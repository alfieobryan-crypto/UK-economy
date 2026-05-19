/* ─── CORS Proxy ─────────────────────────────────────────────────────────── */
const CORS_PROXY = 'https://corsproxy.io/?url=';

async function proxyFetch(url) {
  const res = await fetch(CORS_PROXY + encodeURIComponent(url), {
    signal: AbortSignal.timeout(6000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

/* ─── ONS Fetch (beta direct → old via proxy → fallback) ────────────────── */
async function fetchONS(dataset, series) {
  const betaUrl = `https://api.beta.ons.gov.uk/v1/datasets/${dataset}/timeseries/${series}/data`;
  const oldUrl  = `https://api.ons.gov.uk/v1/datasets/${dataset}/timeseries/${series}/data`;

  try {
    const res = await fetch(betaUrl, { signal: AbortSignal.timeout(6000) });
    if (res.ok) return await res.json();
  } catch (_) { /* fall through */ }

  try {
    const res = await proxyFetch(oldUrl);
    return await res.json();
  } catch (_) { /* fall through */ }

  return null;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function latestMonthly(data) {
  const months = data?.months ?? [];
  return months.length ? months[months.length - 1] : null;
}

function latestYearly(data) {
  const years = data?.years ?? [];
  return years.length ? years[years.length - 1] : null;
}

function lastNMonths(data, n = 36) {
  const months = (data?.months ?? []).slice(-n);
  return {
    labels: months.map(m => m.date),
    values: months.map(m => parseFloat(m.value))
  };
}

function lastNYears(data, n = 25) {
  const years = (data?.years ?? []).slice(-n);
  return {
    labels: years.map(y => y.date),
    values: years.map(y => parseFloat(y.value))
  };
}

/* ─── Fallback Data ──────────────────────────────────────────────────────── */
const FALLBACK_CPI = {
  latest: { date: '2025 MAR', value: '2.6' },
  series: {
    labels: ['2022 JAN','2022 APR','2022 JUL','2022 OCT',
             '2023 JAN','2023 APR','2023 JUL','2023 OCT',
             '2024 JAN','2024 APR','2024 JUL','2024 OCT',
             '2025 JAN','2025 FEB','2025 MAR'],
    values: [5.5, 9.0, 10.1, 11.1, 10.1, 8.7, 6.8, 4.6, 4.0, 3.2, 2.2, 2.3, 3.0, 2.8, 2.6]
  },
  isFallback: true
};

const FALLBACK_UNEMPLOYMENT = {
  latest: { date: '2025 FEB', value: '4.4' },
  series: {
    labels: ['2022 Q1','2022 Q3','2023 Q1','2023 Q3','2024 Q1','2024 Q3','2025 Q1'],
    values: [3.8, 3.5, 3.8, 4.2, 4.3, 4.3, 4.4]
  },
  isFallback: true
};

const FALLBACK_GDP = {
  latest: { date: '2024 Q4', value: '0.1' },
  series: {
    labels: ['2022 Q1','2022 Q2','2022 Q3','2022 Q4',
             '2023 Q1','2023 Q2','2023 Q3','2023 Q4',
             '2024 Q1','2024 Q2','2024 Q3','2024 Q4'],
    values: [0.8, -0.1, 0.2, 0.1, 0.3, 0.2, 0.0, 0.3, 0.7, 0.5, 0.0, 0.1]
  },
  isFallback: true
};

const FALLBACK_BASE_RATE = {
  latest: { date: 'May 2025', value: 4.25 },
  series: {
    labels: ['Jan 22','Jul 22','Jan 23','Jul 23','Jan 24','Jul 24','Jan 25','May 25'],
    values: [0.25, 1.75, 3.50, 5.00, 5.25, 5.25, 4.75, 4.25]
  },
  isFallback: true
};

const FALLBACK_HOUSE_PRICE = {
  latest: { date: '2025 FEB', value: '268000' },
  series: {
    labels: ['Jan 22','Apr 22','Jul 22','Oct 22','Jan 23','Apr 23','Jul 23','Oct 23',
             'Jan 24','Apr 24','Jul 24','Oct 24','Jan 25','Feb 25'],
    values: [274000, 281000, 292000, 295000, 290000, 285000, 288000, 285000,
             282000, 281000, 285000, 290000, 266000, 268000]
  },
  isFallback: true
};

const FALLBACK_NET_MIGRATION = {
  latest: { date: '2024', value: '728000' },
  series: {
    labels: ['2000','2002','2004','2006','2008','2010','2012','2014',
             '2016','2018','2019','2020','2021','2022','2023','2024'],
    values: [163000, 153000, 222000, 244000, 175000, 255000, 177000, 289000,
             336000, 271000, 231000, 184000, 488000, 764000, 906000, 728000]
  },
  isFallback: true
};

const FALLBACK_SPENDING = [
  { label: 'Social Protection', value: 276.7, color: '#38bdf8' },
  { label: 'Health',            value: 192.4, color: '#818cf8' },
  { label: 'Education',         value: 114.8, color: '#34d399' },
  { label: 'Debt Interest',     value: 100.3, color: '#f87171' },
  { label: 'Defence',           value:  55.6, color: '#fbbf24' },
  { label: 'Transport',         value:  37.7, color: '#a78bfa' },
  { label: 'Other',             value: 200.5, color: '#94a3b8' }
];

/* ─── Public Data Functions ──────────────────────────────────────────────── */
export async function getCPI() {
  try {
    const data = await fetchONS('cpih01', 'L55O');
    if (!data?.months?.length) throw new Error('no data');
    const latest = latestMonthly(data);
    const series = lastNMonths(data, 60);
    return { latest, series, isFallback: false };
  } catch (_) {
    console.warn('CPI: using fallback');
    return FALLBACK_CPI;
  }
}

export async function getUnemployment() {
  try {
    const data = await fetchONS('lms', 'mgsx');
    if (!data?.months?.length) throw new Error('no data');
    const latest = latestMonthly(data);
    const series = lastNMonths(data, 36);
    return { latest, series, isFallback: false };
  } catch (_) {
    console.warn('Unemployment: using fallback');
    return FALLBACK_UNEMPLOYMENT;
  }
}

export async function getGDP() {
  try {
    const data = await fetchONS('qna', 'abmi');
    if (!data?.quarters?.length && !data?.months?.length) throw new Error('no data');
    const quarters = data.quarters ?? [];
    const latest = quarters.length ? quarters[quarters.length - 1] : latestMonthly(data);
    const series = {
      labels: quarters.slice(-12).map(q => q.date),
      values: quarters.slice(-12).map(q => parseFloat(q.value))
    };
    return { latest, series, isFallback: false };
  } catch (_) {
    console.warn('GDP: using fallback');
    return FALLBACK_GDP;
  }
}

export async function getBaseRate() {
  try {
    const url = 'https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp' +
                '?csv.x=yes&SeriesCodes=IUMABEDR&UsingCodes=Y&Datefrom=01/Jan/2020&Dateto=now&CSVF=TN';
    const res = await proxyFetch(url);
    const text = await res.text();
    const lines = text.trim().split('\n').filter(l => l && !l.startsWith('DATE') && l.includes(','));
    if (!lines.length) throw new Error('empty CSV');
    const parsed = lines.map(line => {
      const parts = line.split(',');
      return { date: parts[0].trim(), value: parseFloat(parts[1].trim()) };
    }).filter(d => !isNaN(d.value));
    if (!parsed.length) throw new Error('no valid rows');
    const latest = parsed[parsed.length - 1];
    const series = {
      labels: parsed.slice(-36).map(d => d.date),
      values: parsed.slice(-36).map(d => d.value)
    };
    return { latest, series, isFallback: false };
  } catch (_) {
    console.warn('Base rate: using fallback');
    return FALLBACK_BASE_RATE;
  }
}

export async function getHousePrice() {
  try {
    const data = await fetchONS('hpssadataset2', 'kac3');
    if (!data?.months?.length) throw new Error('no data');
    const latest = latestMonthly(data);
    const series = lastNMonths(data, 36);
    return { latest, series, isFallback: false };
  } catch (_) {
    console.warn('House price: using fallback');
    return FALLBACK_HOUSE_PRICE;
  }
}

export async function getNetMigration() {
  try {
    const data = await fetchONS('migration', 'NETMIG');
    if (!data?.years?.length) throw new Error('no data');
    const latest = latestYearly(data);
    const series = lastNYears(data, 25);
    return { latest, series, isFallback: false };
  } catch (_) {
    console.warn('Net migration: using fallback');
    return FALLBACK_NET_MIGRATION;
  }
}

export function getSpending() {
  return FALLBACK_SPENDING;
}

/* ─── Revenue & Deficit Data ─────────────────────────────────────────────── */

export const REVENUE_2425 = [
  { label: 'Income Tax',            value: 285.0, color: '#38bdf8' },
  { label: 'VAT',                   value: 191.0, color: '#818cf8' },
  { label: 'National Insurance',    value: 177.0, color: '#34d399' },
  { label: 'Corporation Tax',       value: 101.0, color: '#fbbf24' },
  { label: 'Council Tax & B.Rates', value:  76.0, color: '#fb923c' },
  { label: 'Excise & Fuel Duties',  value:  42.0, color: '#a78bfa' },
  { label: 'CGT & Inheritance Tax', value:  30.0, color: '#f87171' },
  { label: 'Other Taxes',           value:  49.0, color: '#22d3ee' },
  { label: 'Non-tax Receipts',      value: 162.0, color: '#64748b' }
];
// Total: £1,113bn

export const DEFICIT_HISTORY = {
  labels:      ['2015/16','2016/17','2017/18','2018/19','2019/20',
                '2020/21','2021/22','2022/23','2023/24','2024/25'],
  receipts:    [676, 697, 740, 783, 813,  905, 1019, 1071, 1096, 1113],
  expenditure: [744, 749, 781, 825, 871, 1227, 1158, 1199, 1218, 1237],
  deficit:     [ 68,  52,  41,  42,  58,  322,  139,  128,  122,  124]
};

/* ─── Chart Defaults ─────────────────────────────────────────────────────── */
export const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500 },
  plugins: {
    legend: {
      labels: {
        color: '#f8fafc',
        font: { family: 'Inter, system-ui, sans-serif', size: 12 },
        padding: 16,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#38bdf8',
      bodyColor: '#f8fafc',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 10
    }
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 45 },
      grid:  { color: 'rgba(51,65,85,0.4)' }
    },
    y: {
      ticks: { color: '#94a3b8', font: { size: 11 } },
      grid:  { color: 'rgba(51,65,85,0.4)' }
    }
  }
};

export function mergeChartConfig(...overrides) {
  function deepMerge(target, source) {
    for (const key of Object.keys(source ?? {})) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = deepMerge(target[key] ?? {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
  return overrides.reduce((acc, o) => deepMerge(acc, o), JSON.parse(JSON.stringify(CHART_DEFAULTS)));
}
