import { Context } from 'koa';
import PostService from '../services/postService';
export default class Post {
  private static readonly postService: PostService = PostService.getInstance();

  constructor(){
  }

  static async createPost(ctx: Context) {
    const { user_id, title, content } = ctx.request.body as any

    try {
      const createdPost = await Post.postService.createPost(user_id, title, content);
      ctx.body = { success: true, post: createdPost };
    } catch (error) {
      console.error('Error during create post:', error);
      ctx.body = { success: false, message: 'POST 작성 실패' };
    }
  }

  static async getPostList(ctx: Context) {
    try {
      const postList = await Post.postService.getPostList();
      ctx.body = { success: true, posts: postList };
    } catch (error) {
      console.error('Error during get post list:', error);
      ctx.body = { success: false, message: 'POST 리스트 실패' };
    }
  }

  static async getPostsById(ctx: Context) {
    const { id } = ctx.params;

    try {
      const userPosts = await Post.postService.getPostsById(id);
      ctx.body = { success: true, posts: userPosts };
    } catch (error) {
      console.error('Error during get posts by id:', error);
      ctx.body = { success: false, message: 'POST 조회 실패' };
    }
  }

  static async updatePost(ctx: Context) {
    const { id } = ctx.params;
    const { user_id, title, content } = ctx.request.body as any;

    try {
      const updatedPost = await Post.postService.updatePost( user_id, id, title, content);
      if(updatedPost === false){
          ctx.body = { success: false, message:'작성자 불일치' };
    } else {
          ctx.body = { success: true, post: updatedPost };
      }
    } catch (error) {
      console.error('Error during update post:', error);
      ctx.body = { success: false, message: 'POST 수정 실패' };
    }
  }

  static async deletePost(ctx: Context) {
    const { postId } = ctx.params;
    const user_id = ctx.request.body as any;
    try {
      const deletedPost = await Post.postService.deletePost( user_id,postId);
        if(!deletedPost){
            ctx.body = { success: true, post: deletedPost };
        }else{
            ctx.body = { success: false, post: deletedPost };
        }
    } catch (error) {
      console.error('Error during delete post:', error);
      ctx.body = { success: false, message: 'POST 삭제 실패' };
    }
  }
  
  static async createReply(ctx: Context) {
    const { postId, userId, content } = ctx.request.body as any;

    try {
      const createdReply = await Post.postService.createReply(postId, userId, content);
      ctx.body = { success: true, reply: createdReply };
    } catch (error) {
      console.error('Error during create reply:', error);
      ctx.body = { success: false, message: 'Reply 작성 실패' };
    }
  }

  static async getRepliesByPostId(ctx: Context) {
    const { postId } = ctx.params;

    try {
      const replyList = await Post.postService.getRepliesByPostId(postId);
      ctx.body = { success: true, replies: replyList };
    } catch (error) {
      console.error('Error during get replies by post id:', error);
      ctx.body = { success: false, message: 'Reply 리스트 실패' };
    }
  }


}
