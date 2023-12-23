import { database } from "../../database/config";
import { Pool, QueryResult } from "pg";


export default class UserService {
    private static instance: UserService;
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
    

    async loginUser(username: string, password: string, social?: string){
        try {
            const query = {
                text: 'SELECT * FROM users WHERE username = $1 AND password = $2',
                values: [username, password],
            };

            const result:QueryResult = await this.db.query(query);
            if (result.rows.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error during login:", error);
            throw error;
        }
    }

    async registerUser(username: String, password: String, social?: String) {
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
            const registerUserQuery = {
                text: 'INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *',
                values: [username, password],
            };

            const registeredUserResult = await client.query(registerUserQuery);

            await client.query('COMMIT');

            return registeredUserResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error during register user :", error);
            throw error;
        }  finally {
            client.release();
        }


    }
}
