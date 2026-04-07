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
  "hsl(120 100% 50%)", // green
  "hsl(300 100% 60%)", // magenta
  "hsl(180 100% 50%)", // cyan
  "hsl(45 100% 55%)",  // yellow
];

const BouncingBallCatch = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="BOUNCING BALL CATCH" duration={45} onBack={onBack}>
      {({ addScore, isRunning }) => (
        <GameArea addScore={addScore} isRunning={isRunning} />
      )}
    </GameWrapper>
  );
};

const GameArea = ({ addScore, isRunning }: { addScore: (n: number) => void; isRunning: boolean }) => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const nextId = useRef(0);

  // Spawn balls periodically
  useEffect(() => {
    if (!isRunning) { setBalls([]); return; }
    const spawn = setInterval(() => {
      setBalls((prev) => {
        if (prev.length >= 8) return prev;
        return [...prev, {
          id: nextId.current++,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          dx: (Math.random() - 0.5) * 1.5,
          dy: (Math.random() - 0.5) * 1.5,
          size: 30 + Math.random() * 20,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          visible: true,
        }];
      });
    }, 1200);
    return () => clearInterval(spawn);
  }, [isRunning]);

  // Animate balls
  useEffect(() => {
    if (!isRunning) return;
    const animate = () => {
      setBalls((prev) =>
        prev.map((b) => {
          let { x, y, dx, dy, visible } = b;
          x += dx;
          y += dy;
          if (x < 0 || x > 95) dx = -dx;
          if (y < 0 || y > 90) dy = -dy;

          // BUG: ~3% chance per frame a ball teleports to a random position
          if (Math.random() < 0.03) {
            x = Math.random() * 80 + 10;
            y = Math.random() * 80 + 10;
          }

          // BUG: ~2% chance ball becomes invisible briefly
          if (Math.random() < 0.02) visible = !visible;

          // BUG: ~5% chance speed randomly changes
          if (Math.random() < 0.05) {
            dx *= 0.5 + Math.random() * 1.5;
            dy *= 0.5 + Math.random() * 1.5;
          }

          return { ...b, x, y, dx, dy, visible };
        })
      );
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [isRunning]);

  const catchBall = useCallback((id: number) => {
    setBalls((prev) => prev.filter((b) => b.id !== id));
    addScore(10);
  }, [addScore]);

  return (
    <div ref={containerRef} className="game-area w-full h-full min-h-[400px] relative select-none cursor-crosshair">
      {balls.map((ball) => (
        <div
          key={ball.id}
          onClick={() => catchBall(ball.id)}
          className="absolute rounded-full transition-opacity duration-100"
          style={{
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            width: ball.size,
            height: ball.size,
            backgroundColor: ball.color,
            opacity: ball.visible ? 1 : 0,
            boxShadow: `0 0 10px ${ball.color}`,
            cursor: "pointer",
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
