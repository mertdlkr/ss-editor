import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DECOR_DIR_REL = path.join("public", "decor");
const PUBLIC_PREFIX = "/decor";

// Directory listing rather than a hand-maintained manifest: dropping a new PNG
// into public/decor is enough to make it appear in the picker.
export async function GET() {
  try {
    const dir = path.join(process.cwd(), DECOR_DIR_REL);
    const entries = await fs.readdir(dir);
    const items = entries
      .filter((name) => name.toLowerCase().endsWith(".png"))
      .sort()
      .map((name) => ({
        name: name.replace(/\.png$/i, ""),
        path: `${PUBLIC_PREFIX}/${name}`,
      }));
    return NextResponse.json({ ok: true, items });
  } catch {
    // No decor dir (or a static export) — the picker falls back to Upload.
    return NextResponse.json({ ok: true, items: [] });
  }
}
