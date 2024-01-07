import Koa from 'koa';
import Router from 'koa-router';
import Post from '../controllers/post';
import { AuthenticationMiddleware } from '../middlewares/authenticate';

const app = new Koa();
const router = new Router();
const post = new Post();
const authenticate = new AuthenticationMiddleware('secretKey')

router.post('/create', authenticate.authenticate, post.createPost);
router.get('/list', post.getPostList);
router.get('/:id', post.getPostsById);
router.post('/update/:id', post.updatePost);
router.post('/delete/:id', post.deletePost);
router.post('/:id/reply/create', authenticate.authenticate, post.createReply);
router.get('/:id/reply/list', post.getRepliesByPostId);

app.use(router.routes()).use(router.allowedMethods());

export default router;