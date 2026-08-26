import { API_URL } from "../../api/api-client";
import { cn } from "../../lib/utils";

type ImageProps = {
  imageId?: number | null;
  src?: string | null;
  title: string | null;
  className?: string;
};

export function ImageView({ imageId, title, className,}: ImageProps) {
  if (!imageId) {
    return null;
  }

  return (
    <div>
      <img
        src={`${API_URL}/image/${imageId}`}
        alt={title??""}
        className={cn(
        "max-h-64 max-w-full rounded mt-6",
        className
      )}
      />
    </div>
  );
}

export function ImagePreview({ src, title, className,}: ImageProps) {
  if (!src) {
    return null;
  }


  return (
    <div>
      <img
        src={src}
        alt={title??""}
        className={cn(
        "max-h-64 max-w-full rounded mt-6",
        className
      )}
      />
    </div>
  );
}