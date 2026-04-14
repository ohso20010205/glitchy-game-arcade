<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
import BouncingBallCatch from "@/components/games/BouncingBallCatch";
import RandomButtonClick from "@/components/games/RandomButtonClick";
import PuzzleBlockStack from "@/components/games/PuzzleBlockStack";
import MiniRacing from "@/components/games/MiniRacing";
<<<<<<< HEAD
import ColorTapRush from "@/components/games/ColorTapRush";
import MiniMemoryGame from "@/components/games/MiniMemoryGame";
import { loadHallOfFame, type HallEntry } from "@/components/GameWrapper";

type GameId = "menu" | "bouncing" | "buttons" | "blocks" | "racing" | "colortap" | "memory";

interface GameInfo {
  id: GameId;
  title: string;       // GameWrapper의 title 과 반드시 일치해야 HOF 키가 맞음
=======
import TimingJump from "@/components/games/TimingJump";
import MiniMemoryGame from "@/components/games/MiniMemoryGame";

type GameId = "menu" | "bouncing" | "buttons" | "blocks" | "racing" | "jump" | "memory";

interface GameInfo {
  id: GameId;
  title: string;
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
  emoji: string;
  desc: string;
  color: string;
}

const GAMES: GameInfo[] = [
<<<<<<< HEAD
  { id: "bouncing",  title: "BOUNCING BALL CATCH",   emoji: "🔴", desc: "Catch glitchy balls — speed increases with score",   color: "hsl(0 80% 55%)" },
  { id: "buttons",   title: "RANDOM BUTTON CLICK",   emoji: "🖱️", desc: "Click randomly appearing glitchy buttons",           color: "hsl(120 100% 50%)" },
  { id: "blocks",    title: "PUZZLE BLOCK STACK",     emoji: "🧱", desc: "Drop & stack blocks — scroll up to see your tower!", color: "hsl(45 100% 55%)" },
  { id: "racing",    title: "MINI RACING",            emoji: "🏎️", desc: "Dodge obstacles — more lanes as score grows!",       color: "hsl(200 90% 50%)" },
  { id: "colortap",  title: "COLOR TAP RUSH",         emoji: "🎨", desc: "Tap the right color — names may be lies!",           color: "hsl(300 100% 60%)" },
  { id: "memory",    title: "MINI MEMORY GAME",       emoji: "🧠", desc: "Memorize patterns — gets faster over time!",         color: "hsl(180 100% 50%)" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

// 전체 HOF 탭 컴포넌트
function HallOfFamePanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [lists, setLists] = useState<HallEntry[][]>([]);

  useEffect(() => {
    setLists(GAMES.map((g) => loadHallOfFame(g.title)));
  }, []);

  const currentList = lists[activeTab] ?? [];
  const game = GAMES[activeTab];

  return (
    <div className="border border-yellow-400/30 rounded-lg bg-muted/40 max-w-md mx-auto overflow-hidden">
      {/* 탭 헤더 */}
      <div className="flex overflow-x-auto border-b border-yellow-400/20" style={{ scrollbarWidth: "none" }}>
        {GAMES.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setActiveTab(i)}
            className="flex-shrink-0 px-3 py-2 font-pixel text-[9px] transition-colors"
            style={{
              color: activeTab === i ? "hsl(45 100% 55%)" : "hsl(var(--muted-foreground))",
              borderBottom: activeTab === i ? "2px solid hsl(45 100% 55%)" : "2px solid transparent",
              background: activeTab === i ? "hsl(45 100% 55% / 0.08)" : "transparent",
            }}
          >
            {g.emoji} {g.title.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {/* 랭킹 내용 */}
      <div className="p-4">
        <p className="font-pixel text-[10px] text-yellow-400 text-center mb-3">
          🏆 {game?.title}
        </p>

        {currentList.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground text-center py-3">
            아직 기록이 없습니다!
          </p>
        ) : (
          <div className="space-y-2">
            {currentList.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 rounded"
                style={{
                  background:
                    i === 0 ? "hsl(45 100% 55% / 0.12)" :
                    i === 1 ? "hsl(0 0% 80% / 0.07)" :
                              "hsl(30 80% 55% / 0.07)",
                  border: `1px solid ${
                    i === 0 ? "hsl(45 100% 55% / 0.4)" :
                    i === 1 ? "hsl(0 0% 80% / 0.2)" :
                              "hsl(30 80% 55% / 0.2)"
                  }`,
                }}
              >
                <span className="text-lg w-6">{MEDAL[i]}</span>
                <span className="font-mono text-xs flex-1 mx-3 truncate text-foreground/90">{entry.nickname}</span>
                <span className="font-pixel text-sm text-secondary">{entry.score}</span>
              </div>
            ))}
          </div>
        )}

        <p className="font-mono text-[9px] text-muted-foreground/40 text-center mt-3">
          * 매월 1일 자동 초기화 · 상위 3명 기록
        </p>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──
const Index = () => {
  const [currentGame, setCurrentGame] = useState<GameId>("menu");
  const [showHof, setShowHof] = useState(false);

  const goToMenu = () => setCurrentGame("menu");

  if (currentGame === "bouncing")  return <BouncingBallCatch onBack={goToMenu} />;
  if (currentGame === "buttons")   return <RandomButtonClick onBack={goToMenu} />;
  if (currentGame === "blocks")    return <PuzzleBlockStack  onBack={goToMenu} />;
  if (currentGame === "racing")    return <MiniRacing        onBack={goToMenu} />;
  if (currentGame === "colortap")  return <ColorTapRush      onBack={goToMenu} />;
  if (currentGame === "memory")    return <MiniMemoryGame    onBack={goToMenu} />;

  return (
    <div className="h-screen bg-background scanline-overlay flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="py-6 sm:py-8 text-center flex-shrink-0">
        <h1 className="font-pixel text-2xl sm:text-4xl text-primary neon-glow mb-2">
=======
  { id: "bouncing", title: "BOUNCING BALL", emoji: "🔴", desc: "Catch glitchy bouncing balls", color: "hsl(0 80% 55%)" },
  { id: "buttons", title: "BUTTON CLICK", emoji: "🖱️", desc: "Click randomly appearing buttons", color: "hsl(120 100% 50%)" },
  { id: "blocks", title: "BLOCK STACK", emoji: "🧱", desc: "Stack falling blocks neatly", color: "hsl(45 100% 55%)" },
  { id: "racing", title: "MINI RACING", emoji: "🏎️", desc: "Dodge obstacles on the track", color: "hsl(200 90% 50%)" },
  { id: "jump", title: "TIMING JUMP", emoji: "🦘", desc: "Jump over obstacles with timing", color: "hsl(180 100% 50%)" },
  { id: "memory", title: "MEMORY GAME", emoji: "🧠", desc: "Memorize and repeat patterns", color: "hsl(300 100% 60%)" },
];

const Index = () => {
  const [currentGame, setCurrentGame] = useState<GameId>("menu");

  const goToMenu = () => setCurrentGame("menu");

  if (currentGame === "bouncing") return <BouncingBallCatch onBack={goToMenu} />;
  if (currentGame === "buttons") return <RandomButtonClick onBack={goToMenu} />;
  if (currentGame === "blocks") return <PuzzleBlockStack onBack={goToMenu} />;
  if (currentGame === "racing") return <MiniRacing onBack={goToMenu} />;
  if (currentGame === "jump") return <TimingJump onBack={goToMenu} />;
  if (currentGame === "memory") return <MiniMemoryGame onBack={goToMenu} />;

  return (
    <div className="min-h-screen bg-background scanline-overlay flex flex-col">
      {/* Header */}
      <header className="py-8 sm:py-12 text-center">
        <h1 className="font-pixel text-2xl sm:text-4xl text-primary neon-glow mb-3">
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
          BUGGY GAMES
        </h1>
        <p className="font-mono text-sm text-muted-foreground glitch-text">
          ⚠ WARNING: These games may contain "features" ⚠
        </p>
      </header>

<<<<<<< HEAD
      {/* 스크롤 가능한 본문 */}
      <div className="flex-1 overflow-y-auto pb-4" style={{ scrollbarWidth: "thin" }}>
        <main className="container max-w-4xl px-4">
          {/* 게임 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => setCurrentGame(game.id)}
                className="group relative p-5 rounded border-2 border-border bg-card hover:border-primary transition-all duration-200 text-left overflow-hidden"
                onMouseEnter={(e) => {
                  if (Math.random() < 0.3) {
                    e.currentTarget.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
                  }
                }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
              >
                <span className="text-3xl mb-2 block">{game.emoji}</span>
                <h2 className="font-pixel text-xs text-foreground mb-1 group-hover:text-primary transition-colors">
                  {game.title}
                </h2>
                <p className="font-mono text-xs text-muted-foreground">{game.desc}</p>
                <div
                  className="absolute -bottom-1 -right-1 w-16 h-16 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
                  style={{ backgroundColor: game.color }}
                />
              </button>
            ))}
          </div>

          {/* 명예의 전당 토글 */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setShowHof((v) => !v)}
              className="font-pixel text-xs px-5 py-2 border border-yellow-400/50 text-yellow-400 rounded hover:bg-yellow-400/10 transition-colors"
            >
              🏆 명예의 전당 {showHof ? "▲" : "▼"}
            </button>
          </div>

          {showHof && <HallOfFamePanel />}
        </main>
      </div>

      {/* 푸터 */}
      <footer className="py-3 text-center font-mono text-xs text-muted-foreground border-t border-border flex-shrink-0">
        v0.2.0-alpha (still definitely not buggy) · {GAMES.length} games
=======
      {/* Game Grid */}
      <main className="flex-1 container max-w-4xl px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setCurrentGame(game.id)}
              className="group relative p-5 rounded border-2 border-border bg-card hover:border-primary transition-all duration-200 text-left overflow-hidden"
              style={{
                // BUG: card border occasionally flickers a random color
              }}
              onMouseEnter={(e) => {
                // BUG: ~30% chance the card slightly shifts on hover
                if (Math.random() < 0.3) {
                  e.currentTarget.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
              }}
            >
              <span className="text-3xl mb-2 block">{game.emoji}</span>
              <h2 className="font-pixel text-xs text-foreground mb-1 group-hover:text-primary transition-colors">
                {game.title}
              </h2>
              <p className="font-mono text-xs text-muted-foreground">{game.desc}</p>
              {/* Glow accent */}
              <div
                className="absolute -bottom-1 -right-1 w-16 h-16 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
                style={{ backgroundColor: game.color }}
              />
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center font-mono text-xs text-muted-foreground border-t border-border">
        v0.1.0-alpha (definitely not buggy)
>>>>>>> 62fe8d59eafef97e2e83a8b578ec8a2e8f613abe
      </footer>
    </div>
  );
};

export default Index;
