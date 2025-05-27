import Image from "next/image";



const Profile = () => {
    return (
        <div className="side-nav-btn">
            <Image src={"/person.webp"} height={16} width={16} alt='profile-pic' className='w-6 h-6 object-cover object-center rounded-full' />
            <span className='max-xl:hidden block'>profile</span>
        </div>
    )
}

export default Profile;