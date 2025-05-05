import * as dotenv from 'dotenv';

dotenv.config();

import { Redis } from '@upstash/redis'

export const redis = new Redis({
    url: 'https://skilled-aphid-23654.upstash.io',
    token: process.env.UPSTASH_REDIS_TOKEN,
})
