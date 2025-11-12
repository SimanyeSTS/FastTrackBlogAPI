import { FastifyInstance } from 'fastify';
import { registerUser, loginUser } from '../controllers/auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  // Register new user
  fastify.post('/register', registerUser);
  
  // Login
  fastify.post('/login', loginUser);
  
  // Protected route example - get current user
  fastify.get('/me', {
    onRequest: [fastify.authenticate]
  }, async (request: any, reply) => {
    const userId = request.user.id;
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return { user };
  });
}