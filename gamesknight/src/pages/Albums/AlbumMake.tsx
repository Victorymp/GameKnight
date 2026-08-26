import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ImageInput, Input } from "../../components/ui/Input";
import { Screen, Header } from "../../components/ui/Screen";
import SideBar from "../../components/ui/SideBar";
import { createAlbum } from "../../api/api-controller";
import type { Image } from "../../models/model";
import { ImagePreview } from "../../components/ui/ImageView";

function parseDataUrl(dataUrl: string): { type: string; content: string } {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) return { type: "image/png", content: dataUrl };
  return { type: match[1], content: match[2] };
}

export default function AlbumMake() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState<Image | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function handleImageChange(file: File | null) {
    if (!file) {
      setCoverImage(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const { type, content } = parseDataUrl(dataUrl);
      setCoverImage({
        isThumbnails: true,
        isPrimary: true,
        type,
        category: "IMAGE",
        title: file.name,
        content,
      });
    };
    reader.readAsDataURL(file);
  }

  function validate(): string | null {
    if (!title.trim()) return "Album needs a title.";
    return null;
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const created = await createAlbum({
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags.trim() || undefined,
        isPublic,
        images: coverImage ? [coverImage] : [],
      });
      // Navigate to the edit page so user can add games
      navigate(`/albums/${created.id}/edit`);
    } catch (err) {
      console.error(err);
      setError("Failed to create album.");
    } finally {
      setSaving(false);
    }
  }

  const coverPreview = coverImage
    ? coverImage.content.startsWith("data:")
      ? coverImage.content
      : `data:${coverImage.type};base64,${coverImage.content}`
    : null;

  return (
    <Screen>
      <Header />
      <div className="flex flex-1">
        <SideBar />
        <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto flex-1">
          <h1 className="text-2xl font-bold">Create Album</h1>

          <Card className="flex flex-col gap-3 p-4">
            <label className="font-semibold">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Friday Night Trivia"
            />

            <label className="font-semibold">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this album about?"
            />

            <label className="font-semibold">Tags</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated, e.g. trivia, music, 80s"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>Public (anyone can play)</span>
            </label>
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            <label className="font-semibold">Cover image</label>
            <ImageInput
              chooseText="Upload album art"
              emptyText="Nothing selected yet"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            />
            
            {coverPreview && (
              <ImagePreview 
                src={coverPreview}
                title="Cover preview"
              />
            )}
          </Card>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={() => navigate("/albums")}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Creating..." : "Create Album"}
            </Button>
          </div>
        </div>
      </div>
    </Screen>
  );
}