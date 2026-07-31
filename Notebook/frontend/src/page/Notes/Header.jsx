import React from 'react'

export default function Header() {
  return (
    <div className=' flex p-3 justify-between'>
      <h1 className='text-xl font-semibold'>Sticky Notes</h1>
      <input type="search" name="" id="" className=' w-90 border-2 border-white p-1 placeholder:text-white pl-2 rounded-2xl outline-none' placeholder='Search Your Notes' />
      <button className=' bg-black/40 text-white font-normal pl-2 pr-2' onClick={()=>window.electron.openNoteWindow()}>✎ Create Notes</button>
    </div>
  )
}
