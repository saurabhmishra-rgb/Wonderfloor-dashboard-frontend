// Overview.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UploadRoomModal from '../components/UploadRoomModal';
import UploadTileModal from '../components/UploadTileModal';
import AdminSidebar from '../components/AdminSidebar';

const Icon = {
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  photo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  stack: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  upload: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  plus: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  menu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  list_view: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  grid_view: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const ITEMS_PER_PAGE = 15;

const navItems = [
  { label: 'Dashboard Overview', icon: 'grid', key: 'overview', path: '/admin', group: null },
  { label: 'Demo Rooms', icon: 'photo', key: 'rooms', path: '/admin/rooms', group: 'MANAGE' },
  { label: 'Flooring Products', icon: 'stack', key: 'products', path: '/admin/products', group: null },
  // { label: 'Admin users',        icon: 'users',    key: 'users',    path: '/admin/sidebar',  group: 'SETTINGS' },
  { label: 'Settings', icon: 'settings', key: 'settings', path: '/admin/settings', group: null },
];

export default function Overview() {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isTileModalOpen, setIsTileModalOpen] = useState(false);
  const [isAdminSidebar, setIsAdminSidebar] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  // ── Pagination states ──
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploadLimit, setUploadLimit] = useState(ITEMS_PER_PAGE);
  const [hasMore, setHasMore] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    stats: { totalRooms: 0, totalProducts: 0, totalRecords: 0 },
    recentUploads: [],
  });

  const navigate = useNavigate();
  const location = useLocation();
  const activePage = navItems.find(item => item.path === location.pathname)?.key || 'overview';

  // ── Fetch with limit ──
  async function fetchDashboardStats(limit = ITEMS_PER_PAGE, isLoadMore = false) {
    isLoadMore ? setLoadingMore(true) : setLoading(true);
    try {
      const response = await fetch(`https://wonderfloor-dashboard.vercel.app/dashboard-stats?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        // If the API returned fewer items than requested, there's nothing more to load
        setHasMore(data.recentUploads.length === limit);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      isLoadMore ? setLoadingMore(false) : setLoading(false);
    }
  }

  // ── Load more handler ──
  function handleLoadMore() {
    const newLimit = uploadLimit + ITEMS_PER_PAGE;
    setUploadLimit(newLimit);
    fetchDashboardStats(newLimit, true);
  }

  useEffect(() => {
    fetchDashboardStats(uploadLimit);
  }, []);

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
            <img
              src="https://www.wonderfloor.co.in/assets/img/logo/logo.png"
              alt="Logo"
              className="h-8 max-w-[150px] md:max-w-[180px] object-contain"
            />
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
                  onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-2.5 w-full px-5 py-[9px] border-l-2 text-[13px] text-left transition-all duration-150 cursor-pointer group ${isActive
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

        <div className="px-5 pt-3.5 pb-[18px] border-t border-[#e8e8e8] flex justify-between items-center">
          <div>
            <div className="text-[11px] text-[#aaaaaa]">Logged in as</div>
            <div className="text-[13px] font-medium text-[#333333] mt-0.5">Admin</div>
          </div>

          {/* 👇 YOUR LOGOUT BUTTON 👇 */}
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
        <header className="h-auto md:h-[58px] py-4 md:py-0 border-b border-[#e8e8e8] flex flex-col md:flex-row md:items-center justify-between px-4 md:px-7 shrink-0 bg-white gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-[#111111] p-1 -ml-1 rounded-md hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              {Icon.menu}
            </button>
            <h1 className="text-base font-medium text-[#111111] m-0">Dashboard Overview</h1>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setIsRoomModalOpen(true)}
              className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-4 py-[7px] bg-transparent border border-[#e0e0e0] rounded-lg text-[#555555] text-[13px] font-medium transition-all duration-150 hover:border-[#aaaaaa] hover:text-[#111111]"
            >
              {Icon.upload} Add Demo Room
            </button>
            <button
              onClick={() => setIsTileModalOpen(true)}
              className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-4 py-[7px] bg-[#0b9e7a] border border-[#0b9e7a] rounded-lg text-white text-[13px] font-medium transition-all duration-150 hover:bg-[#09866a] hover:border-[#09866a]"
            >
              {Icon.plus} Add Flooring Product
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 md:px-7">

          {/* ── METRIC CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-7">

            {/* Total Rooms */}
            <div className="bg-white border border-[#e8e8e8] rounded-xl px-5 py-[18px] shadow-sm">
              <div className="text-xs text-[#888888] mb-2 leading-tight">Total rooms</div>
              {loading ? (
                <div className="h-7 w-16 bg-gray-200 rounded animate-pulse my-0.5" />
              ) : (
                <div className="text-[28px] font-semibold text-[#111111] leading-none mb-1.5">{dashboardData.stats.totalRooms}</div>
              )}
              <div className="text-[11px] text-[#aaaaaa]">Saved in database</div>
            </div>

            {/* Tile Products */}
            <div className="bg-white border border-[#e8e8e8] rounded-xl px-5 py-[18px] shadow-sm">
              <div className="text-xs text-[#888888] mb-2 leading-tight">Flooring Products</div>
              {loading ? (
                <div className="h-7 w-16 bg-gray-200 rounded animate-pulse my-0.5" />
              ) : (
                <div className="text-[28px] font-semibold text-[#111111] leading-none mb-1.5">{dashboardData.stats.totalProducts}</div>
              )}
              <div className="text-[11px] text-[#aaaaaa]">Active Products</div>
            </div>

            {/* All Images */}
            <div className="bg-white border border-[#e8e8e8] rounded-xl px-5 py-[18px] shadow-sm sm:col-span-2 md:col-span-1">
              <div className="text-xs text-[#888888] mb-2 leading-tight">All Images</div>
              {loading ? (
                <div className="h-7 w-16 bg-gray-200 rounded animate-pulse my-0.5" />
              ) : (
                <div className="text-[28px] font-semibold text-[#111111] leading-none mb-1.5">{dashboardData.stats.totalRecords}</div>
              )}
              <div className="text-[11px] text-[#aaaaaa]">Synced with database</div>
            </div>
          </div>

          {/* ── RECENT UPLOADS ── */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-sm">

            {/* Header & View Toggle */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-5 py-4 border-b border-[#f0f0f0] gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#111111]">Recent uploads</span>
                {/* Live count badge */}
                {!loading && (
                  <span className="text-[11px] font-medium text-[#888888] bg-[#f4f4f5] px-2 py-0.5 rounded-full">
                    {dashboardData.recentUploads.length} shown
                  </span>
                )}
                {loading && (
                  <span className="text-[10px] text-[#0b9e7a] font-medium animate-pulse">Syncing…</span>
                )}
              </div>

              <div className="flex bg-[#f4f4f5] p-1 rounded-lg w-fit">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#111111]' : 'text-[#888888] hover:text-[#111111]'}`}
                  title="List View"
                >
                  {Icon.list_view}
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#111111]' : 'text-[#888888] hover:text-[#111111]'}`}
                  title="Grid View"
                >
                  {Icon.grid_view}
                </button>
              </div>
            </div>

            {/* Empty state */}
            {dashboardData.recentUploads.length === 0 && !loading && (
              <div className="p-8 text-center text-[#aaaaaa] text-sm">No recent uploads found.</div>
            )}

            {/* ── LIST VIEW ── */}
            {viewMode === 'list' && (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Table header */}
                  <div className="grid grid-cols-[2fr_2fr_80px_160px_100px] px-5 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
                    {['Image', 'Filename', 'Type', 'Category', 'Status'].map(h => (
                      <div key={h} className="text-xs text-[#aaaaaa] font-medium">{h}</div>
                    ))}
                  </div>

                  {/* Skeleton rows */}
                  {loading ? (
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-[2fr_2fr_80px_160px_100px] px-5 py-3.5 items-center border-b border-[#f0f0f0] animate-pulse"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-md bg-gray-200 shrink-0" />
                          <div className="h-3.5 bg-gray-200 rounded w-28" />
                        </div>
                        <div className="h-3 bg-gray-100 rounded w-36" />
                        <div className="h-3.5 bg-gray-200 rounded w-10" />
                        <div className="h-5 bg-gray-200 rounded-full w-24" />
                        <div className="h-5 bg-gray-200 rounded-full w-16" />
                      </div>
                    ))
                  ) : (
                    dashboardData.recentUploads.map((row, idx) => {
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
                    })
                  )}
                </div>
              </div>
            )}

            {/* ── GRID VIEW ── */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5 bg-[#fafafa]">
                {loading ? (
                  Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#e8e8e8] rounded-xl p-3 flex flex-col shadow-sm animate-pulse"
                    >
                      <div className="w-full aspect-video rounded-lg bg-gray-200 mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
                        <div className="h-4 bg-gray-200 rounded-full w-16" />
                        <div className="h-4 bg-gray-200 rounded-full w-12" />
                      </div>
                    </div>
                  ))
                ) : (
                  dashboardData.recentUploads.map((row) => {
                    const typeColor = row.type === 'Room'
                      ? 'bg-[#e8f1ff] text-[#3b82f6]'
                      : 'bg-[#f3eeff] text-[#8b5cf6]';

                    return (
                      <div key={row.id} className="bg-white border border-[#e8e8e8] rounded-xl p-3 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full aspect-video rounded-lg border border-[#e8e8e8] overflow-hidden bg-[#f5f5f5] mb-3 relative">
                          <img src={row.thumb} alt={row.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm">
                            {row.type}
                          </span>
                        </div>
                        <span className="text-[14px] text-[#111111] font-semibold truncate mb-1" title={row.name}>{row.name}</span>
                        <span className="text-[11px] text-[#aaaaaa] font-mono truncate mb-3" title={row.file}>{row.file}</span>
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
                          <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium truncate max-w-[100px] ${typeColor}`}>
                            {row.category}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-[#e6f9f0] text-[#16a34a]">
                            <span className="w-1 h-1 rounded-full shrink-0 bg-[#16a34a]" /> Live
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── LOAD MORE / END OF LIST ── */}
            {!loading && dashboardData.recentUploads.length > 0 && (
              <div className="flex items-center justify-center px-5 py-4 border-t border-[#f0f0f0]">
                {hasMore ? (
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-5 py-2 bg-[#f4f4f5] hover:bg-[#ebebeb] border border-[#e0e0e0] rounded-lg text-[13px] font-medium text-[#555555] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Loading…
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        Load more  ({dashboardData.recentUploads.length} loaded so far)
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[12px] text-[#aaaaaa]">
                    {/* ✓ All {dashboardData.recentUploads.length} uploads shown */}
                  </span>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── MODALS ── */}
      {isRoomModalOpen && (
        <UploadRoomModal
          onClose={() => setIsRoomModalOpen(false)}
          onSuccess={() => { fetchDashboardStats(uploadLimit); setIsRoomModalOpen(false); }}
        />
      )}

      {isTileModalOpen && (
        <UploadTileModal
          onClose={() => setIsTileModalOpen(false)}
          onSuccess={() => { fetchDashboardStats(uploadLimit); setIsTileModalOpen(false); }}
        />
      )}

      {isAdminSidebar && <AdminSidebar onClose={() => setIsAdminSidebar(false)} />}
    </div>
  );
}
