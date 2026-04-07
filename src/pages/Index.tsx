import { useState } from "react";
import BouncingBallCatch from "@/components/games/BouncingBallCatch";
import RandomButtonClick from "@/components/games/RandomButtonClick";
import PuzzleBlockStack from "@/components/games/PuzzleBlockStack";
import MiniRacing from "@/components/games/MiniRacing";
import TimingJump from "@/components/games/TimingJump";
import MiniMemoryGame from "@/components/games/MiniMemoryGame";

type GameId = "menu" | "bouncing" | "buttons" | "blocks" | "racing" | "jump" | "memory";

interface GameInfo {
  id: GameId;
  title: string;
  emoji: string;
  desc: string;
  color: string;
}

const GAMES: GameInfo[] = [
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
          BUGGY GAMES
        </h1>
        <p className="font-mono text-sm text-muted-foreground glitch-text">
          ⚠ WARNING: These games may contain "features" ⚠
        </p>
      </header>

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
      </footer>
    </div>
  );
};

export default Index;
