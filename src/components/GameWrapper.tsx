import { useState, useEffect, useCallback } from "react";

interface GameWrapperProps {
  title: string;
  duration: number; // seconds
  onBack: () => void;
  children: (props: {
    score: number;
    addScore: (points: number) => void;
    timeLeft: number;
    isRunning: boolean;
    startGame: () => void;
  }) => React.ReactNode;
}

const GameWrapper = ({ title, duration, onBack, children }: GameWrapperProps) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Glitch: timer occasionally skips a second
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        // BUG: ~10% chance the timer skips an extra second
        const skip = Math.random() < 0.1 ? 2 : 1;
        const next = t - skip;
        if (next <= 0) {
          setIsRunning(false);
          setGameOver(true);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const addScore = useCallback((points: number) => {
    // BUG: ~5% chance score adds 1 less than expected
    const glitch = Math.random() < 0.05 ? -1 : 0;
    setScore((s) => Math.max(0, s + points + glitch));
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(duration);
    setGameOver(false);
    setIsRunning(true);
  }, [duration]);

  return (
    <div className="min-h-screen flex flex-col bg-background scanline-overlay">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
        <button
          onClick={onBack}
          className="font-pixel text-xs text-foreground hover:text-primary transition-colors"
        >
          ← MENU
        </button>
        <h2 className="font-pixel text-xs sm:text-sm text-foreground glitch-text truncate mx-2">
          {title}
        </h2>
        <div className="flex gap-4 font-mono text-sm">
          <span className="text-accent">⏱ {timeLeft}s</span>
          <span className="text-secondary">★ {score}</span>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 relative">
        {!isRunning && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/90">
            <h3 className="font-pixel text-lg text-primary neon-glow mb-6">{title}</h3>
            <button
              onClick={startGame}
              className="font-pixel text-sm px-6 py-3 bg-primary text-primary-foreground rounded hover:scale-105 transition-transform"
            >
              START
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/90">
            <h3 className="font-pixel text-lg text-destructive glitch-text mb-2">GAME OVER</h3>
            <p className="font-pixel text-sm text-secondary mb-6">Score: {score}</p>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="font-pixel text-xs px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                RETRY
              </button>
              <button
                onClick={onBack}
                className="font-pixel text-xs px-4 py-2 bg-muted text-foreground rounded border border-border"
              >
                MENU
              </button>
            </div>
          </div>
        )}

        {children({ score, addScore, timeLeft, isRunning, startGame })}
      </div>
    </div>
  );
};

export default GameWrapper;
