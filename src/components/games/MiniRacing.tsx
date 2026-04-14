import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

interface Obstacle {
  id: number;
  lane: number;
  y: number;
<<<<<<< HEAD
  visible: boolean;
}

/** 점수에 따른 레이싱 난이도 */
function getRacingGrade(score: number) {
  if (score >= 150) return { lanes: 5, safeCount: 1, spawnMs: 600,  label: "💀 INSANE", speedBase: 5.5 };
  if (score >= 80)  return { lanes: 5, safeCount: 2, spawnMs: 750,  label: "🔴 EXPERT", speedBase: 4.5 };
  if (score >= 40)  return { lanes: 4, safeCount: 2, spawnMs: 900,  label: "🟡 HARD",   speedBase: 3.5 };
  if (score >= 15)  return { lanes: 4, safeCount: 2, spawnMs: 1100, label: "🔵 NORMAL", speedBase: 2.5 };
  return              { lanes: 3, safeCount: 2, spawnMs: 1400, label: "🟢 BEGIN",  speedBase: 2.0 };
=======
  visible: boolean; // BUG: obstacles can flicker
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
}

const MiniRacing = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="MINI RACING" duration={60} onBack={onBack} info={{
<<<<<<< HEAD
      description: "방향키(←→)로 차선을 변경하며 장애물을 피하세요! 점수가 오를수록 차선이 많아지고 장애물이 더 촘촘해집니다.",
=======
      description: "방향키(↑↓)로 차선을 변경하며 장애물을 피하세요! 시간이 지날수록 속도가 빨라집니다.",
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
      bugs: [
        "속도가 갑자기 변할 수 있습니다 (~8%)",
        "장애물이 깜빡이거나 사라질 수 있습니다 (~5%)",
        "차선 변경이 살짝 지연될 수 있습니다",
        "타이머가 가끔 1초를 건너뛸 수 있습니다 (~10%)",
      ],
<<<<<<< HEAD
      scoring: "생존 시간에 따라 지속 점수 획득. 점수가 높아질수록 차선 수 증가, 안전 통로 감소!",
    }}>
      {({ addScore, isRunning, score }) => (
        <GameArea addScore={addScore} isRunning={isRunning} score={score} />
=======
      scoring: "장애물을 피할 때마다 10점. ~5% 확률로 점수가 1점 적게 들어올 수 있습니다.",
    }}>
      {({ addScore, isRunning }) => (
        <GameArea addScore={addScore} isRunning={isRunning} />
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
      )}
    </GameWrapper>
  );
};

