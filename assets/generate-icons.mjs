import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Color palette
const BG = '#07080A';
const CYAN = '#00E5FF';
const GLOW = 'rgba(0,229,255,0.12)';

function drawNMark(ctx, x, y, w, h) {
  // Geometric N letterform
  const strokeW = w * 0.154; // ~80/520 ratio
  
  ctx.fillStyle = CYAN;
  
  // Left vertical
  ctx.fillRect(x, y, strokeW, h);
  
  // Diagonal (parallelogram from top-left to bottom-right)
  ctx.beginPath();
  ctx.moveTo(x + strokeW, y);
  ctx.lineTo(x + w - strokeW, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - strokeW * 1.5);
  ctx.lineTo(x + strokeW * 2, y);
  ctx.closePath();
  ctx.fill();
  
  // Right vertical
  ctx.fillRect(x + w - strokeW, y, strokeW, h);
}

function generateIcon(size, outputPath, withBackground = true, cornerRadius = 0) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  if (withBackground) {
    // Background
    if (cornerRadius > 0) {
      ctx.beginPath();
      const r = cornerRadius;
      ctx.moveTo(r, 0);
      ctx.lineTo(size - r, 0);
      ctx.quadraticCurveTo(size, 0, size, r);
      ctx.lineTo(size, size - r);
      ctx.quadraticCurveTo(size, size, size - r, size);
      ctx.lineTo(r, size);
      ctx.quadraticCurveTo(0, size, 0, size - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fillStyle = BG;
      ctx.fill();
    } else {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, size, size);
    }
    
    // Radial glow
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.35);
    gradient.addColorStop(0, 'rgba(0,229,255,0.12)');
    gradient.addColorStop(0.5, 'rgba(0,229,255,0.03)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  
  // N mark — centered, ~50% of canvas
  const nW = size * 0.5;
  const nH = nW * 1.115; // slightly taller than wide
  const nX = (size - nW) / 2;
  const nY = (size - nH) / 2;
  
  drawNMark(ctx, nX, nY, nW, nH);
  
  // Subtle glow effect via shadow
  ctx.shadowColor = 'rgba(0,229,255,0.25)';
  ctx.shadowBlur = size * 0.04;
  
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath} (${size}x${size})`);
}

function generateSplash(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);
  
  // Radial glow
  const gradient = ctx.createRadialGradient(size/2, size*0.42, 0, size/2, size*0.42, size * 0.3);
  gradient.addColorStop(0, 'rgba(0,229,255,0.10)');
  gradient.addColorStop(0.5, 'rgba(0,229,255,0.02)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // N mark — smaller for splash
  const nW = size * 0.28;
  const nH = nW * 1.115;
  const nX = (size - nW) / 2;
  const nY = size * 0.32;
  
  drawNMark(ctx, nX, nY, nW, nH);
  
  // NERVE wordmark
  const fontSize = size * 0.06;
  ctx.fillStyle = CYAN;
  ctx.font = `800 ${fontSize}px -apple-system, "SF Pro Display", "Helvetica Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = `${size * 0.02}px`;
  
  const wordmarkY = nY + nH + size * 0.08;
  
  // Draw with letter spacing manually
  const text = 'NERVE';
  const spacing = size * 0.018;
  let totalW = 0;
  const charWidths = [];
  for (const ch of text) {
    const w = ctx.measureText(ch).width;
    charWidths.push(w);
    totalW += w + spacing;
  }
  totalW -= spacing;
  
  let cx = (size - totalW) / 2;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], cx + charWidths[i]/2, wordmarkY);
    cx += charWidths[i] + spacing;
  }
  
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath} (${size}x${size})`);
}

function generateFavicon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);
  
  const nW = size * 0.6;
  const nH = nW * 1.115;
  const nX = (size - nW) / 2;
  const nY = (size - nH) / 2;
  
  drawNMark(ctx, nX, nY, nW, nH);
  
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath} (${size}x${size})`);
}

// Generate all assets
const assetsDir = __dirname;

generateIcon(1024, join(assetsDir, 'icon.png'), true, 224);
generateIcon(1024, join(assetsDir, 'adaptive-icon.png'), true, 0);
generateSplash(1024, join(assetsDir, 'splash-icon.png'));
generateFavicon(48, join(assetsDir, 'favicon.png'));

// Android adaptive icon parts
generateIcon(1024, join(assetsDir, 'android-icon-foreground.png'), false); // foreground only
generateIcon(1024, join(assetsDir, 'android-icon-background.png'), true, 0); // bg only

console.log('\n✅ All icon assets generated!');
