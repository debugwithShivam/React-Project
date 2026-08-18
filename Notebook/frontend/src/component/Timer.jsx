import Focus from "../page/Timer/Focus";
import Alarm from "../page/Timer/Alarm";
import StopWatch from "../page/Timer/StopWatch";
import SetTimer from "../page/Timer/SetTimer";
import Header from "../page/Timer/Header";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function Timer() {
  const {TimerPage} = useSelector((state) => state.state);
  console.log(TimerPage)
  return (
    <div className="min-h-screen  px-6 py-10 md:px-10">
      <Header/>
      {TimerPage == "Focus" && <Focus/>}
      {TimerPage == "Alarm" && <Alarm/>}
      {TimerPage == "Stop Watch" && <StopWatch/>}
      {TimerPage == "Timer" && <SetTimer/>}
    </div>
  );
}
