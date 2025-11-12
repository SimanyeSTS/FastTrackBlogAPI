import { FastifyInstance } from 'fastify';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} from '../controllers/comment.controller';

export default async function commentRoutes(fastify: FastifyInstance) {
  // Get comments for a specific post
  fastify.get('/post/:postId', getCommentsByPost);
  
  // Protected routes
  fastify.post('/', {
    onRequest: [fastify.authenticate]
  }, createComment);
  
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate]
  }, updateComment);
  
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate]
  }, deleteComment);
}