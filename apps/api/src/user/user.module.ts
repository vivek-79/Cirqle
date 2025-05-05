import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserServices } from "./user.service";
import { userMiddleWare } from "src/user.middleware";



@Module({
    controllers:[UserController],
    providers:[UserServices],
    exports:[UserServices]
})

export class UserModule implements NestModule{

  
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(userMiddleWare).forRoutes("post")
  }

}