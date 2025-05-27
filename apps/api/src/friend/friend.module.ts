import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports:[NotificationModule],
  controllers: [FriendController],
  providers: [FriendService],
  exports:[FriendService]
})
export class FriendModule {}
