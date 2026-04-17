import { useState, useEffect, useRef } from "react";
import GameWrapper from "../GameWrapper";

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  visible: boolean;
}

function getRacingGrade(score: number) {
  if (score >= 150) {
    return { lanes: 5, safeCount: 1, spawnMs: 600, label: "💀 INSANE", speedBase: 5.5 };
  }
  if (score >= 80) {
    return { lanes: 5, safeCount: 2, spawnMs: 750, label: "🔴 EXPERT", speedBase: 4.5 };
  }
  if (score >= 40) {
    return { lanes: 4, safeCount: 2, spawnMs: 900, label: "🟡 HARD", speedBase: 3.5 };
  }
  if (score >= 15) {
    return { lanes: 4, safeCount: 2, spawnMs: 1100, label: "🔵 NORMAL", speedBase: 2.5 };
  }
  return { lanes: 3, safeCount: 2, spawnMs: 1400, label: "🟢 BEGIN", speedBase: 2.0 };
}

const MiniRacing = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper
      title="MINI RACING"
      duration={60}
      onBack={onBack}
      info={{
        description:
          "방향키(←→)로 차선을 변경하며 장애물을 피하세요! 점수가 오를수록 차선이 많아지고 장애물이 더 촘촘해집니다.",
        bugs: [
          "속도가 갑자기 변할 수 있습니다 (~8%)",
          "장애물이 깜빡이거나 사라질 수 있습니다 (~5%)",
          "차선 변경이 살짝 지연될 수 있습니다",
          "타이머가 가끔 1초를 건너뛸 수 있습니다 (~10%)",
        ],
        scoring: "생존 시간에 따라 지속 점수 획득. 점수가 높아질수록 차선 수 증가, 안전 통로 감소!",
      }}
    >
      {({ addScore, isRunning, score }) => (
        <GameArea addScore={addScore} isRunning={isRunning} score={score} />
      )}
    </GameWrapper>
  );
};

const GameArea = ({
  addScore,
  isRunning,
  score,
}: {
  addScore: (n: number) => void;
  isRunning: boolean;
  score: number;
}) => {
  const gradeRef = useRef(getRacingGrade(0));
  const [laneCount, setLaneCount] = useState(3);
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const nextId = useRef(0);
  const frameRef = useRef<number | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const g = getRacingGrade(score);
    gradeRef.current = g;
    setLaneCount(g.lanes);
    setLane((l) => Math.min(l, g.lanes - 1));
  }, [score]);

  useEffect(() => {
    if (!isRunning) {
      setObstacles([]);
      if (spawnRef.current) clearInterval(spawnRef.current);
      return;
    }

    if (spawnRef.current) clearInterval(spawnRef.current);

    spawnRef.current = setInterval(() => {
      const g = gradeRef.current;
      const lanes = g.lanes;
      const safe = g.safeCount;

      const allLanes = Array.from({ length: lanes }, (_, i) => i);
      const shuffled = [...allLanes].sort(() => Math.random() - 0.5);
      const blocked = shuffled.slice(0, lanes - safe);

      setObstacles((prev) => [
        ...prev,
        ...blocked.map((bl) => ({
          id: nextId.current++,
          lane: bl,
          y: -8,
          visible: Math.random() > 0.05,
        })),
      ]);
    }, gradeRef.current.spawnMs);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [isRunning, score]);

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const g = gradeRef.current;
      const effectiveSpeed =
        Math.random() < 0.08 ? g.speedBase * (0.6 + Math.random() * 0.8) : g.speedBase;

      setObstacles((prev) =>
        prev
          .map((o) => ({
            ...o,
            y: o.y + effectiveSpeed,
            visible: Math.random() < 0.05 ? !o.visible : o.visible,
          }))
          .filter((o) => o.y < 110)
      );

      if (Math.random() < 0.08) addScore(1);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isRunning, addScore]);

  useEffect(() => {
    obstacles.forEach((o) => {
      if (o.y > 80 && o.y < 96 && o.lane === lane && o.visible) {
        addScore(-5);
        setObstacles((prev) => prev.filter((p) => p.id !== o.id));
      }
    });
  }, [obstacles, lane, addScore]);

  useEffect(() => {
    if (!isRunning) return;

    const handler = (e: KeyboardEvent) => {
      const g = gradeRef.current;
      if (e.key === "ArrowLeft" || e.key === "a") {
        setLane((l) => Math.max(0, l - 1));
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setLane((l) => Math.min(g.lanes - 1, l + 1));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning]);

  const grade = getRacingGrade(score);
  const lanePositions = Array.from({ length: laneCount }, (_, i) =>
    Math.round((100 / laneCount) * (i + 0.5))
  );

  return (
    <div className="game-area w-full h-full absolute inset-0 relative select-none overflow-hidden">
      {isRunning && (
        <div
          className="absolute top-2 right-2 font-pixel text-[10px] px-2 py-1 rounded z-10"
          style={{
            color: "hsl(180 100% 50%)",
            border: "1px solid hsl(180 100% 50%)",
            background: "hsl(240 10% 6% / 0.8)",
          }}
        >
          {grade.label} | {laneCount}레인
        </div>
      )}

      <div className="absolute inset-0 flex">
        {Array.from({ length: laneCount }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border-x border-border/30"
            onClick={() => isRunning && setLane(i)}
          />
        ))}
      </div>

      {isRunning && (
        <div
          className="absolute bottom-8 w-8 h-12 rounded-md border-2 border-primary flex items-center justify-center font-pixel text-xs text-primary transition-all duration-100"
          style={{
            left: `calc(${lanePositions[lane]}% - 16px)`,
            backgroundColor: "hsl(var(--card))",
            boxShadow: "0 0 12px hsl(120 100% 50% / 0.5)",
          }}
        >
          ▲
        </div>
      )}

      {obstacles.map((o) => {
        const lx = lanePositions[o.lane] ?? 50;

        return (
          <div
            key={o.id}
            className="absolute w-8 h-7 rounded border border-destructive flex items-center justify-center font-pixel text-[10px]"
            style={{
              left: `calc(${lx}% - 16px)`,
              top: `${o.y}%`,
              backgroundColor: "hsl(var(--destructive))",
              opacity: o.visible ? 1 : 0.08,
            }}
          >
            ✖
          </div>
        );
      })}

      {isRunning && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-6 sm:hidden">
          <button
            onClick={() => setLane((l) => Math.max(0, l - 1))}
            className="font-pixel text-lg px-4 py-2 bg-muted rounded text-foreground"
          >
            ←
          </button>
          <button
            onClick={() => setLane((l) => Math.min(laneCount - 1, l + 1))}
            className="font-pixel text-lg px-4 py-2 bg-muted rounded text-foreground"
          >
            →
          </button>
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