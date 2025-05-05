import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { userMiddleWare } from 'src/user.middleware';

@Module({
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule implements NestModule{

  
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(userMiddleWare).forRoutes("post")
  }

}
