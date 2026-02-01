import dotenv from 'dotenv';

dotenv.config();

interface EnvVariables {
  PORT: string;
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  FRONTEND_URL: string;
  TEST_DB_URI?: string;
}

const loadEnvVariable = (): EnvVariables => {
  const requiredEnvVariables = [
    'PORT',
    'DATABASE_URL',
    'NODE_ENV',
    'FRONTEND_URL',
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  let databaseUrl = process.env.DATABASE_URL as string;

  if (process.env.NODE_ENV === 'test') {
    if (!process.env.TEST_DB_URI) {
      throw new Error('Missing required environment variable: TEST_DB_URI');
    }
    databaseUrl = process.env.TEST_DB_URI as string;
  }

  return {
    PORT: process.env.PORT as string,
    DATABASE_URL: databaseUrl,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    FRONTEND_URL: process.env.FRONTEND_URL as string,
  };
};

const envVariables = loadEnvVariable();
export default envVariables;
