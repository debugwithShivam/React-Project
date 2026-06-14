import React from 'react'
import clickCudio from './clickAudio.wav'
import top from './Top.mp3'
export default function ClickAudioFun(aud1) {
    let audtio = new Audio()
    if(aud1 == 'one'){
         audtio.src = clickCudio
       audtio.play()
    }else if(aud1 == 'two'){    
       audtio.src = top
       audtio.play()
    
   }
}
