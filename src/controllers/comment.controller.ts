import { FastifyRequest, FastifyReply } from 'fastify';

interface CreateCommentBody {
  text: string;
  postId: number;
}

interface UpdateCommentBody {
  text: string;
}

export async function createComment(
  request: FastifyRequest<{ Body: CreateCommentBody }>,
  reply: FastifyReply
) {
  const { text, postId } = request.body;
  const userId = (request.user as any).id;

  if (!text || !postId) {
    return reply.code(400).send({ error: 'Text and postId are required' });
  }

  try {
    // Check if post exists
    const post = await request.server.prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return reply.code(404).send({ error: 'Post not found' });
    }

    const comment = await request.server.prisma.comment.create({
      data: {
        text,
        postId,
        authorId: userId
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        post: {
          select: { id: true, title: true }
        }
      }
    });

    return reply.code(201).send({ message: 'Comment created successfully', comment });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getCommentsByPost(
  request: FastifyRequest<{ Params: { postId: string } }>,
  reply: FastifyReply
) {
  const postId = parseInt(request.params.postId);

  if (isNaN(postId)) {
    return reply.code(400).send({ error: 'Invalid post ID' });
  }

  try {
    const comments = await request.server.prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reply.send({ comments, count: comments.length });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateComment(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateCommentBody }>,
  reply: FastifyReply
) {
  const commentId = parseInt(request.params.id);
  const userId = (request.user as any).id;
  const { text } = request.body;

  if (isNaN(commentId)) {
    return reply.code(400).send({ error: 'Invalid comment ID' });
  }

  if (!text) {
    return reply.code(400).send({ error: 'Text is required' });
  }

  try {
    // Check if comment exists and user is the author
    const existingComment = await request.server.prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return reply.code(404).send({ error: 'Comment not found' });
    }

    if (existingComment.authorId !== userId) {
      return reply.code(403).send({ error: 'You can only update your own comments' });
    }

    const comment = await request.server.prisma.comment.update({
      where: { id: commentId },
      data: { text },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return reply.send({ message: 'Comment updated successfully', comment });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteComment(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const commentId = parseInt(request.params.id);
  const userId = (request.user as any).id;

  if (isNaN(commentId)) {
    return reply.code(400).send({ error: 'Invalid comment ID' });
  }

  try {
    // Check if comment exists and user is the author
    const existingComment = await request.server.prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return reply.code(404).send({ error: 'Comment not found' });
    }

    if (existingComment.authorId !== userId) {
      return reply.code(403).send({ error: 'You can only delete your own comments' });
    }

    await request.server.prisma.comment.delete({
      where: { id: commentId }
    });

    return reply.send({ message: 'Comment deleted successfully' });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}