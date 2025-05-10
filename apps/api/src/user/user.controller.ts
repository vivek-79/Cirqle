import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserServices } from "./user.service";
import { UpdateUserDto } from "src/dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadImageType } from "src/lib/image-upload";
import { JwtAuthGuard } from "src/user.middleware";


@Controller('/user')
@UseGuards(JwtAuthGuard)
export class UserController {

    constructor(private readonly userService: UserServices) { }


    @Get()
    getAllUser() {
        return this.userService.getAllUser()
    }


    @Get(':id')
    getOneUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getOneUser(id)
    }


    @Get('/search/:name')
    getSearchedUser(@Param('name') name: string) {
        return this.userService.getSearchedUser(name)
    }


    @Put(':id')
    @UseInterceptors(FileInterceptor('new_avatar'))
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: UploadImageType,
        @Body() updateuserDto: UpdateUserDto
    ) {
        return this.userService.updateUser(id, file, updateuserDto)
    }


    @Delete(':id')
    removeUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.removeUser(id)
    }
}