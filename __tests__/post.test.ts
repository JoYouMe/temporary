import { Context } from 'koa';
import Post from '../src/controllers/post'
import PostService from '../src/services/postService';
import { CreatePost } from '../src/interfaces/IPost';
import { Database } from '../src/database/config';

describe('Post', () => {
  let post: Post;
  let ctx: Context;
  let createPost: CreatePost;
  let db: Database;

  beforeEach(() => {
    post = new Post();
    ctx = {} as Context;
    createPost = {} as CreatePost;
    db = Database.getInstance();
  });

  it('should create a post successfully', async () => {
    const client = await db.connect();
    client.query = jest.fn().mockResolvedValueOnce({});
    ctx.request = {
      body: createPost,
    };
    await post.createPost(ctx);
    expect(ctx.body).toEqual({ success: true, post: {} });
    client.release();
  });

  it('should handle errors during post creation', async () => {
    const client = await db.connect();
    client.query = jest.fn().mockRejectedValueOnce(new Error('POST 작성 실패'));
    ctx.request = {
      body: createPost,
    };
    await post.createPost(ctx);
    expect(ctx.body).toEqual({ success: false, message: 'POST 작성 실패' });
    client.release();
  });
});
