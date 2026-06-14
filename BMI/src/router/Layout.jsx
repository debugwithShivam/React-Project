import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function layout() {
    return (
        <>
            <div className=' w-full fixed flex bg-black text-white h-13 justify-center items-center text-xl gap-5 montserrat-uniquifier'>
                <Link to='/'> <h2>Home</h2> </Link>
                <Link to='/BMI'> <h2>BMI</h2> </Link>
                <Link to='/History'> <h2>History</h2> </Link>
                <Link to='/Search'> <h2>Search</h2> </Link>
            </div>
            <Outlet />
        </>
    )
}
