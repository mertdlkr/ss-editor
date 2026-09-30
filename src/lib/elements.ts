import type { BuiltInElementId, ElementId, ImageElementId, TextElementId } from "./types";

export const BUILT_IN_ELEMENT_IDS: BuiltInElementId[] = [
  "caption",
  "device",
  "deviceSecondary",
];

export const TEXT_ELEMENT_PREFIX = "text:";
export const IMAGE_ELEMENT_PREFIX = "image:";

export function isBuiltInElementId(id: ElementId | string): id is BuiltInElementId {
  return (BUILT_IN_ELEMENT_IDS as string[]).includes(id);
}

export function isTextElementId(id: ElementId | string | null | undefined): id is TextElementId {
  return typeof id === "string" && id.startsWith(TEXT_ELEMENT_PREFIX);
}

export function isImageElementId(id: ElementId | string | null | undefined): id is ImageElementId {
  return typeof id === "string" && id.startsWith(IMAGE_ELEMENT_PREFIX);
}

export function toTextElementId(id: string): TextElementId {
  return `${TEXT_ELEMENT_PREFIX}${id}` as TextElementId;
}

export function toImageElementId(id: string): ImageElementId {
  return `${IMAGE_ELEMENT_PREFIX}${id}` as ImageElementId;
}

export function textElementKey(id: TextElementId | ElementId): string {
  return isTextElementId(id) ? id.slice(TEXT_ELEMENT_PREFIX.length) : id;
}

export function imageElementKey(id: ImageElementId | ElementId): string {
  return isImageElementId(id) ? id.slice(IMAGE_ELEMENT_PREFIX.length) : id;
}

// Single source of truth for stacking order. Previously duplicated across
// slide-canvas (defaultElementZ + an inline `5 + index`) and inspector
// (defaultZ); with a third element family those three would collide — an image
// and a text element at the same array index both landing on z=5.
// Bands are spaced so a family never overlaps another by default.
export function defaultElementZ(id: ElementId | string, index = 0): number {
  if (isTextElementId(id)) return 50 + index;
  if (isImageElementId(id)) return 20 + index;
  if (id === "deviceSecondary") return 2;
  if (id === "device") return 3;
  return 4; // caption
}
