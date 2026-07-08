// ProductManager.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UploadTileModal from '../components/UploadTileModal';
import BulkUploadModal from '../components/BulkUploadTile';
import ProductDetailModal from './ProductDetailModal';
import VisibilityToggle from '../components/VisibilityToggle';
import DeleteProductModal from '../components/DeleteProductModal';
import { useSearch } from '../components/SearchContext'; // <-- Import the search context hook
import { useDragToSwap } from '../../hooks/useDragToSwap'; // Paste whatever it gives you!
/* ─── icons ──────────────────────────────────────────────────────── */
const Icon = {
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  photo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  stack: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  plus: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  listView: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  gridView: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
  bulk: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
};

const navItems = [
  { label: 'Dashboard Overview', icon: 'grid', key: 'overview', path: '/admin', group: null },
  { label: 'Demo Rooms', icon: 'photo', key: 'rooms', path: '/admin/rooms', group: 'MANAGE' },
  { label: 'Flooring Products', icon: 'stack', key: 'products', path: '/admin/products', group: null },
  { label: 'Settings', icon: 'settings', key: 'settings', path: '/admin/settings', group: null },
];

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function ProductManager() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('All');

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isTileModalOpen, setIsTileModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [editingCollection, setEditingCollection] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const [detailProductId, setDetailProductId] = useState(null);
  const [detailMode, setDetailMode] = useState('view');   // 'view' | 'edit'
  const [productToDelete, setProductToDelete] = useState(null);

  // Hook handling drag and drop
 const {
  getOrderedProducts,
  productDragHandlers,
  getProductDragClass,
} = useDragToSwap();

// 🆕 Product sort-select mode
const [isProductSortMode, setIsProductSortMode] = useState(false);
const [sortedProductSequences, setSortedProductSequences] = useState({}); // { productId: number }

function handleSelectProductForSort(id, e) {
  e.stopPropagation();
  setSortedProductSequences(prev => {
    const updated = { ...prev };
    if (updated[id]) {
      const removedNum = updated[id];
      delete updated[id];
      Object.keys(updated).forEach(k => {
        if (updated[k] > removedNum) updated[k] -= 1;
      });
    } else {
      const currentMax = Object.values(updated).length;
      updated[id] = currentMax + 1;
    }
    return updated;
  });
}

async function handleSaveProductOrder() {
  if (Object.keys(sortedProductSequences).length === 0) {
    setIsProductSortMode(false);
    return;
  }
  setLoading(true);
  try {
    const patches = Object.entries(sortedProductSequences).map(([id, order]) =>
      fetch(`${BASE_URL}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }), // ✅ schema field naam
      })
    );
    await Promise.all(patches);

    setProducts(prev =>
      prev.map(p =>
        sortedProductSequences[p._id] !== undefined
          ? { ...p, order: sortedProductSequences[p._id] }
          : p
      )
    );
  } catch (err) {
    console.error('Failed to save product order:', err);
  } finally {
    setIsProductSortMode(false);
    setSortedProductSequences({});
    setLoading(false);
  }
}

  const navigate = useNavigate();
  const location = useLocation();
  const activePage = navItems.find(item => item.path === location.pathname)?.key || 'products';
  const types = [
    { label: 'All Products', value: 'All' },
    { label: 'View by Collection- General', value: 'Flooring Products' },
    { label: 'View by Collection - LVT', value: 'Luxury Vinyl Tile' }
  ];

  /* ── helpers to open the detail modal ── */
  function openDetail(id) { setDetailProductId(id); setDetailMode('view'); }
  function openEdit(id, e) { e?.stopPropagation(); setDetailProductId(id); setDetailMode('edit'); }
  function closeDetail() { setDetailProductId(null); setDetailMode('view'); }

  async function handleRenameCollection(oldName, newName) {
    const trimmed = newName.trim();
    setEditingCollection(null);
    if (!trimmed || trimmed === oldName) return;

    const colProducts = products.filter(p => p.accordionCategory === oldName);
    await Promise.all(
      colProducts.map(p =>
        fetch(`${BASE_URL}/products/${p._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accordionCategory: trimmed }),
        })
      )
    );
    setProducts(prev =>
      prev.map(p =>
        p.accordionCategory === oldName ? { ...p, accordionCategory: trimmed } : p
      )
    );
  }

  /* ── data fetching ── */
  async function fetchProductsData() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch');
      setProducts(await res.json());
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProductsData(); }, []);

  /* ── derived data ── */
  const uniqueCollections = Array.from(
    new Set(
      products
        .filter(p => activeType === 'All' || p.navCategory === activeType)
        .map(p => p.accordionCategory)
    )
  ).filter(Boolean);

  const getCollectionThumbnail = col => products.find(p => p.accordionCategory === col)?.img ?? '';
  const getCollectionItemCount = col => products.filter(p => p.accordionCategory === col).length;
  const isCollectionVisible = col => products
    .filter(p => p.accordionCategory === col)
    .every(p => p.isVisible !== false);

 const filteredProducts = products.filter(p => {
  const matchType = activeType === 'All' || p.navCategory === activeType;
  const matchCollection = searchQuery ? true : (!selectedCollection || p.accordionCategory === selectedCollection);

  // 🔴 FIX: Fallback to an empty string if searchQuery is undefined or null
  const q = (searchQuery || '').toLowerCase(); 

  const matchSearch =
    (p.name?.toLowerCase().includes(q)) ||
    (p.sku?.toLowerCase().includes(q)) ||
    (p.navCategory?.toLowerCase().includes(q)) ||
    (p.accordionCategory?.toLowerCase().includes(q)) ||
    (p.size?.toLowerCase().includes(q)) ||
    (p.colour?.toLowerCase().includes(q)) ||
    (p.shade?.toLowerCase().includes(q)) ||
    (Array.isArray(p.userIndustry) && p.userIndustry.some(industry => industry?.toLowerCase().includes(q))) ||
    (Array.isArray(p.tags) && p.tags.some(tag => tag?.toLowerCase().includes(q))) ||
    (typeof p.tags === 'string' && p.tags.toLowerCase().includes(q));

  return matchType && matchCollection && matchSearch;
});

