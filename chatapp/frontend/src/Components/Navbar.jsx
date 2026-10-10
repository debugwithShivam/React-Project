import React from 'react'
import settingicon from '../Images/setting-icon.png'
import DefultAccountFace from '../Images/Defult-Account-Face.jpg'
import profilepicture1 from '../Images/profile-picture-1.jpg'
import profilepicture2 from '../Images/profile-picture-2.jpg'
import profilepicture3 from '../Images/profile-picture-3.jpg'
export default function Navbar() {
    return (
        <nav className=' h-14 flex'>
            <div className='w-full   items-center flex pl-3'>
                <img src={settingicon} alt="" className='bg-white rounded-full w-12 bg-cover h-12' />
            </div>
            <div className='w-full border-2 items-center  flex justify-end gap-5 pr-10 '>
                <div className='w-auto pl-3 pr-3 h-12 flex justify-center items-center gap-3 rounded-full bg-black'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="19px" viewBox="24 -936 912 912" width="19px"><path
                        fill="#FFFFFF"
                        d="m352-293 128-76 129 76-34-144 111-95-147-13-59-137-59 137-147 13 112 95-34 144ZM243-144l63-266L96-589l276-24 108-251 108 252 276 23-210 179 63 266-237-141-237 141Zm237-333Z"
                    />
                    </svg>
                    <img src={profilepicture1} className='w-9 h-9 rounded-full' alt="" />
                    <img src={profilepicture2} className='w-9 h-9 rounded-full' alt="" />
                    <img src={profilepicture3} className='w-9 h-9 rounded-full' alt="" />
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="19px" fill="#FFFFFF"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" /></svg>
                </div>
                <div>
                    <div className='items-center flex justify-center '>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" /></svg>
                        <img src={DefultAccountFace} className='h-9 w-9 rounded-full' alt="" />
                        <div>
                            <h3>Shivam Pandey</h3>
                            <h4>Sugar Group</h4>
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    )
}
