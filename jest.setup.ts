import dotenv from 'dotenv';

dotenv.config();

if (process.env.NODE_ENV !== 'test') {
  throw new Error(
    'Refusing to run tests: NODE_ENV is not "test". Run tests via `npm run test` / `pnpm test` (which sets NODE_ENV=test) — never `jest` directly — otherwise tests run against your real DATABASE_URL.'
  );
}

if (!process.env.TEST_DB_URI) {
  throw new Error(
    'Refusing to run tests: TEST_DB_URI is not set. Add a TEST_DB_URI to your .env pointing at a dedicated test database.'
  );
}

if (process.env.TEST_DB_URI === process.env.DATABASE_URL) {
  throw new Error(
    'Refusing to run tests: TEST_DB_URI is identical to DATABASE_URL. Point TEST_DB_URI at a separate database so tests cannot wipe real data.'
  );
}
