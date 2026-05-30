import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { app } from './app';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});
