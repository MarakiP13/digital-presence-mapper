/* ==========================================================================
   Presence Map — Application Logic
   View routing, data loading, charts, animations, modal, export, error states
   ========================================================================== */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────
  let data = null;
  let currentView = 'dashboard';
  const STORAGE_KEY = 'presenceMap_customChannels';

  // ── Boot ───────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initRetryButton();
    initExportButtons();
    initModal();
  });

  async function loadData() {
    showSkeleton(true);
    hideError();

    try {
      const res = await fetch('data/analysis.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      data = await res.json();

      // Merge any localStorage channels
      mergeCustomChannels();

      showSkeleton(false);
      initNav();
      renderDashboard();
      renderChannels();
      initAddChannelButton();
      renderComparison();
      initRevealObserver();
    } catch (err) {
      console.error('Failed to load analysis data:', err);
      showSkeleton(false);
      showError(err.message);
    }
  }

  // ── Error States ──────────────────────────────────────────────────────
  function showError(message) {
    const banner = document.getElementById('error-banner');
    const msgEl = document.getElementById('error-message');
    if (message) msgEl.textContent = message;
    banner.classList.add('visible');
  }

  function hideError() {
    document.getElementById('error-banner').classList.remove('visible');
  }

  function initRetryButton() {
    document.getElementById('btn-retry').addEventListener('click', () => {
      loadData();
    });
  }

  // ── Skeleton Loading ──────────────────────────────────────────────────
  function showSkeleton(visible) {
    const container = document.getElementById('skeleton-container');
    const dashboard = document.getElementById('view-dashboard');
    if (visible) {
      container.style.display = 'block';
      dashboard.style.display = 'none';
    } else {
      container.style.display = 'none';
      dashboard.style.display = '';
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  function initNav() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view === currentView) return;
        switchView(view);
      });
    });

    // Populate user
    const u = data.user;
    document.getElementById('user-avatar').textContent = u.avatar;
    document.getElementById('user-name').textContent = u.name;
    document.getElementById('user-role').textContent = u.role;
  }

  function switchView(viewId) {
    currentView = viewId;

    // Nav active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // View visibility
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) {
      activeView.classList.add('active');
      // Re-trigger animations
      activeView.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('visible');
        void el.offsetWidth; // force reflow
        el.classList.add('visible');
      });
    }

    // Trigger comparison animations on enter
    if (viewId === 'comparison') {
      setTimeout(animateComparisonBars, 200);
      setTimeout(() => drawRadarChart('comparison-radar', data.presenceScores, data.competitor.scores), 300);
    }
  }

  // ── Dashboard ──────────────────────────────────────────────────────────
  function renderDashboard() {
    // Brand name
    document.getElementById('brand-name-header').textContent = data.brand.name;
    document.getElementById('version-footer').textContent = data.brand.version;

    // Overall score ring
    animateScoreRing(data.overallScore);

    // Radar chart
    setTimeout(() => drawRadarChart('radar-chart', data.presenceScores), 400);

    // Pillar cards
    renderPillarGrid();

    // Channels
    renderDashboardChannels();

    // Gaps
    renderGaps();

    // Breakdown
    renderBreakdown();

    // Narrative
    document.getElementById('narrative-text').textContent = data.narrativeSummary;
  }

  function animateScoreRing(score) {
    const circumference = 2 * Math.PI * 65; // r=65
    const offset = circumference - (score / 100) * circumference;
    const ring = document.getElementById('score-ring-fill');
    const numberEl = document.getElementById('overall-score');

    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
    }, 300);

    // Counter animation
    animateCounter(numberEl, 0, score, 1200);
  }

  function animateCounter(el, start, end, duration) {
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.textContent = Math.round(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function renderPillarGrid() {
    const grid = document.getElementById('pillar-grid');
    const pillars = ['clarity', 'consistency', 'credibility', 'conversion'];

    grid.innerHTML = pillars.map(key => {
      const p = data.presenceScores[key];
      const deltaClass = p.trend === 'up' ? 'up' : 'down';
      const arrow = p.trend === 'up' ? '↑' : '↓';
      return `
        <div class="pillar-card reveal">
          <div class="pillar-card__label">${key}</div>
          <div class="pillar-card__score" data-target="${p.score}">0</div>
          <div class="pillar-card__delta pillar-card__delta--${deltaClass}">
            ${arrow} ${Math.abs(p.delta).toFixed(1)}
          </div>
          <div class="pillar-card__bar">
            <div class="pillar-card__bar-fill" data-width="${p.score}"></div>
          </div>
        </div>
      `;
    }).join('');

    // Animate
    setTimeout(() => {
      grid.querySelectorAll('.pillar-card__score').forEach(el => {
        animateCounter(el, 0, parseInt(el.dataset.target), 1000);
      });
      grid.querySelectorAll('.pillar-card__bar-fill').forEach(el => {
        el.style.width = el.dataset.width + '%';
      });
    }, 300);
  }

  function renderDashboardChannels() {
    const container = document.getElementById('dashboard-channels');
    container.innerHTML = data.channels.map(ch => `
      <div class="channel-card" id="channel-${ch.id}">
        <div class="channel-icon" style="background:${ch.color}">
          <span class="material-icons-outlined">${ch.icon}</span>
        </div>
        <div class="channel-info">
          <div class="channel-info__label">${ch.label}</div>
          <div class="channel-info__handle">${ch.handle}</div>
        </div>
        <div class="channel-status">
          <span class="channel-status__dot channel-status__dot--${ch.status}"></span>
          ${ch.status}
        </div>
        <div class="channel-score">${ch.score}</div>
      </div>
    `).join('');
  }

  function renderGaps() {
    const grid = document.getElementById('gaps-grid');
    grid.innerHTML = data.intelligenceGaps.map(gap => `
      <div class="gap-card gap-card--${gap.severity} reveal">
        <div class="gap-card__severity">${gap.severity} priority</div>
        <div class="gap-card__title">${gap.title}</div>
        <p class="gap-card__description">${gap.description}</p>
        <div class="gap-card__recommendation">
          <span class="material-icons-outlined" style="font-size:14px;vertical-align:-2px;margin-right:4px;">lightbulb</span>
          ${gap.recommendation}
        </div>
      </div>
    `).join('');
  }

  function renderBreakdown() {
    const grid = document.getElementById('breakdown-grid');
    grid.innerHTML = data.channels.filter(ch => ch.status === 'active').map(ch => `
      <div class="breakdown-card reveal">
        <div class="breakdown-card__icon" style="background:${ch.color}">
          <span class="material-icons-outlined">${ch.icon}</span>
        </div>
        <div class="breakdown-card__body">
          <div class="breakdown-card__name">${ch.handle}</div>
          <p class="breakdown-card__snippet">${ch.snippet}</p>
          <div class="breakdown-card__meta">
            <div class="breakdown-card__meta-item">
              <span class="material-icons-outlined">bar_chart</span>
              Score: ${ch.score}
            </div>
            <div class="breakdown-card__meta-item">
              <span class="material-icons-outlined">circle</span>
              ${ch.status}
            </div>
            ${ch.type === 'website' ? `
              <div class="breakdown-card__meta-item">
                <span class="material-icons-outlined">location_on</span>
                ${data.brand.hq}
              </div>
              <div class="breakdown-card__meta-item">
                <span class="material-icons-outlined">star</span>
                ${data.brand.rating} (${data.brand.reviews.toLocaleString()} reviews)
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── Channels View ──────────────────────────────────────────────────────
  function renderChannels() {
    // Channel cards (detailed)
    const grid = document.getElementById('channels-grid');
    grid.innerHTML = data.channels.map(ch => `
      <div class="card reveal">
        <div class="card__header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="channel-icon" style="background:${ch.color};width:36px;height:36px;">
              <span class="material-icons-outlined" style="font-size:18px;">${ch.icon}</span>
            </div>
            <div>
              <div class="card__title" style="font-size:.88rem;">${ch.label}</div>
              <div style="font-size:.72rem;color:var(--text-muted);">${ch.handle}</div>
            </div>
          </div>
          <div class="channel-status">
            <span class="channel-status__dot channel-status__dot--${ch.status}"></span>
          </div>
        </div>
        <p style="font-size:.8rem;color:var(--text-secondary);line-height:1.6;margin-bottom:14px;">${ch.snippet}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:.75rem;color:var(--text-muted);">Presence Score</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--accent-light);">${ch.score}</div>
        </div>
        <div class="pillar-card__bar" style="margin-top:8px;">
          <div class="pillar-card__bar-fill" data-width="${ch.score}" style="width:${ch.score}%"></div>
        </div>
      </div>
    `).join('');

    // Data connections
    const connGrid = document.getElementById('connections-grid');
    connGrid.innerHTML = data.dataConnections.map(dc => `
      <div class="connection-card reveal">
        <div class="connection-dot connection-dot--${dc.status}"></div>
        <div class="connection-info">
          <div class="connection-name">${dc.name}</div>
          <div class="connection-desc">${dc.description}</div>
        </div>
        <div class="connection-status-label connection-status-label--${dc.status}">${dc.status}</div>
      </div>
    `).join('');
  }

  function initAddChannelButton() {
    document.getElementById('btn-add-channel').addEventListener('click', () => {
      openModal();
    });
  }

  // ── Comparison View ────────────────────────────────────────────────────
  function renderComparison() {
    const pillars = ['clarity', 'consistency', 'credibility', 'conversion'];
    const acmeScores = data.presenceScores;
    const compScores = data.competitor.scores;

    // Legend names
    document.getElementById('legend-acme').textContent = data.brand.name;
    document.getElementById('legend-comp').textContent = data.competitor.name;

    // Pillar comparison bars
    const pillarGrid = document.getElementById('comparison-pillars');
    pillarGrid.innerHTML = pillars.map(key => `
      <div class="comparison-pillar reveal">
        <div class="comparison-pillar__label">${key}</div>
        <div class="comparison-bar-group">
          <div class="comparison-bar">
            <div class="comparison-bar__label">${data.brand.name.split(' ')[0]}</div>
            <div class="comparison-bar__track">
              <div class="comparison-bar__fill comparison-bar__fill--acme" data-width="${acmeScores[key].score}"></div>
            </div>
            <div class="comparison-bar__value">${acmeScores[key].score}</div>
          </div>
          <div class="comparison-bar">
            <div class="comparison-bar__label">${data.competitor.name.split(' ')[0]}</div>
            <div class="comparison-bar__track">
              <div class="comparison-bar__fill comparison-bar__fill--competitor" data-width="${compScores[key]}"></div>
            </div>
            <div class="comparison-bar__value">${compScores[key]}</div>
          </div>
        </div>
      </div>
    `).join('');

    // Advantages / Opportunities
    const advOpp = document.getElementById('adv-opp-container');
    advOpp.innerHTML = `
      <div class="adv-opp-card reveal">
        <div class="adv-opp-card__title adv-opp-card__title--adv">
          <span class="material-icons-outlined">trending_up</span>
          Competitive Advantages
        </div>
        <ul class="adv-opp-list adv-opp-list--adv">
          ${data.competitor.advantages.map(a => `
            <li><span class="material-icons-outlined">add</span>${a}</li>
          `).join('')}
        </ul>
      </div>
      <div class="adv-opp-card reveal">
        <div class="adv-opp-card__title adv-opp-card__title--opp">
          <span class="material-icons-outlined">trending_down</span>
          Growth Opportunities
        </div>
        <ul class="adv-opp-list adv-opp-list--opp">
          ${data.competitor.opportunities.map(o => `
            <li><span class="material-icons-outlined">remove</span>${o}</li>
          `).join('')}
        </ul>
      </div>
    `;

    // Executive summary
    document.getElementById('exec-summary-text').textContent = data.competitor.executiveSummary;

    // Sentiment
    const sentGrid = document.getElementById('sentiment-grid');
    const sentData = [
      { name: data.brand.name, ...data.competitor.sentiment.acme },
      { name: data.competitor.name, ...data.competitor.sentiment.competitor }
    ];
    sentGrid.innerHTML = sentData.map(s => `
      <div class="sentiment-card reveal">
        <div class="sentiment-card__name">${s.name}</div>
        ${['positive', 'neutral', 'negative'].map(type => `
          <div class="sentiment-bar-row">
            <div class="sentiment-label">${type}</div>
            <div class="sentiment-track">
              <div class="sentiment-fill sentiment-fill--${type}" data-width="${s[type]}"></div>
            </div>
            <div class="sentiment-value">${s[type]}%</div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  function animateComparisonBars() {
    document.querySelectorAll('#comparison-pillars .comparison-bar__fill').forEach(el => {
      el.style.width = el.dataset.width + '%';
    });
    document.querySelectorAll('#sentiment-grid .sentiment-fill').forEach(el => {
      el.style.width = el.dataset.width + '%';
    });
  }

  // ── Radar Chart (Canvas) ───────────────────────────────────────────────
  function drawRadarChart(canvasId, scores, compScores) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(W, H) / 2 - 40;
    const labels = ['Clarity', 'Consistency', 'Credibility', 'Conversion'];
    const keys = ['clarity', 'consistency', 'credibility', 'conversion'];
    const numAxes = 4;

    ctx.clearRect(0, 0, W, H);

    // Background rings
    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * maxR;
      ctx.beginPath();
      for (let i = 0; i <= numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axis lines & labels
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = cx + maxR * Math.cos(angle);
      const y = cy + maxR * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Labels
      const labelR = maxR + 22;
      const lx = cx + labelR * Math.cos(angle);
      const ly = cy + labelR * Math.sin(angle);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], lx, ly);
    }

    // Draw data polygon
    function drawPolygon(scoreData, isCompetitor) {
      const values = keys.map(k => {
        if (isCompetitor) return (scoreData[k] || 0) / 100;
        return (scoreData[k]?.score ?? scoreData[k] ?? 0) / 100;
      });

      ctx.beginPath();
      for (let i = 0; i <= numAxes; i++) {
        const idx = i % numAxes;
        const angle = (Math.PI * 2 * idx) / numAxes - Math.PI / 2;
        const r = values[idx] * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      if (isCompetitor) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(13, 127, 242, 0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(13, 127, 242, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Dots
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const r = values[i] * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isCompetitor ? '#f59e0b' : '#0d7ff2';
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = isCompetitor ? 'rgba(245,158,11,0.15)' : 'rgba(13,127,242,0.15)';
        ctx.fill();
      }
    }

    drawPolygon(scores, false);
    if (compScores) {
      drawPolygon(compScores, true);
    }
  }

  // ── Add Channel Modal ─────────────────────────────────────────────────
  function initModal() {
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('add-channel-form');

    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    // Handle form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      addChannel();
    });
  }

  function openModal() {
    document.getElementById('modal-overlay').classList.add('open');
    document.getElementById('channel-type').focus();
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.getElementById('add-channel-form').reset();
  }

  const CHANNEL_CONFIG = {
    website:     { icon: 'language',      color: '#0d7ff2' },
    instagram:   { icon: 'photo_camera',  color: '#e1306c' },
    linkedin:    { icon: 'work',          color: '#0a66c2' },
    tiktok:      { icon: 'music_note',    color: '#ff0050' },
    youtube:     { icon: 'play_circle',   color: '#ff0000' },
    twitter:     { icon: 'tag',           color: '#1da1f2' },
    facebook:    { icon: 'thumb_up',      color: '#1877f2' },
    threads:     { icon: 'forum',         color: '#000000' },
    xiaohongshu: { icon: 'auto_stories',  color: '#ff2442' },
    other:       { icon: 'public',        color: '#64748b' }
  };

  function addChannel() {
    const type = document.getElementById('channel-type').value;
    const handle = document.getElementById('channel-handle').value.trim();
    const label = document.getElementById('channel-label').value.trim();

    if (!type || !handle || !label) return;

    const config = CHANNEL_CONFIG[type] || CHANNEL_CONFIG.other;
    const newChannel = {
      id: 'ch-custom-' + Date.now(),
      type,
      label,
      handle,
      icon: config.icon,
      status: 'monitoring',
      snippet: `Newly added ${type} channel awaiting first analysis scan...`,
      score: 0,
      color: config.color,
      custom: true
    };

    // Save to localStorage
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    stored.push(newChannel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    // Add to live data
    data.channels.push(newChannel);

    // Re-render
    renderDashboardChannels();
    renderChannels();
    renderBreakdown();

    closeModal();
    showToast('Channel added successfully', 'check_circle');
  }

  function mergeCustomChannels() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (stored.length > 0) {
      // Filter out duplicates by id
      const existingIds = new Set(data.channels.map(ch => ch.id));
      stored.forEach(ch => {
        if (!existingIds.has(ch.id)) {
          data.channels.push(ch);
        }
      });
    }
  }

  // ── Export Functionality ───────────────────────────────────────────────
  function initExportButtons() {
    document.getElementById('btn-export-pdf').addEventListener('click', exportPdf);
    document.getElementById('btn-copy-narrative').addEventListener('click', copyNarrative);
  }

  function exportPdf() {
    showToast('Preparing PDF...', 'picture_as_pdf');
    // Small delay so toast shows before print dialog blocks
    setTimeout(() => {
      window.print();
    }, 400);
  }

  function copyNarrative() {
    const text = document.getElementById('narrative-text')?.textContent;
    if (!text) {
      showToast('No narrative text available', 'warning');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      showToast('Narrative copied to clipboard', 'content_copy');
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Narrative copied to clipboard', 'content_copy');
    });
  }

  // ── Toast Notification ────────────────────────────────────────────────
  let toastTimer = null;

  function showToast(message, icon) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    const iconEl = document.getElementById('toast-icon');

    msgEl.textContent = message;
    iconEl.textContent = icon || 'check_circle';

    // Clear any existing timer
    if (toastTimer) clearTimeout(toastTimer);

    toast.classList.add('visible');
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
      toastTimer = null;
    }, 3000);
  }

  // ── Scroll Reveal Observer ─────────────────────────────────────────────
  function initRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

})();
