import express from 'express';
import { authenticate } from './middleware/authenticate'
import { errorHandler } from './middleware/errorHandler';

export const app = express();
app.use(authenticate);
app.use(express.json());
app.use(errorHandler)
