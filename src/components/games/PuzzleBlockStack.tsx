import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

interface Block {
  id: number;
  width: number;
  color: string;
<<<<<<< HEAD
  x: number;
  rotation: number;
=======
  x: number;        // horizontal position when dropped
  rotation: number;  // BUG: blocks sometimes rotate
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
}

const COLORS = [
  "hsl(120 100% 40%)",
  "hsl(180 100% 45%)",
  "hsl(300 100% 50%)",
  "hsl(45 100% 50%)",
  "hsl(0 80% 55%)",
  "hsl(200 90% 50%)",
];

<<<<<<< HEAD
const BLOCK_H = 24; // px, 각 블록 높이

const PuzzleBlockStack = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="PUZZLE BLOCK STACK" duration={90} onBack={onBack} info={{
      description: "떨어지는 블록을 클릭해서 쌓으세요! 블록이 좌우로 움직이는 동안 타이밍을 맞춰 떨어뜨려야 합니다. 블록이 많이 쌓이면 스크롤로 위를 확인하세요!",
=======
const PuzzleBlockStack = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="PUZZLE BLOCK STACK" duration={90} onBack={onBack} info={{
      description: "떨어지는 블록을 클릭해서 쌓으세요! 블록이 좌우로 움직이는 동안 타이밍을 맞춰 떨어뜨려야 합니다.",
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
      bugs: [
        "블록이 떨어질 때 약간 회전할 수 있습니다 (~15%)",
        "블록의 좌우 위치가 살짝 어긋날 수 있습니다 (~10%)",
        "타이머가 가끔 1초를 건너뛸 수 있습니다 (~10%)",
      ],
<<<<<<< HEAD
      scoring: "정렬 정확도에 따라 5~25점. 잘 쌓을수록 블록 너비가 유지됩니다!",
=======
      scoring: "블록 하나를 쌓을 때마다 25점. ~5% 확률로 점수가 1점 적게 들어올 수 있습니다.",
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
    }}>
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
<<<<<<< HEAD
  const stackScrollRef = useRef<HTMLDivElement>(null);

  // 스택이 변할 때마다 스크롤을 최상단(가장 위 블록)으로 이동
  useEffect(() => {
    if (stackScrollRef.current) {
      stackScrollRef.current.scrollTop = 0;
    }
  }, [stack.length]);

  // 좌우 이동 블록
=======

  // Moving cursor block
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCurrentX((x) => {
<<<<<<< HEAD
        const speed = 1.5 + stack.length * 0.25;
=======
        const speed = 1.5 + stack.length * 0.2; // speeds up
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
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

<<<<<<< HEAD
    const rotation = Math.random() < 0.15 ? (Math.random() * 20 - 10) : 0;
=======
    // BUG: ~15% chance the block rotates slightly when dropped
    const rotation = Math.random() < 0.15 ? (Math.random() * 20 - 10) : 0;

    // BUG: ~10% chance the block's x-position shifts randomly
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
    const glitchX = Math.random() < 0.1 ? currentX + (Math.random() * 20 - 10) : currentX;

    const newBlock: Block = {
      id: nextId.current++,
      width: currentWidth,
<<<<<<< HEAD
      color: COLORS[nextId.current % COLORS.length],
=======
      color: COLORS[stack.length % COLORS.length],
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
      x: glitchX,
      rotation,
    };

<<<<<<< HEAD
    setStack((prev) => {
      const updated = [...prev, newBlock];
      if (prev.length > 0) {
        const prevBlock = prev[prev.length - 1];
        const overlap = Math.abs(glitchX - prevBlock.x);
        if (overlap < 5) {
          addScore(25);
        } else if (overlap < 15) {
          addScore(15);
          setCurrentWidth((w) => Math.max(20, w - 3));
        } else {
          addScore(5);
          setCurrentWidth((w) => Math.max(15, w - 8));
        }
      } else {
        addScore(10);
      }
      return updated;
    });
  }, [isRunning, currentX, currentWidth, addScore]);

  useEffect(() => {
    if (!isRunning) { setStack([]); setCurrentWidth(60); return; }
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); dropBlock(); }
=======
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
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning, dropBlock]);

<<<<<<< HEAD
  // 화면에 표시할 블록 수 계산 (스크롤 영역 높이 기준)
  const visibleAreaH = 300; // px (근사치)
  const totalStackH = stack.length * (BLOCK_H + 2);
  const needsScroll = totalStackH > visibleAreaH;

  return (
    <div
      className="game-area w-full h-full absolute inset-0 flex flex-col select-none cursor-pointer"
      onClick={dropBlock}
    >
      {/* 현재 이동 중인 블록 */}
      {isRunning && (
        <div className="relative flex-shrink-0 h-12 pt-3">
          <div
            className="absolute h-6 rounded border border-foreground/50"
            style={{
              left: `${currentX - currentWidth / 2}%`,
              width: `${currentWidth}%`,
              backgroundColor: COLORS[nextId.current % COLORS.length],
              boxShadow: `0 0 8px ${COLORS[nextId.current % COLORS.length]}`,
            }}
          />
        </div>
      )}

      {/* 쌓인 블록 영역 (스크롤 가능) */}
      <div
        ref={stackScrollRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* 스택이 높을수록 위에 공간을 추가해서 스크롤 시 보이게 */}
        <div
          className="flex flex-col-reverse items-center pb-0 pt-2"
          style={{ minHeight: "100%" }}
        >
          {stack.length === 0 && !isRunning && (
            <div className="flex items-center justify-center h-40 font-mono text-muted-foreground text-sm text-center px-4">
              Click/tap or press Space to drop blocks!<br />Stack them neatly!
            </div>
          )}

          {stack.map((block, idx) => (
            <div
              key={block.id}
              className="h-6 rounded-sm mb-px flex-shrink-0 relative"
              style={{
                width: `${block.width}%`,
                marginLeft: `${(block.x - 50) * 0.5}%`,
                backgroundColor: block.color,
                transform: `rotate(${block.rotation}deg)`,
                boxShadow: `0 0 4px ${block.color}`,
              }}
            >
              {/* 최신 블록 표시 */}
              {idx === stack.length - 1 && (
                <span
                  className="absolute -right-6 top-0 font-pixel text-[8px]"
                  style={{ color: block.color }}
                >NEW</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 블록 수 & 스크롤 안내 */}
      {isRunning && stack.length > 0 && (
        <div className="flex-shrink-0 flex justify-between items-center px-3 py-1 border-t border-border/30 text-xs font-mono text-muted-foreground">
          <span>블록 수: {stack.length}</span>
          {needsScroll && <span className="text-accent animate-pulse">↑ 스크롤로 위 확인</span>}
=======
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
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
        </div>
      )}
    </div>
  );
};

export default PuzzleBlockStack;
