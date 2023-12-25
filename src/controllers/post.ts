import { Context } from 'koa';
import PostService from '../services/postService';
import UserService from '../services/userService';

export default class Post {
  public readonly postService: PostService
  public readonly userService: UserService

  constructor(){
    this.postService = PostService.getInstance();
    this.userService = UserService.getInstance();
  }

   async createPost(ctx: Context) {
    const { user_id, title, content } = ctx.request.body as any

    try {
      const createdPost = await this.postService.createPost(user_id, title, content);
      ctx.body = { success: true, post: createdPost };
    } catch (error) {
      console.error('Error during create post:', error);
      ctx.body = { success: false, message: 'Internal Server Error' };
    }
  }

   async getPostList(ctx: Context) {
    try {
      const postList = await this.postService.getPostList();
      ctx.body = { success: true, posts: postList };
    } catch (error) {
      console.error('Error during get post list:', error);
      ctx.body = { success: false, message: 'Internal Server Error' };
    }
  }

   async getPostsById(ctx: Context) {
    const { id } = ctx.params;

    try {

      const userPosts = await this.postService.getPostsById(id);
      ctx.body = { success: true, posts: userPosts };
    } catch (error) {
      console.error('Error during get posts by id:', error);
      ctx.body = { success: false, message: 'Internal Server Error' };
    }
  }

   async updatePost(ctx: Context) {
    const { id } = ctx.params;
    const { user_id, title, content } = ctx.request.body as any;

    try {
      const updatedPost = await this.postService.updatePost( user_id, id, title, content);
      if(updatedPost === false){
          ctx.body = { success: false, message:'User does not own the post' };
    } else {
          ctx.body = { success: true, post: updatedPost };
      }
    } catch (error) {
      console.error('Error during update post:', error);
      ctx.body = { success: false, message: 'Internal Server Error' };
    }
  }

   async deletePost(ctx: Context) {
    const { postId } = ctx.params;
    const user_id = ctx.request.body as any;
    try {
      const deletedPost = await this.postService.deletePost( user_id,postId);
        if(!deletedPost){
            ctx.body = { success: true, post: deletedPost };
        }else{
            ctx.body = { success: false, post: deletedPost };
        }
    } catch (error) {
      console.error('Error during delete post:', error);
      ctx.body = { success: false, message: 'Internal Server Error' };
    }
  }
}
