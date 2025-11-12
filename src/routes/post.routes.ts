import { FastifyInstance } from 'fastify';
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} from '../controllers/post.controller';

export default async function postRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/', getAllPosts); // Get all published posts
  fastify.get('/:id', getPostById); // Get single post with comments
  
  // Protected routes
  fastify.post('/', {
    onRequest: [fastify.authenticate]
  }, createPost);
  
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate]
  }, updatePost);
  
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate]
  }, deletePost);
}