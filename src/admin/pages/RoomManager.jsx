// RoomManager.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UploadRoomModal from '../components/UploadRoomModal';
import BulkUploadRoomModal from '../components/BulkUploadRoomModal';
import RoomDetail from './RoomDetail';
import DeleteRoomModal from '../components/DeleteProductModal'; // Import the new clear delete handler component

const Icon = {
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  photo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  stack: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  upload: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  
  // Clean, scalable inline icons matching ProductManager specs
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
};

const navItems = [
  { label: 'Overview', icon: 'grid', key: 'overview', path: '/admin', group: null },
  { label: 'Room images', icon: 'photo', key: 'rooms', path: '/admin/rooms', group: 'MANAGE' },
  { label: 'Tile products', icon: 'stack', key: 'products', path: '/admin/products', group: null },
  { label: 'Admin users', icon: 'users', key: 'users', path: '/admin/sidebar', group: 'SETTINGS' },
  { label: 'Settings', icon: 'settings', key: 'settings', path: '/admin/settings', group: null },
];

function LiveToggle({ isLive, onToggle, loading }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-[11px] font-semibold shadow-sm border transition-all duration-200 cursor-pointer select-none ${loading ? 'opacity-50 cursor-not-allowed' : ''
        } ${isLive ? 'bg-[#0b9e7a] text-white border-[#0b9e7a]' : 'bg-white text-[#999999] border-[#dddddd]'}`}
    >
      <span>{isLive ? 'Live' : 'Hidden'}</span>
      <span className={`relative inline-flex w-8 h-4 rounded-full transition-colors duration-200 ${isLive ? 'bg-white/30' : 'bg-[#e0e0e0]'}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full shadow transition-all duration-200 ${isLive ? 'left-[18px] bg-white' : 'left-0.5 bg-white'}`} />
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function RoomManager() {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [roomDetailMode, setRoomDetailMode] = useState('view'); // tracks 'view' | 'edit' structure
  const [roomToDelete, setRoomToDelete] = useState(null);       // references decoupled modular deletion target
  
  const [activeTab, setActiveTab] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState(null);   
  const [togglingCat, setTogglingCat] = useState(null);   
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const activePage = navItems.find(item => item.path === location.pathname)?.key || 'rooms';

  async function fetchRoomsData() {
    setLoading(true);
    try {
      const response = await fetch('https://wonderfloor-dashboard.vercel.app/rooms');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setRooms(data.map(r => ({ ...r, isLive: r.isLive === true })));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRoomsData(); }, []);

  /* ── helper hooks for workspace context state changes ── */
  function openRoomDetail(id) { setSelectedRoomId(id); setRoomDetailMode('view'); }
  function openRoomEdit(id, e) { e?.stopPropagation(); setSelectedRoomId(id); setRoomDetailMode('edit'); }
  function closeRoomDetail()    { setSelectedRoomId(null); setRoomDetailMode('view'); }

  // ── Per-card toggle ──
  async function handleToggleLive(e, roomId) {
    e.stopPropagation();
    setTogglingId(roomId);
    try {
      const res = await fetch(`https://wonderfloor-dashboard.vercel.app/rooms/${roomId}/toggle-live`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Toggle failed');
      const updated = await res.json();
      setRooms(prev =>
        prev.map(r => r._id === roomId ? { ...r, isLive: updated.isLive } : r)
      );
    } catch {
      alert('Could not update live status');
    } finally {
      setTogglingId(null);
    }
  }

  // ── Category-level bulk toggle ──
  async function handleToggleCategory(e, categoryName) {
    e.stopPropagation();
    const categoryRooms = rooms.filter(r => r.category === categoryName);
    const anyLive = categoryRooms.some(r => r.isLive);
    const nextState = !anyLive;

    setTogglingCat(categoryName);
    try {
      const res = await fetch('http://localhost:8000/rooms/bulk-toggle-live', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryName, isLive: nextState }),
      });
      if (!res.ok) throw new Error('Bulk toggle failed');
      setRooms(prev =>
        prev.map(r => r.category === categoryName ? { ...r, isLive: nextState } : r)
      );
    } catch {
      alert('Could not update category live status');
    } finally {
      setTogglingCat(null);
    }
  }

  // ── Derived values ──
  const dynamicCategories = ['All', ...Array.from(
    new Set(
      rooms
        .map(r => r.category?.replace(' Flooring', '').trim())
        .filter(Boolean)
    )
  ).sort()];

  const filteredRooms = activeTab === 'All'
    ? rooms
    : rooms.filter(room => room.category && room.category.includes(activeTab));

  const getCount = (cat) =>
    cat === 'All'
      ? rooms.length
      : rooms.filter(r => r.category && r.category.includes(cat)).length;

  const getLiveCount = (cat) =>
    rooms.filter(r => r.category && r.category.includes(cat) && r.isLive).length;

  const isCategoryFullyLive = (cat) => {
    const catRooms = rooms.filter(r => r.category && r.category.includes(cat));
    return catRooms.length > 0 && catRooms.every(r => r.isLive);
  };

  const isCategoryPartiallyLive = (cat) => {
    const catRooms = rooms.filter(r => r.category && r.category.includes(cat));
    return catRooms.some(r => r.isLive) && !catRooms.every(r => r.isLive);
  };

  const SidebarContent = (
    <>
      <div className="px-5 pt-5 pb-[18px] border-b border-[#e8e8e8] flex items-center justify-between">
        <div>
          <div className="text-[17px] font-semibold text-[#111111] tracking-tight">Wonderfloor</div>
          <div className="text-xs text-[#aaaaaa] mt-0.5">Admin panel</div>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-[#aaaaaa] hover:text-[#333] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
        >
          {Icon.close}
        </button>
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
                onClick={() => { navigate(item.path); setIsMobileSidebarOpen(false); }}
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

      <div className="px-5 pt-3.5 pb-[18px] border-t border-[#e8e8e8]">
        <div className="text-[11px] text-[#aaaaaa]">Logged in as</div>
        <div className="text-[13px] font-medium text-[#333333] mt-0.5">Admin</div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full font-sans bg-[#f4f4f5] text-[#111111] overflow-hidden">

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-[220px] bg-white border-r border-[#e8e8e8] flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shrink-0
      `}>
        {SidebarContent}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-[58px] border-b border-[#e8e8e8] flex items-center justify-between px-4 md:px-7 shrink-0 bg-white gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-[#888] hover:text-[#333] hover:bg-[#f5f5f5] transition-colors cursor-pointer shrink-0"
            >
              {Icon.menu}
            </button>
            <h1 className="text-base font-medium text-[#111111] truncate">Room images</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-[#e0e0e0] text-[#555] px-3 md:px-4 py-2 rounded-lg transition-colors cursor-pointer text-xs md:text-sm font-medium shrink-0 whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="hidden sm:inline">Bulk via Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#0b9e7a] hover:bg-[#09866a] text-white px-3 md:px-4 py-2 rounded-lg transition-colors cursor-pointer text-xs md:text-sm font-medium shadow-sm shrink-0 whitespace-nowrap"
            >
              {Icon.upload}
              <span className="hidden sm:inline">Upload new room</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 md:px-7">
          <p className="text-sm text-[#aaaaaa] mb-4 md:mb-5">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} in library
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {dynamicCategories.map((category) => {
              const isAll = category === 'All';
              const isActive = activeTab === category;
              const fullCat = rooms.find(r => r.category?.replace(' Flooring', '').trim() === category)?.category || category;

              const fullyLive = !isAll && isCategoryFullyLive(fullCat);
              const partialLive = !isAll && isCategoryPartiallyLive(fullCat);
              const liveCount = !isAll ? getLiveCount(fullCat) : null;

              return (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${isActive
                      ? 'bg-[#0b9e7a] text-white border border-[#0b9e7a] shadow-sm'
                      : 'bg-white border border-[#e0e0e0] text-[#666666] hover:border-[#aaaaaa] hover:text-[#111111]'
                    }`}
                >
                  {category}
                  <span className={`text-[11px] ${isActive ? 'opacity-80' : 'text-[#aaaaaa]'}`}>
                    {getCount(category)}
                  </span>

                  {!isAll && (
                    <span
                      title={`${liveCount} of ${getCount(category)} live`}
                      className={`w-1.5 h-1.5 rounded-full ${fullyLive ? 'bg-emerald-400' : partialLive ? 'bg-amber-400' : 'bg-[#cccccc]'}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="min-h-[32px] mb-4 md:mb-6">
            {activeTab !== 'All' && (() => {
              const fullCat = rooms.find(r => r.category?.replace(' Flooring', '').trim() === activeTab)?.category || activeTab;
              const fullyLive = isCategoryFullyLive(fullCat);
              const partialLive = isCategoryPartiallyLive(fullCat);
              const liveCount = getLiveCount(fullCat);

              return (
                <button
                  title={fullyLive ? `Turn off all ${activeTab} rooms` : `Turn on all ${activeTab} rooms`}
                  disabled={togglingCat === fullCat}
                  onClick={(e) => handleToggleCategory(e, fullCat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer whitespace-nowrap w-fit ${togglingCat === fullCat ? 'opacity-50 cursor-not-allowed' : ''
                    } ${fullyLive ? 'bg-[#edf9f5] text-[#0b9e7a] border-[#0b9e7a]' : partialLive ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-white text-[#aaaaaa] border-[#e0e0e0] hover:border-[#0b9e7a] hover:text-[#0b9e7a]'}`}
                >
                  <span className={`relative inline-flex w-7 h-3.5 rounded-full transition-colors duration-200 ${fullyLive ? 'bg-[#0b9e7a]' : partialLive ? 'bg-amber-400' : 'bg-[#e0e0e0]'}`}>
                    <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-all duration-200 ${fullyLive ? 'left-[13px]' : 'left-0.5'}`} />
                  </span>
                  <span>
                    {fullyLive ? `All ${activeTab} live` : partialLive ? `${liveCount} ${activeTab} live` : `All ${activeTab} off`}
                  </span>
                </button>
              );
            })()}
          </div>

          {loading ? (
            <div className="text-center py-24 text-[#aaaaaa] text-sm bg-white rounded-xl border border-[#e8e8e8]">
              <svg className="mx-auto mb-3 opacity-30 animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Loading rooms from database...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-16 md:py-24 text-[#aaaaaa] border-2 border-dashed border-[#e0e0e0] rounded-2xl bg-white">
              <svg className="mx-auto mb-3 opacity-30" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm font-medium text-[#888888]">No rooms found</p>
              <p className="text-xs text-[#aaaaaa] mt-1">Click "Upload new room" to add one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filteredRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => openRoomDetail(room._id)}
                  className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <div className="h-40 md:h-44 w-full overflow-hidden bg-[#f5f5f5] relative">
                    <img
                      src={room.previewUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-2.5 left-2.5" onClick={(e) => e.stopPropagation()}>
                      <LiveToggle
                        isLive={room.isLive}
                        loading={togglingId === room._id}
                        onToggle={(e) => handleToggleLive(e, room._id)}
                      />
                    </div>

                    {room.maskUrl && (
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold bg-white text-[#0b9e7a] border border-[#0b9e7a] px-2 py-0.5 rounded-full shadow-sm">
                        + mask
                      </span>
                    )}
                  </div>

                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <h3 className="text-[14px] font-bold text-gray-800 leading-tight truncate mb-1" title={room.name}>
                      {room.name}
                    </h3>
                    <span className="w-fit inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f0f0f0] text-[#666666] truncate max-w-full">
                      {room.category}
                    </span>

                    {/* DYNAMIC SMARTER ACTION ROW: Symmetrical to your Product catalogue setup */}
                    <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex items-center justify-between">
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${room.isLive ? 'text-[#0b9e7a]' : 'text-[#cccccc]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${room.isLive ? 'bg-[#0b9e7a] animate-pulse' : 'bg-[#dddddd]'}`} />
                        {room.isLive ? 'Live' : 'Off'}
                      </span>
                      
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={(e) => openRoomEdit(room._id, e)}
                          className="text-[#aaaaaa] hover:text-[#0b9e7a] bg-[#f8f8f8] hover:bg-[#edf9f5] rounded-md p-1.5 transition-colors cursor-pointer"
                          title="Edit Layout Details"
                        >
                          {Icon.edit}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomToDelete(room);
                          }}
                          className="text-[#aaaaaa] hover:text-red-500 bg-[#f8f8f8] hover:bg-red-50 rounded-md p-1.5 transition-colors cursor-pointer"
                          title="Permanently Delete Layout"
                        >
                          {Icon.trash}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ═══════════ MODALS ═══════════ */}
      {isModalOpen && (
        <UploadRoomModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { fetchRoomsData(); setIsModalOpen(false); }}
        />
      )}
      
      {selectedRoomId && (
        <RoomDetail
          roomId={selectedRoomId}
          initialMode={roomDetailMode}
          onClose={closeRoomDetail}
        />
      )}
       
      {isBulkModalOpen && (
        <BulkUploadRoomModal
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={() => { fetchRoomsData(); setIsBulkModalOpen(false); }}
        />
      )}

      {/* NEW Decoupled Delete Modal context rendering loop */}
      {roomToDelete && (
        <DeleteRoomModal
          room={roomToDelete}
          onClose={() => setRoomToDelete(null)}
          onSuccess={() => {
            setRoomToDelete(null);
            fetchRoomsData(); // Refresh room grid structures automatically
          }}
        />
      )}
    </div>
  );
}
