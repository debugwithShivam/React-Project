import React ,{useState,useEffect}from 'react'

export default function StopWatch() {
   const [timer, setTimer] = useState({
    houre: 0,
    minutes: 0,
    second: 0,
  });
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return
    let timer = setInterval(() => {
      setTimer((prev) => {
        if (prev.second == 59) {
          if (prev.minutes == 59) {
            return {
              houre: prev.houre + 1,
              second: 0,
              minutes: 0
            }
          }
          return {
            ...prev,
            second: 0,
            minutes: prev.minutes + 1
          }
        }
        return {
          ...prev,
          second:prev.second == 60 ? prev.second = 0:prev.second+1
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning])
  return (
    <div className='flex justify-center gap-5 lg:h-145 h-140 p-5  items-center'>
      <div className=' w-full h-full flex justify-center items-center flex-col  rounded-3xl bg-black/30'>
        <div className='flex text-9xl'>
          <h1>{timer?.houre.toString().padStart(2, "0")}</h1>
          <span>:</span>
          <h1>{timer?.minutes.toString().padStart(2, "0")}</h1>
          <span>:</span>
          <h1>{timer?.second.toString().padStart(2, "0")}</h1>
        </div>
        <div className='flex gap-10 m-5'>
          <button className='text-2xl rounded-full p-2 w-40 bg-[#E8B904]' onClick={() => setIsRunning(isRunning => !isRunning)}>Start</button>
          <button className='text-2xl rounded-full p-2 w-40 bg-white/50'  onClick={() => { setTimer({
            houre: 0,
            minutes: 0,
            second: 0,
          })}}>Restart</button>
          <button className='text-2xl rounded-full p-2 w-40 bg-white/30' onClick={() => {setIsRunning(false), setTimer({
            houre: 0,
            minutes: 0,
            second: 0,
          })}}>Reset</button>
        </div>
      </div>

    </div>
  )
}
