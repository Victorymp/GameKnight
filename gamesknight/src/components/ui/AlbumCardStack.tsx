import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { useState } from "react";
import type { Album } from "../../models/model";
import { Card } from "./Card";
import { Button } from "./Button";
import { ImageView } from "./ImageView";

const CARD_OFFSET = 15;
const SCALE_FACTOR = 0.05;
const SWIPE_THRESHOLD = 100;

type Props = {
  albums: Album[];
  onSelect: (album: Album) => void;
};

export default function AlbumCardStack({ albums, onSelect }: Props) {
  const [orderedAlbums, setOrderedAlbums] = useState<Album[]>(albums ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!orderedAlbums || orderedAlbums.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-slate-500">No albums yet</p>
      </Card>
    );
  }

  function next() {
    setOrderedAlbums((prev) => {
      const arr = [...prev];
      arr.push(arr.shift()!);
      return arr;
    });
    setCurrentIndex((i) => (i + 1) % orderedAlbums.length);
  }

  function prev() {
    setOrderedAlbums((prev) => {
      const arr = [...prev];
      arr.unshift(arr.pop()!);
      return arr;
    });
    setCurrentIndex((i) => (i - 1 + orderedAlbums.length) % orderedAlbums.length);
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative h-125">
        {orderedAlbums.slice(0, 3).map((album, index) => (
          <SwipeCard
            key={album.id ?? `unknown-${index}`}
            album={album}
            index={index}
            isTop={index === 0}
            onSelect={onSelect}
            onNext={next}
            onPrev={prev}
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <span className="text-sm text-slate-500">
          {currentIndex + 1} / {orderedAlbums.length}
        </span>
      </div>
    </div>
  );
}

type SwipeCardProps = {
  album: Album;
  index: number;
  isTop: boolean;
  onSelect: (album: Album) => void;
  onNext: () => void;
  onPrev: () => void;
};

function SwipeCard({ album, index, isTop, onSelect, onNext, onPrev }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const [isHovered, setIsHovered] = useState(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) onNext();
    else if (info.offset.x > SWIPE_THRESHOLD) onPrev();
  }

  const thumbnail =
    album.images?.find((img) => img.isPrimary) ??
    album.images?.[0] ??
    null;

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
            <ImageView imageId={thumbnail.id} title={album.title} />
          ) : (
            <div className="text-slate-400 text-center p-8">No cover image</div>
          )}

          {isTop && (
            <>
              <motion.button
                onClick={onPrev}
                aria-label="Previous album"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: isHovered ? 12 : 20, opacity: isHovered ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-2 border-red-500 text-red-500 text-lg font-bold flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-colors"
              >
                ←
              </motion.button>
              <motion.button
                onClick={onNext}
                aria-label="Next album"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: isHovered ? -12 : -20, opacity: isHovered ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-2 border-red-500 text-red-500 text-lg font-bold flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-colors"
              >
                →
              </motion.button>
            </>
          )}
        </div>
        <div className="p-4 flex flex-col items-center gap-3">
          <h3 className="text-lg font-semibold text-black">
            {album.title || "Untitled album"}
          </h3>
          {album.description && (
            <p className="text-sm text-slate-500 text-center line-clamp-2">
              {album.description}
            </p>
          )}
          <p className="text-xs text-slate-400">
            {album.games?.length ?? 0} game{album.games?.length === 1 ? "" : "s"}
          </p>
          <Button
            onClick={() => onSelect(album)}
            className="w-full"
            disabled={!isTop}
          >
            Open Album
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}