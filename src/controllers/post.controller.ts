import { FastifyRequest, FastifyReply } from 'fastify';

interface CreatePostBody {
  title: string;
  content: string;
  published?: boolean;
}

interface UpdatePostBody {
  title?: string;
  content?: string;
  published?: boolean;
}

export async function createPost(
  request: FastifyRequest<{ Body: CreatePostBody }>,
  reply: FastifyReply
) {
  const { title, content, published } = request.body;
  const userId = (request.user as any).id;

  if (!title || !content) {
    return reply.code(400).send({ error: 'Title and content are required' });
  }

  try {
    const post = await request.server.prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId: userId
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return reply.code(201).send({ message: 'Post created successfully', post });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getAllPosts(request: FastifyRequest, reply: FastifyReply) {
  try {
    const posts = await request.server.prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reply.send({ posts, count: posts.length });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getPostById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const postId = parseInt(request.params.id);

  if (isNaN(postId)) {
    return reply.code(400).send({ error: 'Invalid post ID' });
  }

  try {
    const post = await request.server.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!post) {
      return reply.code(404).send({ error: 'Post not found' });
    }

    return reply.send({ post });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updatePost(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdatePostBody }>,
  reply: FastifyReply
) {
  const postId = parseInt(request.params.id);
  const userId = (request.user as any).id;
  const { title, content, published } = request.body;

  if (isNaN(postId)) {
    return reply.code(400).send({ error: 'Invalid post ID' });
  }

  try {
    // Check if post exists and user is the author
    const existingPost = await request.server.prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return reply.code(404).send({ error: 'Post not found' });
    }

    if (existingPost.authorId !== userId) {
      return reply.code(403).send({ error: 'You can only update your own posts' });
    }

    // Update post
    const post = await request.server.prisma.post.update({
      where: { id: postId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(published !== undefined && { published })
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return reply.send({ message: 'Post updated successfully', post });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deletePost(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const postId = parseInt(request.params.id);
  const userId = (request.user as any).id;

  if (isNaN(postId)) {
    return reply.code(400).send({ error: 'Invalid post ID' });
  }

  try {
    // Check if post exists and user is the author
    const existingPost = await request.server.prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return reply.code(404).send({ error: 'Post not found' });
    }

    if (existingPost.authorId !== userId) {
      return reply.code(403).send({ error: 'You can only delete your own posts' });
    }

    // Delete post (will cascade delete comments due to DB constraints)
    await request.server.prisma.post.delete({
      where: { id: postId }
    });

    return reply.send({ message: 'Post deleted successfully' });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}