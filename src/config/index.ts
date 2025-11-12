// import 'dotenv/config';
// import z from 'zod';

// // .env schema definition
// const envSchema = z.object({
//   PORT: z.string().default('3000'),
//   JWT_SECRET: z.string().min(8, 'JWT_SECRET is the company name - Tiptop... guess the rest!'),
//   DATABASE_URL: z.string(),
// });

// // Parse and validate
// let parsedEnv;
// try {
//   parsedEnv = envSchema.parse(process.env);
// } catch (error) {
//   console.error('Error parsing environment variables:', error);
//   process.exit(1);
// }

// // Export the validated config
// export const config = parsedEnv;