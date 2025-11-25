import { defineConfig } from '@prisma/client/generator-helper';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default defineConfig({
  adapter: 'postgresql',
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
