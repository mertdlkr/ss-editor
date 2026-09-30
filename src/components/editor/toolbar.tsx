"use client";
import * as React from "react";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Cloud, Download, Languages, UnfoldHorizontal, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEVICE_LABEL,
  LOCALE_LABEL,
  STORE_LOCALES,
  supportsLandscape,
  getExportSizes,
} from "@/lib/constants";
import { detectPlatform } from "@/lib/defaults";
import type { Device, Orientation } from "@/lib/types";

type Props = {
  appName: string;
  setAppName: (v: string) => void;
  connectedCanvas: boolean;
  setConnectedCanvas: (v: boolean) => void;
  locale: string;
  setLocale: (v: string) => void;
  locales: string[];
  setLocales: (v: string[]) => void;
  device: Device;
  setDevice: (v: Device) => void;
  orientation: Orientation;
  slideCounts: Record<Device, number>;
  setOrientation: (v: Orientation) => void;
  onExport: (options?: { locales?: string[]; devices?: Device[]; suffix?: string }) => void;
  onResetAll: () => void;
  onResetDevice: () => void;
  exporting: string | null;
  savedAt: number | null;
  saveError: string | null;
  busy: boolean;
};

const allDevices: Device[] = ["iphone", "ipad", "android", "android-7", "android-10", "feature-graphic"];

