
import * as dotenv from 'dotenv';

dotenv.config();

import { createClient } from 'redis';



console.log("Redis Password",process.env.IO_REDIS_HOST);  // Should log '127.0.0.1'
console.log(process.env.IO_REDIS_PASSWORD);
export const IO_REDIS = createClient({
    username: 'default',
    password: process.env.IO_REDIS_PASSWORD,
    socket: {
        host: process.env.IO_REDIS_HOST!,
        port: 13739
    }
});

IO_REDIS.on('error', err => console.log('Redis Client Error', err));

//taskkill /F /IM node.exe

