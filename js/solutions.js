/* ─── Nav toggle ─────────────────────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

/* ─── Data ───────────────────────────────────────────────────────────────── */
const DEFICIT = 124;

const POLICIES = [
  /* ── Revenue ── */
  {
    id: 'pension-relief', category: 'revenue', difficulty: 'medium',
    label: 'Cap pension tax relief at basic rate (20%) for all earners',
    impact: 15, range: '£10–20bn',
    notes: 'Higher earners currently get 40–45% relief. Straightforward in principle; pension industry opposition.'
  },
  {
    id: 'cgt-reform', category: 'revenue', difficulty: 'medium',
    label: 'Align capital gains tax rates with income tax rates',
    impact: 15, range: '£14–17bn',
    notes: 'OBR-costed; significant behavioural avoidance likely to reduce actual yield.'
  },
  {
    id: 'wealth-tax', category: 'revenue', difficulty: 'hard',
    label: 'Annual wealth tax — 0.5% on net assets above £2m',
    impact: 20, range: '£11–35bn',
    notes: 'No UK precedent. High admin cost, valuation complexity, capital flight risk.'
  },
  {
    id: 'council-tax', category: 'revenue', difficulty: 'hard',
    label: 'Revalue council tax bands (currently based on 1991 values)',
    impact: 10, range: '£8–18bn',
    notes: 'Would redistribute burden to high-value property owners. Politically very difficult.'
  },
  {
    id: 'carbon-tax', category: 'revenue', difficulty: 'medium',
    label: 'Expand UK ETS and raise carbon price floor significantly',
    impact: 10, range: '£7–15bn',
    notes: 'Strong economic efficiency case. Regressive without household rebates.'
  },
  {
    id: 'vat-1pp', category: 'revenue', difficulty: 'easy',
    label: 'Raise VAT by 1 percentage point (20% → 21%)',
    impact: 8, range: '~£8bn',
    notes: 'Simplest high-yield option. Regressive — hits lower earners proportionally harder.'
  },
  {
    id: 'iht-reform', category: 'revenue', difficulty: 'medium',
    label: 'Close inheritance tax loopholes (agricultural/business reliefs)',
    impact: 5, range: '£2–8bn',
    notes: 'Recent Budget controversy over farm inheritance. Reliefs were designed to protect family businesses.'
  },
  {
    id: 'income-50p', category: 'revenue', difficulty: 'medium',
    label: 'Restore 50p top rate of income tax (on incomes above £150k)',
    impact: 3, range: '£2–5bn',
    notes: 'Was in place 2010–2013. Laffer curve effects significantly limit additional yield.'
  },
  {
    id: 'digital-tax', category: 'revenue', difficulty: 'medium',
    label: 'Strengthen digital services tax on large tech platforms',
    impact: 4, range: '£2–7bn',
    notes: 'OECD Pillar Two framework limits unilateral action; trade retaliation risk.'
  },
  {
    id: 'fin-tx', category: 'revenue', difficulty: 'hard',
    label: 'Financial transactions tax (0.1% on equity trades)',
    impact: 5, range: '£3–9bn',
    notes: 'Risk of trading moving offshore. City lobbying intense. Sweden tried and reversed.'
  },

  /* ── Spending ── */
  {
    id: 'benefit-fraud', category: 'spending', difficulty: 'medium',
    label: 'Eliminate benefit fraud and error — DWP annual losses',
    impact: 8, range: '£7–9bn',
    notes: 'DWP estimates ~£8.3bn lost annually. Most is overpayment error, not deliberate fraud. Requires investment in compliance.'
  },
  {
    id: 'tax-compliance', category: 'spending', difficulty: 'medium',
    label: 'Close the tax gap — more HMRC compliance staff and tech',
    impact: 6, range: '£4–9bn',
    notes: 'UK tax gap ~£36bn (2022/23). HMRC already recovers ~£34bn/yr from compliance activity. Diminishing returns.'
  },
  {
    id: 'nhs-efficiency', category: 'spending', difficulty: 'hard',
    label: 'NHS procurement reform and back-office efficiency programme',
    impact: 12, range: '£8–18bn',
    notes: 'NHS spends ~£30bn/yr on procurement. Fragmented purchasing. Requires sustained management reform over 5+ years.'
  },
  {
    id: 'pension-age', category: 'spending', difficulty: 'hard',
    label: 'Accelerate state pension age rise to 68 by 2034 (not 2044)',
    impact: 16, range: '£12–22bn/yr when fully phased',
    notes: 'Long phase-in makes immediate saving modest. Life expectancy disparities mean lower-income workers lose most.'
  },
  {
    id: 'triple-lock', category: 'spending', difficulty: 'medium',
    label: 'Replace triple lock with earnings-only pension uprating',
    impact: 5, range: '£3–8bn',
    notes: 'Saving grows over time as gap compounds. Politically toxic — pensioners vote in high numbers.'
  },
  {
    id: 'welfare-reform', category: 'spending', difficulty: 'hard',
    label: 'Reform PIP / disability benefit eligibility assessments',
    impact: 6, range: '£3–10bn',
    notes: 'Benefits bill rising sharply. Previous reform attempts failed or caused significant hardship. High judicial challenge risk.'
  },
  {
    id: 'defence-cap', category: 'spending', difficulty: 'medium',
    label: 'Hold defence spending at 2% GDP (not increase to 2.5%)',
    impact: 12, range: '~£12bn',
    notes: 'NATO pressures post-Ukraine make this politically difficult. Geopolitical risk trade-off is real.'
  },
  {
    id: 'public-sector', category: 'spending', difficulty: 'medium',
    label: 'Restrain public sector pay rises below private sector growth',
    impact: 7, range: '£4–10bn',
    notes: 'Creates recruitment and retention problems in NHS, schools, and prison service. Strike risk.'
  },
  {
    id: 'overseas-aid', category: 'spending', difficulty: 'easy',
    label: 'Reduce overseas aid from 0.5% to 0.3% GNI',
    impact: 4, range: '~£4bn',
    notes: 'UK soft power and humanitarian returns are significant but hard to quantify financially.'
  },
  {
    id: 'quango-reform', category: 'spending', difficulty: 'easy',
    label: 'Merge or abolish underperforming arm\'s-length bodies',
    impact: 3, range: '£1–5bn',
    notes: 'Marginal savings; transition costs are real. Previous culls have largely failed to deliver projected savings.'
  },

  /* ── Growth ── */
  {
    id: 'planning', category: 'growth', difficulty: 'hard',
    label: 'Major planning reform — unlock housebuilding and infrastructure',
    impact: 22, range: '£15–35bn tax revenue',
    notes: '5–10yr horizon. LSE estimate: loosening planning could boost GDP 0.5–1.5%. Extra output generates extra tax receipts.'
  },
  {
    id: 'childcare', category: 'growth', difficulty: 'medium',
    label: 'Universal subsidised childcare — raise female employment rate',
    impact: 7, range: '£4–12bn',
    notes: 'Requires upfront spending. Long-run fiscal positive: 100,000 extra workers = ~£3bn in income tax/NICs.'
  },
  {
    id: 'skilled-visas', category: 'growth', difficulty: 'medium',
    label: 'Expand high-skilled worker and post-study visas (STEM focus)',
    impact: 8, range: '£5–15bn',
    notes: 'Highly educated migrants are net fiscal contributors. Requires political will given migration debate.'
  },
  {
    id: 'rd-invest', category: 'growth', difficulty: 'medium',
    label: 'Raise R&D spending to 3% of GDP (public leverage of private)',
    impact: 10, range: '£6–18bn',
    notes: '10–15yr payback horizon. Social return on R&D estimated at 3–10x private return. Requires co-investment.'
  },
  {
    id: 'trade-deals', category: 'growth', difficulty: 'hard',
    label: 'Comprehensive trade deal with EU (reduce non-tariff barriers)',
    impact: 12, range: '£6–20bn',
    notes: 'OBR estimates Brexit reduced UK trade 15%. Partial reset could recover material GDP. Requires political reset.'
  },
  {
    id: 'infra', category: 'growth', difficulty: 'hard',
    label: 'Fast-track major infrastructure (energy, water, transport)',
    impact: 8, range: '£5–14bn',
    notes: 'Multiplier effects on regional economies. Long build times; cost overruns historically large in UK.'
  }
];

