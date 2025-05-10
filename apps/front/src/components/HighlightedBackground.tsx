import { CloudImage } from '@/helpers/getFullImageUrl';
import Image from 'next/image';
import React from 'react'

type Props = {
    text?: string;
    img?: string;
    scale?: number
}

const HighlightedBackground = ({ text, img, scale }: Props) => {
    return (
        <li style={{ scale }} className='h-full w-17 relative flex-shrink-0 truncate list-none'>
            <span className='w-17 h-17 absolute  bg-gradient-to-bl from-red-400 to-yellow-300 inset-0 rounded-full z-10 top-1'></span>
            {img ? (
                <Image src={"/person.webp"} height={12} width={12} alt={img} className='w-17 h-17 absolute bg-black inset-0 rounded-full z-20 scale-95 top-1 object-cover object-center' />
            ) : (
                <span className='w-17 h-17 absolute  bg-black scale-95 inset-0 rounded-full z-10 top-1'></span>
            )}
            <span className='absolute bottom-0 w-full tracking-tighter text-center'>{text ?? text}</span>
        </li>
    )
}

export default HighlightedBackground