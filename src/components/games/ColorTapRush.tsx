import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../GameWrapper";

/**
 * COLOR TAP RUSH — TimingJump 대체 새 게임
 * 규칙: 화면에 나타나는 색깔 타일을 지시된 색만 빠르게 탭! 다른 색은 누르면 감점.
 * 이상한 규칙: 색 이름과 타일 실제 색이 불일치할 때가 있음 (스트룹 효과 버그)
 */

const TAP_COLORS = [
  { name: "RED",    hsl: "hsl(0 80% 55%)" },
  { name: "GREEN",  hsl: "hsl(120 100% 40%)" },
  { name: "BLUE",   hsl: "hsl(210 90% 55%)" },
  { name: "YELLOW", hsl: "hsl(45 100% 55%)" },
  { name: "CYAN",   hsl: "hsl(180 100% 45%)" },
  { name: "PURPLE", hsl: "hsl(280 80% 60%)" },
];

interface Tile {
  id: number;
  colorIdx: number;       // 실제 색
  labelIdx: number;       // 표시 텍스트 색 이름 (BUG: 불일치 가능)
  x: number;
  y: number;
  isGlitched: boolean;    // 이름≠색 여부
}

function getGrade(score: number) {
  if (score >= 200) return { spawnMs: 400,  maxTiles: 8, lifeMs: 1100, label: "💀 INSANE" };
  if (score >= 120) return { spawnMs: 550,  maxTiles: 7, lifeMs: 1400, label: "🔴 EXPERT" };
  if (score >= 60)  return { spawnMs: 700,  maxTiles: 6, lifeMs: 1700, label: "🟡 HARD" };
  if (score >= 20)  return { spawnMs: 900,  maxTiles: 5, lifeMs: 2000, label: "🔵 NORMAL" };
  return              { spawnMs: 1200, maxTiles: 4, lifeMs: 2500, label: "🟢 BEGIN" };
}

