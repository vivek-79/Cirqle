
import { IoCheckmarkOutline } from "react-icons/io5";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

export const MessageStatus = ({ status }: { status?:string})=>{

    if (!status) return null;

    switch (status) {
        case "SENT":
            return <IoCheckmarkOutline size={13} className=" text-gray-400" />  
        case "DELIVERED":
            return <IoCheckmarkDoneOutline size={13} className=" text-gray-300" />
        case "READ":
            return <IoCheckmarkDoneOutline size={13} className=" text-blue-400" />
        default:
            return null
    }
}