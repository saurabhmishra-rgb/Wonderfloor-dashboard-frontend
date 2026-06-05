import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UploadRoomModal from '../components/UploadRoomModal';
import UploadTileModal from '../components/UploadTileModal';
import AdminSidebar from '../components/AdminSidebar';

const Icon = {
  grid:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  photo:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  stack:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  users:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  settings:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  upload:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  plus:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

const navItems = [
  { label: 'Overview',      icon: 'grid',    key: 'overview', path: '/admin',          group: null },
  { label: 'Room images',   icon: 'photo',    key: 'rooms',    path: '/admin/rooms',    group: 'MANAGE' },
  { label: 'Tile products', icon: 'stack',    key: 'products', path: '/admin/products', group: null },
  { label: 'Admin users',   icon: 'users',    key: 'users',    path: '/admin/sidebar',  group: 'SETTINGS' },
  { label: 'Settings',      icon: 'settings', key: 'settings', path: '/admin/settings', group: null },
];

export default function Overview() {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isTileModalOpen, setIsTileModalOpen] = useState(false);
  const [isAdminSidebar, setIsAdminSidebar] = useState(false);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: { totalRooms: 0, totalProducts: 0, totalRecords: 0 },
    recentUploads: [],
  });

  const navigate = useNavigate();
  const location = useLocation();
  const activePage = navItems.find(item => item.path === location.pathname)?.key || 'overview';

  async function fetchDashboardStats() {
    setLoading(true);
    try {
      // UPDATED TO POINT TO LIVE VERCEL BACKEND
      const response = await fetch('https://wonderfloor-dashboard.vercel.app/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="flex h-screen w-full font-sans bg-[#f4f4f5] text-[#111111] overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] shrink-0 bg-white border-r border-[#e8e8e8] flex flex-col">
        <div className="px-5 pt-5 pb-[18px] border-b border-[#e8e8e8]">
          <div className="text-[17px] font-semibold text-[#111111] tracking-tight">Wonderfloor</div>
          <div className="text-xs text-[#aaaaaa] mt-0.5">Admin panel</div>
        </div>

        <nav className="flex-1 py-3">
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
                  onClick={() => navigate(item.path)}
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
                </button>
              </div>
            );
          })}
        </nav>

        <div className="px-5 pt-3.5 pb-[18px] border-t border-[#e8e8e8]">
          <div className="text-[11px] text-[#aaaaaa]">Logged in as</div>
          <div className="text-[13px] font-medium text-[#333333] mt-0.5">Admin</div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-[58px] border-b border-[#e8e8e8] flex items-center justify-between px-7 shrink-0 bg-white">
          <h1 className="text-base font-medium text-[#111111] m-0">Overview</h1>
          <div className="flex gap-2.5">
            <button
              onClick={() => setIsRoomModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-[7px] bg-transparent border border-[#e0e0e0] rounded-lg text-[#555555] text-[13px] font-medium transition-all duration-150 cursor-pointer hover:border-[#aaaaaa] hover:text-[#111111]"
            >
              {Icon.upload} Upload room
            </button>
            <button
              onClick={() => setIsTileModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-[7px] bg-[#0b9e7a] border border-[#0b9e7a] rounded-lg text-white text-[13px] font-medium transition-all duration-150 cursor-pointer hover:bg-[#09866a] hover:border-[#09866a]"
            >
              {Icon.plus} Add tile
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-6 px-7">

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
            <div className="bg-white border border-[#e8e8e8] rounded-xl px-5 py-[18px] shadow-sm">
              <div className="text-xs text-[#888888] mb-2 leading-tight">Total rooms</div>
              <div className="text-[28px] font-semibold text-[#111111] leading-none mb-1.5">{dashboardData.stats.totalRooms}</div>
              <div className="text-[11px] text-[#aaaaaa]">Saved in database</div>
            </div>

            <div className="bg-white border border-[#e8e8e8] rounded-xl px-5 py-[18px] shadow-sm">
              <div className="text-xs text-[#888888] mb-2 leading-tight">Tile products</div>
              <div className="text-[28px] font-semibold text-[#111111] leading-none mb-1.5">{dashboardData.stats.totalProducts}</div>
              <div className="text-[11px] text-[#aaaaaa]">Active collections</div>
            </div>

            <div className="bg-white border border-[#e8e8e8] rounded-xl px-5 py-[18px] shadow-sm">
              <div className="text-xs text-[#888888] mb-2 leading-tight">Cloudinary Images</div>
              <div className="text-[28px] font-semibold text-[#111111] leading-none mb-1.5">{dashboardData.stats.totalRecords}</div>
              <div className="text-[11px] text-[#aaaaaa]">Synced with database</div>
            </div>

            <div className="bg-white border border-[#e8e8e8] rounded-xl px-5 py-[18px] shadow-sm">
              <div className="text-xs text-[#888888] mb-2 leading-tight">MongoDB records</div>
              <div className="text-[28px] font-semibold text-[#111111] leading-none mb-1.5">{dashboardData.stats.totalRecords}</div>
              <div className="text-[11px] text-[#aaaaaa]">512 MB Free Tier limit</div>
            </div>
          </div>

          {/* Recent uploads table */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-sm">
            <div className="flex justify-between items-center px-5 py-4 border-b border-[#f0f0f0]">
              <span className="text-sm font-medium text-[#111111]">Recent uploads</span>
              {loading && <span className="text-[10px] text-[#aaaaaa] animate-pulse">Syncing...</span>}
            </div>

            <div className="grid grid-cols-[2fr_2fr_80px_160px_100px] px-5 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
              {['Image', 'Filename', 'Type', 'Category', 'Status'].map(h => (
                <div key={h} className="text-xs text-[#aaaaaa] font-medium">{h}</div>
              ))}
            </div>

            {dashboardData.recentUploads.length === 0 && !loading && (
              <div className="p-8 text-center text-[#aaaaaa] text-sm">No recent uploads found.</div>
            )}

            {dashboardData.recentUploads.map((row, idx) => {
              const isLast = idx === dashboardData.recentUploads.length - 1;
              const typeColor = row.type === 'Room'
                ? 'bg-[#e8f1ff] text-[#3b82f6]'
                : 'bg-[#f3eeff] text-[#8b5cf6]';

              return (
                <div
                  key={row.id}
                  className={`grid grid-cols-[2fr_2fr_80px_160px_100px] px-5 py-3 items-center transition-colors duration-100 hover:bg-[#fafafa] cursor-default ${!isLast ? 'border-b border-[#f0f0f0]' : ''}`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-md shrink-0 border border-[#e8e8e8] overflow-hidden bg-[#f5f5f5]">
                      <img src={row.thumb} alt={row.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[13px] text-[#222222] font-medium truncate pr-2">{row.name}</span>
                  </div>

                  <div className="text-xs text-[#aaaaaa] font-mono truncate pr-4" title={row.file}>{row.file}</div>
                  <div className="text-[13px] text-[#666666]">{row.type}</div>

                  <div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium truncate max-w-[140px] ${typeColor}`}>
                      {row.category}
                    </span>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#e6f9f0] text-[#16a34a]">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#16a34a]" /> Live
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {isRoomModalOpen && (
        <UploadRoomModal
          onClose={() => setIsRoomModalOpen(false)}
          onSuccess={() => { fetchDashboardStats(); setIsRoomModalOpen(false); }}
        />
      )}

      {isTileModalOpen && (
        <UploadTileModal
          onClose={() => setIsTileModalOpen(false)}
          onSuccess={() => { fetchDashboardStats(); setIsTileModalOpen(false); }}
        />
      )}

      {isAdminSidebar && <AdminSidebar onClose={() => setIsAdminSidebar(false)} />}
    </div>
  );
}