import { useState, useEffect, useCallback } from "react";

interface GameInfo {
  description: string;
  bugs: string[];
  scoring: string;
}

interface GameWrapperProps {
  title: string;
  duration: number;
  info: GameInfo;
  onBack: () => void;
  children: (props: {
    score: number;
    addScore: (points: number) => void;
    timeLeft: number;
    isRunning: boolean;
    startGame: () => void;
  }) => React.ReactNode;
}

const GameWrapper = ({ title, duration, info, onBack, children }: GameWrapperProps) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Glitch: timer occasionally skips a second
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
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
    <div className="h-screen flex flex-col bg-background scanline-overlay overflow-hidden">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/95 overflow-y-auto py-8 px-4">
            <h3 className="font-pixel text-lg sm:text-xl text-primary neon-glow mb-4">{title}</h3>

            {/* Game Info Card */}
            <div className="w-full max-w-md space-y-4 mb-6">
              {/* Description */}
              <div className="bg-muted/60 border border-border rounded-lg p-4">
                <h4 className="font-pixel text-xs text-accent mb-2">📋 게임 설명</h4>
                <p className="font-mono text-sm text-foreground/80 leading-relaxed">{info.description}</p>
              </div>

              {/* Bugs */}
              <div className="bg-muted/60 border border-destructive/30 rounded-lg p-4">
                <h4 className="font-pixel text-xs text-destructive mb-2">🐛 알려진 버그</h4>
                <ul className="space-y-1">
                  {info.bugs.map((bug, i) => (
                    <li key={i} className="font-mono text-xs text-foreground/70 flex items-start gap-2">
                      <span className="text-destructive mt-0.5">▸</span>
                      <span>{bug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scoring */}
              <div className="bg-muted/60 border border-secondary/30 rounded-lg p-4">
                <h4 className="font-pixel text-xs text-secondary mb-2">★ 점수 기준</h4>
                <p className="font-mono text-sm text-foreground/80 leading-relaxed">{info.scoring}</p>
              </div>

              {/* Duration */}
              <div className="text-center font-mono text-xs text-muted-foreground">
                제한 시간: {duration}초
              </div>
            </div>

            <button
              onClick={startGame}
              className="font-pixel text-sm px-8 py-3 bg-primary text-primary-foreground rounded hover:scale-105 transition-transform"
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
