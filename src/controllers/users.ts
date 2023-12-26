import { Context } from "koa";
import UserService from "../services/userService";
import jwt from 'jsonwebtoken';
import { LoginRequestBody } from "../interfaces/IUser";

export default class Users {
    private static readonly userService: UserService = UserService.getInstance();

    static async generateToken(username: string) {
        const secretKey = 'secretKey';
        const payload = { username };
        return jwt.sign(payload, secretKey, { expiresIn: '1h' });
    }

    static async setJwtTokenInCookie(ctx: Context, username: string) {
        const token = await Users.generateToken(username);
        ctx.cookies.set('jwtToken', token, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });
    }

    static async loginUser(ctx: Context) {
        const { username, password } = ctx.request.body as LoginRequestBody;
        try {
            const result = await Users.userService.loginUser(username, password); 
            if (result) {
                await Users.setJwtTokenInCookie(ctx, username);
                ctx.body = { success: true, token: 'Token set in cookie successfully.' };
            } else {
                ctx.body = { success: false, message: `Login failed for user ${username}. Invalid credentials.` };
            }
        } catch (error) {
            console.error("Error during login:", error);
            ctx.body = { success: false, message: '로그인 실패' };
        }
    }

    static async registerUser(ctx: Context) {
        const { username, password } = ctx.request.body as LoginRequestBody;
        try {
            const result = await Users.userService.registerUser(username, password); 
            if (result) {
                await this.setJwtTokenInCookie(ctx, username);
                ctx.body = { success: true, token: 'Token set in cookie successfully.' };
            } else {
                ctx.body = { success: false, message: `${username} already exists` };
            }
        } catch (error) {
            console.error("Error during register:", error);
            ctx.body = { success: false, message: '이미 등록된 유저' };
        }
    }
}
