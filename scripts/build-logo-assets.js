const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

async function buildLogos() {
  const logoPath = path.resolve(__dirname, '../uploads/logo.jpg');
  const srcImg = await loadImage(logoPath);
  const w = srcImg.width;
  const h = srcImg.height;

  // 1. Create Transparent PNG version
  // Replace white/near-white background (RGB > 240, 240, 240) with transparent alpha
  const cTrans = createCanvas(w, h);
  const ctxTrans = cTrans.getContext('2d');
  ctxTrans.drawImage(srcImg, 0, 0);

  const imgData = ctxTrans.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // If pixel is near white
    if (r > 245 && g > 245 && b > 245) {
      data[i + 3] = 0; // Transparent
    } else if (r > 230 && g > 230 && b > 230) {
      // Smooth alpha edge
      const brightness = (r + g + b) / 3;
      data[i + 3] = Math.round(255 * (1 - (brightness - 230) / 25));
    }
  }
  ctxTrans.putImageData(imgData, 0, 0);
  const transPath = path.resolve(__dirname, '../uploads/maternal_transparent.png');
  fs.writeFileSync(transPath, cTrans.toBuffer('image/png'));
  console.log('Created transparent logo:', transPath);

  // 2. Create Pure White Silhouette version (for dark background pages)
  const cWhite = createCanvas(w, h);
  const ctxWhite = cWhite.getContext('2d');
  ctxWhite.drawImage(cTrans, 0, 0);
  const whiteData = ctxWhite.getImageData(0, 0, w, h);
  const dW = whiteData.data;
  for (let i = 0; i < dW.length; i += 4) {
    if (dW[i + 3] > 20) {
      dW[i] = 255;
      dW[i + 1] = 255;
      dW[i + 2] = 255;
      // keep alpha
    }
  }
  ctxWhite.putImageData(whiteData, 0, 0);
  const whitePath = path.resolve(__dirname, '../uploads/maternal_white.png');
  fs.writeFileSync(whitePath, cWhite.toBuffer('image/png'));
  console.log('Created white logo:', whitePath);

  // 3. Create Compact Corner Badges (Matching Pouter's corner format)
  // Corner width ~180px, height ~160px
  // A: Teal version (for light pages)
  const cCornerTeal = createCanvas(260, 220);
  const ctxCornerTeal = cCornerTeal.getContext('2d');
  // Draw transparent logo centered
  ctxCornerTeal.drawImage(cTrans, 30, 10, 200, 200);
  const cornerTealPath = path.resolve(__dirname, '../uploads/corner_badge_teal.png');
  fs.writeFileSync(cornerTealPath, cCornerTeal.toBuffer('image/png'));

  // B: White version (for dark pages)
  const cCornerWhite = createCanvas(260, 220);
  const ctxCornerWhite = cCornerWhite.getContext('2d');
  ctxCornerWhite.drawImage(cWhite, 30, 10, 200, 200);
  const cornerWhitePath = path.resolve(__dirname, '../uploads/corner_badge_white.png');
  fs.writeFileSync(cornerWhitePath, cCornerWhite.toBuffer('image/png'));

  console.log('Finished building all logo variations!');
}

buildLogos().catch(console.error);
