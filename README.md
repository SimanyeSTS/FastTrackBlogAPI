# FastTrack Blog API

A production-ready Blog API built with Fastify, TypeScript, Prisma, and PostgreSQL. Features complete CRUD operations, JWT authentication, and comment system.

## 🚀 Features

- ✅ User registration and authentication (JWT)
- ✅ Protected routes with JWT middleware
- ✅ Full CRUD operations for blog posts
- ✅ Comment system on posts
- ✅ Password hashing with bcrypt
- ✅ PostgreSQL database with Prisma ORM
- ✅ TypeScript for type safety
- ✅ Clean architecture with controllers and routes

## 📋 Prerequisites

- Node.js (v18+)
- Docker (for PostgreSQL)
- npm or yarn

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/blogdb?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

### 3. Start PostgreSQL (Docker)
```bash
docker run --name blog-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=blogdb \
  -p 5432:5432 \
  -d postgres
```

### 4. Run Prisma Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```

Server will be running at `http://localhost:3000`

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

### Posts

#### Create Post (Protected)
```http
POST /api/posts
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "My First Post",
  "content": "This is the content of my post",
  "published": true
}
```

#### Get All Posts
```http
GET /api/posts
```

#### Get Single Post
```http
GET /api/posts/:id
```

#### Update Post (Protected)
```http
PUT /api/posts/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### Delete Post (Protected)
```http
DELETE /api/posts/:id
Authorization: Bearer <your-jwt-token>
```

### Comments

#### Create Comment (Protected)
```http
POST /api/comments
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "text": "Great post!",
  "postId": 1
}
```

#### Get Comments for Post
```http
GET /api/comments/post/:postId
```

#### Update Comment (Protected)
```http
PUT /api/comments/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "text": "Updated comment"
}
```

#### Delete Comment (Protected)
```http
DELETE /api/comments/:id
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing with cURL

### 1. Register a user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### 2. Login and get token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Create a post (use token from login)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test Post","content":"This is a test","published":true}'
```

### 4. Get all posts
```bash
curl http://localhost:3000/api/posts
```

## 🏗️ Project Structure
```
FastTrackBlogAPI/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── post.controller.ts
│   │   └── comment.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── post.routes.ts
│   │   └── comment.routes.ts
│   ├── types/
│   │   └── fastify.d.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Protected routes with authentication middleware
- Authorization checks (users can only modify their own posts/comments)

## 🚢 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to set strong secrets in production:
- Use a strong, random JWT_SECRET
- Use secure DATABASE_URL with proper credentials

## 📝 License

MIT

---

Built with ❤️ for TiptopCA Backend Developer Application