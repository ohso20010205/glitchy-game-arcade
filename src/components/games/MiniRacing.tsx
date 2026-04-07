import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  visible: boolean; // BUG: obstacles can flicker
}

const MiniRacing = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="MINI RACING" duration={60} onBack={onBack} info={{
      description: "방향키(↑↓)로 차선을 변경하며 장애물을 피하세요! 시간이 지날수록 속도가 빨라집니다.",
      bugs: [
        "속도가 갑자기 변할 수 있습니다 (~8%)",
        "장애물이 깜빡이거나 사라질 수 있습니다 (~5%)",
        "차선 변경이 살짝 지연될 수 있습니다",
        "타이머가 가끔 1초를 건너뛸 수 있습니다 (~10%)",
      ],
      scoring: "장애물을 피할 때마다 10점. ~5% 확률로 점수가 1점 적게 들어올 수 있습니다.",
    }}>
      {({ addScore, isRunning }) => (
        <GameArea addScore={addScore} isRunning={isRunning} />
      )}
    </GameWrapper>
  );
};

const GameArea = ({ addScore, isRunning }: { addScore: (n: number) => void; isRunning: boolean }) => {
  const [lane, setLane] = useState(1); // 0, 1, 2 (3 lanes)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [speed, setSpeed] = useState(3);
  const [distance, setDistance] = useState(0);
  const nextId = useRef(0);
  const frameRef = useRef<number>();

  // Keyboard/touch controls
  useEffect(() => {
    if (!isRunning) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") setLane((l) => Math.max(0, l - 1));
      if (e.key === "ArrowRight" || e.key === "d") setLane((l) => Math.min(2, l + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning]);

  // Spawn obstacles
  useEffect(() => {
    if (!isRunning) { setObstacles([]); setDistance(0); return; }
    const interval = setInterval(() => {
      setObstacles((prev) => [
        ...prev,
        {
          id: nextId.current++,
          lane: Math.floor(Math.random() * 3),
          y: -5,
          // BUG: ~10% of obstacles are invisible (appear/disappear)
          visible: Math.random() > 0.1,
        },
      ]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Game loop
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      // BUG: ~8% chance speed randomly fluctuates
      setSpeed((s) => {
        if (Math.random() < 0.08) return Math.max(1, s + (Math.random() * 4 - 2));
        return s;
      });

      setDistance((d) => d + 1);

      setObstacles((prev) => {
        const updated = prev
          .map((o) => ({
            ...o,
            y: o.y + speed,
            // BUG: obstacles randomly flicker visibility
            visible: Math.random() < 0.05 ? !o.visible : o.visible,
          }))
          .filter((o) => o.y < 105);
        return updated;
      });

      // Score for survival
      if (Math.random() < 0.1) addScore(1);

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [isRunning, speed, addScore]);

  // Collision detection
  useEffect(() => {
    obstacles.forEach((o) => {
      if (o.y > 80 && o.y < 95 && o.lane === lane && o.visible) {
        // Hit! Lose points
        addScore(-5);
        setObstacles((prev) => prev.filter((p) => p.id !== o.id));
      }
    });
  }, [obstacles, lane, addScore]);

  const laneX = [15, 45, 75]; // percentage positions

  return (
    <div className="game-area w-full h-full absolute inset-0 relative select-none overflow-hidden">
      {/* Track lanes */}
      <div className="absolute inset-0 flex">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 border-x border-border/30"
            onClick={() => isRunning && setLane(i)}
          />
        ))}
      </div>

      {/* Player car */}
      {isRunning && (
        <div
          className="absolute bottom-8 w-10 h-14 rounded-md border-2 border-primary transition-all duration-150 flex items-center justify-center font-pixel text-xs text-primary"
          style={{
            left: `calc(${laneX[lane]}% - 20px)`,
            backgroundColor: "hsl(var(--card))",
            boxShadow: "0 0 12px hsl(120 100% 50% / 0.5)",
          }}
        >
          ▲
        </div>
      )}

      {/* Obstacles */}
      {obstacles.map((o) => (
        <div
          key={o.id}
          className="absolute w-10 h-8 rounded border border-destructive flex items-center justify-center font-pixel text-xs"
          style={{
            left: `calc(${laneX[o.lane]}% - 20px)`,
            top: `${o.y}%`,
            backgroundColor: "hsl(var(--destructive))",
            opacity: o.visible ? 1 : 0.1,
          }}
        >
          ✖
        </div>
      ))}

      {/* Mobile controls */}
      {isRunning && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-8 sm:hidden">
          <button onClick={() => setLane((l) => Math.max(0, l - 1))} className="font-pixel text-lg px-4 py-2 bg-muted rounded text-foreground">←</button>
          <button onClick={() => setLane((l) => Math.min(2, l + 1))} className="font-pixel text-lg px-4 py-2 bg-muted rounded text-foreground">→</button>
        </div>
      )}

      {!isRunning && (
        <div className="flex items-center justify-center h-full font-mono text-muted-foreground text-sm text-center px-4">
          Use ←→ keys or tap lanes to dodge obstacles!
        </div>
      )}
    </div>
  );
};

export default MiniRacing;