const handleVisibilityChange = (id, newVisible) =>
    setProducts(prev => prev.map(p => p._id === id ? { ...p, isVisible: newVisible } : p));

  // 🆕 DB 'order' field se pehle sort karo
  const sortedFilteredProducts = [...filteredProducts].sort((a, b) => {
    const oA = a.order ?? 99999;
    const oB = b.order ?? 99999;
    return oA - oB;
  });

  // ─── SWAP OUT THE ORDERING PIPELINE WITH THE SAFEGUARD ───
  let orderedProducts = [];
  try {
    orderedProducts = getOrderedProducts(sortedFilteredProducts);
    // Double check that the hook actually returned a valid array
    if (!Array.isArray(orderedProducts)) {
      orderedProducts = sortedFilteredProducts;
    }
  } catch (err) {
    console.error("useDragToSwap failed to sort products:", err);
    orderedProducts = sortedFilteredProducts; // Fallback so the dashboard doesn't go white
  }

  const isStageTwo = activeType === 'All' || selectedCollection;

  /* ─────────────────────────────────────────────────────────────────
      RENDER
   ───────────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen w-full font-sans bg-[#f4f4f5] text-[#111111] overflow-hidden">

      {/* ── mobile sidebar overlay ── */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ── sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-[220px] bg-white border-r border-[#e8e8e8]
        flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shrink-0
      `}>
        <div className="px-5 pt-5 pb-[18px] border-b border-[#e8e8e8] flex justify-between items-center">
          <div>
            <div className="text-[17px] font-semibold text-[#111111] tracking-tight"> 
              <img
                src="https://www.wonderfloor.co.in/assets/img/logo/logo.png"
                alt="Logo"
                className="h-8 max-w-[150px] md:max-w-[180px] object-contain"
              />
            </div>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden text-[#aaaaaa] hover:text-[#111]"
          >
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
                  onClick={() => { navigate(item.path); setIsMobileSidebarOpen(false); }}
                  className={`
                    flex items-center gap-2.5 w-full px-5 py-[9px] border-l-2
                    text-[13px] text-left transition-all duration-150 cursor-pointer group
                    ${isActive
                      ? 'bg-[#edf9f5] border-[#0b9e7a] text-[#0b9e7a] font-medium'
                      : 'bg-transparent border-transparent text-[#888888] font-normal hover:text-[#333333] hover:bg-[#f5f5f5]'}
                  `}
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
          <button
            onClick={() => navigate('/admin/logout')}
            className="text-[#888888] hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 cursor-pointer"
            title="Log Out"
          >
            {Icon.logout}
          </button>
        </div>
      </aside>

      {/* ── main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── header ── */}
        <header className="h-[58px] border-b border-[#e8e8e8] flex items-center justify-between px-4 md:px-7 shrink-0 bg-white gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-[#aaaaaa] hover:text-[#333] rounded-md hover:bg-[#f5f5f5] transition-colors"
            >
              {Icon.menu}
            </button>
            <h1 className="text-base font-medium text-[#111111] m-0 truncate hidden sm:block">
              Flooring products
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-1 sm:flex-none justify-end">
            <div className="relative w-full max-w-[200px] sm:max-w-none">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search name/SKU…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-[#e0e0e0] text-[#111111] placeholder-[#aaaaaa] pl-8 pr-3 py-[7px] rounded-lg focus:outline-none focus:border-[#0b9e7a] w-full sm:w-48 lg:w-56 text-[13px] transition-colors"
              />
            </div>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-[7px] bg-white border border-[#e0e0e0] hover:border-[#aaaaaa] rounded-lg text-[#555555] text-[13px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shadow-sm shrink-0"
            >
              {Icon.bulk}
              <span className="hidden sm:inline">Bulk Upload</span>
            </button>

            <button
              onClick={() => setIsTileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-[7px] bg-[#0b9e7a] border border-[#0b9e7a] rounded-lg text-white text-[13px] font-medium transition-all duration-150 cursor-pointer hover:bg-[#09866a] whitespace-nowrap shadow-sm shrink-0"
            >
              {Icon.plus}
              <span className="hidden sm:inline">Add Flooring Product</span>
            </button>
          </div>
        </header>

        {/* ── scrollable body ── */}
        <div className="flex-1 overflow-auto p-4 md:p-6 md:px-7">

          {/* type filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {types.map(typeObj => (
              <button
                key={typeObj.value}
                onClick={() => { setActiveType(typeObj.value); setSelectedCollection(null); }}
                className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer ${activeType === typeObj.value ? 'bg-[#0b9e7a] text-white border border-[#0b9e7a] shadow-sm' : 'bg-white border border-[#e0e0e0] text-[#666666] hover:border-[#aaaaaa] hover:text-[#111111]'}`}
              >
                {typeObj.label}
              </button>
            ))}
          </div>

          {/* breadcrumb / count + view toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <div className="text-sm text-[#aaaaaa]">
              {selectedCollection ? (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className="cursor-pointer hover:text-[#0b9e7a] transition-colors"
                    onClick={() => setSelectedCollection(null)}
                  >
                    {types.find(t => t.value === activeType)?.label || activeType}
                  </span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-800 font-semibold">{selectedCollection}</span>
                </div>
              ) : (
                <span>{products.length} product{products.length !== 1 ? 's' : ''} in catalogue</span>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {selectedCollection && filteredProducts.length > 0 && !searchQuery && (
                <div className="flex items-center gap-2">
                  {isProductSortMode ? (
                    <>
                      <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                        {Object.keys(sortedProductSequences).length} selected
                      </span>
                      <button
                        onClick={() => { setIsProductSortMode(false); setSortedProductSequences({}); }}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProductOrder}
                        className="px-3 py-1.5 rounded-lg bg-[#0b9e7a] text-white hover:bg-[#09866a] text-xs font-semibold transition-colors shadow-sm"
                      >
                        Save Product Order
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsProductSortMode(true)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:border-gray-400 text-xs font-semibold text-gray-700 transition-colors shadow-sm"
                    >
                      Sort Products
                    </button>
                  )}
                </div>
              )}
              {isStageTwo && filteredProducts.length > 0 && (
                <div className="flex items-center bg-[#eaeaea] p-0.5 rounded-lg border border-[#e0e0e0]">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#888888] hover:text-[#444]'}`}
                    title="List View"
                  >
                    {Icon.listView}
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#888888] hover:text-[#444]'}`}
                    title="Grid View"
                  >
                    {Icon.gridView}
                  </button>
                </div>
              )}
              {selectedCollection && (
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#e0e0e0] hover:border-[#aaaaaa] rounded-lg text-xs font-medium text-[#555555] transition-all cursor-pointer shadow-sm"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back
                </button>
              )}
            </div>
          </div>

          {/* ── content states ── */}
          {isProductSortMode && (
            <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-xs font-medium">
              Click products in the order you want them to appear. Click again to deselect and shift numbers.
            </div>
          )}
          {loading ? (
            <div className="text-center py-24 text-[#aaaaaa] text-sm bg-white rounded-xl border border-[#e8e8e8] mx-2">
              <svg className="mx-auto mb-3 opacity-30 animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Syncing database asset structures…
            </div>
          ) : activeType !== 'All' && !selectedCollection && !searchQuery ? (
            /* collection grid — Drag handlers and classes fully stripped from here */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {uniqueCollections.map(col => {
                const colVisible = isCollectionVisible(col);
                const colProducts = products.filter(p => p.accordionCategory === col);
                return (
                  <div
                    key={col}
                    onClick={() => setSelectedCollection(col)}
                    className="bg-white rounded-xl overflow-hidden flex flex-col group shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div className="h-32 w-full overflow-hidden bg-[#fafafa] border-b border-[#f0f0f0] relative">
                      <img
                        src={getCollectionThumbnail(col)} alt={col}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-300"
                        onError={e => { e.target.src = 'https://placehold.co/300x200?text=Folder'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-gray-200" onClick={e => e.stopPropagation()}>
                        <span className={`text-[10px] font-semibold ${colVisible ? 'text-[#0b9e7a]' : 'text-gray-400'}`}>
                          {colVisible ? 'Live' : 'Hidden'}
                        </span>
                        <button
                          onClick={async e => {
                            e.stopPropagation();
                            const next = !colVisible;
                            await Promise.all(colProducts.map(p => fetch(`${BASE_URL}/products/${p._id}/visibility`, { method: 'PATCH' })));
                            setProducts(prev => prev.map(p => p.accordionCategory === col ? { ...p, isVisible: next } : p));
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-colors duration-200 cursor-pointer focus:outline-none ${colVisible ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-gray-300 border-gray-300'}`}
                        >
                          <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 ${colVisible ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between bg-white">
                      {editingCollection === col ? (
                        <input
                          autoFocus
                          value={editingValue}
                          onChange={e => setEditingValue(e.target.value)}
                          onBlur={() => handleRenameCollection(col, editingValue)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRenameCollection(col, editingValue);
                            if (e.key === 'Escape') setEditingCollection(null);
                          }}
                          onClick={e => e.stopPropagation()}
                          className="text-[14px] font-bold text-gray-800 tracking-tight border-b-2 border-[#0b9e7a] focus:outline-none bg-transparent w-full pr-2"
                        />
                      ) : (
                        <h3 className="text-[14px] font-bold text-gray-800 tracking-tight group-hover:text-[#0b9e7a] transition-colors truncate pr-2">
                          {col}
                        </h3>
                      )}

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingCollection(col);
                            setEditingValue(col);
                          }}
                          className="text-[#cccccc] hover:text-[#0b9e7a] p-1 rounded transition-colors"
                          title="Rename collection"
                        >
                          {Icon.edit}
                        </button>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full group-hover:bg-[#edf9f5] group-hover:text-[#0b9e7a] transition-colors">
                          {getCollectionItemCount(col)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-[#aaaaaa] text-sm border-2 border-dashed border-[#e0e0e0] rounded-xl bg-white">
                  No products found in this selection.
                </div>
              ) : viewMode === 'list' ? (
                /* ── LIST VIEW ── */
                <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                          {['Product Details', 'SKU', 'Collection', 'Dimensions', 'Visibility', 'Actions'].map((h, i) => (
                            <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-[#aaaaaa] uppercase tracking-wider whitespace-nowrap ${i === 5 ? 'text-right' : ''}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0f0]">
                        {orderedProducts.map(prod => {
                          const handlers = productDragHandlers(prod._id);
                          return (
                            <tr
                              key={prod._id}
                              {...handlers}
                              onDrop={e => handlers.onDrop(e, orderedProducts)}
                              className={`transition-colors duration-100 ${getProductDragClass(prod._id, true)}`}
                            >
                              <td className="px-5 py-3.5 cursor-pointer" onClick={() => openDetail(prod._id)}>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden border border-[#e8e8e8] bg-[#f5f5f5]">
                                    <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-semibold text-[#111111] leading-tight hover:text-[#0b9e7a] transition-colors max-w-[200px] truncate">
                                      {prod.name}
                                    </p>
                                    <p className="text-xs text-[#aaaaaa] mt-0.5">{prod.navCategory}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 font-mono text-xs text-[#888888] cursor-pointer" onClick={() => openDetail(prod._id)}>
                                {prod.sku}
                              </td>
                              <td className="px-5 py-3.5 cursor-pointer" onClick={() => openDetail(prod._id)}>
                                <span className="inline-block bg-[#f0f0f0] text-[#666666] px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap">
                                  {prod.accordionCategory}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-[#666666] cursor-pointer whitespace-nowrap" onClick={() => openDetail(prod._id)}>
                                {prod.size}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <VisibilityToggle
                                    productId={prod._id}
                                    initialVisible={prod.isVisible !== false}
                                    onToggle={handleVisibilityChange}
                                  />
                                  <span className={`text-[11px] font-medium ${prod.isVisible !== false ? 'text-[#0b9e7a]' : 'text-gray-400'}`}>
                                    {prod.isVisible !== false ? 'Live' : 'Hidden'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                <button
                                  onClick={e => openEdit(prod._id, e)}
                                  className="inline-flex items-center gap-1 text-[#888888] hover:text-[#0b9e7a] hover:bg-[#edf9f5] transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium mr-1"
                                  title="Edit product"
                                >
                                  {Icon.edit}
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProductToDelete(prod);
                                  }}
                                  className="inline-flex items-center gap-1 text-[#888888] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                  title="Delete product"
                                >
                                  {Icon.trash}
                                  <span>Delete</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ── GRID VIEW ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {orderedProducts.map(prod => {
                    const handlers = productDragHandlers(prod._id);
                    const prodSortNum = sortedProductSequences[prod._id];
                    return (
                      <div
                        key={prod._id}
                        {...(!isProductSortMode ? handlers : {})}
                        onDrop={!isProductSortMode ? e => handlers.onDrop(e, orderedProducts) : undefined}
                        onClick={isProductSortMode ? e => handleSelectProductForSort(prod._id, e) : undefined}
                        className={`bg-white rounded-xl overflow-hidden flex flex-col group shadow-sm transition-all duration-200 relative select-none ${
                          isProductSortMode ? 'cursor-pointer ring-2 ring-transparent hover:ring-[#0b9e7a] border border-gray-100' : getProductDragClass(prod._id)
                        }`}
                      >
                        {isProductSortMode && (
                          <div className="absolute inset-0 z-30 bg-black/5 rounded-xl flex items-start p-3 pointer-events-none">
                            <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center font-bold text-xs transition-all pointer-events-auto ${
                              prodSortNum ? 'bg-[#0b9e7a] border-[#0b9e7a] text-white shadow-md scale-110' : 'bg-white/90 border-gray-300 text-transparent'
                            }`}>
                              {prodSortNum || ''}
                            </div>
                          </div>
                        )}

                        <div
                          className="h-40 w-full bg-[#f5f5f5] border-b border-[#f0f0f0] relative cursor-pointer overflow-hidden"
                          onClick={!isProductSortMode ? () => openDetail(prod._id) : undefined}
                        >
                          <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          {!isProductSortMode && (
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-gray-200">
                              <VisibilityToggle
                                productId={prod._id}
                                initialVisible={prod.isVisible !== false}
                                onToggle={handleVisibilityChange}
                              />
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                       <h3
                            className="text-[14px] font-bold text-gray-800 leading-tight cursor-pointer hover:text-[#0b9e7a] transition-colors line-clamp-2 mb-1"
                            onClick={!isProductSortMode ? () => openDetail(prod._id) : undefined}
                          >
                            {prod.name}
                          </h3>
                          <div className="text-[11px] text-[#aaaaaa] mb-4 truncate">
                            {prod.navCategory} <span className="mx-1">•</span> {prod.accordionCategory}
                          </div>

                          <div className="mt-auto flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] text-[#aaaaaa] uppercase font-semibold tracking-wider">
                                SKU &nbsp;|&nbsp; Size
                              </span>
                              <span className="text-[12px] font-medium text-[#555] truncate max-w-[130px]">
                                {prod.sku} — {prod.size}
                              </span>
                            </div>

                           {!isProductSortMode && (
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  onClick={e => openEdit(prod._id, e)}
                                  className="text-[#aaaaaa] hover:text-[#0b9e7a] bg-[#f8f8f8] hover:bg-[#edf9f5] rounded-md p-1.5 transition-colors"
                                  title="Edit"
                                >
                                  {Icon.edit}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProductToDelete(prod);
                                  }}
                                  className="text-[#aaaaaa] hover:text-red-500 bg-[#f8f8f8] hover:bg-red-50 rounded-md p-1.5 transition-colors"
                                  title="Delete"
                                >
                                  {Icon.trash}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ═══════════ MODALS ═══════════ */}
      {isTileModalOpen && (
        <UploadTileModal
          onClose={() => setIsTileModalOpen(false)}
          onSuccess={() => { fetchProductsData(); setIsTileModalOpen(false); }}
        />
      )}

      {isBulkModalOpen && (
        <BulkUploadModal
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={() => { fetchProductsData(); setIsBulkModalOpen(false); }}
        />
      )}

      {detailProductId && (
        <ProductDetailModal
          productId={detailProductId}
          initialMode={detailMode}
          onClose={closeDetail}
          onSuccess={fetchProductsData}
        />
      )}

      {productToDelete && (
        <DeleteProductModal
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onSuccess={() => {
            setProductToDelete(null);
            fetchProductsData();
          }}
        />
      )}
    </div>
  );
}
// import { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import UploadTileModal from '../components/UploadTileModal';
// import BulkUploadModal from '../components/BulkUploadTile';
// import ProductDetailModal from './ProductDetailModal';
// import VisibilityToggle from '../components/VisibilityToggle';
// import DeleteProductModal from '../components/DeleteProductModal';
// import { useSearch } from '../components/SearchContext'; 
// import { useDragToSwap } from '../../hooks/useDragToSwap'; 

// /* ─── icons ──────────────────────────────────────────────────────── */
// const Icon = {
//   grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
//   photo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
//   stack: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
//   users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
//   settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
//   plus: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
//   menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
//   close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
//   listView: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
//   gridView: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>,
//   edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
//   trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
//   bulk: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
//   logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
//   sort: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
// };

// const navItems = [
//   { label: 'Dashboard Overview', icon: 'grid', key: 'overview', path: '/admin', group: null },
//   { label: 'Demo Rooms', icon: 'photo', key: 'rooms', path: '/admin/rooms', group: 'MANAGE' },
//   { label: 'Flooring Products', icon: 'stack', key: 'products', path: '/admin/products', group: null },
//   { label: 'Settings', icon: 'settings', key: 'settings', path: '/admin/settings', group: null },
// ];

// const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:8000';

// export default function ProductManager() {
//   const { searchQuery, setSearchQuery } = useSearch();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeType, setActiveType] = useState('All');

//   const [selectedCollection, setSelectedCollection] = useState(null);
//   const [isTileModalOpen, setIsTileModalOpen] = useState(false);
//   const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [viewMode, setViewMode] = useState('grid');

//   // ── Product sort mode ──
//   const [isProductSortMode, setIsProductSortMode] = useState(false);
//   const [sortedProductSequences, setSortedProductSequences] = useState({});

//   const [editingCollection, setEditingCollection] = useState(null);
//   const [editingValue, setEditingValue] = useState('');

//   const [detailProductIdId, setDetailProductId] = useState(null);
//   const [detailMode, setDetailMode] = useState('view');
//   const [productToDelete, setProductToDelete] = useState(null);

//   const {
//     // getOrderedProducts,
//     productDragHandlers,
//     getProductDragClass,
//     resetProductOrder,
//   } = useDragToSwap();

//   const navigate = useNavigate();
//   const location = useLocation();
//   const activePage = navItems.find(item => item.path === location.pathname)?.key || 'products';

//   const types = [
//     { label: 'All Products', value: 'All' },
//     { label: 'View by Collection- General', value: 'Flooring Products' },
//     { label: 'View by Collection - LVT', value: 'Luxury Vinyl Tile' }
//   ];

//   function openDetail(id) { setDetailProductId(id); setDetailMode('view'); }
//   function openEdit(id, e) { e?.stopPropagation(); setDetailProductId(id); setDetailMode('edit'); }
//   function closeDetail() { setDetailProductId(null); setDetailMode('view'); }

//   async function handleRenameCollection(oldName, newName) {
//     const trimmed = newName.trim();
//     setEditingCollection(null);
//     if (!trimmed || trimmed === oldName) return;

//     const colProducts = products.filter(p => p.accordionCategory === oldName);
//     await Promise.all(
//       colProducts.map(p =>
//         fetch(`${BASE_URL}/products/${p._id}`, {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ accordionCategory: trimmed }),
//         })
//       )
//     );
//     setProducts(prev =>
//       prev.map(p =>
//         p.accordionCategory === oldName ? { ...p, accordionCategory: trimmed } : p
//       )
//     );
//   }

//   async function fetchProductsData() {
//     setLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}/products`);
//       if (!res.ok) throw new Error('Failed to fetch');
//       const data = await res.json();
      
//       const savedMapping = JSON.parse(localStorage.getItem('pm_displayOrder') || '{}');
//       const mergedData = data.map(p => ({
//         ...p,
//         productOrder: p.productOrder !== undefined && p.productOrder !== null ? p.productOrder : savedMapping[p._id]
//       }));

//       setProducts(mergedData);
//     } catch (err) {
//       console.error('Error fetching products:', err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => { fetchProductsData(); }, []);

//   // ── Collection order from localStorage ──
//   const uniqueCollections = useMemo(() => {
//     const rawCols = Array.from(
//       new Set(
//         products
//           .filter(p => activeType === 'All' || p.navCategory === activeType)
//           .map(p => p.accordionCategory)
//       )
//     ).filter(Boolean);

//     const savedMapping = JSON.parse(localStorage.getItem('pm_collectionTierOrder')) || {};

//     return rawCols.sort((a, b) => {
//       const orderA = savedMapping[a] !== undefined ? savedMapping[a] : 99999;
//       const orderB = savedMapping[b] !== undefined ? savedMapping[b] : 99999;
//       return orderA - orderB;
//     });
//   }, [products, activeType]);

//   const getCollectionThumbnail = col => products.find(p => p.accordionCategory === col)?.img ?? '';
//   const getCollectionItemCount = col => products.filter(p => p.accordionCategory === col).length;
//   const isCollectionVisible = col => products
//     .filter(p => p.accordionCategory === col)
//     .every(p => p.isVisible !== false);

//   const filteredProducts = useMemo(() => {
//     const base = products.filter(p => {
//       const matchType = activeType === 'All' || p.navCategory === activeType;
//       const matchCollection = searchQuery ? true : (!selectedCollection || p.accordionCategory === selectedCollection);

//       const q = searchQuery.toLowerCase();
//       const matchSearch =
//         (p.name?.toLowerCase().includes(q)) ||
//         (p.sku?.toLowerCase().includes(q)) ||
//         (p.navCategory?.toLowerCase().includes(q)) ||
//         (p.accordionCategory?.toLowerCase().includes(q)) ||
//         (p.size?.toLowerCase().includes(q)) ||
//         (p.colour?.toLowerCase().includes(q)) ||
//         (p.shade?.toLowerCase().includes(q)) ||
//         (Array.isArray(p.userIndustry) && p.userIndustry.some(industry => industry?.toLowerCase().includes(q))) ||
//         (Array.isArray(p.tags) && p.tags.some(tag => tag?.toLowerCase().includes(q))) ||
//         (typeof p.tags === 'string' && p.tags.toLowerCase().includes(q));

//       return matchType && matchCollection && matchSearch;
//     });

//     return [...base].sort((a, b) => {
//       const oA = a.productOrder !== undefined && a.productOrder !== null ? Number(a.productOrder) : 99999;
//       const oB = b.productOrder !== undefined && b.productOrder !== null ? Number(b.productOrder) : 99999;
//       return oA - oB;
//     });
//   }, [products, activeType, selectedCollection, searchQuery]);

//   const handleVisibilityChange = (id, newVisible) =>
//     setProducts(prev => prev.map(p => p._id === id ? { ...p, isVisible: newVisible } : p));

//   // ── Product sort: click checkbox assigns an incrementing number ──
//   const handleSelectProductForSort = (id, e) => {
//     e.stopPropagation();
//     setSortedProductSequences(prev => {
//       const updated = { ...prev };
//       if (updated[id]) {
//         const removedNum = updated[id];
//         delete updated[id];
//         Object.keys(updated).forEach(k => {
//           if (updated[k] > removedNum) updated[k] -= 1;
//         });
//       } else {
//         const currentMax = Object.values(updated).length;
//         updated[id] = currentMax + 1;
//       }
//       return updated;
//     });
//   };

//   // ── Save product order to localStorage + backend ──
//   const handleSaveProductOrder = async () => {
//     if (Object.keys(sortedProductSequences).length === 0) {
//       setIsProductSortMode(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       const unselectedProductsInView = filteredProducts.filter(p => sortedProductSequences[p._id] === undefined);
      
//       const existingOrder = JSON.parse(localStorage.getItem('pm_displayOrder') || '{}');
      
//       unselectedProductsInView.forEach(p => {
//         delete existingOrder[p._id];
//       });

//       const merged = { ...existingOrder, ...sortedProductSequences };
//       localStorage.setItem('pm_displayOrder', JSON.stringify(merged));

//       const patchSelected = Object.entries(sortedProductSequences).map(([id, order]) =>
//         fetch(`${BASE_URL}/products/${id}`, {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ productOrder: order }),
//         })
//       );

//       const patchUnselected = unselectedProductsInView.map(p =>
//         fetch(`${BASE_URL}/products/${p._id}`, {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ productOrder: 99999 }),
//         })
//       );

//       await Promise.all([...patchSelected, ...patchUnselected]);

//       setProducts(prev =>
//         prev.map(p => {
//           if (sortedProductSequences[p._id] !== undefined) {
//             return { ...p, productOrder: sortedProductSequences[p._id] };
//           }
//           if (unselectedProductsInView.some(unselected => unselected._id === p._id)) {
//             return { ...p, productOrder: 99999 };
//           }
//           return p;
//         })
//       );
//     } catch (err) {
//       console.error('Failed to save product order:', err);
//     } finally {
//       setIsProductSortMode(false);
//       setSortedProductSequences({});
//       resetProductOrder();
//       setLoading(false);
//     }
//   };

//  // Temporarily change it to this:
// const orderedProducts = filteredProducts;
//   const isStageTwo = activeType === 'All' || selectedCollection;

//   // ── Reset product sort mode when leaving a collection ──
//   const handleSetSelectedCollection = (col) => {
//     setSelectedCollection(col);
//     setIsProductSortMode(false);
//     setSortedProductSequences({});
//   };

//   return (
//     <div className="flex h-screen w-full font-sans bg-[#f4f4f5] text-[#111111] overflow-hidden">

//       {isMobileSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
//           onClick={() => setIsMobileSidebarOpen(false)}
//         />
//       )}

//       <aside className={`
//         fixed top-0 left-0 h-full w-[220px] bg-white border-r border-[#e8e8e8]
//         flex flex-col z-50 transition-transform duration-300 ease-in-out
//         ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//         md:relative md:translate-x-0 md:shrink-0
//       `}>
//         <div className="px-5 pt-5 pb-[18px] border-b border-[#e8e8e8] flex justify-between items-center">
//           <div>
//             <div className="text-[17px] font-semibold text-[#111111] tracking-tight">
//               <img src="https://www.wonderfloor.co.in/assets/img/logo/logo.png" alt="Logo" className="h-8 max-w-[150px] md:max-w-[180px] object-contain" />
//             </div>
//           </div>
//           <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-[#aaaaaa] hover:text-[#111]">{Icon.close}</button>
//         </div>

//         <nav className="flex-1 py-3 overflow-y-auto">
//           {navItems.map((item, i) => {
//             const isActive = activePage === item.key;
//             const showGroup = item.group && item.group !== navItems[i - 1]?.group;
//             return (
//               <div key={item.key}>
//                 {showGroup && (
//                   <div className="text-[10px] font-semibold tracking-[0.08em] text-[#bbbbbb] px-5 pt-3.5 pb-1.5 uppercase">
//                     {item.group}
//                   </div>
//                 )}
//                 <button
//                   onClick={() => { navigate(item.path); setIsMobileSidebarOpen(false); }}
//                   className={`
//                     flex items-center gap-2.5 w-full px-5 py-[9px] border-l-2
//                     text-[13px] text-left transition-all duration-150 cursor-pointer group
//                     ${isActive ? 'bg-[#edf9f5] border-[#0b9e7a] text-[#0b9e7a] font-medium' : 'bg-transparent border-transparent text-[#888888] font-normal hover:text-[#333333] hover:bg-[#f5f5f5]'}
//                   `}
//                 >
//                   <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'}`}>{Icon[item.icon]}</span>
//                   {item.label}
//                 </button>
//               </div>
//             );
//           })}
//         </nav>

//         <div className="px-5 pt-3.5 pb-[18px] border-t border-[#e8e8e8] flex justify-between items-center">
//           <div>
//             <div className="text-[11px] text-[#aaaaaa]">Logged in as</div>
//             <div className="text-[13px] font-medium text-[#333333] mt-0.5">Admin</div>
//           </div>
//           <button onClick={() => navigate('/admin/logout')} className="text-[#888888] hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 cursor-pointer" title="Log Out">{Icon.logout}</button>
//         </div>
//       </aside>

//       <main className="flex-1 flex flex-col overflow-hidden min-w-0">
//         <header className="h-[58px] border-b border-[#e8e8e8] flex items-center justify-between px-4 md:px-7 shrink-0 bg-white gap-3">
//           <div className="flex items-center gap-3">
//             <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden p-1.5 text-[#aaaaaa] hover:text-[#333] rounded-md hover:bg-[#f5f5f5] transition-colors">{Icon.menu}</button>
//             <h1 className="text-base font-medium text-[#111111] m-0 truncate hidden sm:block">Flooring products</h1>
//           </div>

//           <div className="flex items-center gap-2 md:gap-3 flex-1 sm:flex-none justify-end">
//             <div className="relative w-full max-w-[200px] sm:max-w-none">
//               <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
//               </svg>
//               <input
//                 type="text" placeholder="Search name/SKU…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
//                 className="bg-white border border-[#e0e0e0] text-[#111111] placeholder-[#aaaaaa] pl-8 pr-3 py-[7px] rounded-lg focus:outline-none focus:border-[#0b9e7a] w-full sm:w-48 lg:w-56 text-[13px] transition-colors"
//               />
//             </div>

//             <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-1.5 px-3 py-[7px] bg-white border border-[#e0e0e0] hover:border-[#aaaaaa] rounded-lg text-[#555555] text-[13px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shadow-sm shrink-0">
//               {Icon.bulk}<span className="hidden sm:inline">Bulk Upload</span>
//             </button>

//             <button onClick={() => setIsTileModalOpen(true)} className="flex items-center gap-1.5 px-3 sm:px-4 py-[7px] bg-[#0b9e7a] border border-[#0b9e7a] rounded-lg text-white text-[13px] font-medium transition-all duration-150 cursor-pointer hover:bg-[#09866a] whitespace-nowrap shadow-sm shrink-0">
//               {Icon.plus}<span className="hidden sm:inline">Add Flooring Product</span>
//             </button>
//           </div>
//         </header>

//         <div className="flex-1 overflow-auto p-4 md:p-6 md:px-7">
//           <div className="flex flex-wrap gap-2 mb-6">
//             {types.map(typeObj => (
//               <button
//                 key={typeObj.value} onClick={() => { setActiveType(typeObj.value); handleSetSelectedCollection(null); }}
//                 className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer ${activeType === typeObj.value ? 'bg-[#0b9e7a] text-white border border-[#0b9e7a] shadow-sm' : 'bg-white border border-[#e0e0e0] text-[#666666] hover:border-[#aaaaaa] hover:text-[#111111]'}`}
//               >
//                 {typeObj.label}
//               </button>
//             ))}
//           </div>

//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
//             <div className="text-sm text-[#aaaaaa]">
//               {selectedCollection ? (
//                 <div className="flex items-center gap-1.5 text-xs font-medium">
//                   <span className="cursor-pointer hover:text-[#0b9e7a] transition-colors" onClick={() => handleSetSelectedCollection(null)}>
//                     {types.find(t => t.value === activeType)?.label || activeType}
//                   </span>
//                   <span className="text-gray-300">/</span>
//                   <span className="text-gray-800 font-semibold">{selectedCollection}</span>
//                 </div>
//               ) : (
//                 <span>{products.length} product{products.length !== 1 ? 's' : ''} in catalogue</span>
//               )}
//             </div>

//             <div className="flex items-center gap-3 self-end sm:self-auto">

//               {/* ── Sort Products button: only inside a collection, no active search ── */}
//               {selectedCollection && filteredProducts.length > 0 && !searchQuery && (
//                 <div className="flex items-center gap-2">
//                   {isProductSortMode ? (
//                     <>
//                       <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
//                         {Object.keys(sortedProductSequences).length} selected
//                       </span>
//                       <button
//                         onClick={() => { setIsProductSortMode(false); setSortedProductSequences({}); }}
//                         className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-colors"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         onClick={handleSaveProductOrder}
//                         className="px-3 py-1.5 rounded-lg bg-[#0b9e7a] text-white hover:bg-[#09866a] text-xs font-semibold transition-colors shadow-sm"
//                       >
//                         Save Product Order
//                       </button>
//                     </>
//                   ) : (
//                     <button
//                       onClick={() => setIsProductSortMode(true)}
//                       className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:border-gray-400 text-xs font-semibold text-gray-700 transition-colors shadow-sm"
//                     >
//                       {Icon.sort} Sort Products
//                     </button>
//                   )}
//                 </div>
//               )}

//               {isStageTwo && filteredProducts.length > 0 && (
//                 <div className="flex items-center bg-[#eaeaea] p-0.5 rounded-lg border border-[#e0e0e0]">
//                   <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#888888] hover:text-[#444]'}`} title="List View">{Icon.listView}</button>
//                   <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#888888] hover:text-[#444]'}`} title="Grid View">{Icon.gridView}</button>
//                 </div>
//               )}

//               {selectedCollection && (
//                 <button onClick={() => handleSetSelectedCollection(null)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#e0e0e0] hover:border-[#aaaaaa] rounded-lg text-xs font-medium text-[#555555] transition-all cursor-pointer shadow-sm">
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>Back
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* ── Product sort mode instruction banner ── */}
//           {isProductSortMode && (
//             <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-xs font-medium">
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
//               Click products in the order you want them to appear. Click again to deselect and shift numbers.
//             </div>
//           )}

//           {loading ? (
//             <div className="text-center py-24 text-[#aaaaaa] text-sm bg-white rounded-xl border border-[#e8e8e8] mx-2">
//               <svg className="mx-auto mb-3 opacity-30 animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Syncing database asset structures…
//             </div>
//           ) : activeType !== 'All' && !selectedCollection && !searchQuery ? (

//             /* ── COLLECTION FOLDER GRID ── */
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
//               {uniqueCollections.map(col => {
//                 const colVisible = isCollectionVisible(col);
//                 const colProducts = products.filter(p => p.accordionCategory === col);

//                 return (
//                   <div
//                     key={col}
//                     onClick={() => handleSetSelectedCollection(col)}
//                     className="bg-white rounded-xl overflow-hidden flex flex-col group shadow-sm transition-all duration-200 relative select-none cursor-pointer"
//                   >
//                     <div className="h-32 w-full overflow-hidden bg-[#fafafa] border-b border-[#f0f0f0] relative">
//                       <img
//                         src={getCollectionThumbnail(col)} alt={col}
//                         className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-300"
//                         onError={e => { e.target.src = 'https://placehold.co/300x200?text=Folder'; }}
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

//                       <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-gray-200" onClick={e => e.stopPropagation()}>
//                         <span className={`text-[10px] font-semibold ${colVisible ? 'text-[#0b9e7a]' : 'text-gray-400'}`}>{colVisible ? 'Live' : 'Hidden'}</span>
//                         <button
//                           onClick={async e => {
//                             e.stopPropagation();
//                             const next = !colVisible;
                            
//                             // ✅ FIX: Using correct payload to standard product PATCH endpoint to prevent 404
//                             await Promise.all(colProducts.map(p => 
//                               fetch(`${BASE_URL}/products/${p._id}`, { 
//                                 method: 'PATCH',
//                                 headers: { 'Content-Type': 'application/json' },
//                                 body: JSON.stringify({ isVisible: next })
//                               })
//                             ));
                            
//                             setProducts(prev => prev.map(p => p.accordionCategory === col ? { ...p, isVisible: next } : p));
//                           }}
//                           className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-colors duration-200 cursor-pointer focus:outline-none ${colVisible ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-gray-300 border-gray-300'}`}
//                         >
//                           <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 ${colVisible ? 'translate-x-4' : 'translate-x-0.5'}`} />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="p-4 flex items-center justify-between bg-white relative z-10">
//                       {editingCollection === col ? (
//                         <input
//                           autoFocus value={editingValue} onChange={e => setEditingValue(e.target.value)}
//                           onBlur={() => handleRenameCollection(col, editingValue)}
//                           onKeyDown={e => {
//                             if (e.key === 'Enter') handleRenameCollection(col, editingValue);
//                             if (e.key === 'Escape') setEditingCollection(null);
//                           }}
//                           onClick={e => e.stopPropagation()}
//                           className="text-[14px] font-bold text-gray-800 tracking-tight border-b-2 border-[#0b9e7a] focus:outline-none bg-transparent w-full pr-2"
//                         />
//                       ) : (
//                         <h3 className="text-[14px] font-bold text-gray-800 tracking-tight group-hover:text-[#0b9e7a] transition-colors truncate pr-2">
//                           {col}
//                         </h3>
//                       )}

//                       <div className="flex items-center gap-1.5 shrink-0">
//                         <button
//                           onClick={e => {
//                             e.stopPropagation();
//                             setEditingCollection(col);
//                             setEditingValue(col);
//                           }}
//                           className="text-[#cccccc] hover:text-[#0b9e7a] p-1 rounded transition-colors" title="Rename collection"
//                         >
//                           {Icon.edit}
//                         </button>
//                         <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full group-hover:bg-[#edf9f5] group-hover:text-[#0b9e7a] transition-colors">
//                           {getCollectionItemCount(col)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//           ) : (
//             /* ── PRODUCTS INSIDE COLLECTION VIEW ── */
//             <>
//               {filteredProducts.length === 0 ? (
//                 <div className="text-center py-16 text-[#aaaaaa] text-sm border-2 border-dashed border-[#e0e0e0] rounded-xl bg-white">No products found in this selection.</div>
//               ) : viewMode === 'list' ? (

//                 /* ── LIST VIEW ── */
//                 <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-sm">
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse min-w-[700px]">
//                       <thead>
//                         <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
//                           {isProductSortMode && (
//                             <th className="px-4 py-3.5 text-xs font-semibold text-[#aaaaaa] uppercase tracking-wider w-12">Order</th>
//                           )}
//                           {['Product Details', 'SKU', 'Collection', 'Dimensions', 'Visibility', 'Actions'].map((h, i) => (
//                             <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-[#aaaaaa] uppercase tracking-wider whitespace-nowrap ${i === 5 ? 'text-right' : ''}`}>{h}</th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-[#f0f0f0]">
//                         {orderedProducts.map(prod => {
//                           const handlers = productDragHandlers(prod._id);
//                           const prodSortNum = sortedProductSequences[prod._id];
//                           return (
//                             <tr
//                               key={prod._id}
//                               {...(!isProductSortMode ? handlers : {})}
//                               onDrop={!isProductSortMode ? e => handlers.onDrop(e, orderedProducts) : undefined}
//                               className={`transition-colors duration-100 ${isProductSortMode ? 'hover:bg-amber-50 cursor-pointer' : getProductDragClass(prod._id, true)}`}
//                               onClick={isProductSortMode ? e => handleSelectProductForSort(prod._id, e) : undefined}
//                             >
//                               {isProductSortMode && (
//                                 <td className="px-4 py-3.5" onClick={e => handleSelectProductForSort(prod._id, e)}>
//                                   <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center font-bold text-xs transition-all cursor-pointer mx-auto ${prodSortNum ? 'bg-[#0b9e7a] border-[#0b9e7a] text-white shadow-md scale-110' : 'bg-white border-gray-300 text-transparent hover:border-[#0b9e7a]'}`}>
//                                     {prodSortNum || ''}
//                                   </div>
//                                 </td>
//                               )}
//                               <td className="px-5 py-3.5 cursor-pointer" onClick={!isProductSortMode ? () => openDetail(prod._id) : undefined}>
//                                 <div className="flex items-center gap-3">
//                                   <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden border border-[#e8e8e8] bg-[#f5f5f5]">
//                                     <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
//                                   </div>
//                                   <div>
//                                     <p className="text-[13px] font-semibold text-[#111111] leading-tight hover:text-[#0b9e7a] transition-colors max-w-[200px] truncate">{prod.name}</p>
//                                     <p className="text-xs text-[#aaaaaa] mt-0.5">{prod.navCategory}</p>
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="px-5 py-3.5 font-mono text-xs text-[#888888]">{prod.sku}</td>
//                               <td className="px-5 py-3.5">
//                                 <span className="inline-block bg-[#f0f0f0] text-[#666666] px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap">{prod.accordionCategory}</span>
//                               </td>
//                               <td className="px-5 py-3.5 text-sm text-[#666666] whitespace-nowrap">{prod.size}</td>
//                               <td className="px-5 py-3.5">
//                                 <div className="flex items-center gap-2">
//                                   <VisibilityToggle productId={prod._id} initialVisible={prod.isVisible !== false} onToggle={handleVisibilityChange} />
//                                   <span className={`text-[11px] font-medium ${prod.isVisible !== false ? 'text-[#0b9e7a]' : 'text-gray-400'}`}>{prod.isVisible !== false ? 'Live' : 'Hidden'}</span>
//                                 </div>
//                               </td>
//                               <td className="px-5 py-3.5 text-right whitespace-nowrap">
//                                 {!isProductSortMode && (
//                                   <>
//                                     <button onClick={e => openEdit(prod._id, e)} className="inline-flex items-center gap-1 text-[#888888] hover:text-[#0b9e7a] hover:bg-[#edf9f5] transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium mr-1">{Icon.edit}<span>Edit</span></button>
//                                     <button onClick={e => { e.stopPropagation(); setProductToDelete(prod); }} className="inline-flex items-center gap-1 text-[#888888] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium">{Icon.trash}<span>Delete</span></button>
//                                   </>
//                                 )}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//               ) : (
//                 /* ── GRID VIEW ── */
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
//                   {orderedProducts.map(prod => {
//                     const handlers = productDragHandlers(prod._id);
//                     const prodSortNum = sortedProductSequences[prod._id];
//                     return (
//                       <div
//                         key={prod._id}
//                         {...(!isProductSortMode ? handlers : {})}
//                         onDrop={!isProductSortMode ? e => handlers.onDrop(e, orderedProducts) : undefined}
//                         className={`bg-white rounded-xl overflow-hidden flex flex-col group shadow-sm transition-all duration-200 relative select-none ${isProductSortMode ? 'cursor-pointer ring-2 ring-transparent hover:ring-[#0b9e7a] border border-gray-100' : getProductDragClass(prod._id)}`}
//                         onClick={isProductSortMode ? e => handleSelectProductForSort(prod._id, e) : undefined}
//                       >
//                         {/* Numbered checkbox overlay in sort mode */}
//                         {isProductSortMode && (
//                           <div className="absolute inset-0 z-30 bg-black/5 hover:bg-black/0 transition-colors rounded-xl flex items-start p-3 pointer-events-none">
//                             <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center font-bold text-xs transition-all pointer-events-auto ${prodSortNum ? 'bg-[#0b9e7a] border-[#0b9e7a] text-white shadow-md scale-110' : 'bg-white/90 border-gray-300 text-transparent'}`}>
//                               {prodSortNum || ''}
//                             </div>
//                           </div>
//                         )}

//                         <div
//                           className="h-40 w-full bg-[#f5f5f5] border-b border-[#f0f0f0] relative overflow-hidden cursor-pointer"
//                           onClick={!isProductSortMode ? () => openDetail(prod._id) : undefined}
//                         >
//                           <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//                           {!isProductSortMode && (
//                             <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-gray-200">
//                               <VisibilityToggle productId={prod._id} initialVisible={prod.isVisible !== false} onToggle={handleVisibilityChange} />
//                             </div>
//                           )}
//                         </div>

//                         <div className="p-4 flex flex-col flex-1">
//                           <h3
//                             className="text-[14px] font-bold text-gray-800 leading-tight line-clamp-2 mb-1 transition-colors cursor-pointer hover:text-[#0b9e7a]"
//                             onClick={!isProductSortMode ? () => openDetail(prod._id) : undefined}
//                           >{prod.name}</h3>
//                           <div className="text-[11px] text-[#aaaaaa] mb-4 truncate">{prod.navCategory} <span className="mx-1">•</span> {prod.accordionCategory}</div>

//                           <div className="mt-auto flex items-center justify-between border-t border-[#f0f0f0] pt-3">
//                             <div className="flex flex-col min-w-0">
//                               <span className="text-[10px] text-[#aaaaaa] uppercase font-semibold tracking-wider">SKU &nbsp;|&nbsp; Size</span>
//                               <span className="text-[12px] font-medium text-[#555] truncate max-w-[130px]">{prod.sku} — {prod.size}</span>
//                             </div>
//                             {!isProductSortMode && (
//                               <div className="flex gap-1.5 shrink-0">
//                                 <button onClick={e => openEdit(prod._id, e)} className="text-[#aaaaaa] hover:text-[#0b9e7a] bg-[#f8f8f8] hover:bg-[#edf9f5] rounded-md p-1.5 transition-colors">{Icon.edit}</button>
//                                 <button onClick={e => { e.stopPropagation(); setProductToDelete(prod); }} className="text-[#aaaaaa] hover:text-red-500 bg-[#f8f8f8] hover:bg-red-50 rounded-md p-1.5 transition-colors">{Icon.trash}</button>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </main>

//       {/* ═══════════ MODALS ═══════════ */}
//       {isTileModalOpen && (
//         <UploadTileModal onClose={() => setIsTileModalOpen(false)} onSuccess={() => { fetchProductsData(); setIsTileModalOpen(false); }} />
//       )}
//       {isBulkModalOpen && (
//         <BulkUploadModal onClose={() => setIsBulkModalOpen(false)} onSuccess={() => { fetchProductsData(); setIsBulkModalOpen(false); }} />
//       )}
//       {detailProductIdId && (
//         <ProductDetailModal productId={detailProductIdId} initialMode={detailMode} onClose={closeDetail} onSuccess={fetchProductsData} />
//       )}
//       {productToDelete && (
//         <DeleteProductModal product={productToDelete} onClose={() => setProductToDelete(null)} onSuccess={() => { setProductToDelete(null); fetchProductsData(); }} />
//       )}
//     </div>
//   );
// }
