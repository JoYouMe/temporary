import { database } from "../database/config";
import { Pool, QueryResult } from "pg";

export default class PostService {
    private static instance: PostService;
    private db: Pool;

    private constructor() {
        this.db = database();
    }

    public static getInstance(): PostService {
        if (!PostService.instance) {
            PostService.instance = new PostService();
        }
        return PostService.instance;
    }

    async createPost(user_id: string, title:string, content: string) {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            const createPostQuery = {
                text: 'INSERT INTO posts(user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
                values: [user_id, title, content],
            };

            const createdPostResult = await client.query(createPostQuery).then((result)=> result.rows[0])

            await client.query('COMMIT');

            return createdPostResult;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error('POST 작성 실패');
        } finally {
            client.release();
        }
    }

    async getPostList() {
        try {
            const query = {
                text: 'SELECT * FROM posts',
            };
            const result: QueryResult = await this.db.query(query)
            return result.rows;
        } catch (error) {
            throw new Error('POST 리스트 실패');
        }
    }

    async getPostsById(id: number) {
        try {
            const query = {
                text: 'SELECT * FROM posts WHERE id = $1',
                values: [id],
            };
            const result: QueryResult = await this.db.query(query);
            return result.rows;
        } catch (error) {
            throw new Error('POST 조회 실패');
        }
    }

    async updatePost(userId: number, postId: number, title:string, content: string) {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');
            const checkUserQuery = {
                text: 'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
                values: [postId, userId],
            };
            const checkResult = await client.query(checkUserQuery);
            if (!checkResult.rows[0]) {
                return false
            }
            const updatePostQuery = {
                text: 'UPDATE posts SET title = $1, content = $2, updated = now() WHERE id = $3 RETURNING *',
                values: [ title ,content, postId],
            };
    
            const updatedPost = await client.query(updatePostQuery).then((result)=> result.rows[0])
            await client.query('COMMIT');
            return updatedPost;

        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error('작성자 불일치');
        } finally {
            client.release();
        }
    }

    async deletePost(userId: number, postId: number) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const checkUserQuery = {
                text: 'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
                values: [postId, userId],
            };
            const checkResult = await client.query(checkUserQuery);
            if (!checkResult) {
                throw new Error('작성자 불일치');
            }
            const deletePostQuery = {
                text: 'DELETE FROM posts WHERE id = $1 RETURNING *',
                values: [postId],
            };
            const deletedPost = await client.query(deletePostQuery);
            await client.query('COMMIT');
            return deletedPost;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error('POST 삭제 실패');
        } finally {
            client.release();
        }
    }

    async createReply(postId: number, userId: number, content: string) {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');
            const checkPostQuery = {
                text: 'SELECT * FROM posts WHERE id = $1',
                values: [postId],
            };
            const checkPostResult = await client.query(checkPostQuery);
            if (!checkPostResult.rows[0]) {
                throw new Error('POST 없음');
            }
            const createReplyQuery = {
                text: 'INSERT INTO replies(post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
                values: [postId, userId, content],
            };
            const createdReplyResult = await client.query(createReplyQuery).then((result) => result.rows[0]);
            await client.query('COMMIT');
            return createdReplyResult;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error('RELPY 작성 실패');
        } finally {
            client.release();
        }
    }

    async getRepliesByPostId(postId: number){
        try {
            const query = {
                text: 'SELECT * FROM replies WHERE post_id = $1',
                values: [postId],
            };
            const result: QueryResult = await this.db.query(query);
            return result.rows;
        } catch (error) {
            throw new Error('RELPY 리스트 실패');
        }
    }

}
