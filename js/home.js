import { getCPI, getUnemployment, getGDP, getBaseRate, getHousePrice, getNetMigration, mergeChartConfig } from './api.js';

/* ─── Nav toggle ─────────────────────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* ─── Colour helper ──────────────────────────────────────────────────────── */
function colourClass(id, value) {
  const v = parseFloat(value);
  if (id === 'gdp')         return v > 0 ? 'positive' : 'negative';
  if (id === 'cpi')         return v < 2.5 ? 'positive' : v < 4 ? 'neutral' : 'negative';
  if (id === 'unemployment') return v < 4 ? 'positive' : v < 5 ? 'neutral' : 'negative';
  return 'neutral';
}

/* ─── Render helpers ─────────────────────────────────────────────────────── */
function renderCard(id, valueText, metaText, isFallback, colourId) {
  const valEl  = document.getElementById(`val-${id}`);
  const metaEl = document.getElementById(`meta-${id}`);
  if (!valEl) return;

  const badge = isFallback ? ' <span class="fallback-badge">est.</span>' : '';
  const cls   = colourClass(colourId ?? id, parseFloat(valueText));
  valEl.innerHTML = valueText + badge;
  valEl.className = `card-value ${cls}`;
  if (metaEl) metaEl.textContent = metaText;
}

function renderError(id) {
  const valEl = document.getElementById(`val-${id}`);
  if (valEl) {
    valEl.innerHTML = '<span style="color:var(--text-muted);font-size:1rem">Unavailable</span>';
    valEl.className = 'card-value';
  }
}

function showErrorBanner() {
  document.getElementById('error-banner').classList.add('visible');
}

/* ─── Format helpers ─────────────────────────────────────────────────────── */
function fmtGBP(v) {
  return '£' + Math.round(parseFloat(v)).toLocaleString('en-GB');
}

function fmtNum(v, decimals = 1) {
  return parseFloat(v).toFixed(decimals);
}

function fmtMigration(v) {
  const n = Math.round(parseFloat(v) / 1000) * 1000;
  return n.toLocaleString('en-GB');
}

/* ─── Mini charts on homepage ───────────────────────────────────────────── */
function renderLineChart(canvasId, wrapperId, labels, values, label, unit = '') {
  const wrapper = document.getElementById(wrapperId);
  const canvas  = document.getElementById(canvasId);
  if (!wrapper || !canvas) return;

  wrapper.classList.remove('loading');

  const cfg = mergeChartConfig({
    plugins: { legend: { display: false } }
  });

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 8
      }]
    },
    options: {
      ...cfg,
      plugins: {
        ...cfg.plugins,
        tooltip: {
          ...cfg.plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.parsed.y}${unit}`
          }
        }
      }
    }
  });
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
let anyFallback = false;

async function loadAll() {
  const [gdpRes, cpiRes, unempRes, rateRes, houseRes, migRes] =
    await Promise.allSettled([getGDP(), getCPI(), getUnemployment(), getBaseRate(), getHousePrice(), getNetMigration()]);

  /* GDP */
  if (gdpRes.status === 'fulfilled') {
    const { latest, isFallback } = gdpRes.value;
    if (isFallback) anyFallback = true;
    renderCard('gdp', `${fmtNum(latest.value)}%`, `${latest.date} · Quarter-on-quarter`, isFallback);
  } else { renderError('gdp'); }

  /* CPI */
  if (cpiRes.status === 'fulfilled') {
    const { latest, series, isFallback } = cpiRes.value;
    if (isFallback) anyFallback = true;
    renderCard('cpi', `${fmtNum(latest.value)}%`, `${latest.date} · CPIH all items`, isFallback);
    renderLineChart('cpi-chart', 'cpi-wrapper', series.labels, series.values, 'CPI %', '%');
  } else {
    renderError('cpi');
    document.getElementById('cpi-wrapper')?.classList.remove('loading');
  }

  /* Unemployment */
  if (unempRes.status === 'fulfilled') {
    const { latest, isFallback } = unempRes.value;
    if (isFallback) anyFallback = true;
    renderCard('unemployment', `${fmtNum(latest.value)}%`, `${latest.date} · Aged 16+, seasonally adjusted`, isFallback);
  } else { renderError('unemployment'); }

  /* Base rate */
  if (rateRes.status === 'fulfilled') {
    const { latest, series, isFallback } = rateRes.value;
    if (isFallback) anyFallback = true;
    renderCard('rate', `${fmtNum(latest.value)}%`, `${latest.date}`, isFallback, 'rate');
    renderLineChart('rate-chart', 'rate-wrapper', series.labels, series.values, 'Bank Rate %', '%');
  } else {
    renderError('rate');
    document.getElementById('rate-wrapper')?.classList.remove('loading');
  }

  /* House price */
  if (houseRes.status === 'fulfilled') {
    const { latest, isFallback } = houseRes.value;
    if (isFallback) anyFallback = true;
    renderCard('house', fmtGBP(latest.value), `${latest.date} · UK average`, isFallback, 'house');
  } else { renderError('house'); }

  /* Net migration */
  if (migRes.status === 'fulfilled') {
    const { latest, isFallback } = migRes.value;
    if (isFallback) anyFallback = true;
    renderCard('migration', fmtMigration(latest.value), `${latest.date} · Net (provisional)`, isFallback, 'migration');
  } else { renderError('migration'); }

  if (anyFallback) showErrorBanner();
}

document.addEventListener('DOMContentLoaded', loadAll);
