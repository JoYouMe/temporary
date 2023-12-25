import Koa from 'koa';
import Router from 'koa-router';
import Post from '../controllers/post';
import { authenticate } from '../middlewares/authenticate';

const app = new Koa();
const router = new Router();
const post = new Post()

router.post('/create', authenticate, async (ctx, next) => await post.createPost(ctx));
router.get('/list', async (ctx, next) => await post.getPostList(ctx));
router.get('/:id', async (ctx, next) => await post.getPostsById(ctx));
router.post('/update/:id', async (ctx, next) => await post.updatePost(ctx));
router.post('/delete/:id', async (ctx, next) => await post.deletePost(ctx));

app.use(router.routes()).use(router.allowedMethods());

export default router;