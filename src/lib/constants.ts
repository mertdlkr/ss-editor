import type { Device, Orientation, SlideLayout, Theme, ThemeId } from "./types";

// ---------- Canvas dimensions (design at largest required resolution) ----------
export const CANVAS: Record<Device, { w: number; h: number; wL?: number; hL?: number }> = {
  iphone:        { w: 1320, h: 2868 },
  ipad:          { w: 2064, h: 2752 },
  android:       { w: 1080, h: 1920 },
  "android-7":   { w: 1200, h: 1920, wL: 1920, hL: 1200 },
  "android-10":  { w: 1600, h: 2560, wL: 2560, hL: 1600 },
  "feature-graphic": { w: 1024, h: 500 },
};

// ---------- Export sizes per device ----------
export type ExportSize = { label: string; w: number; h: number };

export const EXPORT_SIZES: Record<Device, ExportSize[]> = {
  iphone: [
    { label: '6.9"', w: 1320, h: 2868 },
    { label: '6.5"', w: 1284, h: 2778 },
    { label: '6.3"', w: 1206, h: 2622 },
    { label: '6.1"', w: 1125, h: 2436 },
  ],
  ipad: [
    { label: '13" iPad',       w: 2064, h: 2752 },
    { label: '12.9" iPad Pro', w: 2048, h: 2732 },
  ],
  android:       [{ label: "Phone",          w: 1080, h: 1920 }],
  "android-7":   [{ label: '7" Portrait',    w: 1200, h: 1920 }],
  "android-10":  [{ label: '10" Portrait',   w: 1600, h: 2560 }],
  "feature-graphic": [{ label: "Feature Graphic", w: 1024, h: 500 }],
};

// Landscape sizes (tablets only)
export const EXPORT_SIZES_LANDSCAPE: Partial<Record<Device, ExportSize[]>> = {
  "android-7":  [{ label: '7" Landscape',  w: 1920, h: 1200 }],
  "android-10": [{ label: '10" Landscape', w: 2560, h: 1600 }],
};

export function supportsLandscape(device: Device): boolean {
  return device in EXPORT_SIZES_LANDSCAPE;
}

export function getExportSizes(device: Device, orientation: Orientation): ExportSize[] {
  if (orientation === "landscape") {
    return EXPORT_SIZES_LANDSCAPE[device] || EXPORT_SIZES[device];
  }
  return EXPORT_SIZES[device];
}

// ---------- Frame aspect ratios ----------
export const MK_RATIO    = 1022 / 2082; // iPhone PNG mockup
export const TAB_P_RATIO = 0.667;        // tablet portrait
export const TAB_L_RATIO = 1.5;          // tablet landscape
export const IPAD_RATIO  = 0.770;        // iPad

// iPhone mockup screen overlay (pre-measured)
export const PHONE_SCREEN = {
  L: (52 / 1022) * 100,
  T: (46 / 2082) * 100,
  W: (918 / 1022) * 100,
  H: (1990 / 2082) * 100,
  RX: (126 / 918) * 100,
  RY: (126 / 1990) * 100,
};

// ---------- Width formula helpers ----------
export function phoneW(cW: number, cH: number, clamp = 0.84) {
  return Math.min(clamp, 0.72 * (cH / cW) * MK_RATIO);
}
export function phoneWSmall(cW: number, cH: number) {
  return phoneW(cW, cH, 0.66);
}
export function tabletPW(cW: number, cH: number, clamp = 0.80) {
  return Math.min(clamp, 0.72 * (cH / cW) * TAB_P_RATIO);
}
export function tabletLW(cW: number, cH: number, clamp = 0.62) {
  return Math.min(clamp, 0.75 * (cH / cW) * TAB_L_RATIO);
}
export function ipadW(cW: number, cH: number, clamp = 0.75) {
  return Math.min(clamp, 0.72 * (cH / cW) * IPAD_RATIO);
}

// ---------- Themes ----------
export const DEFAULT_THEME_ID: ThemeId = "clean-light";

