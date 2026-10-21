const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Read & write settings helpers
function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading settings:', err);
  }
  return {
    cafeName: 'MATERNAL COFFE',
    tagline: 'Specialty Coffee & Eatery',
    primaryColor: '#02859E',
    bgColor: '#2D2926',
    whatsappNumber: '6281234567890',
    instagram: 'poutercoffee',
    googleMaps: 'https://maps.google.com',
    allowDownload: true,
    adminPin: '1234',
    pdfVersion: Date.now(),
    stats: { totalViews: 0, todayViews: 0, lastViewDate: new Date().toISOString().split('T')[0] }
  };
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer storage for PDF & Logo
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    if (file.fieldname === 'pdfMenu') {
      cb(null, 'menu.pdf');
    } else if (file.fieldname === 'logo') {
      const ext = path.extname(file.originalname).toLowerCase() || '.png';
      cb(null, 'logo' + ext);
    } else {
      cb(null, file.originalname);
    }
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdfMenu') {
      if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
        cb(null, true);
      } else {
        cb(new Error('Hanya file PDF yang diperbolehkan!'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Simple Auth token verification
function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const settings = getSettings();
  if (authHeader && authHeader === `Bearer PIN_${settings.adminPin}`) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Autentikasi gagal / PIN salah.' });
}

// ================= API ROUTES =================

// Public Config
app.get('/api/config', (req, res) => {
  const s = getSettings();
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.json({
    cafeName: s.cafeName,
    tagline: s.tagline,
    primaryColor: s.primaryColor || '#02859E',
    bgColor: s.bgColor || '#2D2926',
    whatsappNumber: s.whatsappNumber || '',
    instagram: s.instagram || '',
    googleMaps: s.googleMaps || '',
    allowDownload: s.allowDownload !== false,
    pdfVersion: s.pdfVersion || Date.now(),
    hasLogo: fs.existsSync(path.join(UPLOADS_DIR, 'logo.png')) || fs.existsSync(path.join(UPLOADS_DIR, 'logo.jpg')) || fs.existsSync(path.join(UPLOADS_DIR, 'logo.jfif')) || fs.existsSync(path.join(UPLOADS_DIR, 'logo.webp'))
  });
});

// Version check for cache-busting (Pouter architecture compatibility)
app.get('/version.txt', (req, res) => {
  const s = getSettings();
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.send(String(s.pdfVersion || Date.now()));
});

// PDF stream endpoint with range request support
app.get('/pouter-book.pdf', servePdf);
app.get('/menu.pdf', servePdf);

function servePdf(req, res) {
  const pdfPath = path.join(UPLOADS_DIR, 'menu.pdf');
  if (!fs.existsSync(pdfPath)) {
    return res.status(404).send('File PDF Menu belum diunggah.');
  }

  const s = getSettings();
  res.set('Content-Type', 'application/pdf');
  res.set('Accept-Ranges', 'bytes');
  res.set('Cache-Control', 'public, max-age=86400');
  res.set('ETag', `"${s.pdfVersion}"`);

  res.sendFile('menu.pdf', { root: UPLOADS_DIR }, (err) => {
    if (err && !res.headersSent) {
      console.error('Error sending PDF:', err);
      res.status(500).send('Error serving PDF');
    }
  });
}

// Cafe Logo endpoint
app.get('/logo', (req, res) => {
  const extensions = ['.png', '.jpg', '.jpeg', '.jfif', '.webp', '.svg'];
  for (const ext of extensions) {
    const filename = 'logo' + ext;
    if (fs.existsSync(path.join(UPLOADS_DIR, filename))) {
      return res.sendFile(filename, { root: UPLOADS_DIR });
    }
  }
  return res.redirect('/assets/default-logo.svg');
});

// View counter
app.post('/api/view', (req, res) => {
  const s = getSettings();
  const today = new Date().toISOString().split('T')[0];
  if (!s.stats) s.stats = { totalViews: 0, todayViews: 0, lastViewDate: today };

  s.stats.totalViews = (s.stats.totalViews || 0) + 1;
  if (s.stats.lastViewDate === today) {
    s.stats.todayViews = (s.stats.todayViews || 0) + 1;
  } else {
    s.stats.lastViewDate = today;
    s.stats.todayViews = 1;
  }
  saveSettings(s);
  res.json({ success: true, stats: s.stats });
});

// Admin Login
app.post('/api/login', (req, res) => {
  const { pin } = req.body;
  const s = getSettings();
  if (String(pin).trim() === String(s.adminPin).trim()) {
    return res.json({
      success: true,
      token: `Bearer PIN_${s.adminPin}`,
      cafeName: s.cafeName
    });
  }
  return res.status(401).json({ success: false, message: 'PIN Admin salah!' });
});

// Admin Stats
app.get('/api/admin/stats', verifyAuth, (req, res) => {
  const s = getSettings();
  const pdfPath = path.join(UPLOADS_DIR, 'menu.pdf');
  let pdfSize = 0;
  let pdfModified = null;
  if (fs.existsSync(pdfPath)) {
    const stat = fs.statSync(pdfPath);
    pdfSize = (stat.size / (1024 * 1024)).toFixed(2) + ' MB';
    pdfModified = stat.mtime;
  }

  res.json({
    success: true,
    stats: s.stats || { totalViews: 0, todayViews: 0 },
    pdf: {
      exists: fs.existsSync(pdfPath),
      size: pdfSize,
      modified: pdfModified,
      version: s.pdfVersion
    },
    settings: {
      cafeName: s.cafeName,
      tagline: s.tagline,
      primaryColor: s.primaryColor,
      bgColor: s.bgColor,
      whatsappNumber: s.whatsappNumber,
      instagram: s.instagram,
      googleMaps: s.googleMaps,
      allowDownload: s.allowDownload
    }
  });
});

// Admin Upload PDF Menu
app.post('/api/upload-menu', verifyAuth, upload.single('pdfMenu'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
  }

  const s = getSettings();
  s.pdfVersion = Date.now();
  saveSettings(s);

  res.json({
    success: true,
    message: 'Menu PDF berhasil diperbarui!',
    pdfVersion: s.pdfVersion,
    fileSize: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB'
  });
});

// Admin Upload Logo
app.post('/api/upload-logo', verifyAuth, upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file logo.' });
  }

  const s = getSettings();
  s.pdfVersion = Date.now();
  saveSettings(s);

  res.json({
    success: true,
    message: 'Logo kafe berhasil diperbarui!',
    logoUrl: '/logo?t=' + Date.now()
  });
});

