// admin/pages/Analytics.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import Sidebar from '../components/Sidebar';

const NODE_BACKEND_URL = 'https://wonderfloor-dashboard.vercel.app';
const LEADS_COLOR = '#0b9e7a';
const VISITORS_COLOR = '#3b82f6';

// ── Small icon set, same stroke-based style as Sidebar.jsx ──
const Icon = {
  leads: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M15 9h3M15 13h3M6.5 16c.5-1.5 1.7-2.3 2.5-2.3s2 .8 2.5 2.3" />
    </svg>
  ),
  products: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  trend: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="3 17 9 11 13 15 21 6" />
      <polyline points="14 6 21 6 21 13" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  refresh: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <polyline points="3 3 3 8 8 8" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  eye: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

// ── Helpers ──
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const dayLabel = (d) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

// Builds an array of the last N days (oldest → newest) with lead counts filled in
function buildTrend(leads, days = 14) {
  const buckets = new Map();
  const today = startOfDay(new Date());

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toDateString(), { date: d, label: dayLabel(d), leads: 0 });
  }

  leads.forEach((lead) => {
    const raw = lead.createdAt || lead.date || lead.timestamp;
    if (!raw) return;
    const key = startOfDay(new Date(raw)).toDateString();
    if (buckets.has(key)) buckets.get(key).leads += 1;
  });

  return Array.from(buckets.values());
}

// GA4 ke YYYYMMDD dates ko same day-bucket format mein convert karta hai
function buildGA4Trend(ga4Trend = [], days = 14) {
  const buckets = new Map();
  const today = startOfDay(new Date());

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    buckets.set(key, { label: dayLabel(d), visitors: 0 });
  }

  ga4Trend.forEach((row) => {
    if (buckets.has(row.date)) buckets.get(row.date).visitors = row.activeUsers;
  });

  return Array.from(buckets.values());
}

//  NEW: leads trend + GA4 trend ko ek hi array mein merge karta hai (combined chart ke liye)
function mergeTrends(leadsTrend, ga4TrendArr) {
  return leadsTrend.map((row, i) => ({
    label: row.label,
    leads: row.leads,
    visitors: ga4TrendArr[i]?.visitors ?? 0,
  }));
}

function topProducts(leads, limit = 5) {
  const counts = new Map();
  leads.forEach((lead) => {
    const name = lead.productName || 'Unknown product';
    const downloads = lead.downloadCount || 1;
    counts.set(name, (counts.get(name) || 0) + downloads);
  });
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ── Gradient stat card ──
const StatCard = ({ icon, label, value, sub, gradient }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-5 flex items-start gap-4 border border-[#eeeeee] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300"
    style={{ background: gradient }}
  >
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/70 backdrop-blur-sm text-[#222222] shadow-sm">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-[13px] text-[#555555] font-medium">{label}</div>
      <div className="text-[26px] leading-tight font-bold text-[#1a1a1a] mt-0.5 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-[#777777] mt-1">{sub}</div>}
    </div>
  </div>
);

const SectionCard = ({ title, right, children, className = '' }) => (
  <div className={`bg-white border border-[#eeeeee] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[15px] font-semibold text-[#1a1a1a]">{title}</h2>
      {right}
    </div>
    {children}
  </div>
);

const RangeToggle = ({ range, setRange }) => (
  <div className="flex gap-1 bg-[#f5f5f5] rounded-lg p-1">
    {[7, 14, 30, 60, 90].map((d) => (
      <button
        key={d}
        onClick={() => setRange(d)}
        className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer ${range === d ? 'bg-white shadow-sm text-[#0b9e7a]' : 'text-[#888888] hover:text-[#333333]'
          }`}
      >
        {d}d
      </button>
    ))}
  </div>
);

const ChartLegendDot = ({ color, label }) => (
  <span className="flex items-center gap-1.5 text-[12px] text-[#666666]">
    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
    {label}
  </span>
);

