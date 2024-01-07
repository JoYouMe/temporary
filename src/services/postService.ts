
import { QueryResult } from "pg";
import { CreatePost, CreateReply, UpdatePost } from "../interfaces/IPost";
import { Database } from "../database/config";

export default class PostService {
    private db: Database;
     constructor() {
        this.db = Database.getInstance();
    }

    async createPost(createPost: CreatePost) {
        const { userId, title, content } = createPost;
        try {
            const createPostQuery = {
                text: 'INSERT INTO posts(userId, title, content) VALUES ($1, $2, $3) RETURNING *',
                values: [userId, title, content],
            };
            const createdPostResult: QueryResult = await this.db.query(createPostQuery)
            return createdPostResult.rows[0];
        } catch (error) {
            throw new Error('POST 작성 실패');
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
        const { userId, title, content } = updatePost
        try {
            const checkUserQuery = {
                text: 'SELECT * FROM posts WHERE id = $1 AND userId = $2',
                values: [postId, userId],
            };
            const checkResult = await this.db.query(checkUserQuery);
            if (!checkResult.rows[0]) {
                return false
            }
            const updatePostQuery = {
                text: 'UPDATE posts SET title = $1, content = $2, updated = now() WHERE id = $3 RETURNING *',
                values: [title, content, postId],
            };
            const updatedPost: QueryResult = await this.db.query(updatePostQuery);
            return updatedPost.rows[0];
        } catch (error) {
            throw new Error('작성자 불일치');
        } 
    }

    async deletePost(userId: number, postId: number) {
        try {
            const checkUserQuery = {
                text: 'SELECT * FROM posts WHERE id = $1 AND userId = $2',
                values: [postId, userId],
            };
            const checkResult = await this.db.query(checkUserQuery);
            if (!checkResult) {
                throw new Error('작성자 불일치');
            }
            const deletePostQuery = {
                text: 'DELETE FROM posts WHERE id = $1 RETURNING *',
                values: [postId],
            };
            const deletedPost = await this.db.query(deletePostQuery);
            return deletedPost;
        } catch (error) {
            throw new Error('POST 삭제 실패');
        } 
    }

    async createReply(createRpy: CreateReply) {
        const { userId, postId, content } = createRpy
        try {
            const checkPostQuery = {
                text: 'SELECT * FROM posts WHERE id = $1',
                values: [postId],
            };
            const checkPostResult = await this.db.query(checkPostQuery);
            if (!checkPostResult.rows[0]) {
                throw new Error('POST 없음');
            }
            const createReplyQuery = {
                text: 'INSERT INTO replies(postId, userId, content) VALUES ($1, $2, $3) RETURNING *',
                values: [postId, userId, content],
            };
            const createdReplyResult: QueryResult = await this.db.query(createReplyQuery);
            return createdReplyResult.rows[0];
        } catch (error) {
            throw new Error('RELPY 작성 실패');
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
