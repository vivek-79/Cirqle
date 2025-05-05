
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


export enum Upload_Type{
    AVATAR,
    POST
}
interface CloudinarUploadResult{
    public_id:string;
    [key:string]:any
}


interface UploadReturn{
    message:string,
    status:boolean
}

export const UploadImage = async ({ userId, data, upload_Type }: { userId: number, data: File, upload_Type:Upload_Type }):Promise<UploadReturn>=>{

    if (!userId){
        return {
            message:"Unauothorized",
            status:false
        }
    }

    try {
        const bytes = await data.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise < CloudinarUploadResult>(
            (resolve,reject)=>{
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type:"image",
                        folder:"insta-image"
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