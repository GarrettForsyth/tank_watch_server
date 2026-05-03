/**
 * File: index.ts 
 * Author: Garrett Forsyth
 * Date: May 3rd 2026
 * Description: Entry point: starts the consumer
 */

// Load the proper environment variables before anything else
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import { startMqttConsumer } from './services/mqtt';

startMqttConsumer();
