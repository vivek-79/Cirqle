
import { v2 as cloudinary } from 'cloudinary';





interface CloudinarUploadResult {
    public_id: string;
    [key: string]: any
}

export interface UploadImageType {
    fieldname: string;
    originalname: string,
    encoding: string,
    mimetype: string,
    buffer: Buffer
}
interface UploadReturn {
    message: string,
    status: boolean
}

interface ENV_VARIABLE {
    cloudName: string;
    apiKey: string;
    apiSecret: string

}

export const UploadImage = async ({ file, envVariable }: { file: UploadImageType, envVariable: ENV_VARIABLE }): Promise<UploadReturn> => {

    cloudinary.config({
        cloud_name: envVariable.cloudName,
        api_key: envVariable.apiKey,
        api_secret: envVariable.apiSecret
    });


    try {

        const buffer = file.buffer

        const result = await new Promise<CloudinarUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "image",
                        folder: "insta-image"
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinarUploadResult)
                    }
                )

                uploadStream.end(buffer)
            }
        )
        return {
            message: result.public_id,
            status: true
        };
    } catch (error) {
        console.log("Upload Image failed", error)
        return {
            message: "Upload image failed",
            status: false
        }
    }
}

export const deleteImage = async ({ public_id, envVariable }: { public_id: string, envVariable: ENV_VARIABLE }) => {

    try {
        cloudinary.config({
            cloud_name: envVariable.cloudName,
            api_key: envVariable.apiKey,
            api_secret: envVariable.apiSecret
        });

        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.log(error)
    }

}