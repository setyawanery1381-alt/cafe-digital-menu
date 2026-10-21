const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function updateCover() {
  const pdfPath = path.resolve(__dirname, '../uploads/menu.pdf');
  const bytes = fs.readFileSync(pdfPath);
  const doc = await PDFDocument.load(bytes);
  
  const page1 = doc.getPage(0);
  const { width, height } = page1.getSize(); // 595.28 x 841.89
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const teal = rgb(2/255, 133/255, 158/255); // #02859E
  const dark = rgb(45/255, 41/255, 38/255);  // #2D2926
  const white = rgb(1, 1, 1);

  // 1. Cover right side white box ("POUTER COFFEE" text and logo)
  // Right side box starts at x = width / 2 = 297.64, y = 420.94, width = 297.64, height = 420.95
  page1.drawRectangle({
    x: width / 2,
    y: height / 2,
    width: width / 2,
    height: height / 2,
    color: white,
  });

  // Draw modern MATERNAL COFFE branding in this right box
  // Box center X = 297.64 + (297.64 / 2) = 446.46
  const centerX = width / 2 + (width / 4);

  // Decorative badge/circle in teal
  page1.drawCircle({
    x: centerX,
    y: height / 2 + 270,
    size: 42,
    color: teal,
  });

  // Coffee cup icon representation inside circle
  page1.drawRectangle({
    x: centerX - 18,
    y: height / 2 + 258,
    width: 36,
    height: 24,
    color: white,
  });
  page1.drawCircle({
    x: centerX,
    y: height / 2 + 258,
    size: 18,
    color: white,
  });
  page1.drawRectangle({
    x: centerX - 24,
    y: height / 2 + 248,
    width: 48,
    height: 4,
    color: white,
  });

  // Text "MATERNAL"
  const maternalText = 'MATERNAL';
  const maternalWidth = fontBold.widthOfTextAtSize(maternalText, 28);
  page1.drawText(maternalText, {
    x: centerX - (maternalWidth / 2),
    y: height / 2 + 180,
    size: 28,
    font: fontBold,
    color: teal,
  });

  // Text "COFFE"
  const coffeText = 'COFFE';
  const coffeWidth = fontBold.widthOfTextAtSize(coffeText, 24);
  page1.drawText(coffeText, {
    x: centerX - (coffeWidth / 2),
    y: height / 2 + 150,
    size: 24,
    font: fontBold,
    color: dark,
  });

  // Subtitle "SPECIALTY & EATERY"
  const subText = 'SPECIALTY COFFEE & EATERY';
  const subWidth = fontRegular.widthOfTextAtSize(subText, 10);
  page1.drawText(subText, {
    x: centerX - (subWidth / 2),
    y: height / 2 + 125,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Thin separator line
  page1.drawLine({
    start: { x: centerX - 60, y: height / 2 + 110 },
    end: { x: centerX + 60, y: height / 2 + 110 },
    thickness: 1.5,
    color: teal,
  });

  // "BUKU MENU DIGITAL"
  const menuBookText = 'BUKU MENU DIGITAL';
  const menuBookWidth = fontBold.widthOfTextAtSize(menuBookText, 11);
  page1.drawText(menuBookText, {
    x: centerX - (menuBookWidth / 2),
    y: height / 2 + 90,
    size: 11,
    font: fontBold,
    color: teal,
  });

  // 2. Cover left side cyan text ("Pouter Book")
  // The left side has "Pouter" and "Book" written in cyan over the espresso machine
  // We place an elegant dark rounded translucent card or dark box over it
  page1.drawRectangle({
    x: 25,
    y: height / 2 + 100,
    width: (width / 2) - 45,
    height: 140,
    color: rgb(30/255, 26/255, 24/255),
    opacity: 0.92,
  });

  // Border for the box
  page1.drawRectangle({
    x: 25,
    y: height / 2 + 100,
    width: (width / 2) - 45,
    height: 140,
    borderColor: teal,
    borderWidth: 2,
    opacity: 0.9,
  });

  const leftCenterX = 25 + ((width / 2) - 45) / 2;

  // Text on left: "MATERNAL" & "BOOK"
  const leftMaternal = 'MATERNAL';
  const leftMaternalW = fontBold.widthOfTextAtSize(leftMaternal, 26);
  page1.drawText(leftMaternal, {
    x: leftCenterX - (leftMaternalW / 2),
    y: height / 2 + 180,
    size: 26,
    font: fontBold,
    color: rgb(0.95, 0.95, 0.95),
  });

  const leftBook = 'COFFEE BOOK';
  const leftBookW = fontBold.widthOfTextAtSize(leftBook, 18);
  page1.drawText(leftBook, {
    x: leftCenterX - (leftBookW / 2),
    y: height / 2 + 145,
    size: 18,
    font: fontBold,
    color: teal,
  });

  const leftTag = 'TASTE THE AUTHENTICITY';
  const leftTagW = fontRegular.widthOfTextAtSize(leftTag, 9);
  page1.drawText(leftTag, {
    x: leftCenterX - (leftTagW / 2),
    y: height / 2 + 120,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Save the modified PDF
  const modifiedBytes = await doc.save();
  fs.writeFileSync(pdfPath, modifiedBytes);
  console.log('Cover updated successfully! New size:', modifiedBytes.length);
}

updateCover().catch(console.error);
