import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { markSvg, MARK_TILE } from '../lib/mark.ts';

// Next already depends on Sharp; resolve its copy without adding another one.
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const root = new URL('../', import.meta.url);
const svg = markSvg(512);
await writeFile(new URL('app/icon.svg', root), svg);
await writeFile(new URL('public/favicon.svg', root), svg);
await sharp(Buffer.from(svg)).png().toFile(new URL('app/icon.png', root).pathname);
const apple = markSvg(180, { tile: false }).replace('fill="none">', `fill="none"><rect width="32" height="32" fill="${MARK_TILE}"/>`);
await sharp(Buffer.from(apple)).png().toFile(new URL('app/apple-icon.png', root).pathname);

// ICO supports PNG entries. Include a crisp 48px search icon as well as tab sizes.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(Buffer.from(markSvg(size))).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index]; header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile(new URL('app/favicon.ico', root), Buffer.concat([header, ...images]));
console.log('Generated SVG, PNG, Apple and ICO icons from lib/mark.ts');
