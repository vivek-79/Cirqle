import { imageBaseUrl } from "@/constants";



export const CloudImage = (public_id: string | null | undefined) => {
    
    if(!public_id){
        return "/person.webp"
    }
    return (`${imageBaseUrl}/${public_id}.jpg`)
}