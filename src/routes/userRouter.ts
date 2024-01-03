import Koa from 'koa';
import Router from 'koa-router';
import Users from '../controllers/users';

const app = new Koa();
const router = new Router();

router.post('/login', Users.loginUser);
router.post('/register', Users.registerUser);
router.post('/logout', Users.logoutUser);
router.get('/oauth/kakao', Users.kakaoLogin);
router.get('/oauth/kakao/callback', Users.loginWithKakao);

app.use(router.routes()).use(router.allowedMethods());

export default router;