import React from 'react'
import clickCudio from '../../assets/audio/clickAudio.wav'
import top from '../../assets/audio/Top.mp3'
export default function ClickAudioFun(aud1) {
    let audtio = new Audio()
    if(aud1 == 'one'){
         audtio.src = clickCudio
       audtio.play()
    }else if(aud1 == 'two'){    
       audtio.src = top
       audtio.play()
    }else if(aud1 == "muted"){
      return alert("Audio is muted")
    }
}
