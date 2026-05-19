import { getHousePrice, mergeChartConfig } from './api.js';

/* ─── Nav toggle ─────────────────────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmtGBP(v) {
  return '£' + Math.round(parseFloat(v)).toLocaleString('en-GB');
}

function setText(id, text, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  if (cls) el.className = `stat-value ${cls}`;
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
async function init() {
  let result;
  try {
    result = await getHousePrice();
  } catch (_) {
    document.getElementById('error-banner').classList.add('visible');
    return;
  }

  const { latest, series, isFallback } = result;

  if (isFallback) {
    document.getElementById('error-banner').classList.add('visible');
  }

  const values = series.values;
  const labels = series.labels;
  const badge  = isFallback ? ' (est.)' : '';

  /* Current price */
  setText('stat-price', fmtGBP(latest.value) + badge);
  setText('stat-price-date', latest.date);

  /* Year-on-year change */
  if (values.length >= 13) {
    const current   = values[values.length - 1];
    const yearAgo   = values[values.length - 13];
    const yoyPct    = (((current - yearAgo) / yearAgo) * 100).toFixed(1);
    const yoyNum    = parseFloat(yoyPct);
    setText('stat-yoy', `${yoyNum > 0 ? '+' : ''}${yoyPct}%`,
      yoyNum > 0 ? 'positive' : 'negative');
  } else {
    setText('stat-yoy', 'N/A');
  }

  /* Peak */
  const peak     = Math.max(...values);
  const peakIdx  = values.indexOf(peak);
  setText('stat-peak', fmtGBP(peak));
  setText('stat-peak-date', labels[peakIdx] ?? '');

  /* Low */
  const low      = Math.min(...values);
  const lowIdx   = values.indexOf(low);
  setText('stat-low', fmtGBP(low));
  setText('stat-low-date', labels[lowIdx] ?? '');

  /* Trend line chart */
  const priceWrapper = document.getElementById('price-wrapper');
  const priceCanvas  = document.getElementById('price-chart');
  if (priceWrapper && priceCanvas) {
    priceWrapper.classList.remove('loading');
    const cfg = mergeChartConfig({
      plugins: { legend: { display: false } },
      scales:  { y: { ticks: { callback: v => '£' + v.toLocaleString('en-GB') } } }
    });

    new Chart(priceCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Average house price',
          data: values,
          borderColor:     '#38bdf8',
          backgroundColor: 'rgba(56,189,248,0.12)',
          borderWidth:     2.5,
          fill:            true,
          tension:         0.3,
          pointRadius:     2,
          pointHitRadius:  10
        }]
      },
      options: cfg
    });
  }

  /* Year-on-year bar chart */
  const yoyWrapper = document.getElementById('yoy-wrapper');
  const yoyCanvas  = document.getElementById('yoy-chart');
  if (yoyWrapper && yoyCanvas && values.length >= 13) {
    yoyWrapper.classList.remove('loading');

    const yoyValues = [];
    const yoyLabels = [];
    for (let i = 12; i < values.length; i++) {
      const pct = parseFloat((((values[i] - values[i - 12]) / values[i - 12]) * 100).toFixed(1));
      yoyValues.push(pct);
      yoyLabels.push(labels[i]);
    }

    const barColors = yoyValues.map(v => v >= 0 ? 'rgba(74,222,128,0.7)' : 'rgba(248,113,113,0.7)');
    const barBorder = yoyValues.map(v => v >= 0 ? '#4ade80' : '#f87171');

    const cfg2 = mergeChartConfig({
      plugins: { legend: { display: false } },
      scales:  { y: { ticks: { callback: v => `${v}%` } } }
    });

    new Chart(yoyCanvas, {
      type: 'bar',
      data: {
        labels: yoyLabels,
        datasets: [{
          label: 'YoY % change',
          data:            yoyValues,
          backgroundColor: barColors,
          borderColor:     barBorder,
          borderWidth:     1,
          borderRadius:    3
        }]
      },
      options: cfg2
    });
  } else if (yoyWrapper) {
    yoyWrapper.classList.remove('loading');
  }
}

document.addEventListener('DOMContentLoaded', init);
