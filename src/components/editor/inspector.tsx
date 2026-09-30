"use client";
import * as React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronUp,
  Plus,
  RotateCw,
  ImageIcon,
  Smartphone,
  Trash2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LAYOUT_HINT, LAYOUT_LABEL } from "@/lib/constants";
import { nid } from "@/lib/defaults";
import {
  defaultElementZ,
  imageElementKey,
  isBuiltInElementId,
  isImageElementId,
  isTextElementId,
  textElementKey,
  toImageElementId,
  toTextElementId,
} from "@/lib/elements";
import { img } from "@/lib/image-cache";
import { pickText, writeLocalized } from "@/lib/locale";
import type {
  BuiltInElementId,
  Device,
  ElementId,
  ElementTransform,
  ImageElement,
  Orientation,
  Slide,
  SlideLayout,
  TextElement,
} from "@/lib/types";
import { DecorPicker } from "./decor-picker";
import { ScreenshotPicker } from "./screenshot-picker";
import { getCanvas, getElementTransform } from "./slide-canvas";

type Props = {
  slide: Slide;
  device: Device;
  orientation: Orientation;
  locale: string;
  selectedElementId: ElementId | null;
  onChange: (patch: Partial<Slide>) => void;
  onSelectElement: (id: ElementId | null) => void;
};

const ELEMENT_LABEL: Record<BuiltInElementId, string> = {
  caption: "Headline",
  device: "Device",
  deviceSecondary: "Back device",
};

