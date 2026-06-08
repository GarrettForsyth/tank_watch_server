import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { app } from './app';
import { BreachRepository } from './repositories/BreachRepository';
import { startBreachSubscriber } from './subscribers/breachSubscriber';

startBreachSubscriber(new BreachRepository());

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});
