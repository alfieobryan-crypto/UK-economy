import { getNetMigration, mergeChartConfig } from './api.js';

/* ─── Nav toggle ─────────────────────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmtNum(v) {
  return Math.round(v).toLocaleString('en-GB');
}

function setText(id, text, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  if (cls) el.className = `stat-value ${cls}`;
}

function movingAvg(values, window) {
  return values.map((_, i) => {
    if (i < window - 1) return null;
    const slice = values.slice(i - window + 1, i + 1);
    return Math.round(slice.reduce((a, b) => a + b, 0) / window);
  });
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
async function init() {
  let result;
  try {
    result = await getNetMigration();
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

  /* Stat cards */
  setText('stat-net', fmtNum(parseFloat(latest.value)) + badge);
  setText('stat-net-date', latest.date + ' · net (provisional)');

  const peak    = Math.max(...values);
  const peakIdx = values.indexOf(peak);
  setText('stat-peak', fmtNum(peak));
  setText('stat-peak-date', labels[peakIdx] ?? '');

  if (values.length >= 2) {
    const yoy    = values[values.length - 1] - values[values.length - 2];
    const yoyNum = Math.round(yoy);
    setText('stat-yoy', `${yoyNum > 0 ? '+' : ''}${fmtNum(yoyNum)}`,
      yoyNum > 0 ? 'negative' : 'positive');
  } else {
    setText('stat-yoy', 'N/A');
  }

  if (values.length >= 5) {
    const last5 = values.slice(-5);
    const avg   = Math.round(last5.reduce((a, b) => a + b, 0) / 5);
    setText('stat-avg', fmtNum(avg));
  } else {
    setText('stat-avg', 'N/A');
  }

  /* Bar chart */
  const migWrapper = document.getElementById('mig-wrapper');
  const migCanvas  = document.getElementById('mig-chart');
  if (migWrapper && migCanvas) {
    migWrapper.classList.remove('loading');

    const barColors = values.map(v =>
      v > 500000 ? 'rgba(248,113,113,0.75)' :
      v > 300000 ? 'rgba(251,191,36,0.75)' :
                   'rgba(56,189,248,0.75)'
    );
    const barBorder = values.map(v =>
      v > 500000 ? '#f87171' :
      v > 300000 ? '#fbbf24' :
                   '#38bdf8'
    );

    const cfg = mergeChartConfig({
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${fmtNum(ctx.parsed.y)} net migrants`
          }
        }
      },
      scales: {
        y: { ticks: { callback: v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v } }
      }
    });

    new Chart(migCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Net migration',
          data:            values,
          backgroundColor: barColors,
          borderColor:     barBorder,
          borderWidth:     1,
          borderRadius:    3
        }]
      },
      options: cfg
    });
  }

  /* Rolling average line chart */
  const avgWrapper = document.getElementById('avg-wrapper');
  const avgCanvas  = document.getElementById('avg-chart');
  if (avgWrapper && avgCanvas) {
    avgWrapper.classList.remove('loading');

    const ma3 = movingAvg(values, 3);

    const cfg2 = mergeChartConfig({
      scales: {
        y: { ticks: { callback: v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v } }
      }
    });

    new Chart(avgCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type:            'bar',
            label:           'Net migration',
            data:            values,
            backgroundColor: 'rgba(56,189,248,0.3)',
            borderColor:     'rgba(56,189,248,0.6)',
            borderWidth:     1,
            borderRadius:    2,
            order:           2
          },
          {
            type:        'line',
            label:       '3-year moving avg',
            data:        ma3,
            borderColor: '#fbbf24',
            borderWidth: 2.5,
            fill:        false,
            tension:     0.4,
            pointRadius: 3,
            pointBackgroundColor: '#fbbf24',
            order:       1
          }
        ]
      },
      options: cfg2
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