// Admin Update Settings
app.post('/api/settings', verifyAuth, (req, res) => {
  const { cafeName, tagline, primaryColor, bgColor, whatsappNumber, instagram, googleMaps, allowDownload, newPin } = req.body;
  const s = getSettings();

  if (cafeName) s.cafeName = cafeName.trim();
  if (tagline !== undefined) s.tagline = tagline.trim();
  if (primaryColor) s.primaryColor = primaryColor.trim();
  if (bgColor) s.bgColor = bgColor.trim();
  if (whatsappNumber !== undefined) s.whatsappNumber = whatsappNumber.trim();
  if (instagram !== undefined) s.instagram = instagram.trim();
  if (googleMaps !== undefined) s.googleMaps = googleMaps.trim();
  if (allowDownload !== undefined) s.allowDownload = Boolean(allowDownload);
  if (newPin && newPin.trim().length >= 4) {
    s.adminPin = newPin.trim();
  }

  saveSettings(s);
  res.json({ success: true, message: 'Pengaturan berhasil disimpan!' });
});

// Static files (with no-cache for index.html)
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }
  }
}));

// Fallback to customer viewer
app.use((req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

// Export app for Vercel Serverless & testing
module.exports = app;

// Start Server standalone when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Cafe Digital Menu Server berjalan di:`);
    console.log(`👉 Pelanggan (Customer Viewer) : http://localhost:${PORT}`);
    console.log(`👉 Admin CMS Dashboard        : http://localhost:${PORT}/admin`);
    console.log(`👉 Default PIN Admin          : 1234`);
    console.log(`====================================================`);
  });
}
