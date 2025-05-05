import { Module } from "@nestjs/common";
import { Authservice } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ConfigModule } from "@nestjs/config";



@Module({
    imports:[ConfigModule],
    controllers:[AuthController],
    providers:[Authservice],
    exports:[Authservice]
})

export class AuthModule{}