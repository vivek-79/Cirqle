import { UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken"



export function userMiddleWare(req: Request, res: Response, next: NextFunction) {

    //accessing cookie
    const authorizationHeader = req.headers['authorization']

    //checking if exists
    if (!authorizationHeader) {
        throw new UnauthorizedException()
    }

    const access_Token = authorizationHeader.split(" ")[1]

    const acessToken_secret = process.env.ACCESS_TOKEN_SECRET!

    try {
        const data = verify(access_Token, acessToken_secret)

        if (!data || typeof data === 'string' || !('email' in data)) {
            throw new UnauthorizedException()
        }
        
        next();

    } catch (error) {
        throw new UnauthorizedException("Invalid or expired refresh token");
    }
}