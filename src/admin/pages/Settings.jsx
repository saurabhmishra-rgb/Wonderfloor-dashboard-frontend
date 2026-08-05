// Settings.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Icon = {
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  photo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  stack: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  menu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  leads: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M15 9h3M15 13h3M6.5 16c.5-1.5 1.7-2.3 2.5-2.3s2 .8 2.5 2.3" />
  </svg>,
};

const navItems = [
  { label: 'Dashboard Overview', icon: 'grid', key: 'overview', path: '/admin', group: null },
  { label: 'Demo Rooms', icon: 'photo', key: 'rooms', path: '/admin/rooms', group: 'MANAGE' },
  { label: 'Flooring Products', icon: 'stack', key: 'products', path: '/admin/products', group: null },
  { label: 'Leads', icon: 'leads', key: 'settings', path: '/admin/settings', group: null },
];

//  Backend URL — apne dashboard backend ke saath match honi chahiye
const NODE_BACKEND_URL = 'https://wonderfloor-dashboard.vercel.app';

export default function Settings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  //  NEW: Leads state
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [leadsError, setLeadsError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const activePage = navItems.find(item => item.path === location.pathname)?.key || 'settings';

  //  NEW: Fetch leads jab page load ho
  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch(`${NODE_BACKEND_URL}/leads`);
        const data = await res.json();
        if (data.success) {
          setLeads(data.leads);
        } else {
          setLeadsError('Failed to load leads.');
        }
      } catch (err) {
        console.error('Failed to fetch leads:', err);
        setLeadsError('Could not connect to server.');
      } finally {
        setIsLoadingLeads(false);
      }
    }
    fetchLeads();
  }, []);

  // ✅ NEW: Status update karne ke liye (new → contacted → converted → closed)
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await fetch(`${NODE_BACKEND_URL}/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const statusColors = {
    new: 'bg-[#edf9f5] text-[#0b9e7a]',
    contacted: 'bg-blue-50 text-blue-600',
    converted: 'bg-purple-50 text-purple-600',
    closed: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="flex h-screen w-full font-sans bg-[#f4f4f5] text-[#111111] overflow-hidden">

      {/* ── MOBILE OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed md:relative z-50 h-full w-[220px] shrink-0 bg-white border-r border-[#e8e8e8] flex flex-col 
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex justify-between items-center px-5 pt-5 pb-[18px] border-b border-[#e8e8e8]">
          <div>
            <div className="text-[17px] font-semibold text-[#111111] tracking-tight">
              <img
                src="https://www.wonderfloor.co.in/assets/img/logo/logo.png"
                alt="Logo"
                className="h-8 max-w-[150px] md:max-w-[180px] object-contain"
              />
            </div>
          </div>
          <button className="md:hidden text-[#888888]" onClick={() => setIsMobileMenuOpen(false)}>
            {Icon.close}
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = activePage === item.key;
            const showGroup = item.group && item.group !== navItems[i - 1]?.group;

            return (
              <div key={item.key}>
                {showGroup && (
                  <div className="text-[10px] font-semibold tracking-[0.08em] text-[#bbbbbb] px-5 pt-3.5 pb-1.5 uppercase">
                    {item.group}
                  </div>
                )}
                <button
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 w-full px-5 py-[9px] border-l-2 text-[13px] text-left transition-all duration-150 cursor-pointer group ${isActive
                      ? 'bg-[#edf9f5] border-[#0b9e7a] text-[#0b9e7a] font-medium'
                      : 'bg-transparent border-transparent text-[#888888] font-normal hover:text-[#333333] hover:bg-[#f5f5f5]'
                    }`}
                >
                  <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'}`}>
                    {Icon[item.icon]}
                  </span>
                  {item.label}
                  {/* ✅ NEW: Leads count badge sidebar mein */}
                  {item.key === 'settings' && leads.length > 0 && (
                    <span className="ml-auto bg-[#f05c3f] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {leads.length > 99 ? '99+' : leads.length}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="px-5 pt-3.5 pb-[18px] border-t border-[#e8e8e8] flex justify-between items-center">
          <div>
            <div className="text-[11px] text-[#aaaaaa]">Logged in as</div>
            <div className="text-[13px] font-medium text-[#333333] mt-0.5">Admin</div>
          </div>
          <button
            onClick={() => navigate('/admin/logout')}
            className="text-[#888888] hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 cursor-pointer"
            title="Log Out"
          >
            {Icon.logout}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">

        {/* Top bar */}
        <header className="h-[58px] border-b border-[#e8e8e8] flex items-center justify-between px-4 md:px-7 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-[#111111] p-1 -ml-1 rounded-md hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              {Icon.menu}
            </button>
            <h1 className="text-base font-medium text-[#111111] m-0">Leads</h1>
          </div>
        </header>

        {/* ✅ NEW: Leads Table / Empty / Loading states */}
        <div className="flex-1 overflow-auto p-4 md:p-6 md:px-7">

          {isLoadingLeads ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[#aaaaaa]">Loading leads…</p>
            </div>
          ) : leadsError ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-red-500">{leadsError}</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm py-16 px-6 border-2 border-dashed border-[#e0e0e0] rounded-2xl bg-white shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-[#aaaaaa]">
                  {Icon.leads}
                </div>
                <p className="text-sm font-semibold text-[#333333]">No leads yet</p>
                <p className="text-xs text-[#aaaaaa] mt-1 leading-relaxed">
                  Leads will appear here once someone<br/>downloads a design from the AR visualizer.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f9fafb] text-[#888888] text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Downloads</th>
                    <th className="px-4 py-3">Last Seen</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead._id} className="border-t border-[#f0f0f0] hover:bg-[#fafafa]">
                      <td className="px-4 py-3 font-medium text-[#111111]">{lead.name}</td>
                      <td className="px-4 py-3">{lead.phone}</td>
                       <td className="px-4 py-3 text-[#0b9e7a]">{lead.email || '—'}</td>
                      <td className="px-4 py-3">{lead.productName || '—'}</td>
                      <td className="px-4 py-3">{lead.downloadCount || 1}</td>
                      <td className="px-4 py-3">
                        {new Date(lead.lastSeenAt || lead.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize border-0 cursor-pointer outline-none ${statusColors[lead.status] || statusColors.new}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
