import Link from "next/link";
import SideNavButton from "./Button"
import { MdHomeFilled } from "react-icons/md";


const Home = () => {
  return (
    <Link href="/">
          <SideNavButton Icon={MdHomeFilled} content="Home"/>
      </Link>
  )
}

export default Home