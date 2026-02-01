import cors from 'cors';
import express, { type Application } from 'express';
import notFound from './middlewares/notFound';
import { router } from './routes';
import envVariables from './config/env';

export const app: Application = express();

// Middleware
app.use(cors()); // Enables Cross-Origin Resource Sharing
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
