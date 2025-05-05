import { User } from '@/types';
import { File } from 'buffer';
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

interface Data{
    content:File;
    title:string;
    userId:number;
}

interface CloudinarUploadResult{
    public_id:string;
    bytes:number;
    duration?:number;

    [key:string]:any
}

export const UploadVideo = async({content,title,userId}:Data)=>{

    if (!userId){
        return {
            message:"Unauothorized",
            status:false
        }
    }

    if (
        !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ){
        return{
        message: "Unauothorized",
        status: false
        }
    }

    try {

        const bytes = await content.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise < CloudinarUploadResult>(
            (resolve,reject)=>{
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type:"video",
                        folder:"insta-video",
                    },
                    (error,result)=>{
                        if(error) reject(error);
                        else resolve(result as CloudinarUploadResult )
                    }
                )

                uploadStream.end(buffer)
            }
        )

        return {
            message: result.public_id,
            status:true
        };
    } catch (error) {
        console.log("Upload Image failed",error)
        return {
            message: "Upload image failed",
            status: false
        }
    }
}