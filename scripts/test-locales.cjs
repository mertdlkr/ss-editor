const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../src/lib/constants.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function("exports", "require", "module", compiled)(loaded.exports, require, loaded);
const { APPLE_LOCALE_CODE, GOOGLE_LOCALE_CODE, STORE_LOCALES } = loaded.exports;

const appleCodes = new Set(Object.values(APPLE_LOCALE_CODE));
assert.equal(appleCodes.size, 50, "Apple mapping must resolve to 50 distinct platform locales");
const appleOfficialCodes = new Set(`
  ar-SA bn-BD ca zh-Hans zh-Hant hr cs da nl-NL en-AU en-CA en-GB en-US fi fr-FR fr-CA de-DE el
  gu-IN he hi hu id it ja kn-IN ko ms ml-IN mr-IN no or-IN pl pt-BR pt-PT pa-IN ro ru sk sl-SI
  es-MX es-ES sv ta-IN te-IN th tr uk ur-PK vi
`.trim().split(/\s+/));
assert.deepEqual([...appleCodes].sort(), [...appleOfficialCodes].sort(), "Apple map must use the official locale shortcodes");
assert.equal(appleOfficialCodes.size, 50, "The Apple shortcode fixture should contain 50 locales");
for (const editorCode of ["bn", "gu", "kn", "ml", "mr", "or", "pa", "sl", "ta", "te", "ur"]) {
  assert.ok(APPLE_LOCALE_CODE[editorCode], `Apple locale ${editorCode} must be mapped`);
}
assert.equal(APPLE_LOCALE_CODE.zh, APPLE_LOCALE_CODE["zh-Hans"], "zh is a legacy alias for zh-Hans");
assert.equal(APPLE_LOCALE_CODE["zh-Hant"], "zh-Hant");
assert.ok(!APPLE_LOCALE_CODE.nb, "nb remains a Google/legacy alias, not an Apple target");

// Google Play's official Store listing locale codes from the linked help page.
const googleOfficialCodes = new Set(`
  af sq am ar hy-AM az-AZ bn-BD eu-ES be bg my-MM ca zh-HK zh-CN zh-TW hr cs-CZ da-DK
  nl-NL en-AU en-CA en-US en-GB en-IN en-SG en-ZA et fil fi-FI fr-CA fr-FR gl-ES ka-GE
  de-DE el-GR gu iw-IL hi-IN hu-HU is-IS id it-IT ja-JP kn-IN kk km-KH ko-KR ky-KG lo-LA
  lv lt mk-MK ms-MY ms ml-IN mr-IN mn-MN ne-NP no-NO fa fa-AE fa-AF fa-IR pl-PL pt-BR
  pt-PT pa ro rm ru-RU sr si-LK sk sl es-419 es-ES es-US sw sv-SE ta-IN te-IN th tr-TR uk ur vi
`.trim().split(/\s+/));
const googleCodes = new Set(Object.values(GOOGLE_LOCALE_CODE));
assert.deepEqual([...googleCodes].sort(), [...googleOfficialCodes].sort(), "Google map must match the official listing locales exactly");
assert.equal(googleOfficialCodes.size, 86, "Update the fixture when Google changes its official language list");
assert.equal(GOOGLE_LOCALE_CODE.no, "no-NO");
assert.equal(GOOGLE_LOCALE_CODE.nb, "no-NO");
assert.equal(GOOGLE_LOCALE_CODE.zh, "zh-CN");
assert.equal(GOOGLE_LOCALE_CODE["zh-Hant"], "zh-TW");
assert.equal(GOOGLE_LOCALE_CODE["zh-HK"], "zh-HK");

for (const { code } of STORE_LOCALES) {
  assert.ok(APPLE_LOCALE_CODE[code] || GOOGLE_LOCALE_CODE[code], `Store locale ${code} needs a platform mapping`);
}
assert.equal(new Set(STORE_LOCALES.map(({ code }) => code)).size, STORE_LOCALES.length, "editor keys must be unique");

console.log(`Locale catalog OK: ${STORE_LOCALES.length} editor keys, ${appleCodes.size} Apple targets, ${googleCodes.size} Google Play targets.`);
