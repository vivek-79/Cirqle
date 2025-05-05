import { RootState } from "@/store/store";
import { User } from "@/types";
import { useSelector } from "react-redux";


export const useStoredUser =():User=> useSelector((state:RootState)=>state.auth.data) as User