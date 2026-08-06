import React from 'react'
import Header from './Header'
import AddMusicForm from './AddMusicForm'
import MusicContainer from './MusicContainer'
import Footer from './Footer'

export default function MusicPage() {
  return (
 
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background:
            'linear-gradient(115deg, #f3d9ad 0%, #ecd9e6 28%, #cbb6d6 45%, #8a6a86 62%, #4a2f3d 80%, #2c1c26 100%)',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: '#2a1f26'
        }}
      >
        <Header />
        <div className='flex flex-col  relative  mt-[-4rem] h-100 '>
        <AddMusicForm />
        <MusicContainer />
        <Footer />
        </div>
      </div>
  )
}
