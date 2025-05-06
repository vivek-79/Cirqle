import { Module } from '@nestjs/common';
import { RedisSubscriberService } from './redis-subscriber.service';
import { GateWayModule } from 'src/chat/chat.gateway.module';

@Module({
  imports: [GateWayModule],
  providers: [RedisSubscriberService],
  exports:[RedisSubscriberService]
})
export class RedisSubscriberModule {}
