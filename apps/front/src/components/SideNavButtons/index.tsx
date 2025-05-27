
import Home from "./Home";
import Search from "./Search";
import Explore from "./Explore";
import Reels from "./Reels";
import Message from "./Message";
import Notification from "./Notification";
import Create from "./Create";
import Profile from "./Profile";
import Setting from "./Setting";
import Logout from "./Logout";
import { JSX } from "react";


export type SIDE_NAV_COMPS={
    comp:JSX.Element,
    smallScreen:boolean
}

export const SideNavComps:SIDE_NAV_COMPS[] = [
    { comp: <Home/>, smallScreen: true }, 
    { comp: <Search/>, smallScreen: false }, 
    { comp: <Explore/>, smallScreen: true }, 
    { comp: <Reels/>, smallScreen: true }, 
    { comp: <Message/>, smallScreen: true }, 
    { comp: <Notification/>, smallScreen: false }, 
    { comp: <Create/>, smallScreen: true }, 
    { comp: <Profile/>, smallScreen: true },
    { comp: <Setting/>, smallScreen: false },
    { comp: <Logout/>, smallScreen: false }
    ]