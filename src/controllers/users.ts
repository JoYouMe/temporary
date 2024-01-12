import { Context } from "koa";
import { LoginRequest } from "../interfaces/IUser";
import qs from 'qs'
import axios from 'axios'
import UserService from "../services/userService";
import { Token } from "./token";
import { Database } from "../database/config";



export default class Users {
    private readonly userService: UserService;
    private readonly tokenService: Token;
    private db: Database;

    constructor() {
        this.userService = new UserService();
        this.tokenService = new Token('secretKey');
        this.db = Database.getInstance();
    }

    loginUser = async (ctx: Context) => {
        const loginReq = ctx.request.body as LoginRequest;
        try {
            const result = await this.userService.loginUser(loginReq);
            if (result) {
                await this.tokenService.setJwtTokenInCookie(ctx, loginReq.username);
                ctx.body = { success: true, token: '토큰 생성 성공' };
            } else {
                ctx.body = { success: false, message: `${loginReq.username} 로그인 실패` };
            }
        } catch (error) {
            console.error("Error during login:", error);
            ctx.body = { success: false, message: '로그인 실패' };
        }
    }

    registerUser = async (ctx: Context) => {
        const client = await this.db.connect();
        const loginReq = ctx.request.body as LoginRequest;
        try {
            await client.query('BEGIN');
            const existingUser = await this.userService.getUserByUsername(loginReq.username);
            if (existingUser) {
                ctx.body = { success: false, message: `${loginReq.username} 이미 있음` };
                throw new Error('이미 등록된 유저');
            }
                await this.tokenService.setJwtTokenInCookie(ctx, loginReq.username);
                await client.query('COMMIT');
                ctx.body = { success: true, message: '유저 등록 성공' };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error during register:", error);
            ctx.body = { success: false, message: '유저 등록 실패' };
        } finally {
            client.release();
        }
    }

    logoutUser = async (ctx: Context) => {
        try {
            ctx.cookies.set('jwtToken', null, { httpOnly: true, expires: new Date(0) });
            ctx.body = { success: true, message: '로그아웃 성공' };
        } catch (error) {
            console.error('Error during logout:', error);
            ctx.body = { success: false, message: '로그아웃 실패' };
        }
    }

    kakaoLogin = async (ctx: Context) => {
        const kakaoData = {
            client_id: 'be947eacbcb573f31fafa4f015f1b173',
            client_secret: '9cb6bYE3816sEBWN61UYNVP6AODQp1Us',
            redirect_uri: 'http://localhost:3000/user/oauth/kakao/callback',
        };

        const kakaoAuthorize = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoData.client_id}&redirect_uri=${kakaoData.redirect_uri}&response_type=code`;
        ctx.redirect(kakaoAuthorize);
    }

    loginWithKakao = async (ctx: Context) => {
        const { code } = ctx.request.query as any
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const formData = {
                grant_type: 'authorization_code',
                client_id: 'be947eacbcb573f31fafa4f015f1b173',
                redirect_uri: 'http://localhost:3000/user/oauth/kakao/callback',
                code,
                client_secret: '9cb6bYE3816sEBWN61UYNVP6AODQp1Us',
            };

            const {
                data: { access_token },
            } = await axios.post(`https://kauth.kakao.com/oauth/token?${qs.stringify(formData)}`);

            const { data: userInfo } = await axios.get('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: 'Bearer ' + access_token,
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                },
            });

            const username = userInfo.properties.nickname;
            const profileImg = userInfo.properties.profile_image;
            const id = userInfo.id

            const user = await this.userService.getUserByUserKakaoId(id);
            let createAccountResult;
            if (user === null) {
                const { ok: user } = await this.userService.createKakaoAccount({
                    username,
                    id,
                    profileImg
                });
                createAccountResult = { ok: user };
                await client.query('COMMIT');
            }

            if (user || createAccountResult) {
                const loginResult = await this.userService.kakaoLogin(id);
                if (loginResult.ok) {
                    await this.tokenService.setJwtTokenInCookie(ctx, username);
                    ctx.body = { success: true, token: '토큰 생성 성공' };
                } else {
                    ctx.body = { success: false, message: '카카오 로그인 실패' };
                }
            } else {
                ctx.body = { success: false, message: "카카오 유저 등록 실패" };
            }
        } catch (e) {
            await client.query('ROLLBACK');
            console.error(e);
            ctx.body = { success: false, error: '카카오 로그인 실패' };
        } finally {
            client.release();
        }
    }
}