<<<<<<< HEAD
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
  const [speed, setSpeed] = useState(2.0);
  const nextId = useRef(0);
  const frameRef = useRef<number>();
  const spawnRef = useRef<ReturnType<typeof setInterval>>();

  // 점수에 따라 등급 업데이트
  useEffect(() => {
    const g = getRacingGrade(score);
    gradeRef.current = g;
    setLaneCount(g.lanes);
    setSpeed(g.speedBase);
    // 레인 수 변경 시 범위 안으로 보정
    setLane((l) => Math.min(l, g.lanes - 1));
  }, [score]);

  // 장애물 스폰 (등급에 따른 간격, 동시에 여러 레인 막기)
  useEffect(() => {
    if (!isRunning) { setObstacles([]); return; }
    clearInterval(spawnRef.current);

    spawnRef.current = setInterval(() => {
      const g = gradeRef.current;
      const lanes = g.lanes;
      const safe = g.safeCount;
      // 전체 레인 중 safe 수만큼만 비워두고 나머지 채움
      const allLanes = Array.from({ length: lanes }, (_, i) => i);
      const shuffled = allLanes.sort(() => Math.random() - 0.5);
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

    return () => clearInterval(spawnRef.current);
  }, [isRunning]);

  // 게임 루프
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      const g = gradeRef.current;
      // BUG: ~8% 속도 랜덤 변동
      const effectiveSpeed = Math.random() < 0.08
        ? g.speedBase * (0.6 + Math.random() * 0.8)
        : g.speedBase;

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
=======
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

>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
<<<<<<< HEAD
  }, [isRunning, addScore]);

  // 충돌
  useEffect(() => {
    obstacles.forEach((o) => {
      if (o.y > 80 && o.y < 96 && o.lane === lane && o.visible) {
=======
  }, [isRunning, speed, addScore]);

  // Collision detection
  useEffect(() => {
    obstacles.forEach((o) => {
      if (o.y > 80 && o.y < 95 && o.lane === lane && o.visible) {
        // Hit! Lose points
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
        addScore(-5);
        setObstacles((prev) => prev.filter((p) => p.id !== o.id));
      }
    });
  }, [obstacles, lane, addScore]);

<<<<<<< HEAD
  // 키보드 조작
  useEffect(() => {
    if (!isRunning) return;
    const handler = (e: KeyboardEvent) => {
      const g = gradeRef.current;
      if (e.key === "ArrowLeft"  || e.key === "a") setLane((l) => Math.max(0, l - 1));
      if (e.key === "ArrowRight" || e.key === "d") setLane((l) => Math.min(g.lanes - 1, l + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning]);

  const grade = getRacingGrade(score);
  // 각 레인의 x 위치 (%) — 레인 수에 따라 동적 계산
  const lanePositions = Array.from({ length: laneCount }, (_, i) =>
    Math.round((100 / laneCount) * (i + 0.5))
  );

  return (
    <div className="game-area w-full h-full absolute inset-0 relative select-none overflow-hidden">
      {/* 등급 표시 */}
      {isRunning && (
        <div
          className="absolute top-2 right-2 font-pixel text-[10px] px-2 py-1 rounded z-10"
          style={{ color: "hsl(180 100% 50%)", border: "1px solid hsl(180 100% 50%)", background: "hsl(240 10% 6% / 0.8)" }}
        >
          {grade.label} | {laneCount}레인
        </div>
      )}

      {/* 차선 구분선 */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: laneCount }).map((_, i) => (
=======
  const laneX = [15, 45, 75]; // percentage positions

  return (
    <div className="game-area w-full h-full absolute inset-0 relative select-none overflow-hidden">
      {/* Track lanes */}
      <div className="absolute inset-0 flex">
        {[0, 1, 2].map((i) => (
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
          <div
            key={i}
            className="flex-1 border-x border-border/30"
            onClick={() => isRunning && setLane(i)}
          />
        ))}
      </div>

<<<<<<< HEAD
      {/* 플레이어 차 */}
      {isRunning && (
        <div
          className="absolute bottom-8 w-8 h-12 rounded-md border-2 border-primary flex items-center justify-center font-pixel text-xs text-primary transition-all duration-100"
          style={{
            left: `calc(${lanePositions[lane]}% - 16px)`,
=======
      {/* Player car */}
      {isRunning && (
        <div
          className="absolute bottom-8 w-10 h-14 rounded-md border-2 border-primary transition-all duration-150 flex items-center justify-center font-pixel text-xs text-primary"
          style={{
            left: `calc(${laneX[lane]}% - 20px)`,
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
            backgroundColor: "hsl(var(--card))",
            boxShadow: "0 0 12px hsl(120 100% 50% / 0.5)",
          }}
        >
          ▲
        </div>
      )}

<<<<<<< HEAD
      {/* 장애물 */}
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

      {/* 모바일 컨트롤 */}
      {isRunning && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-6 sm:hidden">
          <button onClick={() => setLane((l) => Math.max(0, l - 1))} className="font-pixel text-lg px-4 py-2 bg-muted rounded text-foreground">←</button>
          <button onClick={() => setLane((l) => Math.min(laneCount - 1, l + 1))} className="font-pixel text-lg px-4 py-2 bg-muted rounded text-foreground">→</button>
=======
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
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
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
