import { PrismaClient } from '@prisma/client';
import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: any;
  }
  
  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
    };
  }
}