import { Context } from 'koa';
import PostService from '../services/postService';
import { CreatePost, CreateReply, UpdatePost } from '../interfaces/IPost';
import { Database } from '../database/config';
export default class Post {
  private readonly postService: PostService;
  private db: Database;

  constructor() {
    this.postService = new PostService();
    this.db = Database.getInstance();
  }

  createPost = async (ctx: Context) => {
    const client = await this.db.connect();
    const createPost = ctx.request.body as CreatePost
    try {
      await client.query('BEGIN');
      const createdPost = await this.postService.createPost(createPost);
      await client.query('COMMIT');
      ctx.body = { success: true, post: createdPost };
    } catch (error) {
      console.error('Error during create post:', error);
      await client.query('ROLLBACK');
      ctx.body = { success: false, message: 'POST 작성 실패' };
    } finally {
      client.release();
  }
  }

  getPostList = async (ctx: Context) => {
    try {
      const postList = await this.postService.getPostList();
      ctx.body = { success: true, posts: postList };
    } catch (error) {
      console.error('Error during get post list:', error);
      ctx.body = { success: false, message: 'POST 리스트 실패' };
    }
  }

  getPostsById = async (ctx: Context) => {
    const { id } = ctx.params;
    try {
      const userPosts = await this.postService.getPostsById(id);
      ctx.body = { success: true, posts: userPosts };
    } catch (error) {
      console.error('Error during get posts by id:', error);
      ctx.body = { success: false, message: 'POST 조회 실패' };
    }
  }

  updatePost = async (ctx: Context) =>{
    const { postId } = ctx.params;
    const updatePost = ctx.request.body as UpdatePost;
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const updatedPost = await this.postService.updatePost(updatePost, postId);
      if (updatedPost === false) {
        ctx.body = { success: false, message: '작성자 불일치' };
      } else {
        await client.query('COMMIT');
        ctx.body = { success: true, post: updatedPost };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during update post:', error);
      ctx.body = { success: false, message: 'POST 수정 실패' };
    } finally {
      client.release();
  }
  }

  deletePost = async (ctx: Context) =>{
    const { postId } = ctx.params;
    const userId = ctx.request.body as any;
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const deletedPost = await this.postService.deletePost(userId, postId);
      if (!deletedPost) {
        await client.query('COMMIT');
        ctx.body = { success: true, post: deletedPost };
      } else {
        ctx.body = { success: false, post: deletedPost };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during delete post:', error);
      ctx.body = { success: false, message: 'POST 삭제 실패' };
    } finally {
      client.release();
  }
  }

  createReply = async (ctx: Context) => {
    const createRpy = ctx.request.body as CreateReply
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const createdReply = await this.postService.createReply(createRpy);
      if (createdReply) {
        await client.query('COMMIT');
        ctx.body = { success: true, reply: createdReply };
      } else {
        ctx.body = { success: false,  message: 'Reply 작성 실패' };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during create reply:', error);
      ctx.body = { success: false, message: 'Reply 작성 실패' };
    } finally {
      client.release();
  }
  }

  getRepliesByPostId = async(ctx: Context) => {
    const { postId } = ctx.params;

    try {
      const replyList = await this.postService.getRepliesByPostId(postId);
      ctx.body = { success: true, replies: replyList };
    } catch (error) {
      console.error('Error during get replies by post id:', error);
      ctx.body = { success: false, message: 'Reply 리스트 실패' };
    }
  }

}
