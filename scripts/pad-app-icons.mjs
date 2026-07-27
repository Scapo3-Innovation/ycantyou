/**
 * Pads app icons by scaling artwork to 76% on a 1024×1024 canvas.
 * Run: node scripts/pad-app-icons.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'assets', 'images');
const SCALE = 0.76;
const SIZE = 1024;

const targets = [
  'icon.png',
  'android-icon-foreground.png',
  'splash-icon.png',
  'android-icon-monochrome.png',
  'favicon.png',
];

async function padIcon(filename) {
  const inputPath = join(assets, filename);
  let input;
  try {
    input = await readFile(inputPath);
  } catch {
    console.warn(`skip missing ${filename}`);
    return;
  }

  const meta = await sharp(input).metadata();
  const w = meta.width ?? SIZE;
  const h = meta.height ?? SIZE;
  const inner = Math.round(Math.min(w, h) * SCALE);

  const resized = await sharp(input)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const out = await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toBuffer();

  await writeFile(inputPath, out);
  console.log(`padded ${filename}`);
}

await mkdir(assets, { recursive: true });
for (const name of targets) {
  await padIcon(name);
}
