import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

interface ClickTarget {
  id: number;
  x: number;
  y: number;
  label: string;
  glitchShift: boolean;
  failClick: boolean;
  rotation: number;
  size: "sm" | "md" | "lg" | "xl";
}

const LABELS = ["CLICK!", "HIT ME", "TAP!", "HERE!", "NOW!", "GO!", "YES!"];

const RandomButtonClick = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper
      title="RANDOM BUTTON CLICK"
      duration={40}
      onBack={onBack}
      info={{
        description:
          "화면에 랜덤으로 나타나는 버튼을 최대한 빨리 클릭하세요! 버튼은 일정 시간이 지나면 사라집니다.",
        bugs: [
          "~20%의 버튼은 마우스를 올리면 위치가 바뀝니다",
          "~15%의 버튼은 첫 번째 클릭이 무시됩니다",
          "일부 버튼이 살짝 기울어져 있을 수 있습니다",
          "타이머가 가끔 1초를 건너뛸 수 있습니다 (~10%)",
        ],
        scoring:
          "버튼 하나를 클릭할 때마다 15점. ~5% 확률로 점수가 1점 적게 들어올 수 있습니다.",
      }}
    >
      {({ addScore, isRunning }) => (
        <GameArea addScore={addScore} isRunning={isRunning} />
      )}
    </GameWrapper>
  );
};

const GameArea = ({
  addScore,
  isRunning,
}: {
  addScore: (n: number) => void;
  isRunning: boolean;
}) => {
  const [targets, setTargets] = useState<ClickTarget[]>([]);
  const nextId = useRef(0);
  const failedClicks = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isRunning) {
      setTargets([]);
      failedClicks.current.clear();
      return;
    }

    const spawn = setInterval(() => {
      setTargets((prev) => {
        if (prev.length >= 5) return prev;

        const isGlitch = Math.random() < 0.2;
        const sizeRoll = Math.random();
        const size =
          sizeRoll < 0.25 ? "sm" : sizeRoll < 0.55 ? "md" : sizeRoll < 0.8 ? "lg" : "xl";

        return [
          ...prev,
          {
            id: nextId.current++,
            x: Math.random() * 75 + 5,
            y: Math.random() * 75 + 5,
            label: LABELS[Math.floor(Math.random() * LABELS.length)],
            glitchShift: isGlitch,
            failClick: Math.random() < 0.15,
            rotation: isGlitch ? Math.random() * 10 - 5 : 0,
            size,
          },
        ];
      });
    }, 800);

    const cleanup = setInterval(() => {
      setTargets((prev) => (prev.length > 3 ? prev.slice(1) : prev));
    }, 3000);

    return () => {
      clearInterval(spawn);
      clearInterval(cleanup);
    };
  }, [isRunning]);

  const handleClick = useCallback(
    (target: ClickTarget) => {
      if (target.failClick && !failedClicks.current.has(target.id)) {
        failedClicks.current.add(target.id);
        return;
      }

      setTargets((prev) => prev.filter((t) => t.id !== target.id));
      failedClicks.current.delete(target.id);
      addScore(15);
    },
    [addScore]
  );

  const sizeStyles: Record<ClickTarget["size"], string> = {
    sm: "px-2 py-1 text-[9px]",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-3 text-sm",
    xl: "px-8 py-5 text-base",
  };

  return (
    <div className="game-area w-full h-full absolute inset-0 relative select-none">
      {targets.map((t) => (
        <button
          key={t.id}
          onClick={() => handleClick(t)}
          onMouseEnter={(e) => {
            if (t.glitchShift) {
              const el = e.currentTarget;
              el.style.left = `${Math.random() * 70 + 5}%`;
              el.style.top = `${Math.random() * 70 + 5}%`;
            }
          }}
          className={`absolute font-pixel bg-primary text-primary-foreground rounded border-2 border-foreground hover:scale-110 transition-all duration-100 active:scale-95 ${sizeStyles[t.size]}`}
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            transform: t.rotation !== 0 ? `rotate(${t.rotation}deg)` : undefined,
          }}
        >
          {t.label}
        </button>
      ))}

      {!isRunning && targets.length === 0 && (
        <div className="flex items-center justify-center h-full font-mono text-muted-foreground text-sm">
          Click buttons as fast as you can!
        </div>
      )}
    </div>
  );
};

export default RandomButtonClick;