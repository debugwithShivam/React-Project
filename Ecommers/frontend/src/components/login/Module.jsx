import Spline from "@splinetool/react-spline";
import { useState } from "react";

export default function SplineScene() {
  return (
    <div className="w-150 h-148 relative top-[-54px]">
      <Spline
        key={Date.now()}
          style={{ width: '100%', height: '100%' }}
        scene="https://prod.spline.design/B5ZNXA6x9kd2qBCm/scene.splinecode"
      />
    </div>
  );
}
