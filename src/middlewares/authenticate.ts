import jwt, { JwtPayload } from 'jsonwebtoken';
import { Context, Next } from 'koa';
import Users from '../controllers/users';

const users = new Users();

export async function authenticate(ctx: Context, next: Next) {
    const token = ctx.cookies.get('jwtToken'); 
    try {
        if (token) {
            const decodedToken = jwt.verify(token, 'secretKey') as JwtPayload;
            users.setJwtTokenInCookie(ctx, decodedToken.username); 
            ctx.state.user = decodedToken;
            return next();
        } else {
            ctx.status = 401; 
            ctx.body = { error: 'Unauthorized' };
        }
    } catch (error) {
        console.error('JWT verification error:', error);
        ctx.status = 401; 
        ctx.body = { error: 'Unauthorized' };
    }
}
