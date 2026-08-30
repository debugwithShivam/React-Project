import Focus from "../page/Timer/Focus";
import StopWatch from "../page/Timer/StopWatch";
import Header from "../page/Timer/Header";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function Timer() {
  const {TimerPage} = useSelector((state) => state.state);
  return (
    <div className="min-h-screen  px-6 py-10 md:px-10">
      <Header/>
      {TimerPage == "Focus" && <Focus/>}
      {TimerPage == "Stop Watch" && <StopWatch/>}
    </div>
  );
}
