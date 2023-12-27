import { Context } from "koa";
import UserService from "../services/userService";
import jwt from 'jsonwebtoken';
import { LoginRequestBody } from "../interfaces/IUser";
import qs from 'qs'

import axios from 'axios'

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

    static async kakaoLogin (ctx: Context) {

        const kakaoData = {
            client_id: 'be947eacbcb573f31fafa4f015f1b173',
            client_secret: '9cb6bYE3816sEBWN61UYNVP6AODQp1Us',
            redirect_uri: 'http://127.0.0.1:5500/user/oauth/kakao',
          };
       
          const kakaoAuthorize = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoData.client_id}&redirect_uri=${kakaoData.redirect_uri}&response_type=code`;
          ctx.redirect(kakaoAuthorize);

    }
    
    static async kakaoLoginCallback(ctx: Context) {
        const code = ctx.request.query.code;
        const kakaoData = {
            client_id: 'be947eacbcb573f31fafa4f015f1b173',
            client_secret: '9cb6bYE3816sEBWN61UYNVP6AODQp1Us',
            redirect_uri: 'http://127.0.0.1:5500/user/oauth/kakao',
        };
        const uri = 'https://kauth.kakao.com/oauth/token';
    
        const body = qs.stringify({
            grant_type: 'authorization_code',
            client_id: kakaoData.client_id,
            client_secret: kakaoData.client_secret,
            redirect_uri: kakaoData.redirect_uri,
            code,
        });
    
        const headers = { 'Content-type': 'application/x-www-form-urlencoded' };
    
        try {
            const response = await axios.post(uri, body, { headers });
            const { access_token } = response.data;
    
            const url = 'https://kapi.kakao.com/v2/user/me';
            const userinfo = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
            });
    
            const { nickname, profile_image_url: userimg } = userinfo.data.kakao_account.profile;
            const userid = userinfo.data.kakao_account.email;
    
            const  user = await Users.userService.getOrCreateUserByKakaoId(userid, nickname, userimg, access_token);
    
            const jwt_token = await Users.generateToken(user)


            ctx.cookies.set('token', jwt_token, {
                path: '/',
                httpOnly: true,
            });
    
            ctx.redirect('http://127.0.0.1:5500?islogin=true');
        } catch (e) {
            console.log(e);
            ctx.status = 500;
            ctx.body = 'Internal Server Error';
        }
    }
    


}
