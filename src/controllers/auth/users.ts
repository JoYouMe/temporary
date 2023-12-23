import UserService from "../../services/user/userService";
import jwt from 'jsonwebtoken';

export default class Users {
    public userService: UserService;

    public constructor() {
        this.userService = UserService.getInstance();
    }

    static generateToken(username: string) {
        const secretKey = 'secret_key';
        const payload = { username };
        return jwt.sign(payload, secretKey, { expiresIn: '1h' });
    }

    async loginUser(username: string, password: string, social?: string) {
        try {
            const result = await this.userService.loginUser(username, password);
            if (result) {
                const token = Users.generateToken(username);
                return { success: true, token };
            } else {
                return { success: false, message: `Login failed for user ${username}. Invalid credentials.` };
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    }
    
    async registerUser(username: string, password: string, social?: string) {
        try {
            const result = await this.userService.registerUser(username, password);
            if (result) {
                const token = Users.generateToken(username)
                return { success: true, token };
            } else {
                return { success: false, message: `${username} already exists` };
            }
        } catch (error) {
            console.error("Error during regist:", error);
        }
    }

    


}
