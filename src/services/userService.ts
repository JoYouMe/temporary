
import { QueryResult } from "pg";
import bcrypt from 'bcrypt';
import { KaKaoData, LoginRequest, UserDetails } from "../interfaces/IUser";
import { Database } from "../database/config";
/**
 * todo: service 더 세분화
 * 트랜잭션 가져오기
 */

export default class UserService {
    private db: Database;
     constructor() {
        this.db = Database.getInstance();
    }

    async loginUser(loginReq: LoginRequest) {
        const { username, password } = loginReq
        try {
            const query = {
                text: 'SELECT * FROM users WHERE username = $1',
                values: [username],
            };
            const result: QueryResult = await this.db.query(query);
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const passwordMatch = await bcrypt.compare(password, user.password);
                console.log('Password match:', passwordMatch);
                if (passwordMatch) {
                    return true;
                } else {
                    return false;
                }
            } else {
                console.log('User not found');
                return false;
            }
        } catch (error) {
            throw new Error('LOGIN 실패');
        }
    }

    async registerUser(loginReq: LoginRequest) {
        const { username, password } = loginReq
        try {
            const existingUser = await this.getUserByUsername(username);
            if (existingUser) {
                throw new Error('이미 등록된 유저');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const registerUserQuery = {
                text: 'INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *',
                values: [username, hashedPassword],
            };
            const registeredUserResult: QueryResult = await  this.db.query(registerUserQuery);
            return registeredUserResult.rows[0];
        } catch (error) {
            throw new Error('유저 등록 실패');
        }
    }

    async getUserByUsername(username: string) {
        try {
            const query = {
                text: 'SELECT * FROM users WHERE username = $1',
                values: [username],
            };
            const result: QueryResult = await this.db.query(query);
            if (result.rows.length > 0) {
                return result.rows[0];
            } else {
                return null
            }
        } catch (error) {
            console.error("Error during getUserByUsername:", error);
            throw new Error('username 조회 실패');
        }
    }

    async getUserByUserKakaoId(id: number) {
        try {
            const query = {
                text: 'SELECT * FROM users WHERE kakaoid = $1',
                values: [id],
            };
            const result: QueryResult = await this.db.query(query);
            if (result.rows.length > 0) {
                return result.rows[0];
            } else {
                return null
            }
        } catch (error) {
            console.error("Error during getUserByUserId:", error);
            throw new Error('kakaoid 조회 실패');
        }
    }

    async createKakaoAccount(userDetails: UserDetails) {
        try {
            const { id, username, profileImg } = userDetails;
            const createUserQuery = {
                text: 'INSERT INTO users(username, password, kakaoid, profileimg) VALUES ($1, $2, $3, $4) RETURNING *',
                values: [username, -1, id, profileImg],
            };
            const createdUserResult: QueryResult = await this.db.query(createUserQuery)
            return createdUserResult.rows[0];
        } catch (error) {
            console.error("Error during createAccount:", error);
            throw error;
        } 
    }

    async kakaoLogin(id: number) {
        try {
            const result: KaKaoData = await this.getUserByUserKakaoId(id)
            if (result) {
                return { ok: true };
            } else {
                return { ok: false };
            }
        } catch (error) {
            console.error("Error during login:", error);
            throw error;
        }
    }



}
