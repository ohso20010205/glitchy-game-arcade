import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

const GRID_SIZE = 4;
const COLORS = [
  "hsl(120 100% 50%)",
  "hsl(300 100% 60%)",
  "hsl(180 100% 50%)",
  "hsl(45 100% 55%)",
  "hsl(0 80% 55%)",
  "hsl(200 90% 50%)",
];

type Phase = "showing" | "input" | "result";

const MiniMemoryGame = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="MINI MEMORY GAME" duration={60} onBack={onBack}>
      {({ addScore, isRunning }) => (
        <GameArea addScore={addScore} isRunning={isRunning} />
      )}
    </GameWrapper>
  );
};

const GameArea = ({ addScore, isRunning }: { addScore: (n: number) => void; isRunning: boolean }) => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("showing");
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [level, setLevel] = useState(3);
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Generate new pattern
  const newRound = useCallback(() => {
    const newPattern: number[] = [];
    for (let i = 0; i < level; i++) {
      let cell = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);

      // BUG: ~15% chance a cell in the pattern is wrong (shows a different cell)
      if (Math.random() < 0.15) {
        cell = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
      }

      newPattern.push(cell);
    }
    setPattern(newPattern);
    setPlayerInput([]);
    setPhase("showing");
    setMessage("");

    // Show pattern to player
    let i = 0;
    const showNext = () => {
      if (i < newPattern.length) {
        // BUG: ~10% chance a cell briefly shows the wrong highlight
        const displayCell = Math.random() < 0.1
          ? Math.floor(Math.random() * GRID_SIZE * GRID_SIZE)
          : newPattern[i];
        setHighlightIdx(displayCell);
        timerRef.current = setTimeout(() => {
          setHighlightIdx(null);
          i++;
          timerRef.current = setTimeout(showNext, 300);
        }, 600);
      } else {
        setPhase("input");
      }
    };
    timerRef.current = setTimeout(showNext, 500);
  }, [level]);

  useEffect(() => {
    if (isRunning) newRound();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCellClick = useCallback((cellIdx: number) => {
    if (phase !== "input" || !isRunning) return;

    const newInput = [...playerInput, cellIdx];
    setPlayerInput(newInput);
    setHighlightIdx(cellIdx);
    setTimeout(() => setHighlightIdx(null), 200);

    if (newInput.length === pattern.length) {
      // Check if correct
      const correct = newInput.every((v, i) => v === pattern[i]);
      if (correct) {
        setMessage("CORRECT!");
        addScore(20 + level * 5);
        setLevel((l) => l + 1);
      } else {
        setMessage("WRONG!");
        addScore(-5);
        setLevel((l) => Math.max(2, l - 1));
      }
      setPhase("result");
      timerRef.current = setTimeout(newRound, 1500);
    }
  }, [phase, isRunning, playerInput, pattern, addScore, level, newRound]);

  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

  return (
    <div className="game-area w-full h-full absolute inset-0 flex flex-col items-center justify-center p-4 select-none">
      {isRunning && (
        <>
          <p className="font-pixel text-xs text-muted-foreground mb-2">
            {phase === "showing" && "Watch the pattern..."}
            {phase === "input" && `Repeat it! (${playerInput.length}/${pattern.length})`}
            {phase === "result" && message}
          </p>
          <p className="font-mono text-xs text-accent mb-4">Level: {level}</p>

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
          >
            {cells.map((idx) => {
              const isHighlighted = highlightIdx === idx;
              const color = COLORS[idx % COLORS.length];
              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded border-2 transition-all duration-150"
                  style={{
                    borderColor: isHighlighted ? color : "hsl(var(--border))",
                    backgroundColor: isHighlighted ? color : "hsl(var(--muted))",
                    boxShadow: isHighlighted ? `0 0 12px ${color}` : "none",
                    // BUG: ~5% of cells randomly disappear briefly
                    opacity: Math.random() < 0.02 ? 0.1 : 1,
                  }}
                />
              );
            })}
          </div>
        </>
      )}

      {!isRunning && (
        <div className="font-mono text-muted-foreground text-sm text-center">
          Watch the pattern and repeat it!
        </div>
      )}
    </div>
  );
};

export default MiniMemoryGame;
