import { getCPI, mergeChartConfig } from './api.js';

/* ─── Nav toggle ─────────────────────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* ─── Helpers ────────────────────────────────────────────────────────────── */
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
    result = await getCPI();
  } catch (_) {
    document.getElementById('error-banner').classList.add('visible');
    return;
  }

  const { latest, series, isFallback } = result;

  if (isFallback) {
    document.getElementById('error-banner').classList.add('visible');
  }

  const current = parseFloat(latest.value);
  const badge   = isFallback ? ' (est.)' : '';

  /* Stat cards */
  setText('stat-current', `${current.toFixed(1)}%${badge}`,
    current < 2.5 ? 'positive' : current < 4 ? 'neutral' : 'negative');
  setText('stat-current-date', latest.date);

  /* MoM change */
  const values = series.values;
  if (values.length >= 2) {
    const mom = (values[values.length - 1] - values[values.length - 2]).toFixed(2);
    const momNum = parseFloat(mom);
    setText('stat-mom', `${momNum > 0 ? '+' : ''}${mom}pp`,
      momNum > 0 ? 'negative' : 'positive');
  } else {
    setText('stat-mom', 'N/A');
  }

  /* Distance from target */
  const dist = (current - 2.0).toFixed(1);
  const distNum = parseFloat(dist);
  setText('stat-target', `${distNum > 0 ? '+' : ''}${dist}pp`,
    distNum > 1 ? 'negative' : distNum < -0.5 ? 'neutral' : 'positive');

  /* History line chart */
  const histWrapper = document.getElementById('cpi-history-wrapper');
  const histCanvas  = document.getElementById('cpi-history-chart');
  if (histWrapper && histCanvas) {
    histWrapper.classList.remove('loading');

    /* Target line as a constant dataset */
    const targetData = series.labels.map(() => 2.0);

    const cfg = mergeChartConfig({
      scales: {
        y: { ticks: { callback: v => `${v}%` } }
      }
    });

    new Chart(histCanvas, {
      type: 'line',
      data: {
        labels: series.labels,
        datasets: [
          {
            label: 'CPI %',
            data: series.values,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56,189,248,0.12)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHitRadius: 10
          },
          {
            label: '2% Target',
            data: targetData,
            borderColor: '#4ade80',
            borderWidth: 1.5,
            borderDash: [6, 4],
            fill: false,
            tension: 0,
            pointRadius: 0,
            pointHitRadius: 0
          }
        ]
      },
      options: cfg
    });
  }

  /* Month-on-month bar chart */
  const momWrapper = document.getElementById('mom-wrapper');
  const momCanvas  = document.getElementById('mom-chart');
  if (momWrapper && momCanvas && values.length >= 2) {
    momWrapper.classList.remove('loading');

    const momValues = values.slice(1).map((v, i) =>
      parseFloat((v - values[i]).toFixed(2))
    );
    const momLabels = series.labels.slice(1);
    const barColors = momValues.map(v => v > 0 ? 'rgba(248,113,113,0.7)' : 'rgba(74,222,128,0.7)');
    const barBorder = momValues.map(v => v > 0 ? '#f87171' : '#4ade80');

    const cfg2 = mergeChartConfig({
      plugins: { legend: { display: false } },
      scales:  { y: { ticks: { callback: v => `${v > 0 ? '+' : ''}${v}pp` } } }
    });

    new Chart(momCanvas, {
      type: 'bar',
      data: {
        labels: momLabels,
        datasets: [{
          label: 'MoM change (pp)',
          data:            momValues,
          backgroundColor: barColors,
          borderColor:     barBorder,
          borderWidth:     1,
          borderRadius:    3
        }]
      },
      options: cfg2
    });
  } else if (momWrapper) {
    momWrapper.classList.remove('loading');
  }
}

document.addEventListener('DOMContentLoaded', init);
