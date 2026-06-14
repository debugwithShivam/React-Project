import React, { useContext, useRef, useState } from 'react'
import { MyContext } from '../stateManag/UIchange'
import { FilterCheckedTodo } from '../stateManag/FilterCheckedTodo'
import { MyBackgroundImg } from '../stateManag/ChangeBackgroungImg'
import { useDispatch, useSelector } from 'react-redux'
import ClickAudioFun from '../ClickAudioFun'
import img1 from '../images/img1.png'
import img2 from '../images/img2.jpg'
import img3 from '../images/img3.jpg'
import img4 from '../images/img4.jpg'
import img5 from '../images/img5.jpg'
import img6 from '../images/img6.jpg'
import img7 from '../images/img7.jpg'
import img8 from '../images/img8.jpg'
import img9 from '../images/img9.jpg'
import img10 from '../images/img10.jpg'
import img11 from '../images/img11.jpg'
import img12 from '../images/img12.jpg'
import img13 from '../images/img13.jpg'
import searchText from '../stateManag/searchBarText'
import textColorContext from '../stateManag/TextColorContetx'
import { timerComponentToggleFun } from '../Redux/Slice'


const images = [
  { img: img1 },
  { img: img2 },
  { img: img3 },
  { img: img4 },
  { img: img5 },
  { img: img6 },
  { img: img7 },
  { img: img8 },
  { img: img9 },
  { img: img10 },
  { img: img11 },
  { img: img12 },
  { img: img13 },
]
function ImgBox({ img }) {
  const { setBackImg } = useContext(MyBackgroundImg);


  return (
    <div className="box" onClick={() => setBackImg(img)}>
      <img
        src={img}
        loading="lazy"
        alt="background option"
      />
    </div>
  );
}

const textColors = [
  { name: "Mint Green", code: "#ffffffff" },
  { name: "Neon Green", code: "#2DFF9A" },
  { name: "Lime", code: "#C7F464" },
  { name: "Soft Cyan", code: "#89F7FE" },
  { name: "Sky Blue", code: "#4FC3F7" },
  { name: "Ocean Blue", code: "#0288D1" },
  { name: "Lavender", code: "#D4A5FF" },
  { name: "Purple Glow", code: "#8E44FF" },
  { name: "Soft Pink", code: "#FFB6C1" },
  { name: "Hot Pink", code: "#FF2E63" },
  { name: "Peach", code: "#FF8C94" },
  { name: "Coral", code: "#FF6F61" },
  { name: "Soft Yellow", code: "#FFF9C4" },
  { name: "Amber", code: "#FFC107" },
  { name: "Orange", code: "#FF5722" },
  { name: "Light Grey", code: "#ECEFF1" },
  { name: "Silver", code: "#B0BEC5" },
  { name: "White Glow", code: "#FFFFFF" }
];


function Box({ name }) {
  const { textColor, setTextColor } = useContext(textColorContext)

  return (
    <div className="box" style={{ background: name }} onClick={() => setTextColor(name)}>

    </div>
  )
}

export default function MakeTodo() {
  const { state, setState } = useContext(MyContext)
  const { checked, setChecked } = useContext(FilterCheckedTodo)

  const [none, setNone] = useState(false)
  const { setSearchBarText } = useContext(searchText)
  const { textColor, setTextColor } = useContext(textColorContext)

  const timerComponentToggle = useDispatch()

  return (
    <div className='Todo-top-bar'>
      <div className="top-box top-box1">
        <div className="filter">
          <button onClick={() => { setState(true) ; ClickAudioFun('two') }} style={{ color: textColor }}>Latest</button>
          <button onClick={() => { setChecked(prev => !prev) ; ClickAudioFun('two') }} style={{ color: textColor }}>Popular</button>
          <button onClick={() => { setState(false) ; ClickAudioFun('two') }} style={{ color: textColor }}>Oldest</button>
          <button onClick={() => { timerComponentToggle(timerComponentToggleFun()) ; ClickAudioFun('two') }} style={{ color: textColor }}>Timer</button>
        </div>
        <div className="search" style={{ display: 'flex', color: textColor }}>
          <input type="search" style={{ color: textColor, "--placeholder-color": textColor }} name="Search" placeholder='◯ Search' onInput={(e) => { setSearchBarText(e.target.value) }} id="" />
          <div className="cuspon-page" onClick={() => { setNone(prev => !prev);ClickAudioFun('two') }}>
            ⌂
          </div>
        </div>
      </div>
      <div className="background-img" style={{ visibility: none ? "visible" : "hidden" }}>
        {images.map((item, i) => (
          <ImgBox key={i} img={item.img} />
        ))}
        {textColors.map((item, i) => (
          <Box key={i} name={item.code} />
        ))}
      </div>
    </div>
  )
}
