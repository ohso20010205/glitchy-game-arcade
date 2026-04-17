import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

interface Ball {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  visible: boolean;
}

const COLORS = [
  "hsl(120 100% 50%)",
  "hsl(300 100% 60%)",
  "hsl(180 100% 50%)",
  "hsl(45 100% 55%)",
  "hsl(0 80% 55%)",
  "hsl(60 100% 50%)",
];

function getGrade(score: number): {
  label: string;
  color: string;
  speedMult: number;
  maxBalls: number;
  spawnMs: number;
} {
  if (score >= 200) {
    return {
      label: "💀 INSANE",
      color: "hsl(0 100% 60%)",
      speedMult: 4.5,
      maxBalls: 14,
      spawnMs: 600,
    };
  }
  if (score >= 120) {
    return {
      label: "🔴 EXPERT",
      color: "hsl(0 80% 55%)",
      speedMult: 3.0,
      maxBalls: 12,
      spawnMs: 750,
    };
  }
  if (score >= 60) {
    return {
      label: "🟡 HARD",
      color: "hsl(45 100% 55%)",
      speedMult: 2.0,
      maxBalls: 10,
      spawnMs: 900,
    };
  }
  if (score >= 20) {
    return {
      label: "🔵 NORMAL",
      color: "hsl(210 90% 55%)",
      speedMult: 1.3,
      maxBalls: 8,
      spawnMs: 1100,
    };
  }
  return {
    label: "🟢 BEGINNER",
    color: "hsl(120 100% 50%)",
    speedMult: 0.7,
    maxBalls: 5,
    spawnMs: 1500,
  };
}

const BouncingBallCatch = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper
      title="BOUNCING BALL CATCH"
      duration={45}
      onBack={onBack}
      info={{
        description:
          "화면에 튀어다니는 공들을 클릭해서 잡으세요! 점수가 오를수록 공이 빨라지고 많아집니다.",
        bugs: [
          "공이 갑자기 다른 위치로 순간이동할 수 있습니다 (~3%)",
          "공이 잠깐 투명해져서 안 보일 수 있습니다 (~2%)",
          "공의 속도가 갑자기 변할 수 있습니다 (~5%)",
          "타이머가 가끔 1초를 건너뛸 수 있습니다 (~10%)",
        ],
        scoring: "공 하나를 잡을 때마다 10점. 점수에 따라 난이도가 올라갑니다!",
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
  const [balls, setBalls] = useState<Ball[]>([]);
  const frameRef = useRef<number | null>(null);
  const nextId = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gradeRef = useRef(getGrade(0));

  useEffect(() => {
    gradeRef.current = getGrade(score);
  }, [score]);

  useEffect(() => {
    if (!isRunning) {
      setBalls([]);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      return;
    }

    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);

    spawnTimerRef.current = setInterval(() => {
      const g = gradeRef.current;
      setBalls((prev) => {
        if (prev.length >= g.maxBalls) return prev;

        const baseSpeed = 0.35 * g.speedMult;
        return [
          ...prev,
          {
            id: nextId.current++,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            dx: (Math.random() - 0.5) * baseSpeed * 2,
            dy: (Math.random() - 0.5) * baseSpeed * 2,
            size: 28 + Math.random() * 16,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            visible: true,
          },
        ];
      });
    }, gradeRef.current.spawnMs);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [isRunning, score]);

  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      const g = gradeRef.current;

      setBalls((prev) =>
        prev.map((b) => {
          let { x, y, dx, dy, visible } = b;

          x += dx * g.speedMult;
          y += dy * g.speedMult;

          if (x < 0 || x > 95) dx = -dx;
          if (y < 0 || y > 90) dy = -dy;

          if (Math.random() < 0.003) {
            x = Math.random() * 80 + 10;
            y = Math.random() * 80 + 10;
          }

          if (Math.random() < 0.002) visible = !visible;

          if (Math.random() < 0.005) {
            dx *= 0.5 + Math.random() * 1.5;
            dy *= 0.5 + Math.random() * 1.5;
          }

          return { ...b, x, y, dx, dy, visible };
        })
      );

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isRunning]);

  const catchBall = useCallback(
    (id: number) => {
      setBalls((prev) => prev.filter((b) => b.id !== id));
      addScore(10);
    },
    [addScore]
  );

  const grade = getGrade(score);

  return (
    <div className="game-area w-full h-full absolute inset-0 relative select-none cursor-crosshair">
      {isRunning && (
        <div
          className="absolute top-2 right-2 font-pixel text-[10px] px-2 py-1 rounded z-10"
          style={{
            color: grade.color,
            border: `1px solid ${grade.color}`,
            background: "hsl(240 10% 6% / 0.8)",
          }}
        >
          {grade.label}
        </div>
      )}

      {balls.map((ball) => (
        <div
          key={ball.id}
          onPointerDown={(e) => {
            e.stopPropagation();
            catchBall(ball.id);
          }}
          className="absolute rounded-full"
          style={{
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            width: ball.size,
            height: ball.size,
            backgroundColor: ball.color,
            opacity: ball.visible ? 1 : 0,
            boxShadow: `0 0 12px ${ball.color}`,
            cursor: "pointer",
            zIndex: 10,
            transform: "translate(-50%, -50%)",
            touchAction: "none",
          }}
        />
      ))}

      {!isRunning && balls.length === 0 && (
        <div className="flex items-center justify-center h-full font-mono text-muted-foreground text-sm">
          Click the bouncing balls to catch them!
        </div>
      )}
    </div>
  );
};

export default BouncingBallCatch;