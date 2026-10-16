const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/lib/png.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const compiled = { exports: {} };
new Function('module', 'exports', code)(compiled, compiled.exports);
(async () => {
  // Includes translucent and fully transparent pixels: output must be opaque white-composited RGB.
  const png = await compiled.exports.encodeRgbPng(new Uint8ClampedArray([255,0,0,255, 0,255,0,128, 0,0,255,0, 12,34,56,255]), 2, 2);
  assert.deepEqual([...png.subarray(0,8)], [137,80,78,71,13,10,26,10]);
  const view = new DataView(png.buffer);
  assert.equal(view.getUint32(16),2); assert.equal(view.getUint32(20),2);
  assert.equal(png[24],8); assert.equal(png[25],2, 'PNG must contain RGB, never RGBA');
  let offset=8, idat=[];
  for (;offset<png.length;) { const length=view.getUint32(offset);const type=Buffer.from(png.subarray(offset+4,offset+8)).toString();if(type==='IDAT') idat.push(png.subarray(offset+8,offset+8+length));offset+=12+length; }
  const pixels=zlib.inflateSync(Buffer.concat(idat));
  assert.deepEqual([...pixels], [0,255,0,0,127,255,127, 0,255,255,255,12,34,56]);
  await assert.rejects(() => compiled.exports.encodeRgbPng(new Uint8ClampedArray(4),2,2), /Invalid PNG/);
  console.log('RGB PNG dimensions, alpha removal, transparency compositing and pixel round-trip passed.');
})().catch(error => { console.error(error); process.exitCode=1; });
