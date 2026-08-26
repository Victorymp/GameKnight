import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Screen, Header } from "../../components/ui/Screen";
import SideBar from "../../components/ui/SideBar";
import { ImageView } from "../../components/ui/ImageView";
import { fetchAlbums } from "../../api/api-controller";
import type { Album } from "../../models/model";

export default function AlbumList() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchAlbums();
        if (!cancelled) setAlbums(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load albums.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = Array.isArray(albums)
  ? albums.filter((a) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q) ||
        (a.tags ?? "").toLowerCase().includes(q)
      );
    })
  : [];

  return (
    <Screen>
      <Header />
      <div className="flex flex-1">
        <SideBar />
        <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto flex-1">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Albums</h1>
            <Button onClick={() => navigate("/albums/new")}>
              + Create Album
            </Button>
          </div>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search albums by title, tag, or description..."
          />

          {loading ? (
            <p className="text-slate-500">Loading albums...</p>
          ) : error ? (
            <Card className="p-6">
              <p className="text-red-500 text-center">{error}</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-6 flex flex-col items-center gap-3">
              <p className="text-slate-500 text-center">
                {search ? "No albums match your search." : "No albums yet."}
              </p>
              {!search && (
                <Button onClick={() => navigate("/albums/new")}>
                  Create your first album
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((album) => (
                <AlbumTile key={album.id} album={album} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}

type AlbumTileProps = {
  album: Album;
};

function AlbumTile({ album }: AlbumTileProps) {
  const navigate = useNavigate();

  const thumbnail =
    album.images?.find((img) => img.isPrimary) ??
    album.images?.[0] ??
    null;

  const gameCount = album.games?.length ?? 0;
  const tagsList = album.tags
    ? album.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <Card className="flex flex-col overflow-hidden">
      <div
        className="aspect-square relative bg-slate-100 cursor-pointer overflow-hidden"
        onClick={() => navigate(`/albums/${album.id}/edit`)}
      >
        {thumbnail?.id != null ? (
          <ImageView imageId={thumbnail.id} title={album.title} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No cover
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {gameCount} game{gameCount === 1 ? "" : "s"}
        </div>
        {!album.isPublic && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
            Private
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-black truncate">
          {album.title || "Untitled"}
        </h3>

        {album.description && (
          <p className="text-sm text-slate-500 line-clamp-2">
            {album.description}
          </p>
        )}

        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tagsList.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {tagsList.length > 3 && (
              <span className="text-xs text-slate-400">
                +{tagsList.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => navigate(`/albums/${album.id}/edit`)}
            className="flex-1 text-sm"
          >
            Edit
          </Button>
          <Button
            onClick={() => navigate(`/game?albumId=${album.id}`)}
            className="flex-1 text-sm"
          >
            Play
          </Button>
        </div>
      </div>
    </Card>
  );
}