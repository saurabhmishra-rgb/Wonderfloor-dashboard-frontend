// RoomManager.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadRoomModal from '../components/UploadRoomModal';
import BulkUploadRoomModal from '../components/BulkUploadRoomModal';
import RoomDetail from './RoomDetail';
import DeleteRoomModal from '../components/DeleteProductModal'; // Import the new clear delete handler component
import { useSearch } from '../components/SearchContext'; // <-- Import the search context hook
import GlobalSearch from '../components/GlobalSearch'; // If you want to show it in the header
// Top par custom hook aur input component import karein
import { useRoomSort } from '../../hooks/useRoomSort';
import { useCategorySort } from '../../hooks/useRoomCategorySort';
import PositionInput from '../components/RoomPositionInput';
import CategoryPositionInput from '../components/CategoryPositionInput';
import RoomSortPanel from '../components/RoomSortPanel';
import Sidebar from '../components/Sidebar';


const Icon = {
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  upload: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  leads: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M15 9h3M15 13h3M6.5 16c.5-1.5 1.7-2.3 2.5-2.3s2 .8 2.5 2.3" />
  </svg>,
};

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

export default function RoomManager() {
  const { searchQuery } = useSearch();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [roomDetailMode, setRoomDetailMode] = useState('view');
  const [roomToDelete, setRoomToDelete] = useState(null);

  const [activeTab, setActiveTab] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [togglingCat, setTogglingCat] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const { handleCategoryTierShift, getUniqueCategories } = useCategorySort(rooms, setRooms, fetchRoomsData);
  const [showCatSettings, setShowCatSettings] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');

  const navigate = useNavigate();

  async function fetchRoomsData() {
    setLoading(true);
    try {
      const response = await fetch('https://wonderfloor-dashboard.vercel.app/rooms');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();

      // Backend se sorted data aa raha hai, use seedhe state mein set karein
      setRooms(data.map(r => ({ ...r, isLive: r.isLive === true })));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRoomsData(); }, []);

  function openRoomDetail(id) { setSelectedRoomId(id); setRoomDetailMode('view'); }
  function openRoomEdit(id, e) { e?.stopPropagation(); setSelectedRoomId(id); setRoomDetailMode('edit'); }
  function closeRoomDetail() { setSelectedRoomId(null); setRoomDetailMode('view'); }

  async function handleRenameCategory(oldFullCat, newName) {
    const trimmed = newName.trim();
    setEditingCategory(null);
    if (!trimmed || trimmed === oldFullCat) return;

    const catRooms = rooms.filter(r => r.category === oldFullCat);
    await Promise.all(
      catRooms.map(r =>
        fetch(`https://wonderfloor-dashboard.vercel.app/rooms/${r._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: trimmed }),
        })
      )
    );
    setRooms(prev =>
      prev.map(r => r.category === oldFullCat ? { ...r, category: trimmed } : r)
    );
    setActiveTab(trimmed);
  }

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

  async function handleToggleCategory(e, categoryName) {
    e.stopPropagation();
    const categoryRooms = rooms.filter(r => r.category === categoryName);
    const anyLive = categoryRooms.some(r => r.isLive);
    const nextState = !anyLive;

    setTogglingCat(categoryName);
    try {
      const res = await fetch('https://wonderfloor-dashboard.vercel.app/rooms/bulk-toggle-live', {
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

  // ✅ Corrected: Array ka natural order maintain rehne dein jo sorted rooms se aa raha hai
  const dynamicCategories = ['All', ...Array.from(
    new Set(
      rooms
        .map(r => r.category?.replace(' Flooring', '').trim())
        .filter(Boolean)
    )
  )];

  const categoryFiltered = activeTab === 'All'
    ? rooms
    : rooms.filter(room => room.category === activeTab);

  const filteredRooms = categoryFiltered.filter(room => {
    const query = searchQuery.toLowerCase();
    return (
      room.name?.toLowerCase().includes(query) ||
      room.category?.toLowerCase().includes(query)
    );
  });

  // Apne component ke state ke just neeche is hook ko call karein
  const { handleManualPositionChange, handleSaveSelectedOrder } = useRoomSort(rooms, setRooms, filteredRooms, fetchRoomsData);
  // 🆕 Selection mode ke liye state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  // const [selectedIds, setSelectedIds] = useState([]);
  const [showSortPanel, setShowSortPanel] = useState(false);

  function toggleSelectMode() {
    setSelectMode(prev => !prev);
    setSelectedIds([]);
  }

  function toggleRoomSelect(id) {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        // pehle se selected hai → remove karo
        return prev.filter(sid => sid !== id);
      }
      // naya select → end mein add karo (isse number badhta jaayega)
      return [...prev, id];
    });
  }
  const getCount = (cat) =>
    cat === 'All'
      ? rooms.length
      : rooms.filter(r => r.category === cat).length;

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
  return (
    <div className="flex h-screen w-full font-sans bg-[#f4f4f5] text-[#111111] overflow-hidden">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

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
          <GlobalSearch />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleSelectMode}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg transition-colors cursor-pointer text-xs md:text-sm font-medium shrink-0 whitespace-nowrap border ${selectMode
                ? 'bg-[#0b9e7a] text-white border-[#0b9e7a]'
                : 'bg-white text-[#555] border-[#e0e0e0] hover:bg-slate-50'
                }`}
            >
              {selectMode ? `Cancel (${selectedIds.size})` : 'Select'}
            </button>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-[#e0e0e0] text-[#555] px-3 md:px-4 py-2 rounded-lg transition-colors cursor-pointer text-xs md:text-sm font-medium shrink-0 whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="hidden sm:inline">Bulk Upload</span>
              {/* <span className="sm:hidden">Excel</span> */}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#0b9e7a] hover:bg-[#09866a] text-white px-3 md:px-4 py-2 rounded-lg transition-colors cursor-pointer text-xs md:text-sm font-medium shadow-sm shrink-0 whitespace-nowrap"
            >
              {Icon.upload}
              <span className="hidden sm:inline">Add Demo Room</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 md:px-7">
          <p className="text-sm text-[#aaaaaa] mb-4 md:mb-5">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} in library
          </p>
          {/* 🎛️ CATEGORY ORDER CONTROL WRAPPER PANEL */}
          <div className="mb-5 bg-white border border-[#e8e8e8] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowCatSettings(!showCatSettings)}>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="18" y2="18" />
                </svg>
                <span>Configure Industry Tab Sequences</span>
              </div>
              <span className="text-xs text-[#0b9e7a] font-bold select-none">
                {showCatSettings ? 'Hide Settings ▲' : 'Configure Order ▼'}
              </span>
            </div>

            {showCatSettings && (
              <div className="mt-4 pt-3 border-t border-dashed border-[#e8e8e8] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {getUniqueCategories().map((catName) => (
                  <CategoryPositionInput
                    key={catName}
                    catName={catName}
                    currentIndex={getUniqueCategories().indexOf(catName)}
                    totalItems={getUniqueCategories().length}
                    onOrderChange={handleCategoryTierShift}
                  />
                ))}
              </div>
            )}
            {/* 🔥 UPDATED BLOCK END */}

          </div>

          {/* 🏷️ Existing Category filter tabs layout row */}
          <div className="flex flex-wrap gap-2 mb-3">
            {dynamicCategories.map((category) => {
              const isAll = category === 'All';
              const fullCat = rooms.find(r => r.category?.replace(' Flooring', '').trim() === category)?.category || category;
              const isActive = isAll ? activeTab === 'All' : activeTab === fullCat;

              const fullyLive = !isAll && isCategoryFullyLive(fullCat);
              const partialLive = !isAll && isCategoryPartiallyLive(fullCat);
              const liveCount = !isAll ? getLiveCount(fullCat) : null;
              const isEditing = editingCategory === fullCat;

              return (
                <div key={category} className="relative flex items-center">
                  <button
                    onClick={() => setActiveTab(isAll ? 'All' : fullCat)}
                    className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${isActive
                      ? 'bg-[#0b9e7a] text-white border border-[#0b9e7a] shadow-sm'
                      : 'bg-white border border-[#e0e0e0] text-[#666666] hover:border-[#aaaaaa] hover:text-[#111111]'
                      }`}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingCategoryValue}
                        onChange={e => setEditingCategoryValue(e.target.value)}
                        onBlur={() => handleRenameCategory(fullCat, editingCategoryValue)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameCategory(fullCat, editingCategoryValue);
                          if (e.key === 'Escape') setEditingCategory(null);
                        }}
                        onClick={e => e.stopPropagation()}
                        // conditionally apply text and border colors based on isActive
                        className={`bg-transparent focus:outline-none border-b w-20 transition-colors ${isActive
                          ? 'border-white/60 focus:border-white text-white placeholder-white/60'
                          : 'border-[#cccccc] focus:border-[#0b9e7a] text-[#111111] placeholder-[#aaaaaa]'
                          }`}
                      />
                    ) : (
                      <span>{category}</span>
                    )}

                    <span className={`text-[11px] ${isActive ? 'opacity-80' : 'text-[#aaaaaa]'}`}>
                      {getCount(isAll ? 'All' : fullCat)}
                    </span>

                    {!isAll && (
                      <span
                        title={`${liveCount} of ${getCount(fullCat)} live`}
                        className={`w-1.5 h-1.5 rounded-full ${fullyLive ? 'bg-emerald-400' : partialLive ? 'bg-amber-400' : 'bg-[#cccccc]'}`}
                      />
                    )}
                  </button>

                  {!isAll && !isEditing && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setEditingCategory(fullCat);
                        setEditingCategoryValue(fullCat);
                      }}
                      className="ml-1 p-1 rounded-md text-[#cccccc] hover:text-[#0b9e7a] hover:bg-white transition-colors"
                      title="Rename category"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                </div>
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
              {filteredRooms.map((room, index) => ( // 👈 Yahan '=> (' lagana zaroori tha
                <div
                  key={room._id}
                  onClick={() => selectMode ? toggleRoomSelect(room._id) : openRoomDetail(room._id)}
                  className={`bg-white border rounded-xl overflow-hidden flex flex-col group shadow-sm transition-all duration-200 cursor-pointer ${selectMode && selectedIds.includes(room._id)
                    ? 'border-[#0b9e7a] ring-2 ring-[#0b9e7a]/30'
                    : 'border-[#e8e8e8] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                    }`}
                >
                  <div className="h-40 md:h-44 w-full overflow-hidden bg-[#f5f5f5] relative">
                    <img
                      src={room.previewUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {selectMode ? (
                      <div className="absolute top-2.5 left-2.5 z-10" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const selectionIndex = selectedIds.indexOf(room._id); // -1 agar select nahi hai
                          const isSelected = selectionIndex !== -1;
                          return (
                            <button
                              onClick={() => toggleRoomSelect(room._id)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 transition-all duration-150 cursor-pointer ${isSelected
                                ? 'bg-[#0b9e7a] text-white border-[#0b9e7a]'
                                : 'bg-white/90 text-transparent border-[#cccccc] hover:border-[#0b9e7a]'
                                }`}
                            >
                              {isSelected ? selectionIndex + 1 : ''}
                            </button>
                          );
                        })()}
                      </div>
                    ) : (
                      <>
                        <PositionInput
                          roomId={room._id}
                          currentIndex={index}
                          totalItems={filteredRooms.length}
                          onPositionChange={handleManualPositionChange}
                        />
                        <div className="absolute top-2.5 left-2.5" onClick={(e) => e.stopPropagation()}>
                          <LiveToggle
                            isLive={room.isLive}
                            loading={togglingId === room._id}
                            onToggle={(e) => handleToggleLive(e, room._id)}
                          />
                        </div>
                      </>
                    )}

                    {room.maskUrl && (
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold bg-white text-[#0b9e7a] border border-[#0b9e7a] px-2 py-0.5 rounded-full shadow-sm">
                        + mask
                      </span>
                    )}
                  </div>
                  {/* baaki card content same rahega */}

                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <h3 className="text-[14px] font-bold text-gray-800 leading-tight truncate mb-1" title={room.name}>
                      {room.name}
                    </h3>
                    <span className="w-fit inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f0f0f0] text-[#666666] truncate max-w-full">
                      {room.category}
                    </span>

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

      {roomToDelete && (
        <DeleteRoomModal
          room={roomToDelete}
          onClose={() => setRoomToDelete(null)}
          onSuccess={() => {
            setRoomToDelete(null);
            fetchRoomsData();
          }}
        />
      )}

      {/* 🆕 FLOATING BAR + SORT PANEL YAHA PASTE KIYA */}
      {selectMode && selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-[#e8e8e8] rounded-full px-4 py-2.5 flex items-center gap-3 z-50">
          <span className="text-xs font-medium text-gray-600">{selectedIds.length} selected</span>
          <button
            onClick={() => setShowSortPanel(true)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0b9e7a] text-white cursor-pointer hover:bg-[#09866a]"
          >
            Arrange Order
          </button>
        </div>
      )}

      {showSortPanel && (
        <RoomSortPanel
          rooms={selectedIds.map(id => filteredRooms.find(r => r._id === id)).filter(Boolean)}
          onSave={handleSaveSelectedOrder}
          onClose={() => {
            setShowSortPanel(false);
            setSelectMode(false);
            setSelectedIds([]); // Set() ki jagah empty array
          }}
        />
      )}
    </div>
  );
}
