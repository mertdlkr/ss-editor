// App Store Connect rejects PNG alpha channels, including fully opaque RGBA.
// Browser canvas PNG encoders may retain alpha; write an explicit RGB PNG.
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function chunk(type: string, data: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(data.length + 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, data.length);
  bytes.set(new TextEncoder().encode(type), 4);
  bytes.set(data, 8);
  let crc = 0xffffffff;
  for (let i = 4; i < bytes.length - 4; i++) crc = crcTable[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
  view.setUint32(bytes.length - 4, (crc ^ 0xffffffff) >>> 0);
  return bytes;
}
export async function encodeRgbPng(rgba: Uint8ClampedArray, width: number, height: number): Promise<Uint8Array> {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || rgba.length !== width * height * 4) throw new Error("Invalid PNG pixel dimensions");
  const rows = new Uint8Array((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    let destination = y * (width * 3 + 1) + 1;
    for (let x = 0; x < width; x++) {
      const source = (y * width + x) * 4;
      const alpha = rgba[source + 3] / 255;
      for (let c = 0; c < 3; c++) rows[destination++] = Math.round(rgba[source + c] * alpha + 255 * (1 - alpha));
    }
  }
  const compressed = new Uint8Array(await new Response(new Blob([rows]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer());
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width); view.setUint32(4, height);
  header[8] = 8; header[9] = 2; // Eight-bit RGB, no alpha channel.
  const chunks = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", compressed), chunk("IEND", new Uint8Array())];
  const png = new Uint8Array(chunks.reduce((size, bytes) => size + bytes.length, 0));
  let offset = 0;
  for (const bytes of chunks) { png.set(bytes, offset); offset += bytes.length; }
  return png;
}
export async function opaquePng(dataUrl: string): Promise<string> {
  const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob());
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("PNG pixel context unavailable");
    context.drawImage(bitmap, 0, 0);
    const bytes = await encodeRgbPng(context.getImageData(0, 0, bitmap.width, bitmap.height).data, bitmap.width, bitmap.height);
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("PNG encoding failed"));
      reader.readAsDataURL(new Blob([bytes as BlobPart], { type: "image/png" }));
    });
  } finally { bitmap.close(); }
}
