import { getSpending, mergeChartConfig } from './api.js';

/* ─── Nav toggle ─────────────────────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* ─── Render ─────────────────────────────────────────────────────────────── */
function init() {
  const data  = getSpending();
  const total = data.reduce((s, d) => s + d.value, 0);

  /* Pie / doughnut */
  const pieCanvas = document.getElementById('pie-chart');
  if (pieCanvas) {
    new Chart(pieCanvas, {
      type: 'doughnut',
      data: {
        labels:   data.map(d => d.label),
        datasets: [{
          data:            data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderColor:     '#0f172a',
          borderWidth:     3,
          hoverOffset:     8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        animation: { duration: 600 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color:          '#f8fafc',
              font:           { size: 12, family: 'Inter, system-ui, sans-serif' },
              padding:        12,
              usePointStyle:  true,
              pointStyleWidth: 10
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
                return ` £${ctx.parsed.toFixed(1)}bn (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /* Horizontal bar chart */
  const sorted    = [...data].sort((a, b) => b.value - a.value);
  const barCanvas = document.getElementById('bar-chart');
  if (barCanvas) {
    const cfg = mergeChartConfig({
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { callback: v => `£${v}bn` } },
        y: { ticks: { font: { size: 12 } } }
      }
    });

    new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels:   sorted.map(d => d.label),
        datasets: [{
          data:            sorted.map(d => d.value),
          backgroundColor: sorted.map(d => d.color + 'cc'),
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
                return ` £${ctx.parsed.x.toFixed(1)}bn (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /* Table */
  const tbody = document.getElementById('spending-tbody');
  if (tbody) {
    tbody.innerHTML = data.map(d => {
      const pct = ((d.value / total) * 100).toFixed(1);
      return `<tr>
        <td><span class="dot" style="background:${d.color}"></span>${d.label}</td>
        <td>£${d.value.toFixed(1)}bn</td>
        <td>${pct}%</td>
      </tr>`;
    }).join('') + `<tr style="font-weight:600;border-top:2px solid var(--border)">
      <td>Total</td>
      <td>£${total.toFixed(1)}bn</td>
      <td>100%</td>
    </tr>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
