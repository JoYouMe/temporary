import { database } from "../database/config";
import { Pool, QueryResult } from "pg";
import bcrypt from 'bcrypt';

export default class UserService {
    public static instance: UserService;
    private db: Pool;
    private constructor() {
        this.db = database();
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

async loginUser(username: string, password: string, social?: string) {
    try {
        const query = {
            text: 'SELECT * FROM users WHERE username = $1',
            values: [username],
        };
        const result: QueryResult = await this.db.query(query);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', passwordMatch);
            if (passwordMatch) {
                return true;
            } else {
                return false;
            }
        } else {
            console.log('User not found');
            return false;
        }
    } catch (error) {
        throw new Error('LOGIN 실패');
    }
}

async registerUser(username: string, password: string, social?: string) {
    const client = await this.db.connect();

    try {
        await client.query('BEGIN');

        const existingUser = await this.getUserByUsername(username);

        if (existingUser) {
            throw new Error('이미 등록된 유저');
        }

        const hashedPassword = await bcrypt.hash(password, 10); 
        const registerUserQuery = {
            text: 'INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *',
            values: [username, hashedPassword],
        };

        const registeredUserResult = await client.query(registerUserQuery);
        await client.query('COMMIT');

        return registeredUserResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error('유저 등록 실패');
    } finally {
        client.release();
    }
}

async getUserByUsername(username: string) {
    try {
        const query = {
            text: 'SELECT * FROM users WHERE username = $1',
            values: [username],
        };

        const result: QueryResult = await this.db.query(query);

        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            return null
        }
    } catch (error) {
        console.error("Error during getUserByUsername:", error);
        throw new Error('Failed to get user by username');
    }
}

async getOrCreateUserByKakaoId(kakaoId: string, nickname: string, userimg: string, access_token: string) {
    const client = await this.db.connect();
    try {
        const sqlSelect = 'SELECT * FROM user WHERE userid = $1';
        const selectResult: QueryResult = await this.db.query(sqlSelect, [kakaoId]);

        if (selectResult.rows.length !== 0) {
            const user = selectResult.rows[0];
            return user
        } else {
            const sqlInsert = "INSERT INTO user(userid, nickname, userimg, userpw, username, address, gender, phone, mobile, email, userintro) VALUES ($1, $2, $3, '', '', '', '', '', '', '', '') RETURNING *";
            const insertResult: QueryResult = await this.db.query(sqlInsert, [kakaoId, nickname, userimg]);

            const newUser = insertResult.rows[0];
            return newUser
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error during getOrCreateUserByKakaoId:", error);
        throw new Error('Failed to get or create user by Kakao ID');
    } finally {
        client.release();
    }
}



}
