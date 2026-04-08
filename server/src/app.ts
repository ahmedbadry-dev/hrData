import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '@/config/env';
import v1Router from '@/router';
import { notFoundHandler } from '@/http/middlewares/not-found';
import { errorHandler } from '@/http/middlewares/error-handler';
import { requestLogger } from '@/http/middlewares/request-logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/v1', v1Router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
