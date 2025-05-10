
import { Request } from 'express';
export interface UserPayload {
  
    id: Number;
    email: string
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload
        }
    }
}