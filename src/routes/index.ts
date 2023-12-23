import Koa from 'koa';
import Router from 'koa-router';
import test from './test'

const app = new Koa();

const router = new Router();

router.get('/', test.routes())

app.use(router.routes()).use(router.allowedMethods());

export default router;