// ProductDetailModal.jsx
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';

/* ─── shared label + input primitives ────────────────────────────── */
const Label = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{children}</p>
);

const inputCls =
  'w-full px-3 py-2 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-lg ' +
  'focus:outline-none focus:border-[#0b9e7a] focus:ring-2 focus:ring-[#0b9e7a]/10 ' +
  'placeholder-gray-300 transition-all duration-150';

/* ─── helpers ─────────────────────────────────────────────────────── */
function toForm(p) {
  return {
    name:              p.name              ?? '',
    sku:               p.sku               ?? '',
    size:              p.size              ?? '',
    navCategory:       p.navCategory       ?? '',
    accordionCategory: p.accordionCategory ?? '',
    colour:            p.colour            ?? '',
    shade:             p.shade             ?? '',
    description:       p.description       ?? '',
    userIndustry:      p.userIndustry      ?? [],
    img:               p.img               ?? '',
  };
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function ProductDetailModal({
  productId,
  initialMode = 'view',   // 'view' | 'edit'
  onClose,
  onSuccess,              // called after a successful save (e.g. refetch list)
}) {
  const [product,   setProduct]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [mode,      setMode]      = useState(initialMode);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tagInput,  setTagInput]  = useState('');

  // New Image Handling States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl]     = useState('');

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  /* reset mode whenever the target product changes */
  useEffect(() => {
    setMode(initialMode);
    cleanupImageStates();
  }, [productId, initialMode]);

  /* fetch product data */
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`${BASE_URL}/products/${productId}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(data => { setProduct(data); setForm(toForm(data)); })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, [productId]);

  /* cleanup helper */
  function cleanupImageStates() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl('');
  }

  /* field setter */
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  /* handle local file select */
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Generate a client-side blob URL for instant UI thumbnail refresh
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  /* tag helpers */
  function commitTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,+$/, '');
      if (tag && !form.userIndustry.includes(tag))
        set('userIndustry', [...form.userIndustry, tag]);
      setTagInput('');
    }
  }
  const removeTag = tag => set('userIndustry', form.userIndustry.filter(t => t !== tag));

  /* cancel edit */
  function handleCancel() {
    if (product) setForm(toForm(product));
    cleanupImageStates();
    setSaveError('');
    setMode('view');
  }

  /* save changes via FormData payload submission */
  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const formData = new FormData();

      // Append textual configuration properties
      Object.keys(form).forEach(key => {
        if (key === 'userIndustry') {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });

      // Append binary file parameter if a user selected one
      if (selectedFile) {
        formData.append('tileImage', selectedFile);
      }

      const res = await fetch(`${BASE_URL}/products/${productId}`, {
        method: 'PATCH',
        body: formData, // Crucial: Do not supply 'Content-Type' header here. Browser automatically calculates the Multipart form boundaries
      });
      
      if (!res.ok) throw new Error(`Update failed with status: ${res.status}`);
      const updated = await res.json();
      
      setProduct(updated);
      setForm(toForm(updated));
      cleanupImageStates();
      setMode('view');
      onSuccess?.();
    } catch (err) {
      console.error('Save error:', err);
      setSaveError('Save failed — please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!productId) return null;

  /* fallback configuration pipeline checks */
  const displayImg = mode === 'edit' 
    ? (previewUrl || form.img || 'https://placehold.co/300x300?text=No+Image') 
    : (product?.img || 'https://placehold.co/300x300?text=No+Image');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden
                      flex flex-col md:flex-row max-h-[90vh] z-10 animate-fade-in">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-700
                     bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-100
                     transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {loading ? (
          <div className="w-full flex flex-col items-center justify-center py-32 text-sm text-[#aaaaaa]">
            <svg className="animate-spin mb-3 text-[#0b9e7a]" width="28" height="28"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Loading product…
          </div>
        ) : !product ? (
          <div className="w-full flex flex-col items-center justify-center py-24 text-center gap-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1.5" className="mb-1">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm font-medium text-gray-500">Product not found.</p>
            <button onClick={onClose} className="px-4 py-2 bg-[#0b9e7a] text-white rounded-lg text-sm font-medium">Close</button>
          </div>
        ) : (
          <>
            {/* ── LEFT: image panel ── */}
            <div className="w-full md:w-[42%] bg-[#fafafa] flex items-center justify-center p-8
                            border-b md:border-b-0 md:border-r border-gray-100 relative shrink-0">

              <div className="aspect-square w-full max-w-[300px] rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <img
                  src={displayImg}
                  alt={form.name || product.name}
                  className="w-full h-full object-cover transition-all duration-500"
                  onError={e => { e.target.src = 'https://placehold.co/300x300?text=No+Image'; }}
                />
              </div>

              <span
                className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all duration-200
                            ${mode === 'edit' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-[#edf9f5] text-[#0b9e7a] border-[#0b9e7a]/20'}`}
              >
                {mode === 'edit' ? '✏ Editing' : '● Live View'}
              </span>

              <span className="absolute bottom-4 left-6 text-[9px] font-mono bg-gray-200/50 text-gray-400 px-2 py-0.5 rounded">
                ID: {product._id}
              </span>
            </div>

            {/* ── RIGHT: detail / edit panel ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

              <div className="px-8 pt-7 pb-4 border-b border-gray-100 shrink-0">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2.5 py-0.5 bg-[#edf9f5] text-[#0b9e7a] text-xs font-semibold rounded-full">
                    {mode === 'edit' ? form.navCategory || '—' : product.navCategory}
                  </span>
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {mode === 'edit' ? form.accordionCategory || '—' : product.accordionCategory}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 truncate">
                  {mode === 'edit' ? form.name || 'Untitled Product' : product.name}
                </h2>
                <p className="text-xs font-mono text-gray-400 mt-0.5">
                  SKU: {mode === 'edit' ? form.sku : product.sku}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                {mode === 'view'
                  ? <ViewPanel product={product} />
                  : <EditPanel
                      form={form} set={set}
                      tagInput={tagInput} setTagInput={setTagInput}
                      commitTag={commitTag} removeTag={removeTag}
                      saveError={saveError}
                      handleFileChange={handleFileChange}
                      selectedFile={selectedFile}
                    />
                }
              </div>

              <div className="px-8 pb-7 pt-4 border-t border-gray-100 shrink-0 flex gap-3">
                {mode === 'view' ? (
                  <>
                    <button
                      onClick={() => setMode('edit')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0b9e7a] hover:bg-[#09866a] text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit Product
                    </button>
                    <a
                      href={product.img} target="_blank" rel="noreferrer"
                      className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl transition-colors text-center"
                    >
                      View Asset
                    </a>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave} disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0b9e7a] hover:bg-[#09866a] disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
                    >
                      {saving ? (
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button onClick={handleCancel} className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl transition-colors cursor-pointer">Cancel</button>
                  </>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   VIEW PANEL
═══════════════════════════════════════════════════════════════════ */
function ViewPanel({ product }) {
  const specCards = [
    { label: 'Physical Size',  value: product.size,   span: false },
    { label: 'Colour Variant', value: product.colour, span: false },
    { label: 'Shade Value',    value: product.shade,  span: true  },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {specCards.map(({ label, value, span }) => (
          <div key={label} className={`bg-gray-50/60 p-3 rounded-xl border border-gray-100 ${span ? 'col-span-2' : ''}`}>
            <Label>{label}</Label>
            <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
          </div>
        ))}
      </div>

      {product.description && (
        <div>
          <Label>Description</Label>
          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100/70">
            {product.description}
          </p>
        </div>
      )}

      <div>
        <Label>Target Sectors</Label>
        <div className="flex flex-wrap gap-1.5">
          {product.userIndustry?.length > 0 ? (
            product.userIndustry.map((ind, i) => (
              <span key={i} className="px-2.5 py-1 bg-gray-100/80 border border-gray-200 text-gray-600 text-[11px] font-medium rounded-md">
                {ind}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">Universal Scope Application</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EDIT PANEL
═══════════════════════════════════════════════════════════════════ */
function EditPanel({ form, set, tagInput, setTagInput, commitTag, removeTag, saveError, handleFileChange, selectedFile }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Product Name</Label>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Calacatta Marble Tile" className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>SKU</Label>
          <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. CAL-001" className={inputCls} />
        </div>
        <div>
          <Label>Size</Label>
          <input value={form.size} onChange={e => set('size', e.target.value)} placeholder="e.g. 600×600 mm" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Category</Label>
          <input value={form.navCategory} onChange={e => set('navCategory', e.target.value)} placeholder="e.g. Flooring Products" className={inputCls} />
        </div>
        <div>
          <Label>Collection</Label>
          <input value={form.accordionCategory} onChange={e => set('accordionCategory', e.target.value)} placeholder="e.g. Marble Series" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Colour Variant</Label>
          <input value={form.colour} onChange={e => set('colour', e.target.value)} placeholder="e.g. White/Grey" className={inputCls} />
        </div>
        <div>
          <Label>Shade Value</Label>
          <input value={form.shade} onChange={e => set('shade', e.target.value)} placeholder="e.g. Light" className={inputCls} />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Short product description…" className={`${inputCls} resize-none`} />
      </div>

      {/* REPLACED: Text Input URL field swapped for clean Custom Upload Field Container */}
      <div>
        <Label>Product Image Asset</Label>
        <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#0b9e7a] rounded-xl p-4 bg-white transition-colors duration-150">
          <input 
            type="file" 
            accept="image/*"
            id="modalTileImageFile"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="flex flex-col items-center text-center gap-1 pointer-events-none">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0b9e7a" strokeWidth="2" className="mb-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-xs font-semibold text-gray-700">
              {selectedFile ? 'Change Selected Image File' : 'Click to Upload Asset File'}
            </p>
            <p className="text-[10px] text-gray-400">
              {selectedFile ? `File: ${selectedFile.name}` : 'PNG, JPG, JPEG or WEBP formats up to 10MB'}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 pl-0.5">Preview updates instantly in the canvas workspace on the left.</p>
      </div>

      <div>
        <Label>Target Sectors</Label>
        <div className="min-h-[42px] flex flex-wrap gap-1.5 p-2 bg-white border border-gray-200 rounded-lg focus-within:border-[#0b9e7a] focus-within:ring-2 focus-within:ring-[#0b9e7a]/10 transition-all cursor-text" onClick={e => e.currentTarget.querySelector('input')?.focus()}>
          {form.userIndustry.map(tag => (
            <span key={tag} className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-[#edf9f5] border border-[#0b9e7a]/20 text-[#0b9e7a] text-[11px] font-semibold rounded-md whitespace-nowrap">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="text-[#0b9e7a]/50 hover:text-[#0b9e7a] leading-none hover:bg-[#0b9e7a]/10 rounded p-0.5 transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </span>
          ))}
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={commitTag} placeholder={form.userIndustry.length === 0 ? 'Type a sector, press Enter…' : ''} className="flex-1 min-w-[130px] text-[13px] text-gray-800 placeholder-gray-300 bg-transparent outline-none py-0.5 px-1" />
        </div>
        <p className="text-[10px] text-gray-400 mt-1 pl-0.5">Press <kbd className="font-mono bg-gray-100 px-1 rounded text-[9px]">Enter</kbd> or <kbd className="font-mono bg-gray-100 px-1 rounded text-[9px]">,</kbd> to add · click × to remove</p>
      </div>

      {saveError && (
        <div className="flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {saveError}
        </div>
      )}
    </div>
  );
}
