import Koa from 'koa';
import Router from 'koa-router';
import Post from '../controllers/post';
import { authenticate } from '../middlewares/authenticate';

const app = new Koa();
const router = new Router();

router.post('/create', authenticate, Post.createPost);
router.get('/list', Post.getPostList);
router.get('/:id', Post.getPostsById);
router.post('/update/:id', Post.updatePost);
router.post('/delete/:id', Post.deletePost);
router.post('/:id/reply/create', authenticate, Post.createReply);
router.get('/:id/reply/list', Post.getRepliesByPostId);

app.use(router.routes()).use(router.allowedMethods());

export default router;