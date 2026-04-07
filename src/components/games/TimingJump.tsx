import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

interface PlatformObstacle {
  id: number;
  x: number;
  width: number;
  height: number;
}

const TimingJump = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="TIMING JUMP" duration={45} onBack={onBack}>
      {({ addScore, isRunning }) => (
        <GameArea addScore={addScore} isRunning={isRunning} />
      )}
    </GameWrapper>
  );
};

const GameArea = ({ addScore, isRunning }: { addScore: (n: number) => void; isRunning: boolean }) => {
  const [playerY, setPlayerY] = useState(0); // 0 = ground
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<PlatformObstacle[]>([]);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const nextId = useRef(0);
  const frameRef = useRef<number>();
  const jumpRef = useRef(0);
  const passed = useRef<Set<number>>(new Set());

  // Jump logic
  const jump = useCallback(() => {
    if (!isRunning || isJumping) return;
    setIsJumping(true);

    // BUG: ~20% chance jump height varies (too low or too high)
    const glitchHeight = Math.random() < 0.2 ? (Math.random() * 40 + 40) : 80;

    // BUG: ~10% chance there's a response delay
    const delay = Math.random() < 0.1 ? 200 : 0;

    setTimeout(() => {
      jumpRef.current = glitchHeight;
      setPlayerY(glitchHeight);

      setTimeout(() => {
        setPlayerY(0);
        setIsJumping(false);
        jumpRef.current = 0;
      }, 500);
    }, delay);
  }, [isRunning, isJumping]);

  // Controls
  useEffect(() => {
    if (!isRunning) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning, jump]);

  // Spawn obstacles
  useEffect(() => {
    if (!isRunning) { setObstacles([]); passed.current.clear(); return; }
    const interval = setInterval(() => {
      setObstacles((prev) => [
        ...prev,
        {
          id: nextId.current++,
          x: 105,
          width: 20 + Math.random() * 30,
          height: 20 + Math.random() * 25,
        },
      ]);
    }, 1500 + Math.random() * 500);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Game loop: move obstacles
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      // BUG: speed occasionally hiccups
      const effectiveSpeed = Math.random() < 0.05 ? scrollSpeed * 0.3 : scrollSpeed;

      setObstacles((prev) =>
        prev
          .map((o) => ({ ...o, x: o.x - effectiveSpeed }))
          .filter((o) => o.x > -20)
      );

      // Check if player passed obstacles
      setObstacles((prev) => {
        prev.forEach((o) => {
          if (o.x < 15 && !passed.current.has(o.id)) {
            // Check collision
            if (jumpRef.current < o.height * 0.8 && o.x > 5) {
              addScore(-3); // hit
            } else if (o.x < 10) {
              addScore(10); // passed!
              passed.current.add(o.id);
            }
          }
        });
        return prev;
      });

      // Gradually speed up
      setScrollSpeed((s) => Math.min(5, s + 0.001));

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [isRunning, scrollSpeed, addScore]);

  const groundY = 75; // percentage from top

  return (
    <div
      className="game-area w-full h-full absolute inset-0 relative select-none cursor-pointer"
      onClick={jump}
    >
      {/* Ground line */}
      <div
        className="absolute left-0 right-0 border-t-2 border-primary"
        style={{ top: `${groundY}%` }}
      />

      {/* Player */}
      {isRunning && (
        <div
          className="absolute w-8 h-10 rounded-sm border-2 border-accent flex items-center justify-center font-pixel text-xs text-accent transition-all"
          style={{
            left: "12%",
            bottom: `${100 - groundY + playerY * 0.3}%`,
            backgroundColor: "hsl(var(--card))",
            boxShadow: "0 0 8px hsl(180 100% 50% / 0.5)",
            transitionDuration: isJumping ? "200ms" : "300ms",
          }}
        >
          ⬆
        </div>
      )}

      {/* Obstacles */}
      {obstacles.map((o) => (
        <div
          key={o.id}
          className="absolute rounded-sm border border-secondary"
          style={{
            left: `${o.x}%`,
            bottom: `${100 - groundY}%`,
            width: `${o.width}px`,
            height: `${o.height}px`,
            backgroundColor: "hsl(var(--secondary) / 0.6)",
          }}
        />
      ))}

      {!isRunning && (
        <div className="flex items-center justify-center h-full font-mono text-muted-foreground text-sm text-center px-4">
          Press Space, ↑, or tap to jump over obstacles!
        </div>
      )}
    </div>
  );
};

export default TimingJump;
