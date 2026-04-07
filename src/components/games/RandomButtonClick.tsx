import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

interface ClickTarget {
  id: number;
  x: number;
  y: number;
  label: string;
  glitchShift: boolean; // BUG: button shifts position on hover
  failClick: boolean;   // BUG: first click doesn't register
}

const LABELS = ["CLICK!", "HIT ME", "TAP!", "HERE!", "NOW!", "GO!", "YES!"];

const RandomButtonClick = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="RANDOM BUTTON CLICK" duration={40} onBack={onBack} info={{
      description: "화면에 랜덤으로 나타나는 버튼을 최대한 빨리 클릭하세요! 버튼은 일정 시간이 지나면 사라집니다.",
      bugs: [
        "~20%의 버튼은 마우스를 올리면 위치가 바뀝니다",
        "~15%의 버튼은 첫 번째 클릭이 무시됩니다",
        "일부 버튼이 살짝 기울어져 있을 수 있습니다",
        "타이머가 가끔 1초를 건너뛸 수 있습니다 (~10%)",
      ],
      scoring: "버튼 하나를 클릭할 때마다 15점. ~5% 확률로 점수가 1점 적게 들어올 수 있습니다.",
    }}>
      {({ addScore, isRunning }) => (
        <GameArea addScore={addScore} isRunning={isRunning} />
      )}
    </GameWrapper>
  );
};

const GameArea = ({ addScore, isRunning }: { addScore: (n: number) => void; isRunning: boolean }) => {
  const [targets, setTargets] = useState<ClickTarget[]>([]);
  const nextId = useRef(0);
  const failedClicks = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isRunning) { setTargets([]); return; }
    const spawn = setInterval(() => {
      setTargets((prev) => {
        if (prev.length >= 5) return prev;
        return [...prev, {
          id: nextId.current++,
          x: Math.random() * 75 + 5,
          y: Math.random() * 75 + 5,
          label: LABELS[Math.floor(Math.random() * LABELS.length)],
          // BUG: ~20% of buttons shift position when hovered
          glitchShift: Math.random() < 0.2,
          // BUG: ~15% of buttons don't register first click
          failClick: Math.random() < 0.15,
        }];
      });
    }, 800);

    // Auto-remove old buttons
    const cleanup = setInterval(() => {
      setTargets((prev) => prev.length > 3 ? prev.slice(1) : prev);
    }, 3000);

    return () => { clearInterval(spawn); clearInterval(cleanup); };
  }, [isRunning]);

  const handleClick = useCallback((target: ClickTarget) => {
    // BUG: if failClick is true, first click is ignored
    if (target.failClick && !failedClicks.current.has(target.id)) {
      failedClicks.current.add(target.id);
      return; // Click "fails" — nothing happens
    }
    setTargets((prev) => prev.filter((t) => t.id !== target.id));
    addScore(15);
  }, [addScore]);

  return (
    <div className="game-area w-full h-full absolute inset-0 relative select-none">
      {targets.map((t) => (
        <button
          key={t.id}
          onClick={() => handleClick(t)}
          onMouseEnter={(e) => {
            // BUG: glitch buttons shift when hovered
            if (t.glitchShift) {
              const el = e.currentTarget;
              el.style.left = `${Math.random() * 70 + 5}%`;
              el.style.top = `${Math.random() * 70 + 5}%`;
            }
          }}
          className="absolute font-pixel text-xs px-4 py-2 bg-primary text-primary-foreground rounded border-2 border-foreground hover:scale-110 transition-all duration-100 active:scale-95"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            // BUG: some buttons have glitchy rotation
            transform: t.glitchShift ? `rotate(${Math.random() * 10 - 5}deg)` : undefined,
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