/* ─── State ──────────────────────────────────────────────────────────────── */
const selected = new Set();

/* ─── Render policies ────────────────────────────────────────────────────── */
function difficultyLabel(d) {
  return `<span class="difficulty-badge difficulty-${d}">${d}</span>`;
}

function impactColor(cat) {
  return cat === 'revenue' ? 'var(--accent)' : cat === 'spending' ? 'var(--positive)' : 'var(--neutral)';
}

function renderCategory(cat) {
  const container = document.getElementById(`policies-${cat}`);
  if (!container) return;
  container.innerHTML = POLICIES.filter(p => p.category === cat).map(p => `
    <div class="policy-card" id="card-${p.id}" data-id="${p.id}" role="checkbox" aria-checked="false" tabindex="0">
      <div class="policy-checkbox" id="chk-${p.id}"></div>
      <div class="policy-info">
        <div class="policy-name">${p.label}</div>
        <div class="policy-impact" style="color:${impactColor(cat)}">
          ~£${p.impact}bn/yr
          <span class="policy-range">&nbsp;(range: ${p.range})</span>
        </div>
        <div class="policy-note">${p.notes}</div>
      </div>
      ${difficultyLabel(p.difficulty)}
    </div>
  `).join('');
}

/* ─── Update panel ───────────────────────────────────────────────────────── */
function updatePanel() {
  let rev = 0, spend = 0, growth = 0;
  for (const id of selected) {
    const p = POLICIES.find(x => x.id === id);
    if (!p) continue;
    if (p.category === 'revenue')  rev    += p.impact;
    if (p.category === 'spending') spend  += p.impact;
    if (p.category === 'growth')   growth += p.impact;
  }

  const total = rev + spend + growth;
  const pct   = Math.min(100, Math.round((total / DEFICIT) * 100));
  const remaining = Math.max(0, DEFICIT - total);

  document.getElementById('total-revenue').textContent  = `£${rev}bn`;
  document.getElementById('total-spending').textContent = `£${spend}bn`;
  document.getElementById('total-growth').textContent   = `£${growth}bn`;
  document.getElementById('total-all').textContent      = `£${total}bn`;

  const fill = document.getElementById('progress-fill');
  fill.style.width = `${pct}%`;
  fill.style.background =
    pct >= 100 ? 'var(--positive)' :
    pct >= 60  ? 'var(--neutral)'  : 'var(--accent)';

  const remLabel = document.getElementById('remaining-label');
  remLabel.textContent = pct >= 100
    ? `Deficit closed (+£${total - DEFICIT}bn surplus)`
    : `£${remaining}bn remaining (${pct}% addressed)`;
  remLabel.style.color = pct >= 100 ? 'var(--positive)' : 'var(--text-muted)';

  const status = document.getElementById('panel-status');
  if (pct === 0) {
    status.textContent = '';
  } else if (pct < 40) {
    status.textContent = '📊 A start — still a large gap to close.';
  } else if (pct < 70) {
    status.textContent = '⚡ Meaningful progress — politically demanding mix.';
  } else if (pct < 100) {
    status.textContent = '🔥 Very ambitious — would require rare political consensus.';
  } else {
    status.textContent = '✅ Deficit closed! But this combination would be unprecedented.';
  }
}

