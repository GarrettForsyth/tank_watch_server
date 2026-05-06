import express from 'express';
import { authenticate } from './middleware/authenticate'

export const app = express();
app.use(authenticate);
app.use(express.json());
