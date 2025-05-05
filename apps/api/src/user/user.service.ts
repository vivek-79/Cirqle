import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto, UpdateUserDto, UserDto } from "../dto";
import { PrismaService } from "src/prisma/prisma.service";
import { deleteImage, UploadImage, UploadImageType } from "src/lib/image-upload";
import { ConfigService } from "@nestjs/config";




@Injectable()
export class UserServices {

    constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) { }


    async getAllUser(): Promise<UserDto[]> {

        const users = await this.prisma.user.findMany({ take: 10 })

        if (users.length === 0) {
            throw new NotFoundException("No users found")
        }

        return users
    }

    async getOneUser(id: number): Promise<UpdateUserDto> {

        const user = await this.prisma.user.findUnique(
            {
                where: { id },
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    bio: true,
                    gender: true,
                    suggestions: true
                }
            })

        if (!user) {
            throw new NotFoundException("No user found")
        }

        return user
    }

    // Updating User
    async updateUser(id: number, file: UploadImageType, data: UpdateUserDto) {

        // If avatar changed
        if (file) {

            try {
                const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME')
                const apiKey = this.config.get<string>('CLOUDINARY_API_KEY')
                const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET')

                if (!cloudName || !apiKey || !apiSecret) {
                    console.log("Missing Cloudinary config");
                    return {
                        message: "Upload image failed",
                        status: false,
                    };
                }

                const envVariable = { cloudName, apiKey, apiSecret }
                const { status, message } = await UploadImage({ file, envVariable });

                if (!status) {
                    return {
                        message: "Upload image failed",
                        status: false,
                    };
                }

                const user = await this.prisma.user.update({
                    where: { id }, data: {
                        avatar: message

                    },
                    select: {
                        avatar: true,
                        bio: true,
                        id: true,
                        name: true,
                    }
                })

                if (data.avatar) {
                    await deleteImage({ public_id: data.avatar, envVariable })
                }
                return {
                    user,
                    status: true
                }
            } catch (error) {
                return {
                    message: "Failed to upload try again",
                    status: false
                }
            }
        }

        // if other data updated
        const user = await this.prisma.user.update({
            where: { id }, data: {
                ...data
            },
            select: {
                avatar: true,
                bio: true,
                id: true,
                name: true,
                gender: true,
                suggestions: true
            }
        })

        if (!user) {
            throw new NotFoundException("No user found")
        }

        if (!user) {
            throw new NotFoundException("No user found")
        }

        return user
    }

    async removeUser(id: number): Promise<Record<string, number>> {

        const user = await this.prisma.user.delete({ where: { id } })

        if (!user) {
            throw new NotFoundException("No user found")
        }

        return { id: user.id }
    }


    async getSearchedUser(name: string) {

        const users = await this.prisma.user.findMany({
            where: {
                name: {
                    startsWith: name,
                    mode: "insensitive"
                },
            },
            select: {
                name: true,
                avatar: true,
                id: true
            }
        })
        if (users.length === 0) {
            throw new NotFoundException("No user found")
        }



        return users
    }
}