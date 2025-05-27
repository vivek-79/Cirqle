import React, { useEffect } from "react";
import { useModelName } from "./store.actions";


type ClickProps = {
    ref: React.RefObject<HTMLElement | null>,
    action: () => void;
}
export const useClickOutSide = ({ ref, action }: ClickProps) => {

    const modelname = useModelName()

    useEffect(() => {
        const handleClickOutSide = (e: MouseEvent) => {

            if (ref.current && !ref.current.contains(e.target as Node)){

                action()
            }
        }

        window.addEventListener("click", handleClickOutSide)

        return ()=> window.removeEventListener("click",handleClickOutSide)
    }, [ref,action])


}