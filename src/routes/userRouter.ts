import Koa from 'koa';
import Router from 'koa-router';
import Users from '../controllers/users';

const app = new Koa();
const router = new Router();
const users = new Users();

router.post('/login', users.loginUser);
router.post('/register', users.registerUser);
router.post('/logout', users.logoutUser);
router.get('/oauth/kakao', users.kakaoLogin);
router.get('/oauth/kakao/callback', users.loginWithKakao);

app.use(router.routes()).use(router.allowedMethods());

export default router;