export const THEMES: Record<string, Theme> = {
  "clean-light": {
    id: "clean-light",
    name: "Clean Light",
    bg: "#F6F1EA",
    bgAlt: "#171717",
    fg: "#171717",
    fgAlt: "#F6F1EA",
    accent: "#5B7CFA",
    muted: "#6B7280",
  },
  "dark-bold": {
    id: "dark-bold",
    name: "Dark Bold",
    bg: "#051c12",
    bgAlt: "#F8FAFC",
    fg: "#F8FAFC",
    fgAlt: "#051c12",
    accent: "#f4c95d",
    muted: "#8fa89b",
  },
  "warm-editorial": {
    id: "warm-editorial",
    name: "Warm Editorial",
    bg: "#F7E8DA",
    bgAlt: "#2B1D17",
    fg: "#2B1D17",
    fgAlt: "#F7E8DA",
    accent: "#D97706",
    muted: "#7C5A47",
  },
  "ocean-fresh": {
    id: "ocean-fresh",
    name: "Ocean Fresh",
    bg: "#E0F2FE",
    bgAlt: "#0C4A6E",
    fg: "#0C4A6E",
    fgAlt: "#E0F2FE",
    accent: "#0284C7",
    muted: "#475569",
  },
  "bloom-roast": {
    id: "bloom-roast",
    name: "Bloom Roast",
    bg: "#F2ECE2",
    bgAlt: "#24352F",
    fg: "#1D2420",
    fgAlt: "#FFF7EA",
    accent: "#B8794A",
    muted: "#65736B",
  },
};

export function themeById(themeId: string | undefined): Theme {
  return THEMES[themeId || ""] || THEMES[DEFAULT_THEME_ID];
}

export function hasTheme(themeId: string | undefined): boolean {
  return !!themeId && !!THEMES[themeId];
}

export const STORAGE_KEY = "ss-editor:project:v1";
export const PROJECT_SCHEMA_VERSION = 3;

export const DEVICE_LABEL: Record<Device, string> = {
  iphone: "iPhone",
  ipad: "iPad",
  android: "Android Phone",
  "android-7": 'Android 7" Tablet',
  "android-10": 'Android 10" Tablet',
  "feature-graphic": "Feature Graphic",
};

// Friendly labels for slide layouts (used in dropdowns)
export const LAYOUT_LABEL: Record<SlideLayout, string> = {
  hero: "Hero",
  "device-bottom": "Device bottom",
  "device-top": "Device top",
  "two-devices": "Two devices",
  "no-device": "No device",
  "split-landscape": "Split (landscape)",
  "feature-graphic": "Feature graphic",
};

// Short description shown under each layout name
export const LAYOUT_HINT: Record<SlideLayout, string> = {
  hero: "Headline above, device at bottom",
  "device-bottom": "Headline top, device anchored below",
  "device-top": "Flipped — device on top",
  "two-devices": "Layered back + front phones",
  "no-device": "Big standalone headline",
  "split-landscape": "Caption left, device right",
  "feature-graphic": "1024×500 Play Store banner",
};

// Built-in decor library served from public/decor (see /api/decor).
export const DECOR_DIR = "/decor";

// Font stacks wired to the CSS variables declared in app/layout.tsx.
export const FONT_STACK = {
  sans: 'var(--font-sans), Barlow, system-ui, sans-serif',
  condensed: 'var(--font-condensed), "Barlow Condensed", Barlow, system-ui, sans-serif',
} as const;

export type FontFamilyId = keyof typeof FONT_STACK;

