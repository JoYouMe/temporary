import PostService from '../src/services/postService';
import  Post  from '../src/controllers/post';
import {Database} from '../src/database/config'

describe('PostService', () => {
  let postService;

  beforeEach(() => {
    postService = new PostService();
  });

  test('updatePost should update a post in the database', async () => {
    const postId = '1';
    const updatePost ={ userId: '1', title: 'Updated Title', content: 'Updated Content'}
    const post = await postService.updatePost(updatePost, postId);

    expect(post).toBeDefined();
    expect(post.userId).toBe('1');
    expect(post.title).toBe('Updated Title');
    expect(post.content).toBe('Updated Content');
  });

  test('deletePost should delete a post from the database', async () => {
    const postId = '1';
    const userId = '1';
    const result = await postService.deletePost(userId, postId);

    expect(result).toBe(true);
  });
});

describe('Post', () => {
  let post: Post;

  beforeEach(() => {
    post = new Post();
  });

  test('updatePost', async () => {
    const ctx = {
      params: {
        postId: '1'
      },
      request: {
        body:{ userId: '1', title: 'Updated Title', content: 'Updated Content'}
      }
    };

    await post.updatePost(ctx);
    expect(ctx.request.body.userId).toBe('1');
    expect(ctx.request.body.title).toBe('Updated Title');
    expect(ctx.request.body.content).toBe('Updated Content');
  });

  // test('deletePost should commit a deletion to the database', async () => {
  //   const ctx = {
  //     params: {
  //       postId: '1'
  //     },
  //     request: {
  //       body: '1'
  //     }
  //   };

  //   await post.deletePost(ctx);

  //   expect(ctx.request.body.success).toBe(true);
  // });
});
