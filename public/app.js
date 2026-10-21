/**
 * Cafe Digital Menu - High-Performance PDF Engine
 * Inspired by book.poutercoffee.id architecture with mobile-first optimizations.
 */

(function () {
  'use strict';

  // State variables
  let pdfDoc = null;
  let mode = 'scroll'; // 'scroll' | 'page'
  let zoom = 1.0;
  let current = 1;
  let aspect = 0.707; // standard A4 ratio default
  let seqToken = 0;
  let config = {};

  const ZMIN = 0.7;
  const ZMAX = 3.0;
  const MAX_DIM = 2400; // Cap dimension to protect low-RAM phones
  const TAJAM_MAKS = 5; // Max sharpened pages in memory
  let tajamList = [];
  let tajamTimer = null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const pagesEl = document.getElementById('pages');

  // DOM Elements
  const mScrollBtn = document.getElementById('mScroll');
  const mPageBtn = document.getElementById('mPage');
  const zInBtn = document.getElementById('zIn');
  const zOutBtn = document.getElementById('zOut');
  const zPctEl = document.getElementById('zPct');
  const pPrevBtn = document.getElementById('pPrev');
  const pNextBtn = document.getElementById('pNext');
  const pIndEl = document.getElementById('pInd');
  const brandLabelEl = document.getElementById('brandLabel');
  const brandImgEl = document.getElementById('brandImg');
  const tableBadgeEl = document.getElementById('tableBadge');
  const waFabBtn = document.getElementById('waFab');
  const infoModal = document.getElementById('infoModal');

  // URL Query Params (e.g. ?meja=05 or ?table=05)
  const urlParams = new URLSearchParams(window.location.search);
  const tableNum = urlParams.get('meja') || urlParams.get('table') || urlParams.get('m') || '';

  // 1. Initialize Cafe Configuration
  async function initConfig() {
    try {
      const res = await fetch('/api/config?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        config = await res.json();
        applyBranding(config);
      }
    } catch (e) {
      console.warn('Using default branding config', e);
    }
  }

  function applyBranding(cfg) {
    if (cfg.cafeName) {
      document.title = `${cfg.cafeName} — Buku Menu`;
      if (brandLabelEl) brandLabelEl.textContent = cfg.cafeName;
      const modalCafe = document.getElementById('modalCafeName');
      if (modalCafe) modalCafe.textContent = cfg.cafeName;
    }

    if (cfg.primaryColor) {
      document.documentElement.style.setProperty('--teal', cfg.primaryColor);
      // Darker shade for bars
      document.documentElement.style.setProperty('--teal-dark', shadeColor(cfg.primaryColor, -25));
    }
    if (cfg.bgColor) {
      document.documentElement.style.setProperty('--bg', cfg.bgColor);
    }

    // Logo
    if (brandImgEl) {
      brandImgEl.src = '/logo?t=' + (cfg.pdfVersion || Date.now());
      brandImgEl.onerror = () => { brandImgEl.src = '/assets/default-logo.svg'; };
    }

    // Table Badge
    if (tableNum && tableBadgeEl) {
      tableBadgeEl.textContent = `Meja ${tableNum}`;
      tableBadgeEl.style.display = 'inline-flex';
    }

    // WhatsApp Action Link
    if (cfg.whatsappNumber && waFabBtn) {
      const cleanWa = cfg.whatsappNumber.replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(
        `Halo ${cfg.cafeName || 'Kak'}, ${tableNum ? `saya di Meja ${tableNum}. ` : ''}Bisa minta tolong dibantu?`
      );
      waFabBtn.href = `https://wa.me/${cleanWa}?text=${waMsg}`;
      waFabBtn.style.display = 'flex';
      const modalWa = document.getElementById('modalWaLink');
      if (modalWa) {
        modalWa.href = `https://wa.me/${cleanWa}?text=${waMsg}`;
        modalWa.style.display = 'flex';
      }
    } else if (waFabBtn) {
      waFabBtn.style.display = 'none';
    }

    // Instagram link in modal
    const modalIg = document.getElementById('modalIgLink');
    if (modalIg && cfg.instagram) {
      const cleanIg = cfg.instagram.replace('@', '');
      modalIg.href = `https://instagram.com/${cleanIg}`;
      modalIg.style.display = 'flex';
    }
  }

  function shadeColor(color, percent) {
    let num = parseInt(color.replace('#', ''), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }

  // 2. Initialize PDF.js Engine
  function initPdfEngine() {
    if (!window.pdfjsLib) {
      pagesEl.innerHTML = '<div class="state">Gagal memuat sistem PDF. Muat ulang halaman browser Anda.</div>';
      return;
    }

    // Configure worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';

    // Fetch version and load PDF
    fetch('/version.txt?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.text() : Date.now())
      .then(v => {
        const versionStr = encodeURIComponent((v || '').trim() || Date.now());
        loadPdfDocument(`/menu.pdf?v=${versionStr}`);
      })
      .catch(() => {
        loadPdfDocument('/menu.pdf?v=' + Date.now());
      });
  }

  function loadPdfDocument(url) {
    const loadingTask = pdfjsLib.getDocument({
      url: url,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true
    });

    loadingTask.onProgress = function (p) {
      const el = document.getElementById('loadTxt');
      if (el && p && p.total) {
        el.textContent = `Memuat menu… ${Math.round((p.loaded / p.total) * 100)}%`;
      }
    };

    loadingTask.promise
      .then(function (pdf) {
        pdfDoc = pdf;
        current = 1;
        return pdf.getPage(1).then(function (pg) {
          const v = pg.getViewport({ scale: 1 });
          aspect = v.width / v.height;
          updatePager();
          rerender();
        });
      })
      .catch(function (err) {
        console.error('PDF Load Error:', err);
        pagesEl.innerHTML = `
          <div class="state">
            <div style="font-size:36px;margin-bottom:12px;">📖</div>
            <b>Menu belum tersedia atau sedang diperbarui.</b><br>
            Silakan segarkan halaman atau hubungi staf kafe.
          </div>`;
      });
  }

  // 3. Layout and Scale Calculation
  function fitWidth() {
    const w = document.documentElement.clientWidth || window.innerWidth || 360;
    // Padding 20px on phone, max width 880px for desktop/tablet
    return Math.min(Math.max(w - 20, 220), 880);
  }

  function makePageContainer(num) {
    const pg = document.createElement('div');
    pg.className = 'pg';
    pg._num = num;
    pg._rendered = false;
    const w = fitWidth() * zoom;
    pg.style.width = w + 'px';
    pg.style.height = Math.round(w / aspect) + 'px';
    pg.innerHTML = '<div class="ph"><div class="spin"></div><span>Memuat hal. ' + num + '...</span></div>';
    return pg;
  }

  function skalaUntuk(page, z) {
    const pw = page.getViewport({ scale: 1 }).width;
    const rs = (fitWidth() * z / pw) * dpr;
    const v0 = page.getViewport({ scale: rs });
    return rs * Math.min(1, MAX_DIM / Math.max(v0.width, v0.height));
  }

  // 4. Sequential Page Rendering
  function renderPg(pg) {
    return pdfDoc.getPage(pg._num).then(function (page) {
      const sk = skalaUntuk(page, 1); // Phase 1: fast base scale
      pg._skala = pg._skalaDasar = sk;
      const vp = page.getViewport({ scale: sk });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width;
      canvas.height = vp.height;
      pg.appendChild(canvas);

      let shown = false;
      function reveal() {
        if (shown) return;
        shown = true;
        const ph = pg.querySelector('.ph');
        if (ph) ph.remove();
        pg.style.height = ''; // Let height adjust to canvas
        pg._rendered = true;
        canvas.style.opacity = '1';
        if (zoom > 1.05) jadwalTajam();
      }

      const safety = setTimeout(reveal, 2500);
      return page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: vp
      }).promise.then(function () {
        clearTimeout(safety);
        reveal();
      });
    });
  }

  function renderSeq(token, list, i) {
    if (token !== seqToken || i >= list.length) return;
    let advanced = false;
    function next() {
      if (!advanced) {
        advanced = true;
        renderSeq(token, list, i + 1);
      }
    }
    const safety = setTimeout(next, 5000);
    renderPg(list[i]).then(
      () => { clearTimeout(safety); next(); },
      (e) => { clearTimeout(safety); console.error(e); next(); }
    );
  }

  function rerender() {
    if (!pdfDoc) return;
    seqToken++;
    tajamList = [];
    pagesEl.className = mode;
    pagesEl.innerHTML = '';

    let nums = [];
    if (mode === 'page') {
      nums = [current];
    } else {
      for (let i = 1; i <= pdfDoc.numPages; i++) nums.push(i);
    }

    const pgs = nums.map(n => {
      const pg = makePageContainer(n);
      pagesEl.appendChild(pg);
      return pg;
    });

    renderSeq(seqToken, pgs, 0);
  }

  // 5. Smart Sharpening Engine (Deferred High-Res re-rendering)
  function jadwalTajam() {
    clearTimeout(tajamTimer);
    tajamTimer = setTimeout(() => pertajam(seqToken), 400);
  }

  function pasangKanvas(pg, cv, skala) {
    const lama = pg.querySelector('canvas');
    cv.style.width = '100%';
    cv.style.height = 'auto';
    cv.style.opacity = '1';
    pg.appendChild(cv);
    if (lama) lama.remove();
    pg._skala = skala;
  }

  function pertajam(token) {
    if (!pdfDoc || token !== seqToken) return;

    const list = [].slice.call(pagesEl.querySelectorAll('.pg')).filter(p => p._rendered);
    const vh = window.innerHeight;

    // Prioritize visible pages
    list.sort((a, b) => {
      const ra = Math.abs(a.getBoundingClientRect().top - vh / 2);
      const rb = Math.abs(b.getBoundingClientRect().top - vh / 2);
      return ra - rb;
    });

    // Sharpen closest pages
    list.slice(0, TAJAM_MAKS).forEach(pg => {
      pdfDoc.getPage(pg._num).then(page => {
        if (token !== seqToken) return;
        const targetSk = skalaUntuk(page, zoom);
        if (Math.abs(pg._skala - targetSk) < 0.08) return;

        const vp = page.getViewport({ scale: targetSk });
        const cv = document.createElement('canvas');
        cv.width = vp.width;
        cv.height = vp.height;

        page.render({
          canvasContext: cv.getContext('2d'),
          viewport: vp
        }).promise.then(() => {
          if (token === seqToken) {
            pasangKanvas(pg, cv, targetSk);
            const idx = tajamList.indexOf(pg);
            if (idx >= 0) tajamList.splice(idx, 1);
            tajamList.push(pg);
            cleanupTajam(token);
          }
        });
      });
    });
  }

  function cleanupTajam(token) {
    while (tajamList.length > TAJAM_MAKS) {
      const pg = tajamList.shift();
      if (!pg || token !== seqToken) continue;
      pdfDoc.getPage(pg._num).then(page => {
        if (token !== seqToken) return;
        const skDasar = pg._skalaDasar;
        if (!skDasar || Math.abs(pg._skala - skDasar) < 0.05) return;
        const vp = page.getViewport({ scale: skDasar });
        const cv = document.createElement('canvas');
        cv.width = vp.width;
        cv.height = vp.height;
        page.render({
          canvasContext: cv.getContext('2d'),
          viewport: vp
        }).promise.then(() => {
          if (token === seqToken) pasangKanvas(pg, cv, skDasar);
        });
      });
    }
  }

  // 6. Zoom & Viewport Scaling
  function applyZoom() {
    const fit = fitWidth();
    [].forEach.call(pagesEl.querySelectorAll('.pg'), pg => {
      const w = fit * zoom;
      pg.style.width = w + 'px';
      if (!pg._rendered) pg.style.height = Math.round(w / aspect) + 'px';
    });
  }

  function setZoomRaw(z, focalX, focalY) {
    z = Math.max(ZMIN, Math.min(ZMAX, z));
    if (zPctEl) zPctEl.textContent = Math.round(z * 100) + '%';
    if (z === zoom) return;

    const fx = typeof focalX === 'number' ? focalX : window.innerWidth / 2;
    const fy = typeof focalY === 'number' ? focalY : window.innerHeight / 2;

    const r1 = pagesEl.getBoundingClientRect();
    const rx = r1.width ? (fx - r1.left) / r1.width : 0.5;
    const ry = r1.height ? (fy - r1.top) / r1.height : 0.5;

    zoom = z;
    applyZoom();

    const r2 = pagesEl.getBoundingClientRect();
    window.scrollBy((r2.left + rx * r2.width) - fx, (r2.top + ry * r2.height) - fy);
    jadwalTajam();
  }

  function setZoom(z) {
    z = Math.round(z * 10) / 10;
    if (z === zoom) return;
    setZoomRaw(z);
  }

  function setMode(m) {
    if (mode === m) return;
    mode = m;
    document.body.className = 'mode-' + m;
    if (mScrollBtn) mScrollBtn.classList.toggle('on', m === 'scroll');
    if (mPageBtn) mPageBtn.classList.toggle('on', m === 'page');
    window.scrollTo(0, 0);
    rerender();
  }

  function gotoPage(n) {
    if (!pdfDoc) return;
    current = Math.max(1, Math.min(pdfDoc.numPages, n));
    updatePager();
    window.scrollTo(0, 0);
    if (mode === 'page') rerender();
  }

  function updatePager() {
    const n = pdfDoc ? pdfDoc.numPages : 1;
    if (pIndEl) pIndEl.textContent = `${current} / ${n}`;
    if (pPrevBtn) pPrevBtn.disabled = current <= 1;
    if (pNextBtn) pNextBtn.disabled = current >= n;
  }

  // 7. Pinch-To-Zoom Touch Event Handling
  let pStart = 0;
  let pZoom = 1;
  let pinching = false;
  let pTarget = 1;
  let pFocalX = 0;
  let pFocalY = 0;
  let pRaf = null;
  const PINCH_SENS = 0.65;

  function tdist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
  function tmidX(t) { return (t[0].clientX + t[1].clientX) / 2; }
  function tmidY(t) { return (t[0].clientY + t[1].clientY) / 2; }
  function flushZoom() { pRaf = null; setZoomRaw(pTarget, pFocalX, pFocalY); }

  document.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
      pinching = true;
      pStart = tdist(e.touches);
      pZoom = zoom;
      pFocalX = tmidX(e.touches);
      pFocalY = tmidY(e.touches);
    }
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (pinching && e.touches.length === 2 && pStart > 0) {
      e.preventDefault();
      pFocalX = tmidX(e.touches);
      pFocalY = tmidY(e.touches);
      pTarget = pZoom * Math.pow(tdist(e.touches) / pStart, PINCH_SENS);
      if (!pRaf) pRaf = requestAnimationFrame(flushZoom);
    }
  }, { passive: false });

  function endPinch() {
    if (pinching) {
      pinching = false;
      setZoom(Math.round(zoom * 10) / 10);
      jadwalTajam();
    }
  }

  document.addEventListener('touchend', endPinch, { passive: true });
  document.addEventListener('touchcancel', endPinch, { passive: true });

  // Swipe detection for 'page' mode
  let touchStartX = 0;
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (mode !== 'page' || pinching || !pdfDoc) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > 60 && Math.abs(diffY) < 50) {
      if (diffX < 0) gotoPage(current + 1); // Swipe left -> next
      else gotoPage(current - 1);           // Swipe right -> prev
    }
  }, { passive: true });

  // Double-tap zoom toggle
  let lastTap = 0;
  document.addEventListener('touchend', (e) => {
    const curTime = new Date().getTime();
    const tapLen = curTime - lastTap;
    if (tapLen < 300 && tapLen > 0) {
      const touch = e.changedTouches[0];
      if (zoom > 1.2) {
        setZoomRaw(1.0, touch.clientX, touch.clientY);
      } else {
        setZoomRaw(1.8, touch.clientX, touch.clientY);
      }
      e.preventDefault();
    }
    lastTap = curTime;
  });

  // 8. Event Listeners
  if (mScrollBtn) mScrollBtn.onclick = () => setMode('scroll');
  if (mPageBtn) mPageBtn.onclick = () => setMode('page');
  if (zInBtn) zInBtn.onclick = () => setZoom(zoom + 0.2);
  if (zOutBtn) zOutBtn.onclick = () => setZoom(zoom - 0.2);
  if (pPrevBtn) pPrevBtn.onclick = () => gotoPage(current - 1);
  if (pNextBtn) pNextBtn.onclick = () => gotoPage(current + 1);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (mode === 'page') {
      if (e.key === 'ArrowLeft') gotoPage(current - 1);
      if (e.key === 'ArrowRight') gotoPage(current + 1);
    }
    if (e.key === '+' || e.key === '=') setZoom(zoom + 0.2);
    if (e.key === '-') setZoom(zoom - 0.2);
  });

  // Modal handlers
  const infoBtn = document.getElementById('infoBtn');
  const closeInfoBtn = document.getElementById('closeInfoBtn');
  if (infoBtn && infoModal) {
    infoBtn.onclick = () => infoModal.classList.add('open');
  }
  if (closeInfoBtn && infoModal) {
    closeInfoBtn.onclick = () => infoModal.classList.remove('open');
  }
  if (infoModal) {
    infoModal.onclick = (e) => {
      if (e.target === infoModal) infoModal.classList.remove('open');
    };
  }

  // Window resize handler
  let rt, lastW = document.documentElement.clientWidth || window.innerWidth;
  window.addEventListener('resize', () => {
    const w = document.documentElement.clientWidth || window.innerWidth;
    if (w === lastW) return; // Ignore height change (URL bar expand/collapse)
    lastW = w;
    clearTimeout(rt);
    rt = setTimeout(rerender, 250);
  });

  // Send view telemetry
  try {
    fetch('/api/view', { method: 'POST' }).catch(() => {});
  } catch (e) {}

  // Initialize!
  initConfig().then(() => {
    initPdfEngine();
  });

})();
