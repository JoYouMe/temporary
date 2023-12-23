import Koa from 'koa';
import Router from 'koa-router';
import { database } from './src/database/config'
import mainRouter from './src/routes/index';

const app = new Koa();

const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

const port = 4000;

app.use(mainRouter.routes())

database().connect((err) => {
  if (err) {
    console.error('Failed to connect db', err);
  } else {
    console.log('Connected to db done!');
  }
  database().end();
});

app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}`);
});