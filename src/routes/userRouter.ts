import Koa from 'koa';
import Router from 'koa-router';
import Users from '../controllers/auth/users';
import { LoginRequestBody } from '../interfaces/IUser';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const app = new Koa();
const router = new Router();
const users = new Users();
const secretKey = 'secret_key';

router.post('/login', async (ctx, next) => {
    const { username, password } = ctx.request.body as LoginRequestBody

    try {
        const result = await users.loginUser(username, password);
        if (result) {
            const payload = { username };
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
            
            // 쿠키에 토큰 설정
            ctx.cookies.set('jwtToken', token, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });

            ctx.body = { success: true, message: `User ${username} logged in successfully.`, token };
        }else{
            ctx.body = { success: false, message: `Login failed for user ${username}. Invalid credentials.` };
        }
    } catch (error) {
        console.error("Error during login:", error);
        ctx.body = { success: false, message: `Login failed for user ${username}. Invalid credentials.` };
    }
});

router.post('/register', async (ctx, next) => {
    const { username, password } = ctx.request.body as LoginRequestBody

    try {
        const result = await users.registerUser(username, password);
        if (result) {
            const payload = { username };
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

            // 쿠키에 토큰 설정
            ctx.cookies.set('jwtToken', token, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });

            ctx.body = { success: true, message: `User ${username} registered successfully.`, token };
        }else{
            ctx.body = { success: false, message: `${username} already exists` };
        }
    } catch (error) {
        console.error("Error during register user :", error);
        ctx.body = { success: false, message: `Error during register user ${username}.` };
    }
});

router.get('/', (ctx, next) => ctx.body = '👌👌👌👌👌👌👌');

app.use(router.routes()).use(router.allowedMethods());



export default router;