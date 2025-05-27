import { useEffect, useState } from "react";


export const useDebounce =(value:string,delay : number =500):string=>{

    const [debouncedValue,setDebouncedValue] = useState<string>('');

    useEffect(()=>{

        if(!value) return;

        const timeOut = window.setTimeout(()=>{

            setDebouncedValue(value);
        },delay)

        return ()=> window.clearTimeout(timeOut);
    },[value,delay]);

    return debouncedValue;
};