export function Toolbar(props: Props) {
  const platform = detectPlatform(props.device);
  const hasLandscape = supportsLandscape(props.device);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedExportLocales, setSelectedExportLocales] = React.useState<string[]>(props.locales);
  const [selectedExportDevices, setSelectedExportDevices] = React.useState<Device[]>([props.device]);

  // Keep selected export locales synced with project locales if they change
  React.useEffect(() => {
    setSelectedExportLocales((prev) => prev.filter((l) => props.locales.includes(l)));
  }, [props.locales]);

  // Track last device per platform so iOS/Android tabs preserve user's choice.
  const lastByPlatform = React.useRef<{ ios: Device; android: Device }>({
    ios: platform === "ios" ? props.device : "iphone",
    android: platform === "android" ? props.device : "android",
  });
  React.useEffect(() => {
    lastByPlatform.current[platform] = props.device;
  }, [platform, props.device]);

  const deviceLabel = DEVICE_LABEL[props.device];
  const exportImageCount = selectedExportDevices.reduce(
    (total, device) => total + props.slideCounts[device] * getExportSizes(device, props.orientation).length,
    0,
  ) * selectedExportLocales.length;

  const currIdx = props.locales.indexOf(props.locale);
  const prevLocale = () => {
    if (props.locales.length <= 1) return;
    const nextIdx = currIdx <= 0 ? props.locales.length - 1 : currIdx - 1;
    props.setLocale(props.locales[nextIdx]);
  };
  const nextLocale = () => {
    if (props.locales.length <= 1) return;
    const nextIdx = currIdx >= props.locales.length - 1 ? 0 : currIdx + 1;
    props.setLocale(props.locales[nextIdx]);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b bg-card/40 px-4 py-2">
      <Input
        value={props.appName}
        onChange={(e) => props.setAppName(e.target.value)}
        className="h-8 w-40 border-dashed text-sm font-semibold focus-visible:border-input focus-visible:border-solid focus-visible:bg-background"
        placeholder="App name"
        aria-label="App name"
        title="App name (click to edit)"
        disabled={props.busy}
      />

      <span aria-hidden className="mx-1 h-5 w-px bg-border" />

      <Button
        type="button"
        variant={props.connectedCanvas ? "secondary" : "outline"}
        size="sm"
        className="h-8 gap-1.5 px-2 text-xs"
        onClick={() => props.setConnectedCanvas(!props.connectedCanvas)}
        aria-pressed={props.connectedCanvas}
        title={
          props.connectedCanvas
            ? "Connected canvas enabled"
            : "Isolated screens; turn on to let elements cross screen edges"
        }
        disabled={props.busy}
      >
        <UnfoldHorizontal className="h-3.5 w-3.5" />
        {props.connectedCanvas ? "Connected" : "Isolated"}
      </Button>

      <span aria-hidden className="mx-1 h-5 w-px bg-border" />

      <Tabs
        value={platform}
        onValueChange={(p) => {
          if (props.busy) return;
          const next = p === "ios" ? lastByPlatform.current.ios : lastByPlatform.current.android;
          props.setDevice(next);
        }}
      >
        <TabsList className="h-8 p-0.5">
          <TabsTrigger value="ios" className="h-7 px-3 text-xs" disabled={props.busy}>
            iOS
          </TabsTrigger>
          <TabsTrigger value="android" className="h-7 px-3 text-xs" disabled={props.busy}>
            Android
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Select
        value={props.device}
        onValueChange={(v) => props.setDevice(v as Device)}
        disabled={props.busy}
      >
        <SelectTrigger className="h-8 w-44 text-xs">
          <SelectValue placeholder="Device">{deviceLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {platform === "ios" ? (
            <>
              <SelectItem value="iphone">{DEVICE_LABEL.iphone}</SelectItem>
              <SelectItem value="ipad">{DEVICE_LABEL.ipad}</SelectItem>
            </>
          ) : (
            <>
              <SelectItem value="android">{DEVICE_LABEL.android}</SelectItem>
              <SelectItem value="android-7">{DEVICE_LABEL["android-7"]}</SelectItem>
              <SelectItem value="android-10">{DEVICE_LABEL["android-10"]}</SelectItem>
              <SelectItem value="feature-graphic">{DEVICE_LABEL["feature-graphic"]}</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      {hasLandscape && (
        <Select
          value={props.orientation}
          onValueChange={(v) => props.setOrientation(v as Orientation)}
          disabled={props.busy}
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-7 px-0"
          onClick={prevLocale}
          disabled={props.busy || props.locales.length <= 1}
          title="Önceki dil (Previous language)"
          aria-label="Previous language"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Select value={props.locale} onValueChange={props.setLocale} disabled={props.busy}>
          <SelectTrigger className="h-8 w-36 text-xs" title="Language shown on the canvas">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {props.locales.map((l) => (
              <SelectItem key={l} value={l}>
                {LOCALE_LABEL[l] ?? l} · {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-7 px-0"
          onClick={nextLocale}
          disabled={props.busy || props.locales.length <= 1}
          title="Sonraki dil (Next language)"
          aria-label="Next language"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setLangOpen(true)}
        disabled={props.busy}
        title="Add or remove languages"
        aria-label="Languages"
      >
        <Languages className="h-4 w-4" />
      </Button>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <SaveStatus savedAt={props.savedAt} saveError={props.saveError} />
        <span aria-hidden className="h-5 w-px bg-border" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setResetOpen(true)}
          title="Reset screens to defaults"
          aria-label="Reset"
          disabled={props.busy}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => setExportOpen(true)}
          disabled={!!props.exporting}
          size="sm"
          className="h-8 gap-1.5"
          title="Dilleri veya cihazları seçerek indir"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Seçerek İndir
        </Button>
        <Button
          onClick={() => props.onExport()}
          disabled={!!props.exporting}
          size="sm"
          className="h-8"
          title="Tüm cihazlar ve seçili tüm dilleri tek seferde zip olarak indir"
        >
          <Download className="h-4 w-4" />
          {props.exporting ? `Exporting ${props.exporting}` : "Tümünü İndir (Zip)"}
        </Button>
      </div>

      {/* Parçalı / Seçerek İndirme Modalı */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Parçalı / Seçerek Ekran Görüntüsü İndir
            </DialogTitle>
            <DialogDescription>
              İndirmek istediğin dilleri ve cihazları seçerek sadece ihtiyacın olan seti çok daha hızlı indirebilirsin.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Hızlı Ön Ayarlar */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hızlı Dil Paketleri
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setSelectedExportLocales([props.locale])}
                >
                  Yalnızca Aktif Dil ({LOCALE_LABEL[props.locale] || props.locale})
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs font-medium text-amber-400 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40"
                  onClick={() => {
                    const csl = ["tr", "en", "pt-BR", "de", "fr", "es", "it", "nl", "pt-PT"];
                    setSelectedExportLocales(csl.filter((l) => props.locales.includes(l)));
                  }}
                >
                  ⭐ 9 Özel Ülke (TR, BR, DE, EN, FR, ES, IT, NL, PT)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setSelectedExportLocales([...props.locales])}
                >
                  Tüm Diller ({props.locales.length})
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => setSelectedExportLocales([props.locales.includes("en") ? "en" : props.locale])}
                >
                  Sıfırla (Tek Dil)
                </Button>
              </div>
            </div>

            {/* Cihaz Seçimi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cihazlar ({selectedExportDevices.length}/{allDevices.length})
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setSelectedExportDevices(["iphone", "ipad"])}
                  >
                    Yalnızca iOS
                  </button>
                  <span className="text-xs text-muted-foreground">•</span>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setSelectedExportDevices(["android", "android-7", "android-10", "feature-graphic"])}
                  >
                    Yalnızca Android
                  </button>
                  <span className="text-xs text-muted-foreground">•</span>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setSelectedExportDevices([...allDevices])}
                  >
                    Tümü
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {allDevices.map((dev) => {
                  const checked = selectedExportDevices.includes(dev);
                  return (
                    <label
                      key={dev}
                      className={`flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                        checked ? "bg-primary/10 border-primary/50 text-foreground" : "bg-card/40 border-border text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            if (selectedExportDevices.length > 1) {
                              setSelectedExportDevices(selectedExportDevices.filter((d) => d !== dev));
                            }
                          } else {
                            setSelectedExportDevices([...selectedExportDevices, dev]);
                          }
                        }}
                      />
                      <span>{DEVICE_LABEL[dev]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Dil Seçimi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Diller ({selectedExportLocales.length}/{props.locales.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-52 overflow-y-auto rounded-lg border p-2 bg-card/20">
                {props.locales.map((code) => {
                  const checked = selectedExportLocales.includes(code);
                  return (
                    <label
                      key={code}
                      className={`flex items-center gap-2 rounded px-2 py-1 text-xs cursor-pointer transition-colors ${
                        checked ? "bg-primary/10 font-medium text-foreground" : "text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            if (selectedExportLocales.length > 1) {
                              setSelectedExportLocales(selectedExportLocales.filter((l) => l !== code));
                            }
                          } else {
                            setSelectedExportLocales([...selectedExportLocales, code]);
                          }
                        }}
                      />
                      <span className="truncate">{LOCALE_LABEL[code] || code}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{code}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Tahmini: <span className="font-semibold text-foreground">{exportImageCount}</span> görsel
              ({selectedExportDevices.length} cihaz × {selectedExportLocales.length} dil)
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setExportOpen(false)}>
                Vazgeç
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                disabled={selectedExportLocales.length === 0 || selectedExportDevices.length === 0}
                onClick={() => {
                  setExportOpen(false);
                  const suffix = selectedExportLocales.length === 1
                    ? selectedExportLocales[0]
                    : `${selectedExportLocales.length}langs`;
                  props.onExport({
                    locales: selectedExportLocales,
                    devices: selectedExportDevices,
                    suffix,
                  });
                }}
              >
                <Download className="h-4 w-4" />
                Seçilenleri İndir ({selectedExportLocales.length} Dil)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={langOpen} onOpenChange={setLangOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Languages</DialogTitle>
            <DialogDescription>
              Every selected language gets its own copy of each caption and its own folder in the
              export zip ({"<platform>/<device>/<size>/<language>/"}). Text you leave empty falls
              back to English, so adding a language never blanks a screen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-80 grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto pr-1">
            {STORE_LOCALES.map((l) => {
              const on = props.locales.includes(l.code);
              const isDefault = l.code === "en";
              return (
                <label
                  key={l.code}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
                    isDefault ? "opacity-60" : "cursor-pointer hover:bg-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={isDefault}
                    onChange={() => {
                      // English is the fallback every other language reads from,
                      // so it cannot be removed.
                      if (isDefault) return;
                      const next = on
                        ? props.locales.filter((x) => x !== l.code)
                        : [...props.locales, l.code];
                      props.setLocales(next);
                      if (on && props.locale === l.code) props.setLocale("en");
                    }}
                  />
                  <span className="truncate">{l.label}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{l.code}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {props.locales.length} selected. Export renders every device size once per language, so
            the bundle grows linearly — deselect what you will not ship.
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset to defaults?</DialogTitle>
            <DialogDescription>
              Choose whether to reset just <span className="font-medium">{deviceLabel}</span> or every device deck. Your canvas edits, uploaded screenshots, and copy will be lost.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResetOpen(false);
                props.onResetDevice();
              }}
            >
              Reset {deviceLabel} only
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setResetOpen(false);
                props.onResetAll();
              }}
            >
              Reset all devices
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SaveStatus({ savedAt, saveError }: { savedAt: number | null; saveError: string | null }) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  if (saveError) {
    return (
      <span
        className="flex items-center gap-1 text-xs text-destructive"
        title={saveError}
      >
        <AlertTriangle className="h-3.5 w-3.5" /> save failed
      </span>
    );
  }

  if (!savedAt) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Cloud className="h-3.5 w-3.5" /> not saved yet
      </span>
    );
  }
  const seconds = Math.max(0, Math.round((Date.now() - savedAt) / 1000));
  const label =
    seconds < 5
      ? "saved"
      : seconds < 60
        ? `saved ${seconds}s ago`
        : seconds < 3600
          ? `saved ${Math.round(seconds / 60)}m ago`
          : `saved ${Math.round(seconds / 3600)}h ago`;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Check className="h-3.5 w-3.5 text-green-500" /> {label}
    </span>
  );
}
