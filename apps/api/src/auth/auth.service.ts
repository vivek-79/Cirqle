import { Injectable, NotFoundException,UnauthorizedException } from "@nestjs/common";
import { CreateUserDto, GoogleUser, UpdateUserDto, UserDto, UserLogin } from "src/dto";
import { PrismaService } from "src/prisma/prisma.service";
import { compare, hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { ConfigService } from "@nestjs/config";
import { Response } from "express";



export const options =(day:number)=>({
    httpOnly: true,         
    secure: true, 
    maxAge: day * 24 * 3600 * 1000, 
    sameSite: "strict" as "strict"
})

@Injectable()
export class Authservice {


    constructor(private readonly prisma: PrismaService,private readonly config:ConfigService) { }


        generateToken(user:UserDto){

        const accessTokenSecret = this.config.get("ACCESS_TOKEN_SECRET")
        const refreshTokenSecret = this.config.get("REFRESH_TOKEN_SECRET")

        const accessToken = sign({ email: user.email,id:user.id }, accessTokenSecret, { expiresIn: this.config.get("ACCESS_TOKEN_EXPIRY")})
        const refreshToken = sign({ email: user.email,id:user.id }, refreshTokenSecret, { expiresIn: this.config.get("REFRESH_TOKEN_EXPIRY") })

        return {
            accessToken, refreshToken
        }
    }

    async signUp(userData: CreateUserDto , res:Response) {

        const hashedPassword = await hash(userData.password,10);

        userData.password=hashedPassword
        const user = await this.prisma.user.create({ data: userData })

        if (!user) {
            throw new NotFoundException("user creation failed")
        }

        const { accessToken, refreshToken } = this.generateToken(user)

        res.cookie('access_Token',accessToken,options(1))
        res.cookie('refresh_Token', refreshToken,options(7))
        res.status(201)
        return res.json(user);
    }


    async logIn(userLogin: UserLogin, res: Response) {

        const user = await this.prisma.user.findFirst({where:{email:userLogin.email}});

        if(!user){
            throw new NotFoundException("No user with this email found")
        }

        // const isValid = await compare(userLogin.password, user.password)

        // if(!isValid){
        //     throw new UnauthorizedException("Wrong password")
        // }

        const { accessToken, refreshToken } = this.generateToken(user)

        res.cookie('access_Token', accessToken, options(1))
        res.cookie('refresh_Token', refreshToken, options(7))
        res.status(200)
        return res.json(user);
    }

    // google login
    async googleLogIn(userData: GoogleUser, res: Response) {

        
        let user = await this.prisma.user.findFirst({ where: { email: userData.email } });

        if (!user) {
         
            const defaultPassword = this.config.get("DEFAULT_PASSWORD") 
            user = await this.prisma.user.create({ 
                data:{
                    name:userData.name,
                    email:userData.email,
                    avatar:userData.avatar,
                    password: defaultPassword
                } 
            })

            if (!user) {

                throw new NotFoundException("user creation failed")
            }
        }

        const { accessToken, refreshToken } =  this.generateToken(user)
       

        res.cookie('access_Token', accessToken, options(1))
        res.cookie('refresh_Token', refreshToken, options(7))
        res.status(200)
        return res.json(user);
    }


    async logOut(res:Response) {

        res.clearCookie('access_Token', options(1));
        res.clearCookie('refresh_Token', options(7));
        res.status(200)
        return res.json({message:"Logged out successfully"});
    }

    async isVerified(id: number): Promise<UpdateUserDto> {
    
            const user = await this.prisma.user.findUnique(
                { where: { id },
                select:{
                    id:true,
                    name:true,
                    avatar:true,
                } 
            })
    
            if (!user) {
                throw new NotFoundException("No user found")
            }
    
            return user
        }
}