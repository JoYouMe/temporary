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

    async loginUser(username: string, password: string, social?: string): Promise<boolean> {
        try {
            const query = {
                text: 'SELECT * FROM users WHERE username = $1 AND password = $2',
                values: [username, password],
            };

            const result: QueryResult = await this.db.query(query);
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

    async searchUser(username: String, password: String, social: String) {
        try {
            const query = {
                text: 'SELECT * FROM users WHERE user_email = $1 AND user_pwd = $2 AND user_social = $3',
                values: [username, password, social],
            };

            const result: QueryResult = await this.db.query(query);
            return result;
        } catch (error) {
            console.error("Error during user search:", error);
            throw error;
        }


    }
}
