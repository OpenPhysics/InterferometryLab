/**
 * generate-icons.ts
 *
 * Rasterizes public/icons/icon.svg into the PNG icons, favicon.ico, and placeholder
 * PWA install screenshots used by the manifest. Run with: npm run icons
 *
 * Replace public/screenshots/{wide,narrow}.png with real sim shots before shipping
 * (e.g. Baton/scripts/generate-screenshots.sh → copy into public/screenshots/).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");
const svg = readFileSync(resolve(publicDir, "icons", "icon.svg"));

/** Theme background matching `theme_color` / icon.svg fill (`#1a1a2e`). */
const THEME_BG = { r: 26, g: 26, b: 46, alpha: 1 };

const density = 512;

const pngTargets = [
  { size: 180, file: "icons/apple-touch-icon.png" },
  { size: 192, file: "icons/icon-192.png" },
  { size: 512, file: "icons/icon-512.png" },
];

for (const { size, file } of pngTargets) {
  await sharp(svg, { density }).resize(size, size).png().toFile(resolve(publicDir, file));
}

const icoBuffers = await Promise.all(
  [16, 32, 48, 64].map((size) => sharp(svg, { density }).resize(size, size).png().toBuffer()),
);
writeFileSync(resolve(publicDir, "favicon.ico"), await pngToIco(icoBuffers));

/** Branded placeholder screenshots for the Web App Manifest `screenshots` member. */
async function writeScreenshot(width: number, height: number, file: string): Promise<void> {
  const iconSize = Math.round(Math.min(width, height) * 0.4);
  const icon = await sharp(svg, { density }).resize(iconSize, iconSize).png().toBuffer();
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: THEME_BG,
    },
  })
    .composite([{ input: icon, gravity: "center" }])
    .png()
    .toFile(resolve(publicDir, file));
}

mkdirSync(resolve(publicDir, "screenshots"), { recursive: true });
await writeScreenshot(1280, 720, "screenshots/wide.png");
await writeScreenshot(720, 1280, "screenshots/narrow.png");
