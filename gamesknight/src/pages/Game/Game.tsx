
import { Screen, Header } from "../../components/ui/Screen";
import { Button } from "../../components/ui/Button";
import { useGamesList } from "../../api/api-hooks";
import SideBar from "../../components/ui/SideBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import GameCardStack from "../../components/ui/GameCardStack";
import type { Album, GameData } from "../../models/model";
import { useEffect, useState } from "react";
import { fetchAlbum, fetchAlbums } from "../../api/api-controller";
import AlbumCardStack from "../../components/ui/AlbumCardStack";

export default function Game() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectAlbumId = searchParams.get("albumId");

  useEffect(() => {
    let cancelled = false;
    async function loadAlbums() {
      try {
        const data = await fetchAlbums();
        if (!cancelled) setAlbums(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAlbums();
    return () => { cancelled = true; };
  }, []);

  async function handleAlbumSelect(album: Album) {
    // Refetch to get the album with games hydrated
    const full = await fetchAlbum(album.id);
    if (full) setSelectedAlbum(full);
  }

  function handleGameSelect(game: GameData) {
    console.log(`Game id: ${game.id}`)
    navigate(`/game/${game.id}`);
  }

  useEffect(() => {
    if (!preselectAlbumId) return;
    // Auto-select the album on mount if albumId param present
    fetchAlbum(Number(preselectAlbumId)).then((album) => {
      if (album) setSelectedAlbum(album);
    });
  }, [preselectAlbumId]);

  const { isLoading, error } = useGamesList();

  if (isLoading) return <div>Loading games...</div>;
  if (error) return <div>Failed to load games</div>;

  return (
    <Screen>
      <Header />
      <div className="flex flex-1">
        <SideBar />
        <div className="flex-1 flex flex-col items-center p-6 gap-4">
          {selectedAlbum ? (
            <>
              <div className="flex items-center justify-between w-full max-w-sm">
                <Button onClick={() => setSelectedAlbum(null)}>
                  ← Back to albums
                </Button>
                <h2 className="text-xl font-bold">{selectedAlbum.title}</h2>
              </div>
              <GameCardStack
                games={selectedAlbum.games}
                onSelect={handleGameSelect}
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">Choose an album</h2>
              {loading ? (
                <p className="text-slate-500">Loading...</p>
              ) : (
                <AlbumCardStack
                  albums={albums}
                  onSelect={handleAlbumSelect}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Screen>
  );
}