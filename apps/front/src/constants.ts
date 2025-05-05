import { IoSearchOutline } from "react-icons/io5";
import { MdHomeFilled } from "react-icons/md";
import { TbMessageCircleBolt } from "react-icons/tb";
import { SideNav } from "./types";
import { MdOutlineAddBox } from "react-icons/md";
import { IoIosTrendingUp } from "react-icons/io";
import { IoIosHeartEmpty } from "react-icons/io";
import { TfiVideoClapper } from "react-icons/tfi";
import { IoSettingsOutline } from "react-icons/io5";
import { PiSignOut } from "react-icons/pi";
export const sideNav:SideNav[] =[
    { name: "Home", icon: MdHomeFilled, size: 26 ,link:true},
    { name: "Search", icon: IoSearchOutline, size: 26,link:false,large:true },
    { name: "Explore", icon: IoIosTrendingUp, size: 26, link: false },
    { name: "Reels", icon: TfiVideoClapper, size: 24, link: true },
    { name: "Messages", icon: TbMessageCircleBolt, size: 26, link: true },
    { name: "Notifications", icon: IoIosHeartEmpty, size: 26, link: false,large: true },
    { name: "Create", icon: MdOutlineAddBox, size: 26, link: false },
    { name: "Profile",link:true },
    { name: "Setting", icon: IoSettingsOutline, size: 26, link: true, large: true },
    { name: "LogOut", icon: PiSignOut, size: 26, link: true, large: true },
]

export const api = process.env.NEXT_PUBLIC_BACKEND_URI!
export const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL!;
export const AccessToken =(token:string | null | undefined)=>({
    Authorization: `Bearer ${token}`,                 
})