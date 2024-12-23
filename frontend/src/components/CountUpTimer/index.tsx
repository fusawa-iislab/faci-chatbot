import React, { useState, useEffect } from "react";

const CountUpTimer = () => {
  const [timeElapsed, setTimeElapsed] = useState(0); // 経過時間を秒単位で管理

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer); // クリーンアップ
  }, []);
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

  return (
    <div>
      <p>{formatTime(timeElapsed)}</p>
    </div>
  );
};

export default CountUpTimer;
