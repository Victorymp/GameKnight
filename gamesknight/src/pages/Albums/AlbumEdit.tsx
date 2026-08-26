import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Screen, Header } from "../../components/ui/Screen";
import SideBar from "../../components/ui/SideBar";
import { ImageView } from "../../components/ui/ImageView";
import {
  fetchAlbum,
  updateAlbum,
  addGameToAlbum,
  removeGameFromAlbum,
  getAllGames,
} from "../../api/api-controller";
import type { Album, GameData } from "../../models/model";

export default function AlbumEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [availableGames, setAvailableGames] = useState<GameData[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    console.log(`Id: ${id}`);
    async function load() {
      const [albumData, allGames] = await Promise.all([
        fetchAlbum(Number(id)),
        // fetchGamesByAlbum(Number(id)),
        getAllGames()
      ]);
      if (cancelled) return;
      if (albumData) {
        setAlbum(albumData);
        setTitle(albumData.title);
        setDescription(albumData.description ?? "");
        setTags(albumData.tags ?? "");
      }
      setAvailableGames(allGames);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (!album) {
    return (
      <Screen>
        <Header />
        <p className="p-6">Loading...</p>
      </Screen>
    );
  }

  const gamesInAlbum = new Set(album.games?.map((g) => g.id) ?? []);
  const gamesNotInAlbum = Array.isArray(availableGames)
    ? availableGames.filter((g) => !gamesInAlbum.has(g.id))
    : [];

  async function handleSaveMetadata() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAlbum(album!.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags.trim() || undefined,
      });
      setAlbum(updated);
    } catch (err) {
      console.error(err);
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddGame(gameId: number) {
    await addGameToAlbum(album!.id, gameId);
    const refreshed = await fetchAlbum(album!.id);
    if (refreshed) setAlbum(refreshed);
  }

  async function handleRemoveGame(gameId: number) {
    await removeGameFromAlbum(album!.id, gameId);
    const refreshed = await fetchAlbum(album!.id);
    if (refreshed) setAlbum(refreshed);
  }

  function handleCreateNewGame() {
    navigate(`/game/make?albumId=${album!.id}`);
  }

  return (
    <Screen>
      <Header />
      <div className="flex flex-1">
        <SideBar />
        <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto flex-1">
          <div className="flex items-center gap-4">
            {album.images?.[0]?.id != null && (
              <div className="w-24 h-24 overflow-hidden rounded">
                <ImageView imageId={album.images[0].id} title={album.title} />
              </div>
            )}
            <h1 className="text-2xl font-bold flex-1">{album.title}</h1>
          </div>

          {/* Metadata */}
          <Card className="flex flex-col gap-3 p-4">
            <label className="font-semibold">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />

            <label className="font-semibold">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="font-semibold">Tags</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button onClick={handleSaveMetadata} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </Card>

          {/* Games in album */}
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                Games in album ({album.games?.length ?? 0})
              </h2>
              <Button onClick={handleCreateNewGame}>+ Create new game</Button>
            </div>

            {album.games?.length === 0 && (
              <p className="text-slate-500 text-sm">
                No games yet. Add existing games or create a new one.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {album.games?.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center gap-3 border rounded p-2"
                >
                  {game.images?.[0]?.id != null && (
                    <div className="w-12 h-12 overflow-hidden rounded shrink-0">
                      <ImageView
                        imageId={game.images[0].id}
                        title={game.gameTitle ?? ""}
                      />
                    </div>
                  )}
                  <span className="flex-1 truncate text-sm">
                    {game.gameTitle || "Untitled"}
                  </span>
                  <Button
                    onClick={() => handleRemoveGame(game.id)}
                    className="text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Add existing games */}
          {gamesNotInAlbum.length > 0 && (
            <Card className="flex flex-col gap-3 p-4">
              <h2 className="font-semibold text-lg">
                Add existing games
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {gamesNotInAlbum.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center gap-3 border rounded p-2"
                  >
                    {game.images?.[0]?.id != null && (
                      <div className="w-12 h-12 overflow-hidden rounded shrink-0">
                        <ImageView
                          imageId={game.images[0].id}
                          title={game.gameTitle ?? ""}
                        />
                      </div>
                    )}
                    <span className="flex-1 truncate text-sm">
                      {game.gameTitle || "Untitled"}
                    </span>
                    <Button
                      onClick={() => handleAddGame(game.id)}
                      className="text-xs"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button onClick={() => navigate("/albums")}>Done</Button>
        </div>
      </div>
    </Screen>
  );
}