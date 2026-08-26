import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { useState } from "react";
import type { GameData } from "../../models/model";
import { Card } from "./Card";
import { Button } from "./Button";
import { ImageView } from "./ImageView";

const CARD_OFFSET = 10;
const SCALE_FACTOR = 0.06;
const SWIPE_THRESHOLD = 100;

type Props = {
  games: GameData[];
  onSelect: (game: GameData) => void;
};

export default function GameCardStack({ games, onSelect }: Props) {
  const [orderedGames, setOrderedGames] = useState<GameData[]>(games ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!orderedGames || orderedGames.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-slate-500">No games available</p>
      </Card>
    );
  }

  function next() {
    setOrderedGames((prev) => {
      const newArray = [...prev];
      newArray.push(newArray.shift()!);
      return newArray;
    });
    setCurrentIndex((i) => (i + 1) % orderedGames.length);
  }

  function prev() {
    setOrderedGames((prev) => {
      const newArray = [...prev];
      newArray.unshift(newArray.pop()!);
      return newArray;
    });
    setCurrentIndex((i) => (i - 1 + orderedGames.length) % orderedGames.length);
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative h-125">
        {orderedGames.slice(0, 3).map((game, index) => {
            const isTop = index === 0;
            return (
              <SwipeCard
                key={game.id ?? `unknown-${index}`}
                game={game}
                index={index}
                isTop={isTop}
                onSelect={onSelect}
                onNext={next}
                onPrev={prev}
                onSwipeLeft={next}
                onSwipeRight={prev}
              />
            );
          })}
      </div>

      <div className="flex justify-center mt-4">
        <span className="text-sm text-slate-500">
          {currentIndex + 1} / {orderedGames.length}
        </span>
      </div>
    </div>
  );
}

type SwipeCardProps = {
  game: GameData;
  index: number;
  isTop: boolean;
  onSelect: (game: GameData) => void;
  onNext: () => void;
  onPrev: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

function SwipeCard({
  game,
  index,
  isTop,
  onSelect,
  onNext,
  onPrev,
  onSwipeLeft,
  onSwipeRight,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const [isHovered, setIsHovered] = useState(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipeRight();
    }
  }

  const thumbnail =
    game.images?.find((img) => img.isPrimary) ??
    game.images?.[0] ??
    null;

  function handleSelect() {
    if (game.id == null) {
      console.warn("Cannot select game without id", game);
      return;
    }
    onSelect(game);
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        transformOrigin: "top center",
      }}
      animate={{
        y: index * -CARD_OFFSET,
        scale: 1 - index * SCALE_FACTOR,
        zIndex: 100 - index,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
    >
      <Card className="h-full flex flex-col overflow-hidden bg-white">
        <div
          className="flex-1 relative flex items-center justify-center bg-slate-100 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {thumbnail?.id != null ? (
            <ImageView imageId={thumbnail.id} title={game.gameTitle ?? ""} />
          ) : (
            <div className="text-slate-400 text-center p-8">No image</div>
          )}

          {isTop && (
            <>
              <motion.button
                onClick={onPrev}
                aria-label="Previous game"
                initial={{ x: 20, opacity: 0 }}
                animate={{
                  x: isHovered ? 12 : 20,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                           w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm
                           border-2 border-red-500 text-red-500 text-lg font-bold
                           flex items-center justify-center shadow-md
                           hover:bg-red-500 hover:text-white transition-colors"
              >
                ←
              </motion.button>

              <motion.button
                onClick={onNext}
                aria-label="Next game"
                initial={{ x: -20, opacity: 0 }}
                animate={{
                  x: isHovered ? -12 : -20,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                           w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm
                           border-2 border-red-500 text-red-500 text-lg font-bold
                           flex items-center justify-center shadow-md
                           hover:bg-red-500 hover:text-white transition-colors"
              >
                →
              </motion.button>
            </>
          )}
        </div>
        <div className="p-4 flex flex-col items-center gap-3">
          <h3 className="text-lg font-semibold text-black">
            {game.gameTitle || "Untitled game"}
          </h3>
          <Button
            onClick={handleSelect}
            className="w-full"
            disabled={!isTop || game.id == null}
          >
            Select Game
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}