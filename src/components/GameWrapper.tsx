import { useState, useEffect, useCallback } from "react";

// ===== 명예의 전당 타입 & 유틸 =====

export interface HallEntry {
  nickname: string;
  score: number;
  date: string; // "YYYY-MM"
}

function hofKey(gameTitle: string) {
  return `buggy_hof__${gameTitle.replace(/\s+/g, "_")}`;
}

export function loadHallOfFame(gameTitle: string): HallEntry[] {
  try {
    const raw = localStorage.getItem(hofKey(gameTitle));
    if (!raw) return [];
    const all: HallEntry[] = JSON.parse(raw);
    const thisMonth = new Date().toISOString().slice(0, 7);
    return all.filter((e) => e.date === thisMonth);
  } catch {
    return [];
  }
}

export function saveToHallOfFame(gameTitle: string, entry: HallEntry): boolean {
  const thisMonth = new Date().toISOString().slice(0, 7);
  let list: HallEntry[] = [];

  try {
    const raw = localStorage.getItem(hofKey(gameTitle));
    if (raw) {
      list = (JSON.parse(raw) as HallEntry[]).filter((e) => e.date === thisMonth);
    }
  } catch {
    // noop
  }

  list.push({ ...entry, date: thisMonth });
  list.sort((a, b) => b.score - a.score);
  list = list.slice(0, 3);

  localStorage.setItem(hofKey(gameTitle), JSON.stringify(list));

  return list.some((e) => e.nickname === entry.nickname && e.score === entry.score);
}

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

const MEDAL = ["🥇", "🥈", "🥉"];

