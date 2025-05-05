import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Res } from "@nestjs/common";
import { CreateUserDto, GoogleUser, UserLogin } from "src/dto";
import { Authservice } from "./auth.service";
import { Response } from "express";





@Controller('/auth')
export class AuthController {

    constructor(private readonly authService: Authservice) { }

    @Post('/signup')
    signUp(@Body() createUser: CreateUserDto,@Res() res:Response) {
        return this.authService.signUp(createUser,res)
    }

    @Post('/signin')
    login(@Body() userLogin: UserLogin, @Res() res: Response){
        return this.authService.logIn(userLogin,res)
    }

    @Delete()
    logout(@Res() res: Response){
        return this.authService.logOut(res)
    }

    @Post("/google-login")
    loginWithGoogle(@Body() user: GoogleUser, @Res() res: Response){
        return this.authService.googleLogIn(user,res)
    }
    @Get(":id")
    isVerified(@Param('id',ParseIntPipe) id:number){
        return this.authService.isVerified(id)
    }
}