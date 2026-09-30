"use client";
import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { img, preloadImages } from "@/lib/image-cache";
import { ScreenshotPicker } from "./screenshot-picker";

type DecorItem = { name: string; path: string };

// Measures the file's real aspect ratio so a dropped icon never lands squashed.
function measureAspect(src: string): Promise<number> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () =>
      resolve(image.naturalHeight > 0 ? image.naturalWidth / image.naturalHeight : 1);
    image.onerror = () => resolve(1);
    image.src = src;
  });
}

export function DecorPicker({
  onPick,
}: {
  onPick: (src: string, aspect: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<DecorItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || items.length) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/decor")
      .then((r) => r.json())
      .then(async (json: { ok: boolean; items?: DecorItem[] }) => {
        const next = json.ok && json.items ? json.items : [];
        // Warm the cache so the grid paints instantly and, more importantly,
        // so a picked icon is already a data URI when the export runs.
        await preloadImages(next.map((i) => i.path));
        if (!cancelled) setItems(next);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, items.length]);

  async function pick(src: string) {
    const aspect = await measureAspect(img(src) || src);
    onPick(src, aspect);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          Decor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add decor</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <p className="mb-2 text-[11px] text-muted-foreground">
              Decor images from <code>public/decor</code>
            </p>
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
            ) : items.length ? (
              <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto">
                {items.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => pick(item.path)}
                    title={item.name}
                    className="group flex flex-col items-center gap-1 rounded border p-2 hover:border-foreground/40 hover:bg-muted"
                  >
                    <span
                      className="h-12 w-12"
                      style={{
                        backgroundImage: `url(${img(item.path)})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                    <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No decor files found — drop PNGs into <code>public/decor</code>.
              </p>
            )}
          </div>

          <div className="border-t pt-3">
            <ScreenshotPicker
              label="Or upload your own"
              value=""
              onChange={(path) => {
                if (path) void pick(path);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
