import { createCanvas } from 'canvas';
import { promises as fs } from 'fs';
import path from 'path';

async function generateIcons() {
  const sizes = [16, 32, 48, 128];
  const iconsDir = path.join('C:\\Users\\PC\\Documents\\Default Project\\reminder-note\\src\\assets\\icons');
  await fs.mkdir(iconsDir, { recursive: true });

  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background circle
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Text / Icon representation
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(size * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RN', size / 2, size / 2);

    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(path.join(iconsDir, `icon-${size}.png`), buffer);
  }
}

generateIcons().catch(console.error);
