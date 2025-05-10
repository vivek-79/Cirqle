


import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './constants.js'
import { createClient, RedisClientType } from 'redis';


type LPOP_DTO = {
    key: string,
    element: string
}


let redisClient: RedisClientType | null = null;
let isConnecting: Promise<RedisClientType> | null = null;
export const getRedis = async (): Promise<RedisClientType> => {

    if (!redisClient) {

        console.log("Getting redis client")
        redisClient = createClient({
            username: 'default',
            socket: {
                host: REDIS_HOST,
                port: REDIS_PORT,
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('Too many Redis reconnection attempts.');
                        return new Error('Redis reconnect failed');
                    }
                    return Math.min(retries * 100, 2000); // exponential backoff
                },
            }
        }
        )
        redisClient.on('error', err => console.log('Redis Client Error', err));

    }

    if (!redisClient.isOpen) {

        if (!isConnecting) {
            isConnecting = redisClient.connect();
        }
        await isConnecting;
        isConnecting = null;
    }

    return redisClient;
};


// Push message to a list
export const rpushMessage = async (queue: string, message: string) => {

    const redis = await getRedis();
    await redis.rPush(queue, message)
}

// Blocking pop from a list (like a queue)
export const listenTOQueue = async (queue: string,
    handler: (message: string) => Promise<void>
) => {

    const redis = await getRedis();

    if (!redis.isOpen) {
        console.error('Redis connection is not open');
        return;
    }
    while (true) {

        try {

            const result: LPOP_DTO | null = await redis.blPop(queue, 0)

            if (result) {

                await handler(result.element);

            }
        } catch (error) {
            console.log("Redis Error", error)
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }

    }
}


//publish to main backend
export const publishMessage = async(channel: string, message: string) => {
    try {
        const redis = await getRedis();

        const duplicate = redis.duplicate();
        await duplicate.connect();

        duplicate.publish(channel, message);
        await duplicate.quit(); 
    } catch (error) {
        console.log("Error while publishing message")
    }
}


// Subscribe to a channel and handle messages via a callback
export const subscribeChannel = async (channel: string,
    handler: (message: string) => Promise<void>
) => {
    const redis = await getRedis();
    const subscriber = redis.duplicate();
    await subscriber.connect();

    subscriber.subscribe(channel, async (message) => {
        try {
            console.log("message came in subscribe")
            await handler(message)
            console.log("message handled subscribe")
        } catch (error) {
            console.error(`Error handling message on channel "${channel}":`, error);
        }
    })

    console.log(`✅ Subscribed to Redis channel "${channel}"`);
}