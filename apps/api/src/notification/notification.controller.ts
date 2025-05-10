import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/user.middleware';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':id')
  getNotifications(@Param('id',ParseIntPipe) id:number) {
    return this.notificationService.getNotifications(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}
