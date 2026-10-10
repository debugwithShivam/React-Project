import React from 'react';
import wallpaper from '../Images/ChatApp-Wallpaper.jpg';
import Navbar from './Navbar';

export default function HomePage() {
    return (
        <div
            className="app-container w-screen h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${wallpaper})` }}
        >
            <Navbar/>
        </div>
    );
}
