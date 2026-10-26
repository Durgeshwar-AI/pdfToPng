export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the image in your browser."));
    };
    image.src = url;
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Your browser could not create the converted image."));
    }, type, quality);
  });
}

export async function renderImage(
  file: File,
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D, image: HTMLImageElement) => void = (context, image) => {
    context.drawImage(image, 0, 0, width, height);
  },
  type = "image/png",
  quality = 0.92,
): Promise<Blob> {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser does not support image processing.");
  draw(context, image);
  return canvasToBlob(canvas, type, quality);
}

export async function getImageDimensions(file: File) {
  const image = await loadImage(file);
  return { width: image.naturalWidth, height: image.naturalHeight };
}

export function downloadImage(blob: Blob, name: string): string {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return url;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function addPngDpi(blob: Blob, dpi: number): Promise<Blob> {
  return blob.arrayBuffer().then((buffer) => {
    const source = new Uint8Array(buffer);
    const chunkData = new Uint8Array(9);
    const view = new DataView(chunkData.buffer);
    view.setUint32(0, Math.round(dpi / 0.0254));
    view.setUint32(4, Math.round(dpi / 0.0254));
    chunkData[8] = 1;
    const type = new TextEncoder().encode("pHYs");
    const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);
    new DataView(chunk.buffer).setUint32(0, chunkData.length);
    chunk.set(type, 4);
    chunk.set(chunkData, 8);
    new DataView(chunk.buffer).setUint32(17, crc32(new Uint8Array([...type, ...chunkData])));
    return new Blob([source.slice(0, 33), chunk, source.slice(33)], { type: "image/png" });
  });
}
