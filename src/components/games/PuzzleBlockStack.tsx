import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

interface Block {
  id: number;
  width: number;
  color: string;
  x: number;        // horizontal position when dropped
  rotation: number;  // BUG: blocks sometimes rotate
}

const COLORS = [
  "hsl(120 100% 40%)",
  "hsl(180 100% 45%)",
  "hsl(300 100% 50%)",
  "hsl(45 100% 50%)",
  "hsl(0 80% 55%)",
  "hsl(200 90% 50%)",
];

const PuzzleBlockStack = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="PUZZLE BLOCK STACK" duration={90} onBack={onBack}>
      {({ addScore, isRunning }) => (
        <GameArea addScore={addScore} isRunning={isRunning} />
      )}
    </GameWrapper>
  );
};

const GameArea = ({ addScore, isRunning }: { addScore: (n: number) => void; isRunning: boolean }) => {
  const [stack, setStack] = useState<Block[]>([]);
  const [currentX, setCurrentX] = useState(50);
  const [direction, setDirection] = useState(1);
  const [currentWidth, setCurrentWidth] = useState(60);
  const nextId = useRef(0);

  // Moving cursor block
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCurrentX((x) => {
        const speed = 1.5 + stack.length * 0.2; // speeds up
        let next = x + direction * speed;
        if (next > 90 || next < 10) {
          setDirection((d) => -d);
          next = Math.max(10, Math.min(90, next));
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isRunning, direction, stack.length]);

  const dropBlock = useCallback(() => {
    if (!isRunning) return;

    // BUG: ~15% chance the block rotates slightly when dropped
    const rotation = Math.random() < 0.15 ? (Math.random() * 20 - 10) : 0;

    // BUG: ~10% chance the block's x-position shifts randomly
    const glitchX = Math.random() < 0.1 ? currentX + (Math.random() * 20 - 10) : currentX;

    const newBlock: Block = {
      id: nextId.current++,
      width: currentWidth,
      color: COLORS[stack.length % COLORS.length],
      x: glitchX,
      rotation,
    };

    setStack((prev) => [...prev, newBlock]);

    // Score based on alignment with previous block
    if (stack.length > 0) {
      const prevBlock = stack[stack.length - 1];
      const overlap = Math.abs(glitchX - prevBlock.x);
      if (overlap < 5) {
        addScore(25); // perfect
      } else if (overlap < 15) {
        addScore(15); // good
        setCurrentWidth((w) => Math.max(20, w - 3));
      } else {
        addScore(5); // poor
        setCurrentWidth((w) => Math.max(15, w - 8));
      }
    } else {
      addScore(10);
    }
  }, [isRunning, currentX, currentWidth, stack, addScore]);

  // Click/tap to drop
  useEffect(() => {
    if (!isRunning) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") dropBlock();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning, dropBlock]);

  return (
    <div
      className="game-area w-full h-full absolute inset-0 relative select-none cursor-pointer"
      onClick={dropBlock}
    >
      {/* Moving block indicator at top */}
      {isRunning && (
        <div
          className="absolute top-4 h-6 rounded border border-foreground/50 transition-none"
          style={{
            left: `${currentX - currentWidth / 2}%`,
            width: `${currentWidth}%`,
            backgroundColor: COLORS[stack.length % COLORS.length],
            boxShadow: `0 0 8px ${COLORS[stack.length % COLORS.length]}`,
          }}
        />
      )}

      {/* Stacked blocks from bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse items-center">
        {stack.map((block) => (
          <div
            key={block.id}
            className="h-6 rounded-sm mb-px"
            style={{
              width: `${block.width}%`,
              marginLeft: `${(block.x - 50) * 0.5}%`,
              backgroundColor: block.color,
              // BUG: rotated blocks look misaligned
              transform: `rotate(${block.rotation}deg)`,
              boxShadow: `0 0 4px ${block.color}`,
            }}
          />
        ))}
      </div>

      {!isRunning && stack.length === 0 && (
        <div className="flex items-center justify-center h-full font-mono text-muted-foreground text-sm text-center px-4">
          Click/tap or press Space to drop blocks!<br />Stack them neatly!
        </div>
      )}
    </div>
  );
};

export default PuzzleBlockStack;