export default function Analytics() {
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(14); // days shown in trend chart
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [ga4Data, setGa4Data] = useState(null);
  const [ga4Loading, setGa4Loading] = useState(true);
  const [topDownloads, setTopDownloads] = useState([]);
  const [downloadsLoading, setDownloadsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [leadsRes, productsRes] = await Promise.all([
        fetch(`${NODE_BACKEND_URL}/leads`),
        fetch(`${NODE_BACKEND_URL}/products`),
      ]);

      const leadsData = await leadsRes.json();
      const productsData = await productsRes.json();

      setLeads(leadsData?.success ? leadsData.leads : Array.isArray(leadsData) ? leadsData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Analytics fetch failed:', err);
      setError('Data is not loading');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // GA4 fetch data
  async function loadGA4Data(days) {
    setGa4Loading(true);
    try {
      const res = await fetch(`${NODE_BACKEND_URL}/analytics/ga4-summary?days=${days}`);
      const data = await res.json();
      setGa4Data(data?.success ? data : null);
    } catch (err) {
      console.error('GA4 fetch failed:', err);
      setGa4Data(null);
    } finally {
      setGa4Loading(false);
    }
  }

  useEffect(() => {
    loadGA4Data(range);
  }, [range]);

  // ✅ NEW: accurate product-wise download counts
  async function loadTopDownloads() {
    setDownloadsLoading(true);
    try {
      const res = await fetch(`${NODE_BACKEND_URL}/leads/downloads/top`);
      const data = await res.json();
      setTopDownloads(data?.success ? data.topDownloads : []);
    } catch (err) {
      console.error('Top downloads fetch failed:', err);
      setTopDownloads([]);
    } finally {
      setDownloadsLoading(false);
    }
  }

  useEffect(() => {
    loadTopDownloads();
  }, []);
  const trendData = useMemo(() => buildTrend(leads, range), [leads, range]);
  // const productData = useMemo(() => topProducts(leads, 5), [leads]);
  const ga4TrendData = useMemo(() => buildGA4Trend(ga4Data?.trend, range), [ga4Data, range]);
  // sabse jyada aur sabse kam downloaded Product
  // ✅ NEW: sabse zyada aur sabse kam downloaded product nikalo
  const mostLeastDownloads = useMemo(() => {
    if (topDownloads.length === 0) return [];
    const most = topDownloads[0];
    const least = topDownloads[topDownloads.length - 1];
    // agar sirf ek hi product hai, dono same honge — tab sirf ek dikhao
    if (most.name === least.name) return [most];
    return [most, least];
  }, [topDownloads]);
  // ✅ NEW: combined chart data
  const combinedTrendData = useMemo(
    () => mergeTrends(trendData, ga4TrendData),
    [trendData, ga4TrendData]
  );

  const leadsToday = useMemo(() => {
    const today = startOfDay(new Date()).toDateString();
    return leads.filter((l) => {
      const raw = l.createdAt || l.date || l.timestamp;
      return raw && startOfDay(new Date(raw)).toDateString() === today;
    }).length;
  }, [leads]);

  const leadsThisWeek = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return leads.filter((l) => {
      const raw = l.createdAt || l.date || l.timestamp;
      return raw && new Date(raw) >= weekAgo;
    }).length;
  }, [leads]);

  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => {
        const da = new Date(a.createdAt || a.date || 0);
        const db = new Date(b.createdAt || b.date || 0);
        return db - da;
      })
      .slice(0, 8);
  }, [leads]);

  const anyLoading = isLoading || ga4Loading;

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gradient-to-b from-[#fafbfa] to-[#f5f6f5]">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[#e8e8e8] bg-white shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md text-[#555555] hover:bg-[#f5f5f5] cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[#222222]">Analytics</span>
        </div>

        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="hidden md:block">
              <h1 className="text-2xl md:text-[28px] font-bold text-[#1a1a1a] tracking-tight">Analytics</h1>
            </div>
            <button
              onClick={() => { loadData(); loadGA4Data(range); }}
              disabled={anyLoading}
              className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-lg border border-[#e8e8e8] bg-white text-[#555555] hover:bg-[#f5f5f5] hover:shadow-sm transition-all disabled:opacity-50 cursor-pointer ml-auto"
            >
              <span className={anyLoading ? 'animate-spin' : ''}>{Icon.refresh}</span>
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Stat cards — Leads */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard
              icon={Icon.leads}
              label="Total Leads"
              value={isLoading ? '—' : leads.length}
              gradient="linear-gradient(135deg, #e5f7f0 0%, #f4fbf8 100%)"
            />
            <StatCard
              icon={Icon.calendar}
              label="Leads Today"
              value={isLoading ? '—' : leadsToday}
              gradient="linear-gradient(135deg, #eef4ff 0%, #f7faff 100%)"
            />
            <StatCard
              icon={Icon.trend}
              label="Leads (7 days)"
              value={isLoading ? '—' : leadsThisWeek}
              gradient="linear-gradient(135deg, #fff6e8 0%, #fffbf3 100%)"
            />
            <StatCard
              icon={Icon.products}
              label="Live Products"
              value={isLoading ? '—' : products.length}
              gradient="linear-gradient(135deg, #f3eefc 0%, #faf7fd 100%)"
            />
          </div>

          {/* Stat cards — GA4 Visitors */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Icon.users}
              label="Total Visitors"
              value={ga4Loading ? '—' : ga4Data?.totalVisitors ?? 0}
              gradient="linear-gradient(135deg, #e6f1fb 0%, #f5faff 100%)"
            />
            <StatCard
              icon={Icon.calendar}
              label="New Users"
              value={ga4Loading ? '—' : ga4Data?.newUsers ?? 0}
              gradient="linear-gradient(135deg, #e6f1fb 0%, #f5faff 100%)"
            />
            <StatCard
              icon={Icon.trend}
              label="Sessions"
              value={ga4Loading ? '—' : ga4Data?.sessions ?? 0}
              gradient="linear-gradient(135deg, #e6f1fb 0%, #f5faff 100%)"
            />
            <StatCard
              icon={Icon.eye}
              label="Page Views"
              value={ga4Loading ? '—' : ga4Data?.pageViews ?? 0}
              gradient="linear-gradient(135deg, #e6f1fb 0%, #f5faff 100%)"
            />
          </div>

          {/* Combined trend chart — Leads vs Visitors */}
          <SectionCard
            title="Leads vs Visitors"
            right={
              <div className="flex items-center gap-4">
                <ChartLegendDot color={LEADS_COLOR} label="Leads" />
                <ChartLegendDot color={VISITORS_COLOR} label="Visitors" />
                <RangeToggle range={range} setRange={setRange} />
              </div>
            }
            className="mb-6"
          >
            {anyLoading ? (
              <div className="h-[280px] flex items-center justify-center text-[#aaaaaa] text-sm">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={combinedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={LEADS_COLOR} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={LEADS_COLOR} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={VISITORS_COLOR} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={VISITORS_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={true} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} axisLine={{ stroke: '#eee' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #e8e8e8', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: 600, color: '#333' }}
                  />
                  <Area type="monotone" dataKey="leads" stroke={LEADS_COLOR} strokeWidth={2.5} fill="url(#leadsFill)" dot={{ r: 3, fill: LEADS_COLOR }} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="visitors" stroke={VISITORS_COLOR} strokeWidth={2.5} fill="url(#visitorsFill)" dot={{ r: 3, fill: VISITORS_COLOR }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top products */}
            <SectionCard title="Most & Least Downloaded">
              {downloadsLoading ? (
                <div className="h-[220px] flex items-center justify-center text-[#aaaaaa] text-sm">Loading…</div>
              ) : mostLeastDownloads.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-[#aaaaaa] text-sm">There is no any download</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mostLeastDownloads} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <defs>
                      <linearGradient id="barFill" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0b9e7a" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#0b9e7a" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#555' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e8e8e8', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} cursor={{ fill: '#f5f5f5' }} />
                    <Bar dataKey="count" fill="url(#barFill)" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>

            {/* Recent leads */}
            <SectionCard title="Recent Leads">
              {isLoading ? (
                <div className="h-[220px] flex items-center justify-center text-[#aaaaaa] text-sm">Loading…</div>
              ) : recentLeads.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-[#aaaaaa] text-sm">Koi lead nahi mila.</div>
              ) : (
                <div className="flex flex-col divide-y divide-[#f0f0f0] max-h-[260px] overflow-y-auto">
                  {recentLeads.map((lead, i) => (
                    <div key={lead._id || i} className="py-3 flex items-center justify-between gap-3 hover:bg-[#fafafa] rounded-lg px-2 -mx-2 transition-colors">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#eef7f3] text-[#0b9e7a] flex items-center justify-center text-[12px] font-semibold shrink-0">
                          {(lead.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-[#333333] truncate">{lead.name || 'Unnamed'}</div>
                          <div className="text-[11px] text-[#999999] truncate">
                            {lead.productName || 'No product'} {lead.phone ? `· ${lead.phone}` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#aaaaaa] shrink-0">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
