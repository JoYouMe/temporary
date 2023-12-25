import { Context } from "koa";
import UserService from "../services/userService";
import jwt from 'jsonwebtoken';
import { LoginRequestBody } from "../interfaces/IUser";

export default class Users {
    private readonly userService: UserService;

    constructor() {
        this.userService  = UserService.getInstance();
    }

    async generateToken(username: string) {
        const secretKey = 'secretKey';
        const payload = { username };
        return jwt.sign(payload, secretKey, { expiresIn: '1h' });
    }

    async setJwtTokenInCookie(ctx: Context, username: string) {
        const token = await this.generateToken(username);
        ctx.cookies.set('jwtToken', token, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });
    }

     async loginUser(ctx: Context) {
        const { username, password } = ctx.request.body as LoginRequestBody;
        try {
            const result = await this.userService.loginUser(username, password); 
            if (result) {
                await this.setJwtTokenInCookie(ctx, username);
                ctx.body = { success: true, token: 'Token set in cookie successfully.' };
            } else {
                ctx.body = { success: false, message: `Login failed for user ${username}. Invalid credentials.` };
            }
        } catch (error) {
            console.error("Error during login:", error);
            // throw new Error ('유저 정보를 받아오는데 실패했습니다.');
            ctx.body = { success: false, message: '유저 정보를 받아오는데 실패했습니다.' };
        }
    }

     async registerUser(ctx: Context) {
        const { username, password } = ctx.request.body as LoginRequestBody;
        try {
            const result = await this.userService.registerUser(username, password); 
            if (result) {
                await this.setJwtTokenInCookie(ctx, username);
                return { success: true, token: 'Token set in cookie successfully.' };
            } else {
                return { success: false, message: `${username} already exists` };
            }
        } catch (error) {
            console.error("Error during register:", error);
            // throw new Error('이미 등록된 유저입니다.')
            ctx.body = { success: false, message: '이미 등록된 유저입니다.' };
        }
    }
}
