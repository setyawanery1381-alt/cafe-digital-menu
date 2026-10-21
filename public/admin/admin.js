/**
 * Cafe Digital Menu - Admin CMS Controller
 */

(function () {
  'use strict';

  let currentToken = sessionStorage.getItem('adminToken');
  let cafeData = null;

  // DOM Elements
  const loginWrap = document.getElementById('loginWrap');
  const loginForm = document.getElementById('loginForm');
  const pinInput = document.getElementById('pinInput');
  const loginError = document.getElementById('loginError');

  const appContainer = document.getElementById('appContainer');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminCafeTitle = document.getElementById('adminCafeTitle');
  const adminLogo = document.getElementById('adminLogo');

  // Tabs
  const navItems = document.querySelectorAll('.nav-item');
  const tabSections = document.querySelectorAll('.tab-section');

  // Stats elements
  const statTotalViews = document.getElementById('statTotalViews');
  const statTodayViews = document.getElementById('statTodayViews');
  const statPdfSize = document.getElementById('statPdfSize');
  const statPdfVersion = document.getElementById('statPdfVersion');

  // Upload elements
  const dropzone = document.getElementById('dropzone');
  const pdfFileInput = document.getElementById('pdfFileInput');
  const uploadStatus = document.getElementById('uploadStatus');

  // Settings form
  const settingsForm = document.getElementById('settingsForm');
  const cafeNameInput = document.getElementById('cafeNameInput');
  const taglineInput = document.getElementById('taglineInput');
  const primaryColorInput = document.getElementById('primaryColorInput');
  const primaryColorHex = document.getElementById('primaryColorHex');
  const bgColorInput = document.getElementById('bgColorInput');
  const bgColorHex = document.getElementById('bgColorHex');
  const whatsappInput = document.getElementById('whatsappInput');
  const instagramInput = document.getElementById('instagramInput');
  const newPinInput = document.getElementById('newPinInput');
  const logoFileInput = document.getElementById('logoFileInput');
  const logoPreview = document.getElementById('logoPreview');

  // QR Code generator
  const qrTableInput = document.getElementById('qrTableInput');
  const generateQrBtn = document.getElementById('generateQrBtn');
  const qrCodeBox = document.getElementById('qrCodeBox');
  const qrPrintTitle = document.getElementById('qrPrintTitle');
  const qrPrintTable = document.getElementById('qrPrintTable');
  const printQrBtn = document.getElementById('printQrBtn');

  // 1. Auth Check
  if (currentToken) {
    showDashboard();
  } else {
    showLogin();
  }

  function showLogin() {
    loginWrap.style.display = 'flex';
    appContainer.style.display = 'none';
    pinInput.focus();
  }

  function showDashboard() {
    loginWrap.style.display = 'none';
    appContainer.style.display = 'flex';
    loadDashboardData();
  }

  // Handle Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const pin = pinInput.value.trim();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();

      if (data.success) {
        currentToken = data.token;
        sessionStorage.setItem('adminToken', currentToken);
        showDashboard();
      } else {
        loginError.textContent = data.message || 'PIN salah!';
      }
    } catch (err) {
      loginError.textContent = 'Gagal terhubung ke server.';
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminToken');
    currentToken = null;
    showLogin();
  });

  // 2. Navigation Tabs
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      tabSections.forEach(s => s.style.display = 'none');

      item.classList.add('active');
      const targetId = item.getAttribute('data-tab');
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.style.display = 'block';

      if (targetId === 'tabQr') {
        renderQrPreview();
      }
    });
  });

  // 3. Load Dashboard Data
  async function loadDashboardData() {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: currentToken }
      });
      if (res.status === 401) {
        logoutBtn.click();
        return;
      }

      const data = await res.json();
      if (data.success) {
        cafeData = data;
        renderDashboardStats(data);
        populateSettingsForm(data.settings);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }

  function renderDashboardStats(data) {
    if (statTotalViews) statTotalViews.textContent = (data.stats.totalViews || 0).toLocaleString();
    if (statTodayViews) statTodayViews.textContent = (data.stats.todayViews || 0).toLocaleString();
    if (statPdfSize) statPdfSize.textContent = data.pdf.exists ? data.pdf.size : 'Belum diunggah';
    if (statPdfVersion) {
      const d = data.pdf.modified ? new Date(data.pdf.modified) : new Date();
      statPdfVersion.textContent = d.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }

    if (adminCafeTitle && data.settings.cafeName) {
      adminCafeTitle.textContent = data.settings.cafeName;
    }
    if (adminLogo) {
      adminLogo.src = '/logo?t=' + (data.pdf.version || Date.now());
      adminLogo.onerror = () => { adminLogo.src = '/assets/default-logo.svg'; };
    }
  }

  function populateSettingsForm(s) {
    if (!s) return;
    cafeNameInput.value = s.cafeName || '';
    taglineInput.value = s.tagline || '';
    primaryColorInput.value = s.primaryColor || '#02859E';
    primaryColorHex.value = s.primaryColor || '#02859E';
    bgColorInput.value = s.bgColor || '#2D2926';
    bgColorHex.value = s.bgColor || '#2D2926';
    whatsappInput.value = s.whatsappNumber || '';
    instagramInput.value = s.instagram || '';

    // QR live defaults
    if (qrPrintTitle) qrPrintTitle.textContent = s.cafeName || 'MATERNAL COFFE';
  }

  // Color Pickers sync
  primaryColorInput.addEventListener('input', (e) => primaryColorHex.value = e.target.value);
  primaryColorHex.addEventListener('input', (e) => primaryColorInput.value = e.target.value);
  bgColorInput.addEventListener('input', (e) => bgColorHex.value = e.target.value);
  bgColorHex.addEventListener('input', (e) => bgColorInput.value = e.target.value);

  // 4. File Upload Handler (PDF Menu)
  if (dropzone) {
    dropzone.addEventListener('click', () => pdfFileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        uploadPdfFile(e.dataTransfer.files[0]);
      }
    });
  }

  pdfFileInput.addEventListener('change', () => {
    if (pdfFileInput.files.length > 0) {
      uploadPdfFile(pdfFileInput.files[0]);
    }
  });

  async function uploadPdfFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Pilih file berformat .PDF');
      return;
    }

    const formData = new FormData();
    formData.append('pdfMenu', file);

    uploadStatus.style.display = 'block';
    uploadStatus.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;color:var(--admin-primary);font-weight:600;">
        <div class="spin" style="width:20px;height:20px;border-width:2px;border-top-color:var(--admin-primary);"></div>
        <span>Mengunggah file PDF (${(file.size / (1024 * 1024)).toFixed(1)} MB)... Jangan tutup halaman ini.</span>
      </div>`;

    try {
      const res = await fetch('/api/upload-menu', {
        method: 'POST',
        headers: { Authorization: currentToken },
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        uploadStatus.innerHTML = `
          <div style="background:rgba(16,185,129,0.15);border:1px solid #10b981;color:#10b981;padding:12px;border-radius:10px;font-weight:600;">
            ✅ Berhasil! File menu diperbarui (${data.fileSize}). HP pelanggan akan otomatis memuat menu baru saat membuka tautan.
          </div>`;
        loadDashboardData();
      } else {
        uploadStatus.innerHTML = `<div style="color:var(--admin-danger);font-weight:600;">❌ ${data.message}</div>`;
      }
    } catch (err) {
      uploadStatus.innerHTML = `<div style="color:var(--admin-danger);font-weight:600;">❌ Terjadi kesalahan saat mengunggah. Coba lagi.</div>`;
    }
  }

  // 5. Logo File Upload Handler
  logoFileInput.addEventListener('change', async () => {
    if (logoFileInput.files.length === 0) return;
    const file = logoFileInput.files[0];

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        headers: { Authorization: currentToken },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        logoPreview.src = data.logoUrl;
        if (adminLogo) adminLogo.src = data.logoUrl;
        alert('Logo kafe berhasil diperbarui!');
      }
    } catch (e) {
      alert('Gagal mengunggah logo.');
    }
  });

  // 6. Settings Form Submit
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      cafeName: cafeNameInput.value.trim(),
      tagline: taglineInput.value.trim(),
      primaryColor: primaryColorHex.value.trim(),
      bgColor: bgColorHex.value.trim(),
      whatsappNumber: whatsappInput.value.trim(),
      instagram: instagramInput.value.trim(),
      newPin: newPinInput.value.trim() || undefined
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: currentToken
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        alert('Pengaturan kafe berhasil disimpan!');
        if (payload.newPin) {
          currentToken = `Bearer PIN_${payload.newPin}`;
          sessionStorage.setItem('adminToken', currentToken);
          newPinInput.value = '';
        }
        loadDashboardData();
      } else {
        alert(data.message || 'Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  });

  // 7. Table QR Code Generator
  generateQrBtn.addEventListener('click', renderQrPreview);
  qrTableInput.addEventListener('input', renderQrPreview);

  function renderQrPreview() {
    const tableNum = qrTableInput.value.trim() || '01';
    const baseUrl = window.location.origin;
    const targetUrl = `${baseUrl}/?meja=${encodeURIComponent(tableNum)}`;

    if (qrPrintTable) qrPrintTable.textContent = `MEJA ${tableNum}`;
    if (qrPrintTitle && cafeData && cafeData.settings) {
      qrPrintTitle.textContent = cafeData.settings.cafeName || 'MATERNAL COFFE';
    }

    qrCodeBox.innerHTML = '';
    if (window.QRCode) {
      new QRCode(qrCodeBox, {
        text: targetUrl,
        width: 180,
        height: 180,
        colorDark: '#1a1a1a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      qrCodeBox.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(targetUrl)}" alt="QR Code">`;
    }
  }

  // Print QR Code Tent Card
  printQrBtn.addEventListener('click', () => {
    const tableNum = qrTableInput.value.trim() || '01';
    const printWindow = window.open('', '_blank');
    const qrCanvas = qrCodeBox.querySelector('canvas') || qrCodeBox.querySelector('img');
    const qrSrc = qrCanvas ? (qrCanvas.toDataURL ? qrCanvas.toDataURL() : qrCanvas.src) : '';
    const cafeName = (cafeData && cafeData.settings && cafeData.settings.cafeName) ? cafeData.settings.cafeName : 'MATERNAL COFFE';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Stand Meja ${tableNum} — ${cafeName}</title>
        <style>
          @page { size: A6 portrait; margin: 10mm; }
          body { font-family: sans-serif; text-align: center; color: #111; margin: 0; padding: 20px 10px; }
          .card { border: 2px solid #ddd; border-radius: 16px; padding: 28px 18px; max-width: 320px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .logo { height: 36px; margin-bottom: 8px; }
          .cafe { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
          .table { font-size: 26px; font-weight: 900; color: #02859E; margin-bottom: 16px; }
          .qr { width: 190px; height: 190px; margin: 0 auto 16px; display: block; }
          .scan-text { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
          .sub { font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="cafe">${cafeName}</div>
          <div class="table">MEJA ${tableNum}</div>
          <img class="qr" src="${qrSrc}" alt="QR Meja">
          <div class="scan-text">SCAN UNTUK BUKU MENU DIGITAL</div>
          <div class="sub">Buka kamera HP Anda & arahkan ke kode QR ini</div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  });

})();
