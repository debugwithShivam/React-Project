import React, { useState, useEffect, useRef } from "react";
import timePageImages from "../../config/timePageImages.config";
import { db } from "../../IndexDB/focus.IndexDB";

const DEFAULT_DURATIONS = {
  deepFocus: 25 * 60,
  shortFocus: 15 * 60,
  longFocus: 50 * 60,
};

export default function Focus() {
  const [timers, setTimers] = useState({ ...DEFAULT_DURATIONS });
  const [selectedTimer, setSelectedTimer] = useState("deepFocus");
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(30);

  const sessionStartedRef = useRef(false);

  const [timerScore, setTimerScore] = useState(() => {
    const score = localStorage.getItem("score");
    return score
      ? JSON.parse(score)
      : { Sessions: 0, Completed: 0, FocusTime: 0 };
  });

  const displayTimer = timers?.[selectedTimer] ?? 0;

  useEffect(() => {
    const existingScore = localStorage.getItem("score");
    if (!existingScore) {
      const initialScore = { Sessions: 0, Completed: 0, FocusTime: 0 };
      localStorage.setItem("score", JSON.stringify(initialScore));
      setTimerScore(initialScore);
    }
  }, []);

  const persistScore = (updater) => {
    setTimerScore((prev) => {
      const updated = updater(prev);
      localStorage.setItem("score", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimers((prev) => {
        const current = prev[selectedTimer];

        if (current <= 1) {
          setIsRunning(false);
          sessionStartedRef.current = false;

          const focusedMinutes = Math.round(
            (getDuration(selectedTimer) || 0) / 60
          );

          persistScore((prevScore) => ({
            ...prevScore,
            Completed: (prevScore.Completed || 0) + 1,
            FocusTime: (prevScore.FocusTime || 0) + focusedMinutes,
          }));

          return { ...prev, [selectedTimer]: 0 };
        }

        return { ...prev, [selectedTimer]: current - 1 };
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning, selectedTimer]);

  const getDuration = (key) => {
    if (key === "custom") return customMinutes * 60;
    return DEFAULT_DURATIONS[key];
  };

  const focusPresetsObj = [
    {
      key: "deepFocus",
      icon: timePageImages.focuspageImage.icon2,
      title: "Deep Focus",
      description: "25 min focus · 5 min break",
    },
    {
      key: "shortFocus",
      icon: timePageImages.focuspageImage.icon3,
      title: "Short Focus",
      description: "15 min focus · 5 min break",
    },
    {
      key: "longFocus",
      icon: timePageImages.focuspageImage.icon4,
      title: "Long Focus",
      description: "50 min focus · 10 min break",
    },
    {
      key: "custom",
      icon: timePageImages.focuspageImage.icon5,
      title: "Custom",
      description: "Set your focus duration",
    },
  ];

  const todayFocus = [
    {
      icon: timePageImages.focuspageImage.icon6,
      title: "Focus Time",
      score: `${timerScore.FocusTime || 0}m`,
    },
    {
      icon: timePageImages.focuspageImage.icon7,
      title: "Sessions",
      score: timerScore.Sessions,
    },
    {
      icon: timePageImages.focuspageImage.icon8,
      title: "Completed",
      score: timerScore.Completed,
    },
  ];

  const minutes = Math.floor(displayTimer / 60);
  const seconds = displayTimer % 60;

  const handleSelectPreset = (key) => {
    setIsRunning(false);
    sessionStartedRef.current = false;
    setSelectedTimer(key);

    // make sure timers state has a fresh value for this preset
    setTimers((prev) => ({
      ...prev,
      [key]: key === "custom" ? customMinutes * 60 : DEFAULT_DURATIONS[key],
    }));
  };

  const handleStartPause = () => {
    if (!isRunning) {
      if (!sessionStartedRef.current) {
        sessionStartedRef.current = true;
        persistScore((prev) => ({
          ...prev,
          Sessions: (prev.Sessions || 0) + 1,
        }));
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    sessionStartedRef.current = false;
    setTimers({
      ...DEFAULT_DURATIONS,
      custom: customMinutes * 60,
    });
  };

  const handleCustomMinutesChange = (val) => {
    const mins = Math.max(1, Number(val) || 1);
    setCustomMinutes(mins);
    if (selectedTimer === "custom") {
      setTimers((prev) => ({ ...prev, custom: mins * 60 }));
    }
  };

  return (
    <div className="flex justify-center gap-5 lg:h-145 h-140 px-5">
      <div
        className="
          w-115
          rounded-[28px]
          bg-white/15
          backdrop-blur-xl
          border border-white/10
          shadow-[0_20px_50px_rgba(0,0,0,0.08)]
          overflow-hidden
        "
      >
        <div className="h-40 flex flex-col justify-center items-center text-center">
          <span
            className="
              flex items-center justify-center
              w-15 h-15
              rounded-full
              bg-white/10
              border border-white/15
              backdrop-blur-md
              mb-3
            "
          >
            <img
              src={timePageImages.focuspageImage.icon1}
              className="w-9 h-9 object-contain opacity-90"
              alt=""
            />
          </span>
          <h1 className="text-2xl font-semibold text-white">
            Ready to Focus?
          </h1>
          <p className="text-sm text-white/65 mt-1">
            Stay focused and get more done.
          </p>
          <p className="text-sm text-white/65">You've got this!</p>
        </div>

        <div className="h-75 flex justify-center flex-col items-center">
          {selectedTimer === "custom" && (
          <div className="flex justify-center items-center gap-2 -mt-4 mb-2">
            <label className="text-white/80 font-extrabold ">Minutes:</label>
            <input
              type="number"
              min={1}
              value={customMinutes}
              onChange={(e) => handleCustomMinutesChange(e.target.value)}
              className="w-16 px-2 py-1 rounded-md bg-white/10 border border-white/20 text-white text-sm text-center outline-none"
            />
          </div>
        )}
          <div
            className="
              w-64 h-64
              rounded-full
              p-[2px]
              bg-[conic-gradient(from_220deg,#ffffff33_0deg,#E8B904_120deg,#E8B904_180deg,#ffffff22_270deg,#ffffff22_360deg)]
              shadow-[0_0_30px_rgba(232,185,4,0.12)]
            "
          >
            
            <div
              className="
                w-full h-full
                rounded-full
                flex justify-center items-center
                bg-white/5
                backdrop-blur-md
                border border-white/10
              "
            >
              <h1
                className="
                  text-7xl
                  font-medium
                  tracking-tight
                  text-white
                  drop-shadow-[0_3px_10px_rgba(0,0,0,0.15)]
                "
              >
                {minutes}:{seconds.toString().padStart(2, "0")}
              </h1>
            </div>
          </div>
        </div>

        

        <div className="flex flex-col justify-center items-center">
          <button
            onClick={handleStartPause}
            className="
              w-36
              py-2.5
              rounded-full
              bg-[#E8B904]
              hover:bg-[#f4c51c]
              active:scale-95
              transition-all
              text-black
              font-semibold
              shadow-[0_5px_20px_rgba(232,185,4,0.2)]
            "
          >
            {isRunning ? "Pause" : "Start Focus"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1 w-22 py-1 mt-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition text-white/75 text-sm"
          >
            <span className="text-base">↻</span>
            Reset
          </button>
        </div>
      </div>

      <div className="w-120 flex flex-col gap-5">
        <div
          className="
            rounded-[28px]
            bg-white/10
            backdrop-blur-xl
            border border-white/20
            p-7
            shadow-[0_20px_50px_rgba(0,0,0,0.08)]
          "
        >
          <h1 className="text-lg font-semibold text-white mb-4">
            Focus Presets
          </h1>
          <div className="flex flex-col gap-2.5">
            {focusPresetsObj.map((item, index) => {
              const isSelected = item.key === selectedTimer;
              return (
                <div
                  onClick={() => handleSelectPreset(item.key)}
                  key={item.title}
                  className={`
                    group
                    flex items-center
                    justify-between
                    rounded-xl
                    px-3 py-2.5
                    border
                    transition-all
                    cursor-pointer
                    ${
                      isSelected
                        ? "bg-white/15 border-white/10"
                        : "bg-white/10 border-transparent hover:bg-white/15"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-10 h-10
                        rounded-full
                        flex items-center justify-center
                        ${
                          index === 0
                            ? "bg-purple-400/30"
                            : index === 1
                            ? "bg-orange-400/30"
                            : index === 2
                            ? "bg-green-400/30"
                            : "bg-purple-300/20"
                        }
                      `}
                    >
                      <img
                        src={item.icon}
                        alt=""
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="text-sm font-medium text-white">
                        {item.title}
                      </h2>
                      <p className="text-xs text-white/55 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`
                      w-5 h-5
                      rounded-full
                      flex items-center justify-center
                      border
                      ${
                        isSelected
                          ? "border-[#E8B904] bg-[#E8B904]"
                          : "border-white/60 bg-transparent"
                      }
                    `}
                  >
                    {isSelected && (
                      <span className="text-black text-xs font-bold">✓</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="
            rounded-[28px]
            bg-white/10
            backdrop-blur-xl
            border border-white/10
            flex-1
            shadow-[0_20px_50px_rgba(0,0,0,0.08)]
          "
        >
          <h1 className="text-lg pl-3 pt-1 font-semibold text-white mb-5">
            Today's Focus
          </h1>
          <div className="flex justify-between items-center h-full max-h-25">
            {todayFocus.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center justify-center flex-1"
              >
                <div
                  className="
                    w-11 h-11
                    rounded-full
                    flex items-center justify-center
                    bg-white/5
                    mb-2
                  "
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="text-base font-semibold text-white">
                  {item.score}
                </div>
                <div className="text-xs text-white/50 mt-0.5">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

