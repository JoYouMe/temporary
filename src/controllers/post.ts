import { Context } from 'koa';
import PostService from '../services/postService';
import { CreatePost, CreateReply, UpdatePost } from '../interfaces/IPost';
export default class Post {
  private readonly postService: PostService

  constructor() {
    this.postService  = PostService.getInstance();
  }

 async createPost(ctx: Context) {
    const createPost = ctx.request.body as CreatePost

    try {
      const createdPost = await this.postService.createPost(createPost);
      ctx.body = { success: true, post: createdPost };
    } catch (error) {
      console.error('Error during create post:', error);
      ctx.body = { success: false, message: 'POST 작성 실패' };
    }
  }

 async getPostList(ctx: Context) {
    try {
      const postList = await this.postService.getPostList();
      ctx.body = { success: true, posts: postList };
    } catch (error) {
      console.error('Error during get post list:', error);
      ctx.body = { success: false, message: 'POST 리스트 실패' };
    }
  }

 async getPostsById(ctx: Context) {
    const { id } = ctx.params;

    try {
      const userPosts = await this.postService.getPostsById(id);
      ctx.body = { success: true, posts: userPosts };
    } catch (error) {
      console.error('Error during get posts by id:', error);
      ctx.body = { success: false, message: 'POST 조회 실패' };
    }
  }

 async updatePost(ctx: Context) {
    const { postId } = ctx.params;
    const updatePost = ctx.request.body as UpdatePost;

    try {
      const updatedPost = await this.postService.updatePost(updatePost, postId);
      if (updatedPost === false) {
        ctx.body = { success: false, message: '작성자 불일치' };
      } else {
        ctx.body = { success: true, post: updatedPost };
      }
    } catch (error) {
      console.error('Error during update post:', error);
      ctx.body = { success: false, message: 'POST 수정 실패' };
    }
  }

 async deletePost(ctx: Context) {
    const { postId } = ctx.params;
    const userId = ctx.request.body as any;
    try {
      const deletedPost = await this.postService.deletePost(userId, postId);
      if (!deletedPost) {
        ctx.body = { success: true, post: deletedPost };
      } else {
        ctx.body = { success: false, post: deletedPost };
      }
    } catch (error) {
      console.error('Error during delete post:', error);
      ctx.body = { success: false, message: 'POST 삭제 실패' };
    }
  }

 async createReply(ctx: Context) {
    const createRpy = ctx.request.body as CreateReply

    try {
      const createdReply = await this.postService.createReply(createRpy);
      ctx.body = { success: true, reply: createdReply };
    } catch (error) {
      console.error('Error during create reply:', error);
      ctx.body = { success: false, message: 'Reply 작성 실패' };
    }
  }

 async getRepliesByPostId(ctx: Context) {
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
