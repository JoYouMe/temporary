import Koa from 'koa';
import Router from 'koa-router';
import Users from '../controllers/users';

const app = new Koa();
const router = new Router();
const users = new Users();

router.post('/login', async (ctx, next) => await users.loginUser(ctx));
router.post('/register', async (ctx, next) => await users.registerUser(ctx));
router.get('/', (ctx, next) => ctx.body = '👌👌👌👌👌👌👌');

app.use(router.routes()).use(router.allowedMethods());

export default router;