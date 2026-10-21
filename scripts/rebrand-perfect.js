const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function perfectRebrand() {
  console.log('🌟 Executing 100% Complete & Exact Rebranding for MATERNAL COFFE...');

  const extractedDir = path.resolve(__dirname, '../extracted_pages');
  const uploadsDir = path.resolve(__dirname, '../uploads');
  const processedDir = path.resolve(__dirname, '../processed_pages');
  if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

  const logoTrans = await loadImage(path.join(uploadsDir, 'maternal_transparent.png'));
  const logoWhite = await loadImage(path.join(uploadsDir, 'maternal_white.png'));

  // ==========================================
  // 1. PAGE 1 (COVER)
  // ==========================================
  console.log('Processing Page 1 (Cover)...');
  const p1 = await loadImage(path.join(extractedDir, 'page_1.jpg'));
  const c1 = createCanvas(1240, 1754);
  const ctx1 = c1.getContext('2d');
  ctx1.drawImage(p1, 0, 0);

  // Solid white panel on right
  ctx1.fillStyle = '#FFFFFF';
  ctx1.fillRect(620, 0, 620, 877);

  // Large sharp Maternal logo
  const logoW = 500;
  const logoH = 500;
  ctx1.drawImage(logoTrans, 930 - (logoW / 2), 90, logoW, logoH);

  // Subtitles
  ctx1.fillStyle = '#0E3B43';
  ctx1.font = 'bold 25px sans-serif';
  ctx1.textAlign = 'center';
  ctx1.fillText('SPECIALTY COFFEE & EATERY', 930, 615);

  ctx1.strokeStyle = '#02859E';
  ctx1.lineWidth = 3;
  ctx1.beginPath();
  ctx1.moveTo(790, 640);
  ctx1.lineTo(1070, 640);
  ctx1.stroke();

  ctx1.fillStyle = '#02859E';
  ctx1.font = 'bold 23px sans-serif';
  ctx1.fillText('BUKU MENU DIGITAL', 930, 680);

  ctx1.fillStyle = '#666666';
  ctx1.font = '16px sans-serif';
  ctx1.fillText('EST. 2026 • DINE-IN & TAKE-AWAY', 930, 720);

  // Left card: 100% OPAQUE deep charcoal black covering "Pouter Book" completely
  ctx1.fillStyle = '#120E0C';
  ctx1.beginPath();
  ctx1.roundRect(40, 100, 550, 480, 24);
  ctx1.fill();

  ctx1.strokeStyle = '#02859E';
  ctx1.lineWidth = 3.5;
  ctx1.beginPath();
  ctx1.roundRect(40, 100, 550, 480, 24);
  ctx1.stroke();

  // White Maternal cup emblem
  ctx1.drawImage(logoWhite, 315 - 75, 125, 150, 150);

  ctx1.fillStyle = '#FFFFFF';
  ctx1.font = 'bold 46px sans-serif';
  ctx1.fillText('MATERNAL', 315, 340);

  ctx1.fillStyle = '#02859E';
  ctx1.font = 'bold 32px sans-serif';
  ctx1.fillText('COFFEE BOOK', 315, 390);

  ctx1.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx1.lineWidth = 2;
  ctx1.beginPath();
  ctx1.moveTo(170, 425);
  ctx1.lineTo(460, 425);
  ctx1.stroke();

  ctx1.fillStyle = '#E6E6E6';
  ctx1.font = 'bold 18px sans-serif';
  ctx1.fillText('SPECIALTY COFFEE & EATERY', 315, 460);

  ctx1.fillStyle = '#AAAAAA';
  ctx1.font = '16px sans-serif';
  ctx1.fillText('TASTE THE AUTHENTICITY', 315, 500);

  fs.writeFileSync(path.join(processedDir, 'page_1.jpg'), c1.toBuffer('image/jpeg', { quality: 95 }));
  console.log('✅ Page 1 finished!');

  // ==========================================
  // 2. PAGE 2 (ABOUT / STORY)
  // ==========================================
  console.log('Processing Page 2 (About/Story)...');
  const p2 = await loadImage(path.join(extractedDir, 'page_2.jpg'));
  const c2 = createCanvas(1240, 1754);
  const ctx2 = c2.getContext('2d');
  ctx2.drawImage(p2, 0, 0);

  // Exact coordinates for Pouter bird logo on Page 2: centered at x = 800, y = 170..390
  ctx2.fillStyle = '#015364'; // Exact teal background color of Page 2
  ctx2.fillRect(660, 170, 300, 220);

  // Draw White Maternal logo centered at cx = 800, cy = 275
  ctx2.drawImage(logoWhite, 800 - 100, 170, 200, 200);

  // Replace text mentions:
  // Paragraph 1: "Pouter Coffee" -> "Maternal Coffee"
  ctx2.fillStyle = '#015364';
  ctx2.fillRect(575, 515, 145, 28);
  ctx2.fillStyle = '#FFFFFF';
  ctx2.font = '17px sans-serif';
  ctx2.textAlign = 'left';
  ctx2.fillText('Maternal Coffee,', 576, 535);

  // Paragraph 2: "Pouterian" -> "Sahabat Maternal"
  ctx2.fillStyle = '#015364';
  ctx2.fillRect(515, 626, 95, 28);
  ctx2.fillStyle = '#FFFFFF';
  ctx2.fillText('Sahabat Maternal,', 516, 646);

  // Paragraph 3: "Pouter Coffee" -> "Maternal Coffee"
  ctx2.fillStyle = '#015364';
  ctx2.fillRect(422, 715, 120, 28);
  ctx2.fillStyle = '#FFFFFF';
  ctx2.fillText('Maternal Coffee', 424, 735);

  // Footer website
  ctx2.fillStyle = '#015364';
  ctx2.fillRect(440, 790, 220, 30);
  ctx2.fillStyle = 'rgba(255,255,255,0.7)';
  ctx2.font = '14px sans-serif';
  ctx2.fillText('maternalcoffe.id', 445, 810);

  fs.writeFileSync(path.join(processedDir, 'page_2.jpg'), c2.toBuffer('image/jpeg', { quality: 95 }));
  console.log('✅ Page 2 finished!');

  // ==========================================
  // 3. PAGES 3 to 15 (MENU PAGES CORNER LOGOS + MENU ITEMS)
  // ==========================================
  const whitePages = [3, 4, 7, 10, 14, 15]; // Pages needing White logo
  for (let i = 3; i <= 15; i++) {
    console.log(`Processing Page ${i}...`);
    const p = await loadImage(path.join(extractedDir, `page_${i}.jpg`));
    const c = createCanvas(1240, 1754);
    const ctx = c.getContext('2d');
    ctx.drawImage(p, 0, 0);

    const useWhite = whitePages.includes(i);
    const logoToUse = useWhite ? logoWhite : logoTrans;

    // Corner center: cx = 1130, cy = 110
    const cx = 1130;
    const cy = 110;

    if (i === 8 || i === 9) {
      // Pure white pages
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(1015, 20, 225, 195);
    } else if (i === 5) {
      // Light tile page
      ctx.fillStyle = '#E8EBF0';
      ctx.fillRect(1015, 20, 225, 195);
    } else if (i === 14 || i === 15) {
      // Solid teal pages
      ctx.fillStyle = '#0E869F';
      ctx.fillRect(1015, 20, 225, 195);
    } else {
      // Soft radial blend
      const s = ctx.getImageData(1015, cy, 1, 1).data;
      const rgbStr = `${s[0]}, ${s[1]}, ${s[2]}`;
      const r = 115;
      const grad = ctx.createRadialGradient(cx, cy, 70, cx, cy, r);
      grad.addColorStop(0, `rgba(${rgbStr}, 1)`);
      grad.addColorStop(0.85, `rgba(${rgbStr}, 1)`);
      grad.addColorStop(1, `rgba(${rgbStr}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Maternal Logo
    const size = 160;
    ctx.drawImage(logoToUse, cx - (size / 2), cy - (size / 2) - 4, size, size);

    // Menu item name updates
    if (i === 3) {
      ctx.fillStyle = '#A96A00';
      ctx.fillRect(328, 48, 62, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('MATERNAL', 328, 60);
    }
    if (i === 7) {
      ctx.fillStyle = '#92561A';
      ctx.fillRect(12, 408, 48, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('MATERNAL', 12, 420);
    }
    if (i === 11) {
      ctx.fillStyle = '#0E869F';
      ctx.fillRect(755, 375, 45, 15);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('MATERNAL', 755, 386);
    }

    fs.writeFileSync(path.join(processedDir, `page_${i}.jpg`), c.toBuffer('image/jpeg', { quality: 95 }));
    console.log(`✅ Page ${i} finished!`);
  }

  // ==========================================
  // 4. PAGE 16 (APP PROMO)
  // ==========================================
  console.log('Processing Page 16 (App Promo)...');
  const p16 = await loadImage(path.join(extractedDir, 'page_16.jpg'));
  const c16 = createCanvas(1240, 1754);
  const ctx16 = c16.getContext('2d');
  ctx16.drawImage(p16, 0, 0);

  const creamBg = '#FBF8F0';

  // A. Corner logo at x = 980..1180, y = 70..250
  ctx16.fillStyle = creamBg;
  ctx16.fillRect(980, 70, 240, 190);
  ctx16.drawImage(logoTrans, 1010, 80, 160, 160);

  // B. Exact headline covering: covers full width from x = 30 to 1100, y = 260 to 520
  ctx16.fillStyle = creamBg;
  ctx16.fillRect(30, 260, 1070, 260);

  ctx16.fillStyle = '#02859E';
  ctx16.font = 'bold 46px sans-serif';
  ctx16.textAlign = 'left';
  ctx16.fillText('JOIN', 50, 350);

  ctx16.fillStyle = '#0E3B43';
  ctx16.font = 'bold 46px sans-serif';
  ctx16.fillText('MATERNAL COFFEE APP', 185, 350);

  ctx16.fillStyle = '#444444';
  ctx16.font = '24px sans-serif';
  ctx16.fillText('Buku menu digital & scan QR meja kafe!', 50, 420);

  // C. QR center emblem: x = 240..370, y = 800..950
  ctx16.fillStyle = '#FFFFFF';
  ctx16.beginPath();
  ctx16.arc(295, 875, 55, 0, Math.PI * 2);
  ctx16.fill();
  ctx16.drawImage(logoTrans, 295 - 45, 875 - 45, 90, 90);

  // D. Bottom website URL
  ctx16.fillStyle = '#0E3B43';
  ctx16.fillRect(100, 1610, 500, 40);
  ctx16.fillStyle = '#FFFFFF';
  ctx16.font = 'bold 18px sans-serif';
  ctx16.fillText('Website: https://cafe-menu-app-swart.vercel.app', 120, 1636);

  fs.writeFileSync(path.join(processedDir, 'page_16.jpg'), c16.toBuffer('image/jpeg', { quality: 95 }));
  console.log('✅ Page 16 finished!');

  // ==========================================
  // 5. PAGE 17 (MERCHANDISE PROMO)
  // ==========================================
  console.log('Processing Page 17 (Merchandise Promo)...');
  const p17 = await loadImage(path.join(extractedDir, 'page_17.jpg'));
  const c17 = createCanvas(1240, 1754);
  const ctx17 = c17.getContext('2d');
  ctx17.drawImage(p17, 0, 0);

  // Top center logo at x = 540..740, y = 140..320
  ctx17.fillStyle = '#FFFFFF';
  ctx17.fillRect(530, 140, 230, 175);

  // Draw Maternal Coffee & Eatery logo centered at cx = 645, cy = 230
  ctx17.drawImage(logoTrans, 645 - 95, 140, 190, 170);

  // Cover text on tumbler
  ctx17.fillStyle = '#E6E9EE';
  ctx17.fillRect(230, 410, 160, 22);
  ctx17.fillStyle = '#0E3B43';
  ctx17.font = 'bold 12px sans-serif';
  ctx17.textAlign = 'center';
  ctx17.fillText('Maternal Special Aren', 310, 426);

  // Black mug at x = 810..870, y = 460..500
  ctx17.fillStyle = '#222222';
  ctx17.fillRect(805, 460, 75, 25);
  ctx17.fillStyle = '#FFFFFF';
  ctx17.font = 'bold 9px sans-serif';
  ctx17.fillText('MATERNAL', 842, 477);

  // Lower black tumbler bird emblem at x = 710..760, y = 860..910
  ctx17.fillStyle = '#222222';
  ctx17.fillRect(705, 860, 60, 50);

  fs.writeFileSync(path.join(processedDir, 'page_17.jpg'), c17.toBuffer('image/jpeg', { quality: 95 }));
  console.log('✅ Page 17 finished!');

  // ==========================================
  // 6. COMPILE FINAL PDF
  // ==========================================
  console.log('📦 Compiling all 17 pages into final uploads/menu.pdf...');
  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= 17; i++) {
    const imgBytes = fs.readFileSync(path.join(processedDir, `page_${i}.jpg`));
    const embeddedImg = await newDoc.embedJpg(imgBytes);
    const page = newDoc.addPage([595.28, 841.89]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89
    });
  }

  const finalPdfBytes = await newDoc.save();
  const targetPdf = path.join(uploadsDir, 'menu.pdf');
  fs.writeFileSync(targetPdf, finalPdfBytes);
  console.log(`🎉 SUCCESS! Final PDF compiled to ${targetPdf} (${finalPdfBytes.length} bytes)`);

  // Update settings.json version for cache busting
  const settingsFile = path.resolve(__dirname, '../data/settings.json');
  if (fs.existsSync(settingsFile)) {
    const s = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
    s.cafeName = 'MATERNAL COFFE';
    s.pdfVersion = Date.now();
    fs.writeFileSync(settingsFile, JSON.stringify(s, null, 2), 'utf-8');
    console.log('✅ Updated settings.json with new pdfVersion:', s.pdfVersion);
  }
}

perfectRebrand().catch(err => {
  console.error('❌ Error during perfect rebranding:', err);
  process.exit(1);
});
