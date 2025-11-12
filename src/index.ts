import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import commentRoutes from './routes/comment.routes.js';
import path from 'path';
import fastifyStatic from '@fastify/static';

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors, { origin: true });
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey-change-in-production'
});

// JWT decorator for protected routes
fastify.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Make Prisma available in all routes
fastify.decorate('prisma', prisma);

// Serve static files
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'static'),
  prefix: '/static/'
});

// Serve homepage
fastify.get('/', async (request, reply) => {
  return (reply as any).sendFile('index.html');
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(postRoutes, { prefix: '/api/posts' });
fastify.register(commentRoutes, { prefix: '/api/comments' });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});