
" use client"
import CreatePost from "../CreatePost";
import SideNavButton from "./Button"
import { MdOutlineAddBox } from "react-icons/md";
import { useModelName, useStoredUser, useUnseenMessageActions } from "@/hooks/store.actions";

const Create = () => {
    const user = useStoredUser();
     const modelName = useModelName();
      const { setModels} = useUnseenMessageActions();

    if(!user) return;
    return (
        <div>
            <SideNavButton 
            Icon={MdOutlineAddBox} 
            size={28}
            onPress={()=>{
                setModels(modelName == "create" ?"" : "create")
            }} 
            content="Create" 
            />
            {modelName =="create" && (
                <div className='fixed inset-0 flex items-center justify-center flex-col bg-black/50'>
                    <CreatePost userId={user.id} accessToken={user.accessToken} />
                </div>
            )}
        </div>
    )
}

export default Create;
