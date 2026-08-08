export default function getGameQr(): string {
  return "/tempqr.png";
}

export async function imageToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert image blob to a base64 string."));
      }
    };
    reader.onerror = () => reject(new Error("Image conversion to base64 failed."));
    reader.readAsDataURL(blob);
  });
}


