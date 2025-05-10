import * as dotenv from "dotenv";
dotenv.config(); 

export const REDIS_HOST=String(process.env.IO_REDIS_HOST)!
export const REDIS_PASSWORD=String(process.env.IO_REDIS_PASSWORD)!
export const REDIS_PORT =6379