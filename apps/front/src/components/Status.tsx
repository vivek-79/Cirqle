import React from 'react'
import HighlightedBackground from './HighlightedBackground'



const Status = () => {
    return (
        <ul className='w-full h-26 flex flex-row gap-3 overflow-x-auto px-10 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] [scrollbar-width:none]'>
            {Array.from({ length: 15 }).map((_, i) => (
               <HighlightedBackground key={i} text='abcdrf' />
            ))}

        </ul>
    )
}

export default Status