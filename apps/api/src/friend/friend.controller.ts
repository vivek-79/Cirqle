import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendRequestDto, RemoveFriendDto } from './dto/friend-request.dto';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post("/add")
  sendRequest(@Body() req: FriendRequestDto) {
    return this.friendService.sendRequest(req);
  }
  @Delete("/remove")
  removeFriend(@Body() req: RemoveFriendDto) {
    return this.friendService.removeFriend(req);
  }

  @Get(':id')
  findFriendWithNoChat(@Param('id',ParseIntPipe) id:number) {
    return this.friendService.findFriendWithNoChat({id:id});
  }

  @Get('/search/:id')
  searchedFriendWithNoChat(@Param('id',ParseIntPipe) id:number,@Query('name') name:string){
    return this.friendService.findFriendWithNoChat({id:id,name:name});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendService.findOne(+id);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendService.remove(+id);
  }
}
