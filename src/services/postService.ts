import { database } from "../database/config";
import { Pool, QueryResult } from "pg";
import { CreatePost, CreateReply, UpdatePost } from "../interfaces/IPost";

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

    async createPost(createPost: CreatePost) {
        const client = await this.db.connect();
        const { userId, title, content } = createPost;
        try {
            await client.query('BEGIN');
            const createPostQuery = {
                text: 'INSERT INTO posts(userId, title, content) VALUES ($1, $2, $3) RETURNING *',
                values: [userId, title, content],
            };
            const createdPostResult: QueryResult = await client.query(createPostQuery)
            await client.query('COMMIT');
            return createdPostResult.rows[0];
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

    async updatePost(updatePost: UpdatePost, postId:number) {
        const client = await this.db.connect();
        const { userId, title, content } = updatePost
        try {
            await client.query('BEGIN');
            const checkUserQuery = {
                text: 'SELECT * FROM posts WHERE id = $1 AND userId = $2',
                values: [postId, userId],
            };
            const checkResult = await client.query(checkUserQuery);
            if (!checkResult.rows[0]) {
                return false
            }
            const updatePostQuery = {
                text: 'UPDATE posts SET title = $1, content = $2, updated = now() WHERE id = $3 RETURNING *',
                values: [title, content, postId],
            };
            const updatedPost: QueryResult = await client.query(updatePostQuery);
            await client.query('COMMIT');
            return updatedPost.rows[0];
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
                text: 'SELECT * FROM posts WHERE id = $1 AND userId = $2',
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

    async createReply(createRpy: CreateReply) {
        const client = await this.db.connect();
        const { userId, postId, content } = createRpy
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
                text: 'INSERT INTO replies(postId, userId, content) VALUES ($1, $2, $3) RETURNING *',
                values: [postId, userId, content],
            };
            const createdReplyResult: QueryResult = await client.query(createReplyQuery);
            await client.query('COMMIT');
            return createdReplyResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error('RELPY 작성 실패');
        } finally {
            client.release();
        }
    }

    async getRepliesByPostId(postId: number) {
        try {
            const query = {
                text: 'SELECT * FROM replies WHERE postId = $1',
                values: [postId],
            };
            const result: QueryResult = await this.db.query(query);
            return result.rows;
        } catch (error) {
            throw new Error('RELPY 리스트 실패');
        }
    }

}
