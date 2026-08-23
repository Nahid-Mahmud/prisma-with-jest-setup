import { cookieParser } from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import notFound from './middlewares/notFound';
import globalErrorHandler from './middlewares/globalErrorHandler';
import { router } from './routes';
import envVariables from './config/env';

export const app: Application = express();

const corsOptions: CorsOptions = {
  origin:
    envVariables.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : envVariables.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};
// Middleware
app.use(helmet()); // Set security-related HTTP headers
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); // Parse cookies from incoming requests

app.use(cors(corsOptions)); // Enable CORS with the specified options

app.use('/api/v1', router);

// Default route for testing
app.get('/', (_req, res) => {
  res.send('API is running');
});

app.use(notFound);
app.use(globalErrorHandler);
