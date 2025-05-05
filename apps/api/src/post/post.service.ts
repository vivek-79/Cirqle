
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadImage, UploadImageType } from 'src/lib/image-upload';
import { CreatePostDto, PostDto, UpdatePostDto } from 'src/dto/post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {

    constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) { }

    //get all post
    async getAllPosts(page: number): Promise<PostDto[]> {

        const posts = await this.prisma.post.findMany({
            take: 10,
            skip: (page - 1) * 10,
            select: {
                thumbnail: true,
                title: true,
                id: true,
                author: {
                    select: {
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                createdAt: true,
            },
        });

        if (posts.length === 0) {
            throw new NotFoundException("No posts found")
        }

        return posts
    }

    //getById
    async getPostById(id: number): Promise<PostDto> {

        const post = await this.prisma.post.findFirst({
            where: { id },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        likes: true
                    }
                }
            },
        });

        if (!post) {
            throw new NotFoundException("No post exists")
        }

        return post
    }

    //updatePost
    async updatePost(id: number, data: UpdatePostDto): Promise<Record<string, string>> {

        const editedPost = await this.prisma.post.update({
            where: { id },
            data: data,
        });


        if (!editedPost) {
            throw new NotFoundException("No post found")
        }

        return { message: "Post edited successfully" };
    }

    //getting comments
    async getComments(id: number) {
        const comments = await this.prisma.post.findFirst({
            where: { id },
            select: {
                comments: {
                    select: {
                        content: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        });

        if (comments?.comments.length === 0) {
            throw new NotFoundException("No comments exists")
        }

        return comments?.comments;
    }

    //getting user post
    async getUserPosts(userId: number) {

        const result = await this.prisma.post.findMany({
            where: {
                authorId: userId
            },
            select: {
                id: true,
                thumbnail: true,
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            }
        });

        return result || [];
    }


    //make post 
    async makePost(data: CreatePostDto, file: UploadImageType) {
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

            await this.prisma.post.create({
                data: {
                    title: data.title,
                    authorId: data.authorId,
                    thumbnail: message,
                    published: data.public,
                    content: message
                }
            })


            return {
                status: true
            }
        } catch (error) {
            return {
                message: "Failed to upload try again",
                status: false
            }
        }
    }
}
