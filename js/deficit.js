import { REVENUE_2425, DEFICIT_HISTORY, mergeChartConfig } from './api.js';

/* ─── Nav toggle ─────────────────────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* ─── Init ───────────────────────────────────────────────────────────────── */
function init() {
  const total = REVENUE_2425.reduce((s, d) => s + d.value, 0);

  /* ── Revenue doughnut ── */
  const doughnutCanvas = document.getElementById('revenue-doughnut');
  if (doughnutCanvas) {
    new Chart(doughnutCanvas, {
      type: 'doughnut',
      data: {
        labels:   REVENUE_2425.map(d => d.label),
        datasets: [{
          data:            REVENUE_2425.map(d => d.value),
          backgroundColor: REVENUE_2425.map(d => d.color),
          borderColor:     '#0f172a',
          borderWidth:     2,
          hoverOffset:     8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        animation: { duration: 600 },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color:           '#f8fafc',
              font:            { size: 11, family: 'Inter, system-ui, sans-serif' },
              padding:         10,
              usePointStyle:   true,
              pointStyleWidth: 9,
              boxHeight:       9
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor:      '#38bdf8',
            bodyColor:       '#f8fafc',
            borderColor:     '#334155',
            borderWidth:     1,
            callbacks: {
              label: ctx => {
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ` £${ctx.parsed.toFixed(0)}bn (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /* ── Revenue horizontal bar ── */
  const sorted    = [...REVENUE_2425].sort((a, b) => b.value - a.value);
  const barCanvas = document.getElementById('revenue-bar');
  if (barCanvas) {
    const cfg = mergeChartConfig({
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { callback: v => `£${v}bn` } },
        y: { ticks: { font: { size: 11 } } }
      }
    });

    new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels:   sorted.map(d => d.label),
        datasets: [{
          data:            sorted.map(d => d.value),
          backgroundColor: sorted.map(d => d.color + 'bb'),
          borderColor:     sorted.map(d => d.color),
          borderWidth:     1,
          borderRadius:    4
        }]
      },
      options: {
        ...cfg,
        indexAxis: 'y',
        plugins: {
          ...cfg.plugins,
          tooltip: {
            ...cfg.plugins.tooltip,
            callbacks: {
              label: ctx => {
                const pct = ((ctx.parsed.x / total) * 100).toFixed(1);
                return ` £${ctx.parsed.x.toFixed(0)}bn (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /* ── Receipts vs expenditure gap chart ── */
  const gapCanvas = document.getElementById('gap-chart');
  if (gapCanvas) {
    const cfg2 = mergeChartConfig({
      scales: {
        y: {
          ticks: { callback: v => `£${v}bn` },
          suggestedMin: 500
        }
      }
    });

    new Chart(gapCanvas, {
      type: 'line',
      data: {
        labels: DEFICIT_HISTORY.labels,
        datasets: [
          {
            label:           'Total Receipts',
            data:            DEFICIT_HISTORY.receipts,
            borderColor:     '#4ade80',
            backgroundColor: 'rgba(74,222,128,0.08)',
            borderWidth:     2.5,
            fill:            '+1',
            tension:         0.3,
            pointRadius:     4,
            pointBackgroundColor: '#4ade80'
          },
          {
            label:           'Total Spending',
            data:            DEFICIT_HISTORY.expenditure,
            borderColor:     '#f87171',
            backgroundColor: 'rgba(248,113,113,0.15)',
            borderWidth:     2.5,
            fill:            false,
            tension:         0.3,
            pointRadius:     4,
            pointBackgroundColor: '#f87171'
          }
        ]
      },
      options: {
        ...cfg2,
        plugins: {
          ...cfg2.plugins,
          tooltip: {
            ...cfg2.plugins.tooltip,
            mode: 'index',
            intersect: false,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: £${ctx.parsed.y.toLocaleString('en-GB')}bn`
            }
          }
        }
      }
    });
  }

  /* ── Annual deficit bar chart ── */
  const defCanvas = document.getElementById('deficit-bar');
  if (defCanvas) {
    const isCovid = DEFICIT_HISTORY.deficit.map((v, i) => DEFICIT_HISTORY.labels[i] === '2020/21');
    const barColors = DEFICIT_HISTORY.deficit.map((v, i) =>
      DEFICIT_HISTORY.labels[i] === '2020/21' ? 'rgba(248,113,113,0.9)' : 'rgba(251,191,36,0.75)'
    );
    const borderColors = DEFICIT_HISTORY.deficit.map((v, i) =>
      DEFICIT_HISTORY.labels[i] === '2020/21' ? '#f87171' : '#fbbf24'
    );

    const cfg3 = mergeChartConfig({
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` Deficit: £${ctx.parsed.y.toLocaleString('en-GB')}bn`
          }
        }
      },
      scales: {
        y: { ticks: { callback: v => `£${v}bn` } }
      }
    });

    new Chart(defCanvas, {
      type: 'bar',
      data: {
        labels: DEFICIT_HISTORY.labels,
        datasets: [{
          label:           'Deficit (£bn)',
          data:            DEFICIT_HISTORY.deficit,
          backgroundColor: barColors,
          borderColor:     borderColors,
          borderWidth:     1,
          borderRadius:    4
        }]
      },
      options: cfg3
    });
  }

  /* ── Revenue table ── */
  const tbody = document.getElementById('revenue-tbody');
  if (tbody) {
    tbody.innerHTML = REVENUE_2425.map(d => {
      const pct = ((d.value / total) * 100).toFixed(1);
      return `<tr>
        <td><span class="dot" style="background:${d.color}"></span>${d.label}</td>
        <td>£${d.value.toFixed(0)}bn</td>
        <td>${pct}%</td>
      </tr>`;
    }).join('') + `<tr style="font-weight:600;border-top:2px solid var(--border)">
      <td>Total Current Receipts</td>
      <td>£${total.toFixed(0)}bn</td>
      <td>100%</td>
    </tr>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