export function Inspector({
  slide,
  device,
  orientation,
  locale,
  selectedElementId,
  onChange,
  onSelectElement,
}: Props) {
  const isFeatureGraphic = device === "feature-graphic" || slide.layout === "feature-graphic";
  const isNoDevice = slide.layout === "no-device";
  const layoutValue = device === "feature-graphic" ? "feature-graphic" : slide.layout;
  const layoutOptions = Object.entries(LAYOUT_LABEL).filter(([layout]) =>
    device === "feature-graphic" ? layout === "feature-graphic" : layout !== "feature-graphic",
  );
  const localeLabel = slide.label?.[locale] ?? "";
  const localeHeadline = slide.headline?.[locale] ?? "";
  // When the active locale is empty, surface the fallback (typically en) as
  // the placeholder so the user sees what they're translating from.
  const headlineDefault = isFeatureGraphic ? "Your tagline." : "One idea\nper slide.";
  const labelPlaceholder = localeLabel ? "FEATURE 01" : pickText(slide.label, locale) || "FEATURE 01";
  const headlinePlaceholder = localeHeadline
    ? headlineDefault
    : pickText(slide.headline, locale) || headlineDefault;

  function setLocaleField(key: "label" | "headline", value: string) {
    onChange({ [key]: writeLocalized(slide[key], locale, value) } as Partial<Slide>);
  }

  React.useEffect(() => {
    if (device === "feature-graphic" && slide.layout !== "feature-graphic") {
      onChange({ layout: "feature-graphic", transforms: undefined, screenshotSecondary: undefined });
    }
  }, [device, onChange, slide.layout]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Screen settings</h2>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            editing · {locale.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{LAYOUT_HINT[layoutValue]}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Layout</Label>
          <Select
            value={layoutValue}
            onValueChange={(layout) => {
              const next = layout as SlideLayout;
              onChange({
                layout: next,
                transforms: undefined,
                screenshotSecondary:
                  next === "two-devices" ? slide.screenshotSecondary || slide.screenshot : undefined,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {layoutOptions.map(([layout, label]) => (
                <SelectItem key={layout} value={layout}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isFeatureGraphic && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                value={localeLabel}
                onChange={(e) => setLocaleField("label", e.target.value)}
                placeholder={labelPlaceholder}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Laurel Badge (Optional)</Label>
              <Input
                value={slide.laurelText?.[locale] ?? ""}
                onChange={(e) => onChange({ laurelText: writeLocalized(slide.laurelText, locale, e.target.value) })}
                placeholder="e.g. 10M+ DOWNLOADS"
              />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label className="text-xs">{isFeatureGraphic ? "Tagline" : "Headline"}</Label>
            <span className="text-[10px] text-muted-foreground">newline = break</span>
          </div>
          <Textarea
            value={localeHeadline}
            onChange={(e) => setLocaleField("headline", e.target.value)}
            rows={3}
            placeholder={headlinePlaceholder}
          />
        </div>

        {!isFeatureGraphic && !isNoDevice && (
          <div className="space-y-1.5">
            <Label className="text-xs">
              {slide.layout === "two-devices" ? "Front device screenshot" : "Screenshot"}
            </Label>
            <ScreenshotPicker
              label="Primary"
              value={slide.screenshot}
              locale={locale}
              onChange={(v) => onChange({ screenshot: v })}
            />
          </div>
        )}

        {slide.layout === "two-devices" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Back device screenshot</Label>
            <ScreenshotPicker
              label="Secondary (back layer)"
              value={slide.screenshotSecondary || ""}
              locale={locale}
              onChange={(v) => onChange({ screenshotSecondary: v })}
            />
          </div>
        )}

        {!isFeatureGraphic && (
          <ElementTransformControls
            slide={slide}
            device={device}
            orientation={orientation}
            locale={locale}
            selectedElementId={selectedElementId}
            onChange={onChange}
            onSelectElement={onSelectElement}
          />
        )}

        {isFeatureGraphic && (
          <p className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            Shows app icon + name + tagline. Drop an icon at <span className="rounded bg-background px-1 py-0.5 font-mono text-[10px] text-foreground">/public/app-icon.png</span> (or leave blank — the app initial will be used). Name is set in the toolbar.
          </p>
        )}
      </div>
    </div>
  );
}

function ElementTransformControls({
  slide,
  device,
  orientation,
  locale,
  selectedElementId,
  onChange,
  onSelectElement,
}: {
  slide: Slide;
  device: Device;
  orientation: Orientation;
  locale: string;
  selectedElementId: ElementId | null;
  onChange: (patch: Partial<Slide>) => void;
  onSelectElement: (id: ElementId | null) => void;
}) {
  const present: ElementId[] = ["caption"];
  if (slide.layout !== "no-device") present.push("device");
  if (slide.layout === "two-devices") present.push("deviceSecondary");
  for (const element of slide.textElements || []) present.push(toTextElementId(element.id));
  for (const element of slide.imageElements || []) present.push(toImageElementId(element.id));

  const transforms = slide.transforms || {};
  const activeId =
    selectedElementId && present.includes(selectedElementId) ? selectedElementId : null;
  const activeTransform = activeId
    ? getElementTransform(slide, device, orientation, activeId)
    : undefined;
  const activeTextElement =
    activeId && isTextElementId(activeId)
      ? slide.textElements?.find((element) => element.id === textElementKey(activeId))
      : null;
  const activeImageElement =
    activeId && isImageElementId(activeId)
      ? slide.imageElements?.find((element) => element.id === imageElementKey(activeId))
      : null;

  function getTransform(id: ElementId) {
    return getElementTransform(slide, device, orientation, id);
  }

  function patchElement(id: ElementId, patch: Partial<ElementTransform>) {
    const cur = getTransform(id);
    if (!cur) return;
    if (isTextElementId(id)) {
      const textId = textElementKey(id);
      onChange({
        textElements: (slide.textElements || []).map((element) =>
          element.id === textId
            ? { ...element, transform: { ...element.transform, ...patch } }
            : element,
        ),
      });
      return;
    }
    if (isImageElementId(id)) {
      const imageId = imageElementKey(id);
      onChange({
        imageElements: (slide.imageElements || []).map((element) =>
          element.id === imageId
            ? { ...element, transform: { ...element.transform, ...patch } }
            : element,
        ),
      });
      return;
    }
    if (!isBuiltInElementId(id)) return;
    onChange({
      transforms: { ...transforms, [id]: { ...cur, ...patch } },
    });
  }

  function patchTextElement(id: string, patch: Partial<TextElement>) {
    onChange({
      textElements: (slide.textElements || []).map((element) =>
        element.id === id ? { ...element, ...patch } : element,
      ),
    });
  }

  function setTextElementValue(element: TextElement, value: string) {
    patchTextElement(element.id, { text: writeLocalized(element.text, locale, value) });
  }

  function deleteTextElement(element: TextElement) {
    const nextTextElements = (slide.textElements || []).filter((item) => item.id !== element.id);
    onChange({
      textElements: nextTextElements.length > 0 ? nextTextElements : undefined,
    });
    onSelectElement(null);
  }

  function patchImageElement(id: string, patch: Partial<ImageElement>) {
    onChange({
      imageElements: (slide.imageElements || []).map((element) =>
        element.id === id ? { ...element, ...patch } : element,
      ),
    });
  }

  function deleteImageElement(element: ImageElement) {
    const next = (slide.imageElements || []).filter((item) => item.id !== element.id);
    onChange({ imageElements: next.length > 0 ? next : undefined });
    onSelectElement(null);
  }

  function nextZIndex() {
    return (
      Math.max(
        5,
        ...present.map((elementId) => getTransform(elementId)?.zIndex ?? defaultZ(elementId)),
      ) + 1
    );
  }

  function addImageElement(src: string, aspect: number) {
    const { cW, cH } = getCanvas(device, orientation);
    const id = nid();
    const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
    const width = cW * 0.16;
    const height = width / safeAspect;
    const element: ImageElement = {
      id,
      src,
      transform: {
        x: (cW - width) / 2,
        y: cH * 0.12,
        width,
        height,
        rotation: 0,
        zIndex: nextZIndex(),
      },
      opacity: 1,
      fit: "contain",
      lockAspect: true,
    };
    onChange({ imageElements: [...(slide.imageElements || []), element] });
    onSelectElement(toImageElementId(id));
  }

  // Mockup aspect from public/mockup.png; matches PHONE_SCREEN in constants.
  const PHONE_ASPECT = 1022 / 2082;

  function addPhoneElement() {
    const { cW, cH } = getCanvas(device, orientation);
    const id = nid();
    const width = cW * 0.5;
    const height = width / PHONE_ASPECT;
    const element: ImageElement = {
      id,
      src: slide.screenshot || "",
      transform: {
        x: (cW - width) / 2,
        y: cH * 0.3,
        width,
        height,
        rotation: 0,
        zIndex: nextZIndex(),
      },
      opacity: 1,
      lockAspect: true,
      frame: "phone",
    };
    onChange({ imageElements: [...(slide.imageElements || []), element] });
    onSelectElement(toImageElementId(id));
  }

  function addTextElement() {
    const { cW, cH } = getCanvas(device, orientation);
    const id = nid();
    const zIndex = nextZIndex();
    const element: TextElement = {
      id,
      text: writeLocalized({}, locale, "New text"),
      transform: {
        x: cW * 0.18,
        y: cH * 0.42,
        width: cW * 0.64,
        height: cH * 0.12,
        rotation: 0,
        zIndex,
      },
      fontSize: Math.round(Math.min(cW, cH) * 0.065),
      fontWeight: 800,
      align: "center",
    };
    onChange({ textElements: [...(slide.textElements || []), element] });
    onSelectElement(toTextElementId(id));
  }

  // Z-order: re-rank zIndex among present elements so they remain contiguous.
  function reorder(id: ElementId, dir: "front" | "back" | "up" | "down") {
    const ranked = [...present].sort((a, b) => {
      const za = getTransform(a)?.zIndex ?? defaultZ(a);
      const zb = getTransform(b)?.zIndex ?? defaultZ(b);
      return za - zb;
    });
    const idx = ranked.indexOf(id);
    if (idx === -1) return;
    let target = idx;
    if (dir === "front") target = ranked.length - 1;
    else if (dir === "back") target = 0;
    else if (dir === "up") target = Math.min(ranked.length - 1, idx + 1);
    else if (dir === "down") target = Math.max(0, idx - 1);
    if (target === idx) return;
    ranked.splice(idx, 1);
    ranked.splice(target, 0, id);
    const nextTransforms = { ...transforms };
    const nextTextElements = (slide.textElements || []).map((element) => ({
      ...element,
      transform: { ...element.transform },
    }));
    const nextImageElements = (slide.imageElements || []).map((element) => ({
      ...element,
      transform: { ...element.transform },
    }));
    ranked.forEach((eid, i) => {
      const cur = getTransform(eid);
      if (!cur) return;
      if (isTextElementId(eid)) {
        const textId = textElementKey(eid);
        const textElement = nextTextElements.find((element) => element.id === textId);
        if (textElement) textElement.transform = { ...textElement.transform, zIndex: i + 1 };
      } else if (isImageElementId(eid)) {
        const imageId = imageElementKey(eid);
        const imageElement = nextImageElements.find((element) => element.id === imageId);
        if (imageElement) imageElement.transform = { ...imageElement.transform, zIndex: i + 1 };
      } else if (isBuiltInElementId(eid)) {
        nextTransforms[eid] = { ...cur, zIndex: i + 1 };
      }
    });
    onChange({
      transforms: nextTransforms,
      textElements: nextTextElements.length > 0 ? nextTextElements : undefined,
      imageElements: nextImageElements.length > 0 ? nextImageElements : undefined,
    });
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Label className="text-xs font-semibold">Elements</Label>
          <p className="text-[11px] text-muted-foreground">
            {activeId
              ? "Fine-tune the selected element's rotation and stacking."
              : "Click an element on the canvas to fine-tune its rotation and stacking."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={addTextElement}
          >
            <Plus className="h-3.5 w-3.5" />
            Text
          </Button>
          <DecorPicker onPick={addImageElement} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={addPhoneElement}
            title="Add a tilted phone mockup"
          >
            <Smartphone className="h-3.5 w-3.5" />
            Phone
          </Button>
        </div>
      </div>

      {activeId ? (
        <ActiveElementPanel
          activeId={activeId}
          transform={activeTransform}
          textElement={activeTextElement || undefined}
          imageElement={activeImageElement || undefined}
          locale={locale}
          onRotate={(rotation) => patchElement(activeId, { rotation })}
          onReorder={(dir) => reorder(activeId, dir)}
          onTextChange={(value) => {
            if (activeTextElement) setTextElementValue(activeTextElement, value);
          }}
          onTextPatch={(patch) => {
            if (activeTextElement) patchTextElement(activeTextElement.id, patch);
          }}
          onDeleteText={() => {
            if (activeTextElement) deleteTextElement(activeTextElement);
            if (activeImageElement) deleteImageElement(activeImageElement);
          }}
          onImagePatch={(patch) => {
            if (activeImageElement) patchImageElement(activeImageElement.id, patch);
          }}
          onImageResize={(patch) => patchElement(activeId, patch)}
        />
      ) : (
        <div className="rounded border border-dashed bg-background/40 p-4 text-center text-[11px] text-muted-foreground">
          No element selected
        </div>
      )}
    </div>
  );
}

function ActiveElementPanel({
  activeId,
  transform,
  textElement,
  imageElement,
  locale,
  onRotate,
  onReorder,
  onTextChange,
  onTextPatch,
  onDeleteText,
  onImagePatch,
  onImageResize,
}: {
  activeId: ElementId;
  transform: ElementTransform | undefined;
  textElement?: TextElement;
  imageElement?: ImageElement;
  locale: string;
  onRotate: (rotation: number) => void;
  onReorder: (dir: "front" | "back" | "up" | "down") => void;
  onTextChange: (value: string) => void;
  onTextPatch: (patch: Partial<TextElement>) => void;
  onDeleteText: () => void;
  onImagePatch: (patch: Partial<ImageElement>) => void;
  onImageResize: (patch: Partial<ElementTransform>) => void;
}) {
  const engaged = !!transform;
  const rotation = transform?.rotation ?? 0;
  const label = imageElement?.frame === "phone" ? "Phone" : elementLabel(activeId);
  return (
    <div className="space-y-2 rounded border bg-background/60 p-2.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-medium">
          {textElement && <Type className="h-3.5 w-3.5" />}
          {imageElement &&
            (imageElement.frame === "phone" ? (
              <Smartphone className="h-3.5 w-3.5" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5" />
            ))}
          {label}
        </span>
        {textElement || imageElement ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-destructive"
            onClick={onDeleteText}
            title={`Delete ${label.toLowerCase()} element`}
            aria-label={`Delete ${label.toLowerCase()} element`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : !engaged ? (
          <span className="text-[10px] text-muted-foreground">drag to enable</span>
        ) : null}
      </div>

      {textElement && (
        <TextElementPanel
          element={textElement}
          locale={locale}
          onTextChange={onTextChange}
          onTextPatch={onTextPatch}
        />
      )}

      {imageElement && (
        <ImageElementPanel
          element={imageElement}
          transform={transform}
          onImagePatch={onImagePatch}
          onImageResize={onImageResize}
        />
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <RotateCw className="h-3 w-3" /> Rotation
          </Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {rotation}°
          </span>
        </div>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={rotation}
          disabled={!engaged}
          onChange={(e) => onRotate(Number(e.target.value))}
          className="w-full disabled:opacity-50"
          aria-label={`${label} rotation`}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Layer</Label>
        <div className="grid grid-cols-4 gap-1">
          <LayerButton disabled={!engaged} onClick={() => onReorder("back")} label="Send to back">
            <ArrowDownToLine className="h-3.5 w-3.5" />
          </LayerButton>
          <LayerButton disabled={!engaged} onClick={() => onReorder("down")} label="Send backward">
            <ChevronDown className="h-3.5 w-3.5" />
          </LayerButton>
          <LayerButton disabled={!engaged} onClick={() => onReorder("up")} label="Bring forward">
            <ChevronUp className="h-3.5 w-3.5" />
          </LayerButton>
          <LayerButton disabled={!engaged} onClick={() => onReorder("front")} label="Bring to front">
            <ArrowUpToLine className="h-3.5 w-3.5" />
          </LayerButton>
        </div>
      </div>
    </div>
  );
}

function ImageElementPanel({
  element,
  transform,
  onImagePatch,
  onImageResize,
}: {
  element: ImageElement;
  transform: ElementTransform | undefined;
  onImagePatch: (patch: Partial<ImageElement>) => void;
  onImageResize: (patch: Partial<ElementTransform>) => void;
}) {
  const framed = element.frame === "phone";
  const PHONE_ASPECT = 1022 / 2082;
  const opacity = element.opacity ?? 1;
  const width = Math.round(transform?.width ?? 0);
  const height = Math.round(transform?.height ?? 0);
  const aspect = framed ? PHONE_ASPECT : height > 0 ? width / height : 1;

  const locked = framed || element.lockAspect !== false;
  function setWidth(value: number) {
    if (!Number.isFinite(value) || value <= 0) return;
    onImageResize(locked ? { width: value, height: value / aspect } : { width: value });
  }
  function setHeight(value: number) {
    if (!Number.isFinite(value) || value <= 0) return;
    onImageResize(locked ? { height: value, width: value * aspect } : { height: value });
  }
  function toggleFrame(on: boolean) {
    onImagePatch({ frame: on ? "phone" : undefined, lockAspect: true });
    // Snap to the handset ratio immediately, otherwise the element stays
    // deformed until the next resize.
    if (on && width > 0) onImageResize({ width, height: width / PHONE_ASPECT });
  }

  return (
    <div className="space-y-2 border-b pb-2">
      <div
        className="h-16 w-full rounded border bg-[repeating-conic-gradient(#0002_0%_25%,transparent_0%_50%)] bg-[length:12px_12px]"
        hidden={framed}
        style={{
          backgroundImage: `url(${img(element.src)})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        aria-hidden
      />
      {framed ? (
        <ScreenshotPicker
          label="Screen"
          value={element.src}
          onChange={(path) => onImagePatch({ src: path })}
        />
      ) : (
        <p className="truncate text-[10px] text-muted-foreground" title={element.src}>
          {element.src}
        </p>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] text-muted-foreground">Opacity</Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(opacity * 100)}
          onChange={(e) => onImagePatch({ opacity: Number(e.target.value) / 100 })}
          className="w-full"
          aria-label="Decor opacity"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Width</Label>
          <Input
            type="number"
            className="h-7 text-xs"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Height</Label>
          <Input
            type="number"
            className="h-7 text-xs"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={`frame-${element.id}`}
          type="checkbox"
          checked={framed}
          onChange={(e) => toggleFrame(e.target.checked)}
        />
        <Label htmlFor={`frame-${element.id}`} className="text-[11px] text-muted-foreground">
          Phone frame
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={`lock-${element.id}`}
          type="checkbox"
          checked={locked}
          disabled={framed}
          onChange={(e) => onImagePatch({ lockAspect: e.target.checked })}
        />
        <Label htmlFor={`lock-${element.id}`} className="text-[11px] text-muted-foreground">
          Lock aspect ratio{framed ? " (fixed by frame)" : ""}
        </Label>
      </div>
    </div>
  );
}

function TextElementPanel({
  element,
  locale,
  onTextChange,
  onTextPatch,
}: {
  element: TextElement;
  locale: string;
  onTextChange: (value: string) => void;
  onTextPatch: (patch: Partial<TextElement>) => void;
}) {
  const text = element.text?.[locale] ?? pickText(element.text, locale);
  return (
    <div className="space-y-2 rounded border bg-muted/30 p-2">
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Text</Label>
        <Textarea
          value={text}
          rows={2}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Overlay text"
        />
      </div>
      <div className="grid grid-cols-[1fr_76px] gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Size</Label>
          <Input
            type="number"
            min={12}
            max={400}
            value={Math.round(element.fontSize || 72)}
            onChange={(event) => onTextPatch({ fontSize: Number(event.target.value) || 72 })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Color</Label>
          <Input
            type="color"
            value={element.color || "#171717"}
            className="h-9 p-1"
            onChange={(event) => onTextPatch({ color: event.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Font</Label>
          <div className="grid grid-cols-2 gap-1">
            <Button
              type="button"
              size="sm"
              variant={(element.fontFamily ?? "sans") === "sans" ? "default" : "outline"}
              className="h-7 px-0 text-[11px]"
              onClick={() => onTextPatch({ fontFamily: "sans" })}
            >
              Barlow
            </Button>
            <Button
              type="button"
              size="sm"
              variant={element.fontFamily === "condensed" ? "default" : "outline"}
              className="h-7 px-0 text-[11px]"
              onClick={() => onTextPatch({ fontFamily: "condensed" })}
            >
              Cond.
            </Button>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={element.uppercase ? "default" : "outline"}
          className="h-7 px-2 text-[11px]"
          onClick={() => onTextPatch({ uppercase: !element.uppercase })}
          title="Uppercase"
        >
          AA
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        <LayerButton
          disabled={false}
          onClick={() => onTextPatch({ align: "left" })}
          label="Align left"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </LayerButton>
        <LayerButton
          disabled={false}
          onClick={() => onTextPatch({ align: "center" })}
          label="Align center"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </LayerButton>
        <LayerButton
          disabled={false}
          onClick={() => onTextPatch({ align: "right" })}
          label="Align right"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </LayerButton>
      </div>
    </div>
  );
}

function LayerButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 px-0"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </Button>
  );
}

function elementLabel(id: ElementId): string {
  if (isBuiltInElementId(id)) return ELEMENT_LABEL[id];
  if (isImageElementId(id)) return "Decor";
  return "Text";
}

const defaultZ = defaultElementZ;
