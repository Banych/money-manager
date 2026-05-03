import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // DIRECT_URL is the non-pooled Supabase connection used by the Prisma CLI
    // for migrations (same role as `directUrl` in the old schema.prisma).
    url: env('DIRECT_URL'),
  },
});
