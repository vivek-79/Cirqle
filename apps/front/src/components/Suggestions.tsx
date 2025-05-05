import React from 'react'

type Props = {}

const Suggestions = (props: Props) => {
    return (
        <div className='w-full pl-6 '>
            <div className='w-fit mx-auto'>
                <div className=' h-24  flex flex-row items-center'>
                    <div className='w-12 h-12 rounded-full bg-white'></div>
                    <div className='flex flex-col ml-2 justify-center leading-4.5 min-w-[200px]'>
                        <p className='font-medium'>its_vivek_15</p>
                        <p className='text-gray-400'>Vivek</p>
                    </div>
                    <button className='text-sm tracking-tight text-blue-500 hover-white'>Switch</button>
                </div>


                {/* suggestions */}
                <div className='flex'>
                    <p className=' text-left font-bold text-gray-400 min-w-[256px]'>Suggested for you</p>
                    <button className='text-sm tracking-tight text-white font-semibold hover-black'>See All</button>
                </div>
                <div className='mx-auto w-fit h-24 flex flex-row items-center'>

                    <div className='w-12 h-12 rounded-full bg-white'></div>
                    <div className='flex flex-col ml-2 justify-center leading-4.5 min-w-[200px]'>
                        <p className='font-medium'>its_vivek_15</p>
                        <p className='text-gray-400'>Vivek</p>
                    </div>
                    <button className='text-sm tracking-tight text-blue-500 font-semibold hover-white'>Follow</button>
                </div>
            </div>
        </div>
    )
}

export default Suggestions