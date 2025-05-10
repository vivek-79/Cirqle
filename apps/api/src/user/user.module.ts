import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserServices } from "./user.service";



@Module({
    controllers:[UserController],
    providers:[UserServices],
    exports:[UserServices]
})

export class UserModule {}