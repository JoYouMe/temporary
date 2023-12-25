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
        console.error("Error during login:", error);
        throw error;
    }
}

async registerUser(username: string, password: string, social?: string) {
    const client = await this.db.connect();

    try {
        await client.query('BEGIN');
        const userExistsQuery = {
            text: 'SELECT * FROM users WHERE username = $1',
            values: [username],
        };

        const existingUserResult = await client.query(userExistsQuery);

        if (existingUserResult.rows.length > 0) {
            throw new Error('User already exists');
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
        console.error("Error during register user:", error);
        throw error;
    } finally {
        client.release();
    }
}

}