// Union of App Store Connect and Google Play listing languages. The editor
// code remains the persistent project/screenshot-path key; each store's API
// locale is resolved through its own map below.
// Sources:
// https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations
// https://support.google.com/googleplay/android-developer/answer/9844778?hl=en
export const STORE_LOCALES: { code: string; label: string }[] = [
  { code: "af", label: "Afrikaans" },
  { code: "sq", label: "Shqip" },
  { code: "am", label: "አማርኛ" },
  { code: "hy", label: "Հայերեն" },
  { code: "az", label: "Azərbaycanca" },
  { code: "eu", label: "Euskara" },
  { code: "bg", label: "Български" },
  { code: "my", label: "မြန်မာ" },
  { code: "gl", label: "Galego" },
  { code: "ka", label: "ქართული" },
  { code: "is", label: "Íslenska" },
  { code: "km", label: "ខ្មែរ" },
  { code: "ky", label: "Кыргызча" },
  { code: "lo", label: "ລາວ" },
  { code: "mk", label: "Македонски" },
  { code: "mn", label: "Монгол" },
  { code: "ne", label: "नेपाली" },
  { code: "nb", label: "Norsk bokmål" },
  { code: "pt", label: "Português" },
  { code: "si", label: "සිංහල" },
  { code: "zh", label: "简体中文" },
  { code: "en", label: "English (US)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-CA", label: "English (Canada)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-IN", label: "English (India)" },
  { code: "en-SG", label: "English (Singapore)" },
  { code: "en-ZA", label: "English (South Africa)" },
  { code: "ar", label: "العربية" },
  { code: "hy-AM", label: "Հայերեն" },
  { code: "az-AZ", label: "Azərbaycanca" },
  { code: "bn", label: "বাংলা" },
  { code: "eu-ES", label: "Euskara" },
  { code: "be", label: "Беларуская" },
  { code: "my-MM", label: "မြန်မာ" },
  { code: "ca", label: "Català" },
  { code: "cs", label: "Čeština" },
  { code: "da", label: "Dansk" },
  { code: "de", label: "Deutsch" },
  { code: "el", label: "Ελληνικά" },
  { code: "es", label: "Español" },
  { code: "es-MX", label: "Español (LatAm)" },
  { code: "es-US", label: "Español (EE. UU.)" },
  { code: "et", label: "Eesti" },
  { code: "fil", label: "Filipino" },
  { code: "fi", label: "Suomi" },
  { code: "fr", label: "Français" },
  { code: "fr-CA", label: "Français (Canada)" },
  { code: "gl-ES", label: "Galego" },
  { code: "ka-GE", label: "ქართული" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "he", label: "עברית" },
  { code: "hi", label: "हिन्दी" },
  { code: "is-IS", label: "Íslenska" },
  { code: "hr", label: "Hrvatski" },
  { code: "hu", label: "Magyar" },
  { code: "id", label: "Indonesia" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ko", label: "한국어" },
  { code: "kk", label: "Қазақша" },
  { code: "km-KH", label: "ខ្មែរ" },
  { code: "ky-KG", label: "Кыргызча" },
  { code: "lo-LA", label: "ລາວ" },
  { code: "lt", label: "Lietuvių" },
  { code: "lv", label: "Latviešu" },
  { code: "ml", label: "മലയാളം" },
  { code: "mr", label: "मराठी" },
  { code: "ms", label: "Melayu" },
  { code: "ms-MY", label: "Bahasa Melayu (Malaysia)" },
  { code: "mk-MK", label: "Македонски" },
  { code: "nl", label: "Nederlands" },
  { code: "no", label: "Norsk" },
  { code: "mn-MN", label: "Монгол" },
  { code: "ne-NP", label: "नेपाली" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "pl", label: "Polski" },
  { code: "pt-BR", label: "Português (BR)" },
  { code: "pt-PT", label: "Português (PT)" },
  { code: "fa", label: "فارسی" },
  { code: "fa-AE", label: "فارسی (امارات)" },
  { code: "fa-AF", label: "فارسی (افغانستان)" },
  { code: "fa-IR", label: "فارسی (ایران)" },
  { code: "ro", label: "Română" },
  { code: "rm", label: "Rumantsch" },
  { code: "ru", label: "Русский" },
  { code: "si-LK", label: "සිංහල" },
  { code: "sr", label: "Српски" },
  { code: "sk", label: "Slovenčina" },
  { code: "sl", label: "Slovenščina" },
  { code: "sv", label: "Svenska" },
  { code: "sw", label: "Kiswahili" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "th", label: "ไทย" },
  { code: "tr", label: "Türkçe" },
  { code: "uk", label: "Українська" },
  { code: "ur", label: "اردو" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "zh-Hans", label: "简体中文" },
  { code: "zh-Hant", label: "繁體中文" },
  { code: "zh-HK", label: "繁體中文（香港）" },
];

export const LOCALE_LABEL: Record<string, string> = Object.fromEntries(
  STORE_LOCALES.map((l) => [l.code, l.label]),
);

// The editor keys for Apple's 50 locales, retained unchanged for saved
// projects and screenshot paths.
const APPLE_EDITOR_LOCALES = new Set([
  "en", "en-AU", "en-CA", "en-GB", "ar", "bn", "ca", "cs", "da", "de",
  "el", "es", "es-MX", "fi", "fr", "fr-CA", "gu", "he", "hi", "hr",
  "hu", "id", "it", "ja", "kn", "ko", "ml", "mr", "ms", "nl", "no",
  "or", "pa", "pl", "pt-BR", "pt-PT", "ro", "ru", "sk", "sl", "sv",
  "ta", "te", "th", "tr", "uk", "ur", "vi", "zh", "zh-Hans", "zh-Hant",
]);

// Editor projects use language roots where regional separation was not needed.
// This mapping changes neither stored text keys nor screenshot/export paths.
export const APPLE_LOCALE_CODE: Record<string, string> = Object.fromEntries(
  STORE_LOCALES.filter(({ code }) => APPLE_EDITOR_LOCALES.has(code)).map(({ code }) => [code, ({
    ar: "ar-SA", bn: "bn-BD", de: "de-DE", en: "en-US", es: "es-ES",
    fr: "fr-FR", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", mr: "mr-IN",
    nl: "nl-NL", or: "or-IN", pa: "pa-IN", sl: "sl-SI", ta: "ta-IN",
    te: "te-IN", ur: "ur-PK", zh: "zh-Hans",
  } as Record<string, string>)[code] || code]),
);

// Google Play listing API locale codes for every currently available
// translation. Keys intentionally reuse existing editor codes where present.
export const GOOGLE_LOCALE_CODE: Record<string, string> = {
  af: "af", sq: "sq", am: "am", ar: "ar", "hy-AM": "hy-AM",
  "az-AZ": "az-AZ", bn: "bn-BD", "eu-ES": "eu-ES", be: "be",
  "hy": "hy-AM", "az": "az-AZ", "eu": "eu-ES", bg: "bg",
  my: "my-MM", gl: "gl-ES", ka: "ka-GE", is: "is-IS", km: "km-KH",
  ky: "ky-KG", lo: "lo-LA", mk: "mk-MK", mn: "mn-MN", ne: "ne-NP",
  nb: "no-NO", no: "no-NO", pt: "pt-BR", si: "si-LK", zh: "zh-CN",
  "my-MM": "my-MM", ca: "ca", "zh-HK": "zh-HK", "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW", hr: "hr", cs: "cs-CZ", da: "da-DK", nl: "nl-NL",
  "en-AU": "en-AU", "en-CA": "en-CA", en: "en-US", "en-GB": "en-GB",
  "en-IN": "en-IN", "en-SG": "en-SG", "en-ZA": "en-ZA", et: "et",
  fil: "fil", fi: "fi-FI", "fr-CA": "fr-CA", fr: "fr-FR", "gl-ES": "gl-ES",
  "ka-GE": "ka-GE", de: "de-DE", el: "el-GR", gu: "gu", he: "iw-IL",
  hi: "hi-IN", hu: "hu-HU", "is-IS": "is-IS", id: "id", it: "it-IT",
  ja: "ja-JP", kn: "kn-IN", kk: "kk", "km-KH": "km-KH", ko: "ko-KR",
  "ky-KG": "ky-KG", "lo-LA": "lo-LA", lv: "lv", lt: "lt", "mk-MK": "mk-MK",
  "ms-MY": "ms-MY", ms: "ms", ml: "ml-IN", mr: "mr-IN", "mn-MN": "mn-MN",
  "ne-NP": "ne-NP", fa: "fa", "fa-AE": "fa-AE",
  "fa-AF": "fa-AF", "fa-IR": "fa-IR", pl: "pl-PL", "pt-BR": "pt-BR",
  "pt-PT": "pt-PT", pa: "pa", ro: "ro", rm: "rm", ru: "ru-RU", sk: "sk",
  sl: "sl", "es-MX": "es-419", "es-US": "es-US", es: "es-ES", sr: "sr",
  "si-LK": "si-LK", sw: "sw", sv: "sv-SE", ta: "ta-IN", te: "te-IN",
  th: "th", tr: "tr-TR", uk: "uk", ur: "ur", vi: "vi",
};