const ColorTapRush = ({ onBack }: { onBack: () => void }) => {
  return (
    <GameWrapper title="COLOR TAP RUSH" duration={40} onBack={onBack} info={{
      description: "화면 상단에 표시된 색상의 타일만 빠르게 탭하세요! 단, 타일에 적힌 이름과 실제 색이 다를 수 있습니다 — 색을 보고 누르세요!",
      bugs: [
        "타일에 적힌 색 이름이 실제 색과 다를 수 있습니다 (~30%)",
        "타겟 색 표시가 갑자기 바뀔 수 있습니다 (~5%)",
        "타이머가 가끔 1초를 건너뛸 수 있습니다 (~10%)",
      ],
      scoring: "정답 색 탭 시 +15점. 오답 탭 시 -10점. 점수에 따라 속도와 타일 수 증가!",
    }}>
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
  const [targetIdx, setTargetIdx] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const nextId = useRef(0);
  const spawnRef = useRef<ReturnType<typeof setInterval>>();
  const cleanRef = useRef<ReturnType<typeof setInterval>>();
  const gradeRef = useRef(getGrade(0));
  const targetRef = useRef(0);

  useEffect(() => { gradeRef.current = getGrade(score); }, [score]);

  // 타겟 색 랜덤 변경 (BUG: ~5% 갑작스러운 변경 포함)
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.05) {
        // BUG: 갑자기 타겟 변경
        const next = Math.floor(Math.random() * TAP_COLORS.length);
        setTargetIdx(next);
        targetRef.current = next;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning]);

  // 게임 시작 시 첫 타겟 설정
  useEffect(() => {
    if (!isRunning) { setTiles([]); return; }
    const t = Math.floor(Math.random() * TAP_COLORS.length);
    setTargetIdx(t);
    targetRef.current = t;
  }, [isRunning]);

  // 타겟 일정 시간마다 변경
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const next = Math.floor(Math.random() * TAP_COLORS.length);
      setTargetIdx(next);
      targetRef.current = next;
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // 타일 스폰
  useEffect(() => {
    if (!isRunning) return;
    clearInterval(spawnRef.current);
    spawnRef.current = setInterval(() => {
      const g = gradeRef.current;
      setTiles((prev) => {
        if (prev.length >= g.maxTiles) return prev;
        const colorIdx = Math.floor(Math.random() * TAP_COLORS.length);
        // BUG: ~30% 확률로 라벨이 다른 색 이름
        const isGlitched = Math.random() < 0.3;
        let labelIdx = colorIdx;
        if (isGlitched) {
          do { labelIdx = Math.floor(Math.random() * TAP_COLORS.length); }
          while (labelIdx === colorIdx);
        }
        return [...prev, {
          id: nextId.current++,
          colorIdx,
          labelIdx,
          x: Math.random() * 75 + 5,
          y: Math.random() * 65 + 15,
          isGlitched,
        }];
      });
    }, gradeRef.current.spawnMs);
    return () => clearInterval(spawnRef.current);
  }, [isRunning]);

  // 타일 자동 소멸
  useEffect(() => {
    if (!isRunning) return;
    clearInterval(cleanRef.current);
    cleanRef.current = setInterval(() => {
      const g = gradeRef.current;
      setTiles((prev) => prev.length > 2 ? prev.slice(1) : prev);
    }, gradeRef.current.lifeMs);
    return () => clearInterval(cleanRef.current);
  }, [isRunning]);

  const handleTap = useCallback((tile: Tile) => {
    if (!isRunning) return;
    const correct = tile.colorIdx === targetRef.current;
    if (correct) {
      addScore(15);
      setFeedback({ text: "+15", color: TAP_COLORS[tile.colorIdx].hsl });
    } else {
      addScore(-10);
      setFeedback({ text: "-10", color: "hsl(0 80% 55%)" });
    }
    setTiles((prev) => prev.filter((t) => t.id !== tile.id));
    // 정답 맞히면 타겟 변경
    if (correct) {
      const next = Math.floor(Math.random() * TAP_COLORS.length);
      setTargetIdx(next);
      targetRef.current = next;
    }
    setTimeout(() => setFeedback(null), 500);
  }, [isRunning, addScore]);

  const grade = getGrade(score);

  return (
    <div className="game-area w-full h-full absolute inset-0 relative select-none overflow-hidden">
      {/* 타겟 색 표시 바 */}
      {isRunning && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 z-10"
          style={{ background: "hsl(240 10% 8% / 0.95)", borderBottom: "1px solid hsl(var(--border))" }}>
          <span className="font-pixel text-[10px] text-muted-foreground">TAP THIS COLOR:</span>
          <div
            className="font-pixel text-sm px-4 py-1 rounded"
            style={{
              backgroundColor: TAP_COLORS[targetIdx].hsl,
              color: "hsl(240 10% 6%)",
              boxShadow: `0 0 12px ${TAP_COLORS[targetIdx].hsl}`,
            }}
          >
            {TAP_COLORS[targetIdx].name}
          </div>
          <span
            className="font-pixel text-[9px] px-1 rounded"
            style={{ color: "hsl(180 100% 50%)", border: "1px solid hsl(180 100% 50% / 0.4)" }}
          >
            {grade.label}
          </span>
        </div>
      )}

      {/* 타일들 */}
      {tiles.map((tile) => (
        <button
          key={tile.id}
          onClick={() => handleTap(tile)}
          className="absolute w-16 h-16 rounded-lg border-2 border-foreground/30 flex flex-col items-center justify-center font-pixel text-[9px] transition-transform hover:scale-110 active:scale-95"
          style={{
            left: `${tile.x}%`,
            top: `${tile.y}%`,
            backgroundColor: TAP_COLORS[tile.colorIdx].hsl,
            color: "hsl(240 10% 6%)",
            boxShadow: `0 0 8px ${TAP_COLORS[tile.colorIdx].hsl}`,
          }}
        >
          {/* BUG: 이름이 실제 색과 다를 수 있음 */}
          <span>{TAP_COLORS[tile.labelIdx].name}</span>
          {tile.isGlitched && (
            <span className="text-[7px] mt-0.5 opacity-60">⚠</span>
          )}
        </button>
      ))}

      {/* 피드백 */}
      {feedback && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-pixel text-2xl pointer-events-none z-20"
          style={{ color: feedback.color, textShadow: `0 0 10px ${feedback.color}` }}
        >
          {feedback.text}
        </div>
      )}

      {!isRunning && (
        <div className="flex items-center justify-center h-full font-mono text-muted-foreground text-sm text-center px-4">
          Tap tiles matching the target color!<br/>
          <span className="text-xs opacity-60 mt-1">⚠ Color name ≠ color tile (sometimes!)</span>
        </div>
      )}
    </div>
  );
};

export default ColorTapRush;
