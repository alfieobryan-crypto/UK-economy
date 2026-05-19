import { mergeChartConfig } from './api.js';

/* ─── Nav toggle ─────────────────────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* ─── Data ───────────────────────────────────────────────────────────────── */
const OVERVIEW = [
  { label: 'Social Protection', value: 276.7, color: '#38bdf8' },
  { label: 'Health',            value: 192.4, color: '#818cf8' },
  { label: 'Education',         value: 114.8, color: '#34d399' },
  { label: 'Debt Interest',     value: 100.3, color: '#f87171' },
  { label: 'Local Government',  value:  82.0, color: '#fb923c' },
  { label: 'Defence',           value:  55.6, color: '#fbbf24' },
  { label: 'Transport',         value:  37.7, color: '#a78bfa' },
  { label: 'Home Office',       value:  20.0, color: '#e879f9' },
  { label: 'Business & Science',value:  18.0, color: '#22d3ee' },
  { label: 'Housing & Cmntys', value:  15.0, color: '#86efac' },
  { label: 'International Aid', value:  13.0, color: '#67e8f9' },
  { label: 'Justice',           value:  12.0, color: '#fda4af' },
  { label: 'Environment',       value:   8.0, color: '#6ee7b7' },
  { label: 'Other',             value:  31.5, color: '#64748b' }
];

const DETAIL = {
  'Social Protection': [
    { label: 'State Pension',        value: 130.0 },
    { label: 'Universal Credit',     value:  67.0 },
    { label: 'Housing Benefit',      value:  31.0 },
    { label: 'Disability Benefits',  value:  23.7 },
    { label: 'Other Benefits',       value:  25.0 }
  ],
  'Health': [
    { label: 'NHS England',          value: 164.9 },
    { label: 'Adult Social Care',    value:  18.5 },
    { label: 'Public Health',        value:   5.0 },
    { label: 'Other Health',         value:   4.0 }
  ],
  'Education': [
    { label: 'Schools',              value:  61.0 },
    { label: 'Further Education',    value:  15.0 },
    { label: 'Higher Education',     value:  13.0 },
    { label: 'Early Years',          value:   8.0 },
    { label: 'Other Education',      value:  17.8 }
  ],
  'Transport': [
    { label: 'Rail',                 value:  17.0 },
    { label: 'Roads',                value:  13.0 },
    { label: 'Other Transport',      value:   7.7 }
  ],
  'Home Office': [
    { label: 'Policing',             value:  13.0 },
    { label: 'Border & Immigration', value:   4.5 },
    { label: 'Fire & Resilience',    value:   2.5 }
  ]
};

/* ─── Render ─────────────────────────────────────────────────────────────── */
function init() {
  const total = OVERVIEW.reduce((s, d) => s + d.value, 0);

  /* ── Doughnut ── */
  const pieCanvas = document.getElementById('pie-chart');
  if (pieCanvas) {
    new Chart(pieCanvas, {
      type: 'doughnut',
      data: {
        labels:   OVERVIEW.map(d => d.label),
        datasets: [{
          data:            OVERVIEW.map(d => d.value),
          backgroundColor: OVERVIEW.map(d => d.color),
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
                return ` £${ctx.parsed.toFixed(1)}bn (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /* ── Horizontal bar — all departments sorted ── */
  const sorted    = [...OVERVIEW].sort((a, b) => b.value - a.value);
  const barCanvas = document.getElementById('bar-chart');
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
                return ` £${ctx.parsed.x.toFixed(1)}bn (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /* ── Summary table (top-level) ── */
  const overviewTbody = document.getElementById('overview-tbody');
  if (overviewTbody) {
    overviewTbody.innerHTML = OVERVIEW.map(d => {
      const pct = ((d.value / total) * 100).toFixed(1);
      return `<tr>
        <td><span class="dot" style="background:${d.color}"></span>${d.label}</td>
        <td>£${d.value.toFixed(1)}bn</td>
        <td>${pct}%</td>
      </tr>`;
    }).join('') + `<tr style="font-weight:600;border-top:2px solid var(--border)">
      <td>Total</td><td>£${total.toFixed(1)}bn</td><td>100%</td>
    </tr>`;
  }

  /* ── Detailed sub-category table ── */
  const detailTbody = document.getElementById('detail-tbody');
  if (detailTbody) {
    const rows = [];
    for (const dept of OVERVIEW) {
      const subs = DETAIL[dept.label];
      const deptPct = ((dept.value / total) * 100).toFixed(1);

      rows.push(`<tr class="dept-row">
        <td colspan="3">
          <span class="dot" style="background:${dept.color}"></span>
          <strong>${dept.label}</strong>
          <span style="color:var(--text-muted);font-size:0.78rem;margin-left:0.5rem">£${dept.value.toFixed(1)}bn · ${deptPct}%</span>
        </td>
      </tr>`);

      if (subs) {
        for (const sub of subs) {
          const subPct = ((sub.value / total) * 100).toFixed(1);
          rows.push(`<tr class="sub-row">
            <td style="padding-left:2.25rem;color:var(--text-muted)">↳ ${sub.label}</td>
            <td>£${sub.value.toFixed(1)}bn</td>
            <td>${subPct}%</td>
          </tr>`);
        }
      }
    }
    rows.push(`<tr style="font-weight:600;border-top:2px solid var(--border)">
      <td>Total</td><td>£${total.toFixed(1)}bn</td><td>100%</td>
    </tr>`);
    detailTbody.innerHTML = rows.join('');
  }
}

document.addEventListener('DOMContentLoaded', init);
