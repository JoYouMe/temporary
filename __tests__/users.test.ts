
import { Context } from 'koa';
import Users from '../src/controllers/users';
import UserService from '../src/services/userService';
import { Token } from '../src/controllers/token';

// Mock dependencies
jest.mock('axios');
jest.mock('qs');
jest.mock('../services/userService');
jest.mock('../middlewares/token');
jest.mock('../database/config');

const MockedUserService = UserService as jest.MockedClass<typeof UserService>;
const MockedToken = Token as jest.MockedClass<typeof Token>;

describe('Users', () => {
  let users: Users;
  let ctx: Context;

  beforeEach(() => {
    users = new Users();
    ctx = {} as Context;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('loginUser', () => {
    it('should handle successful login', async () => {
      MockedUserService.prototype.loginUser.mockResolvedValue(true);

      await users.loginUser(ctx);

      expect(MockedUserService.prototype.loginUser).toHaveBeenCalledWith(/* your expected arguments */);
      expect(MockedToken.prototype.setJwtTokenInCookie).toHaveBeenCalledWith(ctx, /* your expected username */);
      expect(ctx.body).toEqual({ success: true, token: '토큰 생성 성공' });
    });

    it('should handle failed login', async () => {
      MockedUserService.prototype.loginUser.mockResolvedValue(false);

      await users.loginUser(ctx);

      expect(MockedUserService.prototype.loginUser).toHaveBeenCalledWith(/* your expected arguments */);
      expect(MockedToken.prototype.setJwtTokenInCookie).not.toHaveBeenCalled();
      expect(ctx.body).toEqual({ success: false, message: '로그인 실패' });
    });

    it('should handle login error', async () => {
      MockedUserService.prototype.loginUser.mockRejectedValue(new Error('Login Error'));

      await users.loginUser(ctx);

      expect(MockedUserService.prototype.loginUser).toHaveBeenCalledWith(/* your expected arguments */);
      expect(MockedToken.prototype.setJwtTokenInCookie).not.toHaveBeenCalled();
      expect(ctx.body).toEqual({ success: false, message: '로그인 실패' });
    });
  });

});