/* ─── Toggle a policy ────────────────────────────────────────────────────── */
function togglePolicy(id) {
  const card = document.getElementById(`card-${id}`);
  const chk  = document.getElementById(`chk-${id}`);
  if (!card) return;

  if (selected.has(id)) {
    selected.delete(id);
    card.classList.remove('selected');
    card.setAttribute('aria-checked', 'false');
  } else {
    selected.add(id);
    card.classList.add('selected');
    card.setAttribute('aria-checked', 'true');
  }
  updatePanel();
}

/* ─── Wire up events ─────────────────────────────────────────────────────── */
function wireEvents() {
  /* Individual card clicks */
  document.querySelectorAll('.policy-card').forEach(card => {
    card.addEventListener('click', () => togglePolicy(card.dataset.id));
    card.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePolicy(card.dataset.id); }
    });
  });

  /* Category "Select all" buttons */
  document.querySelectorAll('.cat-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat      = btn.dataset.cat;
      const catPols  = POLICIES.filter(p => p.category === cat);
      const allOn    = catPols.every(p => selected.has(p.id));

      catPols.forEach(p => {
        if (allOn) selected.delete(p.id);
        else selected.add(p.id);
      });

      catPols.forEach(p => {
        const card = document.getElementById(`card-${p.id}`);
        const on   = selected.has(p.id);
        card?.classList.toggle('selected', on);
        card?.setAttribute('aria-checked', String(on));
      });

      btn.textContent = allOn ? 'Select all' : 'Deselect all';
      updatePanel();
    });
  });

  /* Reset */
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    selected.clear();
    document.querySelectorAll('.policy-card').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });
    document.querySelectorAll('.cat-toggle-btn').forEach(b => b.textContent = 'Select all');
    updatePanel();
  });
}

/* ─── Init ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderCategory('revenue');
  renderCategory('spending');
  renderCategory('growth');
  wireEvents();
  updatePanel();
});
