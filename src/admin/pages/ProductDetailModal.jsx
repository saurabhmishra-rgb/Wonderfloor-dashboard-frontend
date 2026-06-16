import { useState, useEffect } from 'react';
import ProductEdit from './ProductEdit';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';



// ─── Safely parse and clean nested stringified arrays from the database ───
function safeParseArray(data) {
  if (!data) return [];

  let parsed = data;

  // 1. If it's an array but the inner item is a stringified array (e.g., ['["Living Room"]'])
  if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'string' && parsed[0].includes('[')) {
    parsed = parsed[0];
  }

  // 2. Keep parsing until it is no longer a string
  try {
    while (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
  } catch (e) {
    // 3. Fallback: if it's completely broken, strip brackets and quotes manually
    if (typeof parsed === 'string') {
      return parsed.replace(/[\[\]\\"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  return Array.isArray(parsed) ? parsed : [];
}

// ── SpecCard outside component ──
const SpecCard = ({ label, value }) => (
  <div className="border border-gray-100 rounded-xl p-4 flex flex-col justify-center bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</p>
    <p className="text-[13px] font-semibold text-gray-800 leading-tight">
      {value || <span className="text-gray-300 font-normal">—</span>}
    </p>
  </div>
);

export default function ProductDetailModal({ productId, initialMode = 'view', onClose, onSuccess }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(initialMode);

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Fetch product data
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`${BASE_URL}/products/${productId}`)
      .then(r => r.json())
      .then(data => setProduct(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-[900px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[480px] max-h-[90vh] z-10">

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-700 bg-white/80 hover:bg-white rounded-full shadow-sm border border-gray-100 transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {loading ? (
          <div className="w-full flex justify-center items-center py-32 text-gray-400">
            <svg className="animate-spin mr-3 text-[#0b9e7a]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Loading details...
          </div>
        ) : mode === 'edit' ? (
          <ProductEdit
            product={product}
            onCancel={() => setMode('view')}
            onSaveSuccess={(updated) => {
              setProduct(updated);
              setMode('view');
              onSuccess?.();
            }}
          />
        ) : (
          <>
            {/* ── LEFT PANEL: Image ── */}
            <div className="w-full md:w-[48%] p-6 md:p-8 flex items-center justify-center relative shrink-0 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 relative shadow-sm border border-gray-100/50">
                <img
                  src={product?.img || 'https://placehold.co/600x600?text=No+Image'}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                />
                {/* Live View Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#0b9e7a]/20 rounded-full shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0b9e7a]"></div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#0b9e7a]">Live View</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL: Details ── */}
            <div className="flex-1 flex flex-col p-6 md:p-8 overflow-hidden">

              {/* Header */}
              <div className="mb-6 pr-8 shrink-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.navCategory && (
                    <span className="px-2.5 py-1 bg-[#edf9f5] text-[#0b9e7a] text-[10px] font-bold tracking-widest uppercase rounded-md border border-[#0b9e7a]/20">
                      {product.navCategory}
                    </span>
                  )}
                  {product.accordionCategory && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold tracking-widest uppercase rounded-md border border-slate-200">
                      {product.accordionCategory}
                    </span>
                  )}
                </div>
                <h2 className="text-[22px] font-bold tracking-tight text-gray-900 mb-1">
                  {product.name || 'Untitled Product'}
                </h2>
                <p className="text-[11px] font-mono text-gray-400 tracking-wide uppercase">
                  SKU: {product.sku || 'N/A'}
                </p>
              </div>

              {/* Scrollable Specs */}
              <div className="flex-1 overflow-y-auto pb-4 pr-2 space-y-6 custom-scrollbar">

                {/* Core Spec Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <SpecCard label="Physical Size" value={product.size} />
                  <SpecCard label="Thickness" value={product.thickness} />
                  <SpecCard label="Colour Variant" value={product.colour} />
                  <SpecCard label="Shade Value" value={product.shade} />
                  <SpecCard label="Style" value={product.style} />
                  <SpecCard label="Pattern / Layout" value={product.pattern} />
                </div>

                {/* User Industry */}
                {safeParseArray(product.userIndustry).length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">User Industry</p>
                    <div className="flex flex-wrap gap-1.5">
                      {safeParseArray(product.userIndustry).map((ind, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium rounded-md">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Areas */}
                {safeParseArray(product.applicationArea).length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Application Areas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {safeParseArray(product.applicationArea).map((area, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#edf9f5] border border-[#0b9e7a]/20 text-[#0b9e7a] text-[11px] font-medium rounded-md">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Tags */}
                {safeParseArray(product.tags).length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Search Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {safeParseArray(product.tags).map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Link */}
                {product.productLink && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Product Link</p>
                    <a
                      href={product.productLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] text-[#0b9e7a] hover:underline font-medium inline-flex items-center gap-1.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      View External Link
                    </a>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Description</p>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {product.description}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Edit Button */}
              <div className="mt-auto pt-6 shrink-0">
                <button
                  onClick={() => setMode('edit')}
                  className="w-full py-3.5 bg-[#0b9e7a] hover:bg-[#09866a] text-white text-[14px] font-semibold rounded-xl transition-colors shadow-sm shadow-[#0b9e7a]/20 cursor-pointer"
                >
                  Edit Product
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
