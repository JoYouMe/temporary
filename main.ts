import Koa from 'koa';
import Router from 'koa-router';
import mainRouter from './src/routes/index';
import userRouter from './src/routes/userRouter'
import bodyParser from 'koa-bodyparser';
import { internalErrorHandler, notAvailablePathErrorHandler } from './src/middlewares/errorHandler'

const app = new Koa();

const router = new Router();

app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

const port = 3000;

app.use(mainRouter.routes())
app.use(userRouter.routes())
app.use(internalErrorHandler)
app.use(notAvailablePathErrorHandler)

app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}`);
});