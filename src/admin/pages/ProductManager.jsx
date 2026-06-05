import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UploadTileModal from '../components/UploadTileModal';

// ── Icons (same as Overview) ──
const Icon = {
  grid:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  photo:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  stack:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  users:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  settings:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  plus:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

// ── Nav items (same as Overview) ──
const navItems = [
  { label: 'Overview',      icon: 'grid',     key: 'overview', path: '/admin',          group: null },
  { label: 'Room images',   icon: 'photo',    key: 'rooms',    path: '/admin/rooms',    group: 'MANAGE' },
  { label: 'Tile products', icon: 'stack',    key: 'products', path: '/admin/products', group: null },
  { label: 'Admin users',   icon: 'users',    key: 'users',    path: '/admin/sidebar',  group: 'SETTINGS' },
  { label: 'Settings',      icon: 'settings', key: 'settings', path: '/admin/settings', group: null },
];

export default function ProductManager() {
  const [isTileModalOpen, setIsTileModalOpen] = useState(false);
  const [activeType, setActiveType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const activePage = navItems.find(item => item.path === location.pathname)?.key || 'products';

  const types = ['All', 'Flooring Products', 'Luxury Vinyl Tile'];

  async function fetchProductsData() {
    setLoading(true);
    try {
      const response = await fetch('https://wonderfloor-dashboard.vercel.app/products');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = products.filter(prod => {
    const matchesType = activeType === 'All' || prod.navCategory === activeType;
    const matchesSearch =
      (prod.name && prod.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prod.sku && prod.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

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

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-[58px] border-b border-[#e8e8e8] flex items-center justify-between px-7 shrink-0 bg-white">
          <h1 className="text-base font-medium text-[#111111] m-0">Tile products</h1>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-[#e0e0e0] text-[#111111] placeholder-[#aaaaaa] pl-8 pr-4 py-[7px] rounded-lg focus:outline-none focus:border-[#0b9e7a] w-56 text-[13px] transition-colors"
              />
            </div>
            {/* Add button */}
            <button
              onClick={() => setIsTileModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-[7px] bg-[#0b9e7a] border border-[#0b9e7a] rounded-lg text-white text-[13px] font-medium transition-all duration-150 cursor-pointer hover:bg-[#09866a] whitespace-nowrap shadow-sm"
            >
              {Icon.plus} Add Product
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-6 px-7">

          {/* Subtitle */}
          <p className="text-sm text-[#aaaaaa] mb-5">
            {products.length} product{products.length !== 1 ? 's' : ''} in catalogue
          </p>

          {/* Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                  activeType === type
                    ? 'bg-[#0b9e7a] text-white border border-[#0b9e7a] shadow-sm'
                    : 'bg-white border border-[#e0e0e0] text-[#666666] hover:border-[#aaaaaa] hover:text-[#111111]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                    {['Product Details', 'SKU', 'Collection', 'Dimensions', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-[#aaaaaa] uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">

                  {loading && (
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center text-[#aaaaaa] text-sm">
                        <svg className="mx-auto mb-3 opacity-30 animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Loading products from database...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-[#fafafa] transition-colors duration-100">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden border border-[#e8e8e8] bg-[#f5f5f5]">
                            <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[#111111] leading-tight">{prod.name}</p>
                            <p className="text-xs text-[#aaaaaa] mt-0.5">{prod.navCategory}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#888888]">{prod.sku}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block bg-[#f0f0f0] text-[#666666] px-2.5 py-1 rounded-full text-[11px] font-medium">
                          {prod.accordionCategory}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#666666]">{prod.size}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="text-[#888888] hover:text-[#0b9e7a] transition-colors cursor-pointer px-2 text-sm font-medium">Edit</button>
                        <button className="text-[#888888] hover:text-red-500 transition-colors cursor-pointer px-2 text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center">
                        <svg className="mx-auto mb-3 opacity-20" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                          <polyline points="2 17 12 22 22 17"/>
                          <polyline points="2 12 12 17 22 12"/>
                        </svg>
                        <p className="text-sm font-medium text-[#888888]">No products found</p>
                        <p className="text-xs text-[#aaaaaa] mt-1">Try adjusting your search or filter.</p>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {isTileModalOpen && (
        <UploadTileModal
          onClose={() => setIsTileModalOpen(false)}
          onSuccess={() => { fetchProductsData(); setIsTileModalOpen(false); }}
        />
      )}
    </div>
  );
}