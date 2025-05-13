import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload, verify } from "jsonwebtoken"

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context:ExecutionContext):boolean {
        
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['authorization']

        if(!authHeader) throw new UnauthorizedException("No token provided");
        
        const token = authHeader.split(" ")[1]
        const acessToken_secret = process.env.ACCESS_TOKEN_SECRET!
        
        
        try {
            
            const payload = verify(token, acessToken_secret) as JwtPayload & { id: number, email: string }  
            if (!payload || !payload.id ) {
                throw new UnauthorizedException("Invalid token");
            }
            request.user = payload;


            return true
        } catch (error) {
    
            throw new UnauthorizedException("Invalid or expired token");            
        }
    }
}