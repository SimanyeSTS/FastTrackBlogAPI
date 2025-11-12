import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function registerUser(
  request: FastifyRequest<{ Body: RegisterBody }>,
  reply: FastifyReply
) {
  const { email, password, name } = request.body;

  // Validation
  if (!email || !password) {
    return reply.code(400).send({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return reply.code(400).send({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user exists
    const existingUser = await request.server.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return reply.code(409).send({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await request.server.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = request.server.jwt.sign({ id: user.id, email: user.email });

    return reply.code(201).send({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function loginUser(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.code(400).send({ error: 'Email and password are required' });
  }

  try {
    // Find user
    const user = await request.server.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = request.server.jwt.sign({ id: user.id, email: user.email });

    return reply.send({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}