const GameWrapper = ({ title, duration, info, onBack, children }: GameWrapperProps) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [nickname, setNickname] = useState(() => localStorage.getItem("buggy_nickname") || "");
  const [nicknameInput, setNicknameInput] = useState("");
  const [editingNick, setEditingNick] = useState(!localStorage.getItem("buggy_nickname"));

  const [hofList, setHofList] = useState<HallEntry[]>([]);
  const [rankResult, setRankResult] = useState<{ made: boolean; rank: number } | null>(null);

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

  useEffect(() => {
    if (!gameOver) return;

    const entry: HallEntry = {
      nickname: nickname || "PLAYER",
      score,
      date: new Date().toISOString().slice(0, 7),
    };

    const made = score > 0 ? saveToHallOfFame(title, entry) : false;
    const list = loadHallOfFame(title);
    setHofList(list);

    if (made && score > 0) {
      const rank =
        list.findIndex((e) => e.nickname === entry.nickname && e.score === entry.score) + 1;
      setRankResult({ made: true, rank });
    } else {
      setRankResult(null);
    }
  }, [gameOver, nickname, score, title]);

  const addScore = useCallback((points: number) => {
    const glitch = Math.random() < 0.05 ? -1 : 0;
    setScore((s) => Math.max(0, s + points + glitch));
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(duration);
    setGameOver(false);
    setIsRunning(true);
    setRankResult(null);
  }, [duration]);

  const handleSetNickname = () => {
    const n = nicknameInput.trim() || "PLAYER";
    setNickname(n);
    localStorage.setItem("buggy_nickname", n);
    setEditingNick(false);
  };

  const timerColor =
    timeLeft <= 10
      ? "hsl(0 80% 55%)"
      : timeLeft <= 20
        ? "hsl(45 100% 55%)"
        : "hsl(180 100% 50%)";

  return (
    <div className="h-screen flex flex-col bg-background scanline-overlay overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50 flex-shrink-0">
        <button
          onClick={onBack}
          className="font-pixel text-xs text-foreground hover:text-primary transition-colors"
        >
          ← MENU
        </button>

        <h2 className="font-pixel text-xs sm:text-sm text-foreground glitch-text truncate mx-2">
          {title}
        </h2>

        <div className="flex gap-3 font-mono text-sm">
          <span style={{ color: timerColor }}>⏱ {timeLeft}s</span>
          <span className="text-secondary">★ {score}</span>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        {!isRunning && !gameOver && (
          <div className="absolute inset-0 z-10 bg-background/95 overflow-y-auto">
            <div className="flex flex-col items-center py-6 px-4 min-h-full">
              <h3 className="font-pixel text-lg sm:text-xl text-primary neon-glow mb-4">
                {title}
              </h3>

              <div className="w-full max-w-md space-y-3 mb-5">
                <div className="bg-muted/60 border border-border rounded-lg p-4">
                  <h4 className="font-pixel text-xs text-accent mb-2">📋 게임 설명</h4>
                  <p className="font-mono text-sm text-foreground/80 leading-relaxed">
                    {info.description}
                  </p>
                </div>

                <div className="bg-muted/60 border border-destructive/30 rounded-lg p-4">
                  <h4 className="font-pixel text-xs text-destructive mb-2">🐛 알려진 버그</h4>
                  <ul className="space-y-1">
                    {info.bugs.map((bug, i) => (
                      <li
                        key={i}
                        className="font-mono text-xs text-foreground/70 flex items-start gap-2"
                      >
                        <span className="text-destructive mt-0.5">▸</span>
                        <span>{bug}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted/60 border border-secondary/30 rounded-lg p-4">
                  <h4 className="font-pixel text-xs text-secondary mb-2">★ 점수 기준</h4>
                  <p className="font-mono text-sm text-foreground/80 leading-relaxed">
                    {info.scoring}
                  </p>
                </div>

                <div className="text-center font-mono text-xs text-muted-foreground">
                  제한 시간: {duration}초
                </div>

                <HofPanel title={title} />
              </div>

              {editingNick ? (
                <div className="w-full max-w-xs space-y-2 mb-4">
                  <p className="font-pixel text-xs text-accent text-center">
                    닉네임 설정 (명예의 전당용)
                  </p>

                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-muted border border-border rounded px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                      placeholder="닉네임 입력..."
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSetNickname();
                      }}
                      maxLength={12}
                    />

                    <button
                      onClick={handleSetNickname}
                      className="font-pixel text-xs px-3 py-2 bg-primary text-primary-foreground rounded"
                    >
                      OK
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-mono text-xs text-muted-foreground mb-4">
                  플레이어: <span className="text-accent">{nickname}</span>
                  <button
                    onClick={() => {
                      setEditingNick(true);
                      setNicknameInput(nickname);
                    }}
                    className="ml-2 text-[10px] text-muted-foreground/50 hover:text-foreground underline"
                  >
                    변경
                  </button>
                </p>
              )}

              <button
                onClick={startGame}
                disabled={editingNick}
                className="font-pixel text-sm px-8 py-3 bg-primary text-primary-foreground rounded hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
              >
                START
              </button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 z-10 bg-background/92 overflow-y-auto">
            <div className="flex flex-col items-center py-8 px-4 min-h-full">
              <h3 className="font-pixel text-lg text-destructive glitch-text mb-1">
                GAME OVER
              </h3>

              <p className="font-pixel text-2xl text-secondary mb-3">★ {score}</p>

              {rankResult?.made && (
                <div className="mb-4 px-4 py-2 rounded border border-yellow-400/50 bg-yellow-400/10 text-center">
                  <p className="font-pixel text-xs text-yellow-400 animate-pulse">
                    {MEDAL[rankResult.rank - 1]} {rankResult.rank}위 등극! 명예의 전당 등록!
                  </p>
                </div>
              )}

              {hofList.length > 0 && (
                <div className="w-full max-w-xs mb-5">
                  <p className="font-pixel text-[10px] text-yellow-400 text-center mb-2">
                    🏆 {title} 명예의 전당
                  </p>

                  <div className="space-y-1.5">
                    {hofList.map((e, i) => {
                      const isMe = e.nickname === (nickname || "PLAYER") && e.score === score;

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between px-3 py-1.5 rounded text-sm"
                          style={{
                            background: isMe ? "hsl(120 100% 50% / 0.1)" : "hsl(240 10% 14%)",
                            border: `1px solid ${
                              isMe ? "hsl(120 100% 50% / 0.5)" : "hsl(var(--border))"
                            }`,
                          }}
                        >
                          <span className="text-base">{MEDAL[i]}</span>
                          <span
                            className="font-mono text-xs flex-1 mx-2 truncate"
                            style={{ color: isMe ? "hsl(120 100% 60%)" : undefined }}
                          >
                            {e.nickname}
                          </span>
                          <span className="font-pixel text-xs text-secondary">{e.score}</span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="font-mono text-[9px] text-muted-foreground/40 text-center mt-1">
                    * 이번 달 상위 3명
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="font-pixel text-xs px-5 py-2 bg-primary text-primary-foreground rounded"
                >
                  RETRY
                </button>

                <button
                  onClick={onBack}
                  className="font-pixel text-xs px-5 py-2 bg-muted text-foreground rounded border border-border"
                >
                  MENU
                </button>
              </div>
            </div>
          </div>
        )}

        {children({ score, addScore, timeLeft, isRunning, startGame })}
      </div>
    </div>
  );
};

function HofPanel({ title }: { title: string }) {
  const list = loadHallOfFame(title);

  if (list.length === 0) {
    return (
      <div className="bg-muted/40 border border-yellow-400/20 rounded-lg p-3 text-center">
        <p className="font-pixel text-[10px] text-yellow-400 mb-1">🏆 {title} 명예의 전당</p>
        <p className="font-mono text-xs text-muted-foreground">
          아직 기록이 없습니다. 첫 번째 주인공이 되세요!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 border border-yellow-400/20 rounded-lg p-3">
      <p className="font-pixel text-[10px] text-yellow-400 mb-2">🏆 {title} 명예의 전당</p>

      <div className="space-y-1">
        {list.map((e, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2 py-1 rounded"
            style={{ background: "hsl(240 10% 10%)" }}
          >
            <span>{MEDAL[i]}</span>
            <span className="font-mono text-xs flex-1 truncate text-foreground/80">
              {e.nickname}
            </span>
            <span className="font-pixel text-xs text-secondary">{e.score}</span>
          </div>
        ))}
      </div>

      <p className="font-mono text-[9px] text-muted-foreground/40 text-center mt-1.5">
        이번 달 상위 3명 · 매월 초기화
      </p>
    </div>
  );
}

export default GameWrapper;