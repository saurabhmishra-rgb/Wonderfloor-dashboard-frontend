// components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NODE_BACKEND_URL = 'https://wonderfloor-dashboard.vercel.app';
const LAST_SEEN_KEY = 'wf_lastSeenLeadCount';

const Icon = {
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  photo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  stack: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  leads: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M15 9h3M15 13h3M6.5 16c.5-1.5 1.7-2.3 2.5-2.3s2 .8 2.5 2.3" />
  </svg>,
    analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"> <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /> <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
};

//  Nav items ab SIRF yahan define hote hain — har page mein nahi
export const navItems = [
  { label: 'Dashboard Overview', icon: 'grid', key: 'overview', path: '/admin', group: null },
  { label: 'Demo Rooms', icon: 'photo', key: 'rooms', path: '/admin/rooms', group: 'MANAGE' },
  { label: 'Flooring Products', icon: 'stack', key: 'products', path: '/admin/products', group: null },
  { label: 'Leads', icon: 'leads', key: 'settings', path: '/admin/settings', group: null },
   { label: 'Analytics', icon: 'analytics', key: 'analytics', path: '/admin/analytics', group: null },
];

/**
 * Shared sidebar for all admin pages.
 * Props:
 *  - isMobileOpen: boolean — controls mobile slide-in
 *  - onCloseMobile: fn — called on close button / nav click / overlay click
 *
 * Naye leads ke liye red dot: Sidebar khud total lead count check karta hai
 * (kisi page se badge prop pass karne ki zaroorat nahi). localStorage mein
 * "last seen count" save hota hai — jab bhi utne se zyada leads ho jayein,
 * dot dikh jata hai. "Leads" pe click karte hi current count "seen" mark
 * ho jata hai aur dot gayab.
 */
export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activePage = navItems.find(item => item.path === location.pathname)?.key || '';

  const [totalLeads, setTotalLeads] = useState(0);
  const [hasNewLeads, setHasNewLeads] = useState(false);

  useEffect(() => {
    async function checkNewLeads() {
      try {
        const res = await fetch(`${NODE_BACKEND_URL}/leads`);
        const data = await res.json();
        if (data.success) {
          const count = data.leads.length;
          setTotalLeads(count);
          const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
          setHasNewLeads(count > lastSeen);
        }
      } catch (err) {
        console.error('Failed to check for new leads:', err);
      }
    }
    checkNewLeads();
  }, []);

  function handleNavClick(item) {
    navigate(item.path);
    onCloseMobile?.();
    // Leads pe click karte hi current count ko "seen" mark kar do
    if (item.key === 'settings') {
      localStorage.setItem(LAST_SEEN_KEY, totalLeads.toString());
      setHasNewLeads(false);
    }
  }

  return (
    <aside className={`
      fixed md:relative z-50 h-full w-[220px] shrink-0 bg-white border-r border-[#e8e8e8] flex flex-col
      transition-transform duration-300 ease-in-out
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
    `}>
      <div className="flex justify-between items-center px-5 pt-5 pb-[18px] border-b border-[#e8e8e8]">
        <img
          src="https://www.wonderfloor.co.in/assets/img/logo/logo.png"
          alt="Logo"
          className="h-8 max-w-[150px] md:max-w-[180px] object-contain"
        />
        <button className="md:hidden text-[#888888]" onClick={onCloseMobile}>
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
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-2.5 w-full px-5 py-[9px] border-l-2 text-[13px] text-left transition-all duration-150 cursor-pointer group ${
                  isActive
                    ? 'bg-[#edf9f5] border-[#0b9e7a] text-[#0b9e7a] font-medium'
                    : 'bg-transparent border-transparent text-[#888888] font-normal hover:text-[#333333] hover:bg-[#f5f5f5]'
                }`}
              >
                <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'}`}>
                  {Icon[item.icon]}
                </span>
                {item.label}
                {item.key === 'settings' && hasNewLeads && (
                  <span className="ml-auto w-2.5 h-2.5 bg-[#f05c3f] rounded-full shrink-0" title="New leads" />
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
  );
}
