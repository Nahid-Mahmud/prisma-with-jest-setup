import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import notFound from './middlewares/notFound';
import globalErrorHandler from './middlewares/globalErrorHandler';
import { router } from './routes';
import envVariables from './config/env';

export const app: Application = express();

// Middleware
app.use(helmet()); // Set security-related HTTP headers
app.use(express.json()); // Parse incoming JSON requests

app.use(
  cors({
    origin: [envVariables.FRONTEND_URL],
    credentials: true,
  })
);

app.use('/api/v1', router);

// Default route for testing
app.get('/', (_req, res) => {
  res.send('API is running');
});

app.use(notFound);
app.use(globalErrorHandler);
