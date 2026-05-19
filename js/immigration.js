import { getNetMigration, mergeChartConfig } from './api.js';

/* ─── Irregular migration data (Home Office) ─────────────────────────────── */
const SMALL_BOATS = {
  labels: ['2018','2019','2020','2021','2022','2023','2024'],
  values: [299, 1843, 8410, 28526, 45755, 29437, 36816]
};

const ASYLUM = {
  labels: ['2019','2020','2021','2022','2023','2024'],
  applications: [35099, 29456, 48540, 74751, 84425, 108138],
  granted:      [16800, 18600, 20000, 14961, 52534, 55000],
  refused:      [10200,  4900,  8500,  9826, 18492, 20000],
  other:        [ 8099,  5956, 20040, 49964, 13399, 33138]
};

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

function renderIrregular() {
  /* Small boats bar chart */
  const boatsCanvas = document.getElementById('boats-chart');
  if (boatsCanvas) {
    const cfg = mergeChartConfig({
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString('en-GB')} crossings` }
        }
      },
      scales: {
        y: { ticks: { callback: v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v } }
      }
    });

    const barColors = SMALL_BOATS.values.map(v =>
      v > 40000 ? 'rgba(248,113,113,0.75)' :
      v > 20000 ? 'rgba(251,191,36,0.75)' :
                  'rgba(56,189,248,0.75)'
    );
    const barBorder = SMALL_BOATS.values.map(v =>
      v > 40000 ? '#f87171' : v > 20000 ? '#fbbf24' : '#38bdf8'
    );

    new Chart(boatsCanvas, {
      type: 'bar',
      data: {
        labels: SMALL_BOATS.labels,
        datasets: [{
          label: 'Small boat crossings',
          data:            SMALL_BOATS.values,
          backgroundColor: barColors,
          borderColor:     barBorder,
          borderWidth:     1,
          borderRadius:    4
        }]
      },
      options: cfg
    });
  }

  /* Asylum stacked bar chart */
  const asylumCanvas = document.getElementById('asylum-chart');
  if (asylumCanvas) {
    const cfg2 = mergeChartConfig({
      scales: {
        x: { stacked: true },
        y: { stacked: true, ticks: { callback: v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v } }
      }
    });

    new Chart(asylumCanvas, {
      type: 'bar',
      data: {
        labels: ASYLUM.labels,
        datasets: [
          {
            label:           'Granted',
            data:            ASYLUM.granted,
            backgroundColor: 'rgba(74,222,128,0.75)',
            borderColor:     '#4ade80',
            borderWidth:     1,
            borderRadius:    { topLeft: 0, topRight: 0, bottomLeft: 3, bottomRight: 3 }
          },
          {
            label:           'Refused',
            data:            ASYLUM.refused,
            backgroundColor: 'rgba(248,113,113,0.75)',
            borderColor:     '#f87171',
            borderWidth:     1
          },
          {
            label:           'Pending / Other',
            data:            ASYLUM.other,
            backgroundColor: 'rgba(100,116,139,0.6)',
            borderColor:     '#64748b',
            borderWidth:     1,
            borderRadius:    { topLeft: 3, topRight: 3, bottomLeft: 0, bottomRight: 0 }
          }
        ]
      },
      options: cfg2
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  renderIrregular();
});
