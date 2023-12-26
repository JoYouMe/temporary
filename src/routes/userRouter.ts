import Koa from 'koa';
import Router from 'koa-router';
import Users from '../controllers/users';

const app = new Koa();
const router = new Router();

router.post('/login', Users.loginUser);
router.post('/register', Users.registerUser);
router.get('/', (ctx, next) => ctx.body = '👌👌👌👌👌👌👌');

app.use(router.routes()).use(router.allowedMethods());

export default router;