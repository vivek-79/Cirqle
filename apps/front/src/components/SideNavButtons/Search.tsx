
"use client"
import { useRef } from "react";
import SideNavButton from "./Button"
import { IoSearchOutline } from "react-icons/io5";
import SearchComp from "../LeftSlider/SearchComp";
import { useModelName, useUnseenMessageActions } from "@/hooks/store.actions";
import { useClickOutSide } from "@/hooks/useClickOutside";

const Search = () => {


    const searchRef = useRef<HTMLDivElement>(null);
    const modelName = useModelName();
    const { setModels } = useUnseenMessageActions();
    const isOpen = modelName === 'search';

    useClickOutSide({
        ref: searchRef,
        action: () => {
            if (isOpen) setModels('')
        }
    })


    return (
        <div
            ref={searchRef}
        >
            <SideNavButton
                Icon={IoSearchOutline}
                content="Search"
                onPress={() => {
                    setModels(isOpen ? '' : 'search')
                }}
            />

            <div style={{ width: modelName == "search" ? 310 : 0 }} className='fixed top-0 left-18 xl:left-38 bottom-0 z-50 bg-black overflow-hidden pt-8 transition-all duration-500 shadow-md shadow-white'>
                <SearchComp />
            </div>
        </div>
    )
}

export default Search;