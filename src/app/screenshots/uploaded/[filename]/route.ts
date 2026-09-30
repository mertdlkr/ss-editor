import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

// Production Next.js indexes public files at startup. Serve new uploads from
// disk as well, so screenshots added while the server is running load instantly.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!/^[a-f0-9]{16}\.(png|jpg)$/.test(filename)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const bytes = await fs.readFile(
      path.join(process.cwd(), "public", "screenshots", "uploaded", filename),
    );
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": filename.endsWith(".png") ? "image/png" : "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return new Response(code === "ENOENT" ? "Not found" : "Unable to read image", {
      status: code === "ENOENT" ? 404 : 500,
    });
  }
}
