import jwt from 'jsonwebtoken';
import { Context } from 'koa';

export class Token {
    private readonly secretKey: string;

    constructor(secretKey: string) {
        this.secretKey = secretKey;
    }

    generateToken = async (username: string) => {
        try {
            const secretKey = 'secretKey';
            const payload = { username };
            const existingToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });
            const decoded = jwt.decode(existingToken) as { exp?: number };

            if (decoded.exp !== undefined && decoded.exp * 1000 - Date.now() < 10 * 1000) {
                return jwt.sign(payload, secretKey, { expiresIn: '1h' });
            }
            return existingToken;
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error('토큰 생성 실패');
        }
    }

    setJwtTokenInCookie = async (ctx: Context, username: string) => {
        const token = await this.generateToken(username);
        ctx.cookies.set('jwtToken', token, { httpOnly: true, expires: new Date(Date.now() + 1 * 60 * 60 * 1000) });
    }
}
