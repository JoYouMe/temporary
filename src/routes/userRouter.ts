import Koa from 'koa';
import Router from 'koa-router';
import Users from '../controllers/auth/users';
import { LoginRequestBody } from '../interfaces/IUser';

const app = new Koa();
const router = new Router();
const users = new Users();

router.post('/login', async (ctx, next) => {
    const { username, password } = ctx.request.body as LoginRequestBody

    try {
        const result = await users.loginUser(username, password);
        if (result?.success) {            
            ctx.cookies.set('jwtToken', result.token, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });
            ctx.body = { success: true, message: `User ${username} logged in successfully.` };
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
            ctx.cookies.set('jwtToken', result.token, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });

            ctx.body = { success: true, message: `User ${username} registed in successfully.` };

        } else {
            ctx.body = { success: false, message: `${username} already exists` };
        }
    } catch (error) {
        ctx.body = { success: false, message: `Error during register user ${username}.` };
    }
});

router.get('/', (ctx, next) => ctx.body = '👌👌👌👌👌👌👌');

app.use(router.routes()).use(router.allowedMethods());



export default router;