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
            console.error("Error during create post:", error);
            throw error;
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
            console.error("Error during get post list:", error);
            throw error;
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
            console.error("Error during get posts by user ID:", error);
            throw error;
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
            console.log('checkResult', checkResult.rows)
    
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
            throw new Error('User does not own the post');
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
                throw new Error('User does not own the post');
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
            console.error("Error during delete post:", error);
            throw error;
        } finally {
            client.release();
        }
    }

}
