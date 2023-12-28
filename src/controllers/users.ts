import { Context } from "koa";
import UserService from "../services/userService";
import jwt from 'jsonwebtoken';
import { LoginRequest } from "../interfaces/IUser";
import qs from 'qs'
import axios from 'axios'

export default class Users {
    private static readonly userService: UserService = UserService.getInstance();

    static async generateToken(username: string) {
        try {
            const secretKey = 'secretKey';
            const payload = { username };
            const existingToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });
            const decoded = jwt.decode(existingToken) as { exp?: number };

            // 토큰이 10초 남았을때 refresh 
            if (decoded.exp !== undefined && decoded.exp * 1000 - Date.now() < 10 * 1000) {
                return jwt.sign(payload, secretKey, { expiresIn: '1h' });
            }
            return existingToken;
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error('토큰 생성 실패');
        }
    }

    static async setJwtTokenInCookie(ctx: Context, username: string) {
        const token = await this.generateToken(username);
        ctx.cookies.set('jwtToken', token, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });
    }


    static async loginUser(ctx: Context) {
        const loginReq = ctx.request.body as LoginRequest;
        try {
            const result = await Users.userService.loginUser(loginReq);
            if (result) {
                await Users.setJwtTokenInCookie(ctx, loginReq.username);
                ctx.body = { success: true, token: '토큰 생성 성공' };
            } else {
                ctx.body = { success: false, message: `${loginReq.username} 로그인 실패` };
            }
        } catch (error) {
            console.error("Error during login:", error);
            ctx.body = { success: false, message: '로그인 실패' };
        }
    }

    static async registerUser(ctx: Context) {
        const loginReq = ctx.request.body as LoginRequest;
        try {
            const result = await Users.userService.registerUser(loginReq);
            if (result) {
                await Users.setJwtTokenInCookie(ctx, loginReq.username);
                ctx.body = { success: true, message: '유저 등록 성공' };
            } else {
                ctx.body = { success: false, message: `${loginReq.username} 이미 있음` };
            }
        } catch (error) {
            console.error("Error during register:", error);
            ctx.body = { success: false, message: '유저 등록 실패' };
        }
    }

    static async logoutUser(ctx: Context) {
        try {
            ctx.cookies.set('jwtToken', null, { httpOnly: true, expires: new Date(0) });
            ctx.body = { success: true, message: '로그아웃 성공' };
        } catch (error) {
            console.error('Error during logout:', error);
            ctx.body = { success: false, message: '로그아웃 실패' };
        }
    }

    static async kakaoLogin(ctx: Context) {

        const kakaoData = {
            client_id: 'be947eacbcb573f31fafa4f015f1b173',
            client_secret: '9cb6bYE3816sEBWN61UYNVP6AODQp1Us',
            redirect_uri: 'http://localhost:3000/user/oauth/kakao/callback',
        };

        const kakaoAuthorize = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoData.client_id}&redirect_uri=${kakaoData.redirect_uri}&response_type=code`;
        ctx.redirect(kakaoAuthorize);

    }

    static async loginWithKakao(ctx: Context) {
        const { code } = ctx.request.query as any
        try {
            const formData = {
                grant_type: 'authorization_code',
                client_id: 'be947eacbcb573f31fafa4f015f1b173',
                redirect_uri: 'http://localhost:3000/user/oauth/kakao/callback',
                code,
                client_secret: '9cb6bYE3816sEBWN61UYNVP6AODQp1Us',
            };
            const {
                data: { access_token },
            } = await axios
                .post(`https://kauth.kakao.com/oauth/token?${qs.stringify(formData)}`)
                .then((res) => {
                    return res;
                });

            const { data: userInfo } = await axios
                .get('https://kapi.kakao.com/v2/user/me', {
                    headers: {
                        Authorization: 'Bearer ' + access_token,
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    },
                })
                .then((res) => {
                    return res;
                });

            const username = userInfo.properties.nickname;
            const profileImg = userInfo.properties.profile_image;
            const id = userInfo.id

            const user = await Users.userService.getUserByUserKakaoId(id);
            let createAccountResult;
            if (user === null) {
                const { ok: user } = await Users.userService.createKakaoAccount({
                    username,
                    id,
                    profileImg
                });
                createAccountResult = { ok: user };
            }

            if (user || createAccountResult) {
                const loginResult = await Users.userService.kakaoLogin(id);
                if (loginResult.ok) {
                    await Users.setJwtTokenInCookie(ctx, username);
                    ctx.body = { success: true, token: '토큰 생성 성공' };
                } else {
                    ctx.body = { success: false, message: '카카오 로그인 실패' };
                }
            } else {
                ctx.body = { success: false, message: "카카오 유저 등록 실패" };
            }
        } catch (e) {
            console.error(e);
            ctx.body = { success: false, error: '카카오 로그인 실패' };
        }
    }



}
