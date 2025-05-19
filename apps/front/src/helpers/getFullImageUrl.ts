import { imageBaseUrl } from "@/constants";



export const CloudImage = (public_id: string | null | undefined) => {
    
    if(!public_id){
        return "/person.webp"
    }

    else if (public_id.startsWith('https://lh3.googleusercontent.com')){
        return public_id
    }
    return (`${imageBaseUrl}/${public_id}.jpg`)
}

export const LocalImage =(file:File )=>{

    const url = URL.createObjectURL(file);

    return url;
}