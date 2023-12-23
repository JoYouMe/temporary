import Koa from 'koa';
import Router from 'koa-router';
import test from './test'
import userRouter from './userRouter'

const app = new Koa();
const router = new Router();

router.get('/test', test.routes())
router.get('/', userRouter.routes())
router.post('/login', userRouter.routes())

app.use(router.routes()).use(router.allowedMethods());

export default router;