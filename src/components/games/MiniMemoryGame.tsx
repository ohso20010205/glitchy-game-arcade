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

<<<<<<< HEAD
/** 점수 또는 남은 시간에 따른 표시 속도 */
function getShowSpeed(score: number, timeLeft: number): { showMs: number; gapMs: number; label: string } {
  // 점수가 높거나 시간이 얼마 안 남을수록 빨라짐
  const urgency = score / 20 + Math.max(0, (30 - timeLeft) / 30) * 3;
  if (urgency >= 6)  return { showMs: 250,  gapMs: 150, label: "💀 INSANE" };
  if (urgency >= 4)  return { showMs: 380,  gapMs: 200, label: "🔴 FAST" };
  if (urgency >= 2)  return { showMs: 550,  gapMs: 280, label: "🟡 QUICK" };
  if (urgency >= 1)  return { showMs: 700,  gapMs: 320, label: "🔵 NORMAL" };
  return               { showMs: 900,  gapMs: 400, label: "🟢 SLOW" };
}

const MiniMemoryGame = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="MINI MEMORY GAME" duration={60} onBack={onBack} info={{
      description: "화면에 표시되는 패턴을 기억한 후 같은 순서로 클릭하세요! 점수가 높아지거나 시간이 얼마 안 남을수록 패턴이 더 빠르게 표시됩니다.",
=======
const MiniMemoryGame = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="MINI MEMORY GAME" duration={60} onBack={onBack} info={{
      description: "화면에 표시되는 패턴을 기억한 후 같은 순서로 클릭하세요! 라운드가 올라갈수록 패턴이 길어집니다.",
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
      bugs: [
        "패턴 표시 중 잘못된 칸이 강조될 수 있습니다 (~10%)",
        "칸이 잠깐 사라질 수 있습니다 (~8%)",
        "타이머가 가끔 1초를 건너뛸 수 있습니다 (~10%)",
      ],
<<<<<<< HEAD
      scoring: "정확한 패턴 재현 시 레벨 × 10점. 틀리면 -5점. 점수·잔여시간에 따라 속도 증가!",
    }}>
      {({ addScore, isRunning, score, timeLeft }) => (
        <GameArea addScore={addScore} isRunning={isRunning} score={score} timeLeft={timeLeft} />
=======
      scoring: "정확한 패턴 재현 시 라운드 × 10점. ~5% 확률로 점수가 1점 적게 들어올 수 있습니다.",
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
  timeLeft,
}: {
  addScore: (n: number) => void;
  isRunning: boolean;
  score: number;
  timeLeft: number;
}) => {
=======
const GameArea = ({ addScore, isRunning }: { addScore: (n: number) => void; isRunning: boolean }) => {
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("showing");
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [level, setLevel] = useState(3);
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

<<<<<<< HEAD
  const speed = getShowSpeed(score, timeLeft);

  const newRound = useCallback((lvl: number, sc: number, tl: number) => {
    const spd = getShowSpeed(sc, tl);
    const newPattern: number[] = [];
    for (let i = 0; i < lvl; i++) {
      let cell = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
      if (Math.random() < 0.15) cell = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
=======
  // Generate new pattern
  const newRound = useCallback(() => {
    const newPattern: number[] = [];
    for (let i = 0; i < level; i++) {
      let cell = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);

      // BUG: ~15% chance a cell in the pattern is wrong (shows a different cell)
      if (Math.random() < 0.15) {
        cell = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
      }

>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
      newPattern.push(cell);
    }
    setPattern(newPattern);
    setPlayerInput([]);
    setPhase("showing");
    setMessage("");

<<<<<<< HEAD
    let i = 0;
    const showNext = () => {
      if (i < newPattern.length) {
=======
    // Show pattern to player
    let i = 0;
    const showNext = () => {
      if (i < newPattern.length) {
        // BUG: ~10% chance a cell briefly shows the wrong highlight
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
        const displayCell = Math.random() < 0.1
          ? Math.floor(Math.random() * GRID_SIZE * GRID_SIZE)
          : newPattern[i];
        setHighlightIdx(displayCell);
        timerRef.current = setTimeout(() => {
          setHighlightIdx(null);
          i++;
<<<<<<< HEAD
          timerRef.current = setTimeout(showNext, spd.gapMs);
        }, spd.showMs);
=======
          timerRef.current = setTimeout(showNext, 300);
        }, 600);
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
      } else {
        setPhase("input");
      }
    };
<<<<<<< HEAD
    timerRef.current = setTimeout(showNext, 400);
  }, []);

  useEffect(() => {
    if (isRunning) newRound(level, score, timeLeft);
=======
    timerRef.current = setTimeout(showNext, 500);
  }, [level]);

  useEffect(() => {
    if (isRunning) newRound();
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCellClick = useCallback((cellIdx: number) => {
    if (phase !== "input" || !isRunning) return;

    const newInput = [...playerInput, cellIdx];
    setPlayerInput(newInput);
    setHighlightIdx(cellIdx);
<<<<<<< HEAD
    setTimeout(() => setHighlightIdx(null), 180);

    if (newInput.length === pattern.length) {
      const correct = newInput.every((v, i) => v === pattern[i]);
      if (correct) {
        const pts = 20 + level * 5;
        setMessage(`✅ CORRECT! +${pts}`);
        addScore(pts);
        setLevel((l) => {
          const nl = l + 1;
          timerRef.current = setTimeout(() => newRound(nl, score + pts, timeLeft), 1200);
          return nl;
        });
      } else {
        setMessage("❌ WRONG! -5");
        addScore(-5);
        setLevel((l) => {
          const nl = Math.max(2, l - 1);
          timerRef.current = setTimeout(() => newRound(nl, Math.max(0, score - 5), timeLeft), 1200);
          return nl;
        });
      }
      setPhase("result");
    }
  }, [phase, isRunning, playerInput, pattern, addScore, level, newRound, score, timeLeft]);

  // BUG: 랜덤 사라짐 — render 중 Math.random() 호출 대신 state로 관리
  const [glitchedCells, setGlitchedCells] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const next = new Set<number>();
      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        if (Math.random() < 0.02) next.add(i);
      }
      setGlitchedCells(next);
      setTimeout(() => setGlitchedCells(new Set()), 120);
    }, 800);
    return () => clearInterval(interval);
  }, [isRunning]);
=======
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
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe

  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

  return (
    <div className="game-area w-full h-full absolute inset-0 flex flex-col items-center justify-center p-4 select-none">
      {isRunning && (
        <>
<<<<<<< HEAD
          {/* 속도 등급 표시 */}
          <div className="flex items-center gap-3 mb-1">
            <p className="font-pixel text-[10px] text-muted-foreground">
              {phase === "showing" && "Watch the pattern..."}
              {phase === "input" && `Repeat it! (${playerInput.length}/${pattern.length})`}
              {phase === "result" && message}
            </p>
            <span
              className="font-pixel text-[9px] px-1 rounded"
              style={{ color: "hsl(180 100% 50%)", border: "1px solid hsl(180 100% 50% / 0.4)" }}
            >
              {speed.label}
            </span>
          </div>
          <p className="font-mono text-xs text-accent mb-3">Level: {level}</p>
=======
          <p className="font-pixel text-xs text-muted-foreground mb-2">
            {phase === "showing" && "Watch the pattern..."}
            {phase === "input" && `Repeat it! (${playerInput.length}/${pattern.length})`}
            {phase === "result" && message}
          </p>
          <p className="font-mono text-xs text-accent mb-4">Level: {level}</p>
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe

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
<<<<<<< HEAD
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded border-2 transition-all duration-100"
=======
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded border-2 transition-all duration-150"
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
                  style={{
                    borderColor: isHighlighted ? color : "hsl(var(--border))",
                    backgroundColor: isHighlighted ? color : "hsl(var(--muted))",
                    boxShadow: isHighlighted ? `0 0 12px ${color}` : "none",
<<<<<<< HEAD
                    opacity: glitchedCells.has(idx) ? 0.1 : 1,
=======
                    // BUG: ~5% of cells randomly disappear briefly
                    opacity: Math.random() < 0.02 ? 0.1 : 1,
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
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
