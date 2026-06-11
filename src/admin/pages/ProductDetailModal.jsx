import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';

// ─── Initial data constants ───────────────────────────────────────────────────
const INITIAL_NAV_CATEGORIES  = ['Flooring Products', 'Luxury Vinyl Tile'];
const INITIAL_COLLECTIONS     = [
  'Braavo', 'Krayons', 'Durofloor', 'Siggma', 'Orbit', 'Stoneland Monza',
  'Meteor', 'Aventus', 'Timberworld 1.5mm', 'Timberland Exotica 2mm',
  'Timberland Maestro 3mm', 'Timberland Widex', 'Timberland Herringbone',
  'Grandeure Supreme',
];
const INITIAL_SHADES          = ['Light', 'Medium', 'Dark'];
const INITIAL_COLOR_FAMILIES  = [
  'Grey', 'Beige', 'Brown', 'Black', 'White',
  'Blue', 'Green', 'Red', 'Orange', 'Yellow', 'Purple', 'Pink',
];

// ─── Persistent Memory (Lives outside the modal lifecycle) ────────────────────
let persistentNavCategories = [...INITIAL_NAV_CATEGORIES];
let persistentCollections   = [...INITIAL_COLLECTIONS];
let persistentColorFamilies = [...INITIAL_COLOR_FAMILIES];
let persistentShadeOptions  = [...INITIAL_SHADES];

/* ─── shared label primitive ─────────────────────────────────────── */
const Label = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{children}</p>
);

const inputCls =
  'w-full px-3 py-2 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-lg ' +
  'focus:outline-none focus:border-[#0b9e7a] focus:ring-2 focus:ring-[#0b9e7a]/10 ' +
  'placeholder-gray-300 transition-all duration-150';

/* ─── helpers ─────────────────────────────────────────────────────── */
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
    // NEW: Safely convert tags array to a comma-separated string for editing
    tags:              Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
  };
}

// ─── Custom Interactive Dropdown Component ────────────────────────────────────
function ToggleSelectField({
  label,
  value,
  onChange,
  options,
  onAddOption,
  onRemoveOption,
  selectPlaceholder = 'Select…',
  createPlaceholder,
}) {
  const [isCustom,    setIsCustom]    = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isOpen,      setIsOpen]      = useState(false);

  const handleToggle = () => {
    setIsCustom((prev) => !prev);
    setIsOpen(false);
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleAddCustomInline = () => {
    const val = customValue.trim();
    if (val) {
      if (!options.includes(val)) onAddOption(val);
      onChange(val);
      setIsCustom(false);
      setCustomValue('');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={handleToggle}
          className="text-xs text-[#0b9e7a] hover:text-[#098264] hover:underline font-semibold cursor-pointer transition-colors"
        >
          {isCustom ? 'Select Existing' : '+ Create New'}
        </button>
      </div>

      {isCustom ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={createPlaceholder || `Enter new ${label.toLowerCase()}…`}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleAddCustomInline}
            className="px-3 bg-gray-100 hover:bg-[#0b9e7a] text-gray-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            Add
          </button>
        </div>
      ) : (
        <div className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-[13px] border-gray-200 focus-within:border-[#0b9e7a] transition-all flex justify-between items-center cursor-pointer select-none"
          >
            <span className={value ? 'text-gray-800' : 'text-gray-300'}>
              {value || selectPlaceholder}
            </span>
            <div className="text-gray-400">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)}></div>
              <ul className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1">
                <li
                  onClick={() => handleSelect('')}
                  className="px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  {selectPlaceholder}
                </li>
                {options.map((opt) => (
                  <li
                    key={opt}
                    className="group px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 flex justify-between items-center cursor-pointer"
                    onClick={() => handleSelect(opt)}
                  >
                    <span className="truncate flex-1">{opt}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveOption(opt);
                        if (value === opt) onChange('');
                      }}
                      className="text-gray-400 hover:text-red-500 p-0.5 rounded hover:bg-gray-200/60 opacity-0 group-hover:opacity-100 transition-all ml-2"
                      title={`Remove ${opt}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6"  y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
    MAIN PRODUCT DETAIL MODAL COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function ProductDetailModal({
  productId,
  initialMode = 'view',
  onClose,
  onSuccess,
}) {
  const [product,   setProduct]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [mode,      setMode]      = useState(initialMode);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tagInput,  setTagInput]  = useState('');

  // Dropdown Tracked States
  const [navCategories, setNavCategories] = useState(persistentNavCategories);
  const [collections,   setCollections]   = useState(persistentCollections);
  const [colorFamilies, setColorFamilies] = useState(persistentColorFamilies);
  const [shadeOptions,  setShadeOptions]  = useState(persistentShadeOptions);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl,   setPreviewUrl]   = useState('');

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

  function cleanupImageStates() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl('');
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ✅ FIX 1: Client-side file size guard — rejects files over 10 MB instantly,
  //   before any network request is made, and surfaces a friendly inline error.
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      setSaveError(
        `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
        `Please use a file under ${MAX_MB} MB.`
      );
      e.target.value = ''; // reset the native file input so the user can re-pick
      return;
    }

    setSaveError(''); // clear any previous error
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

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

  function handleCancel() {
    if (product) setForm(toForm(product));
    cleanupImageStates();
    setSaveError('');
    setMode('view');
  }

async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const formData = new FormData();

      Object.keys(form).forEach(key => {
        if (key === 'userIndustry') {
          formData.append(key, JSON.stringify(form[key]));
        } else if (key === 'tags') {
          // NEW: Convert comma-separated string back to a clean array
          const tagsArray = (form[key] || '')
            .split(',')
            .map(t => t.trim())
            .filter(Boolean); // removes empty strings
            
          // Stringify so the backend can parse it as an array
          formData.append(key, JSON.stringify(tagsArray));
        } else {
          formData.append(key, form[key]);
        }
      });

      if (selectedFile) {
        formData.append('tileImage', selectedFile);
      }

      const res = await fetch(`${BASE_URL}/products/${productId}`, {
        method: 'PATCH',
        body: formData,
      });

      // ✅ FIX 2: Parse the server's error body before throwing so the real
      //   backend message (e.g. "File too large") reaches the UI error banner
      //   instead of a generic "Update failed with status: 500".
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const message   = errorBody?.error || errorBody?.message || `Save failed (status ${res.status})`;
        throw new Error(message);
      }

      const updated = await res.json();

      // Auto-save any brand new customized textual selections directly to global lists
      if (form.navCategory && !persistentNavCategories.includes(form.navCategory)) {
        persistentNavCategories = [...persistentNavCategories, form.navCategory];
        setNavCategories(persistentNavCategories);
      }
      if (form.accordionCategory && !persistentCollections.includes(form.accordionCategory)) {
        persistentCollections = [...persistentCollections, form.accordionCategory];
        setCollections(persistentCollections);
      }
      if (form.colour && !persistentColorFamilies.includes(form.colour)) {
        persistentColorFamilies = [...persistentColorFamilies, form.colour];
        setColorFamilies(persistentColorFamilies);
      }
      if (form.shade && !persistentShadeOptions.includes(form.shade)) {
        persistentShadeOptions = [...persistentShadeOptions, form.shade];
        setShadeOptions(persistentShadeOptions);
      }

      setProduct(updated);
      setForm(toForm(updated));
      cleanupImageStates();
      setMode('view');
      onSuccess?.();
    } catch (err) {
      console.error('Save error:', err);
      // Show the real server message if available, otherwise a fallback
      setSaveError(err.message || 'Save failed — please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!productId) return null;

  const displayImg = mode === 'edit'
    ? (previewUrl || form.img || 'https://placehold.co/300x300?text=No+Image')
    : (product?.img || 'https://placehold.co/300x300?text=No+Image');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] z-10 animate-fade-in">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-700 bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-100 transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {loading ? (
          <div className="w-full flex flex-col items-center justify-center py-32 text-sm text-[#aaaaaa]">
            <svg className="animate-spin mb-3 text-[#0b9e7a]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <div className="w-full md:w-[42%] bg-[#fafafa] flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100 relative shrink-0">
              <div className="aspect-square w-full max-w-[300px] rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <img
                  src={displayImg}
                  alt={form.name || product.name}
                  className="w-full h-full object-cover transition-all duration-500"
                  onError={e => { e.target.src = 'https://placehold.co/300x300?text=No+Image'; }}
                />
              </div>

              <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all duration-200 ${mode === 'edit' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-[#edf9f5] text-[#0b9e7a] border-[#0b9e7a]/20'}`}>
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
                {mode === 'view' ? (
                  <ViewPanel product={product} />
                ) : (
                  <EditPanel
                    form={form} set={set}
                    tagInput={tagInput} setTagInput={setTagInput}
                    commitTag={commitTag} removeTag={removeTag}
                    saveError={saveError}
                    handleFileChange={handleFileChange}
                    selectedFile={selectedFile}
                    navCategories={navCategories} setNavCategories={setNavCategories}
                    collections={collections} setCollections={setCollections}
                    colorFamilies={colorFamilies} setColorFamilies={setColorFamilies}
                    shadeOptions={shadeOptions} setShadeOptions={setShadeOptions}
                  />
                )}
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

      {/* NEW: Searchable Tags Display */}
      <div>
        <Label>Searchable Tags</Label>
        <div className="flex flex-wrap gap-1.5">
          {product.tags && product.tags.length > 0 ? (
            (Array.isArray(product.tags) ? product.tags : product.tags.split(',')).map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-[#edf9f5] border border-[#0b9e7a]/20 text-[#0b9e7a] text-[11px] font-medium rounded-md">
                {tag.trim()}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No search tags added</span>
          )}
        </div>
      </div>
      
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
    EDIT PANEL
═══════════════════════════════════════════════════════════════════ */
function EditPanel({
  form, set, tagInput, setTagInput, commitTag, removeTag, saveError, handleFileChange, selectedFile,
  navCategories, setNavCategories, collections, setCollections, colorFamilies, setColorFamilies, shadeOptions, setShadeOptions
}) {
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

      {/* Upgraded fields to interactive modular layout dropdown menus */}
      <div className="grid grid-cols-2 gap-3">
        <ToggleSelectField
          label="Category"
          value={form.navCategory}
          onChange={val => set('navCategory', val)}
          options={navCategories}
          onAddOption={(val) => {
            setNavCategories(prev => {
              const updated = [...prev, val];
              persistentNavCategories = updated;
              return updated;
            });
          }}
          onRemoveOption={(val) => {
            setNavCategories(prev => {
              const updated = prev.filter(i => i !== val);
              persistentNavCategories = updated;
              return updated;
            });
          }}
          selectPlaceholder="Select category..."
        />
        <ToggleSelectField
          label="Collection"
          value={form.accordionCategory}
          onChange={val => set('accordionCategory', val)}
          options={collections}
          onAddOption={(val) => {
            setCollections(prev => {
              const updated = [...prev, val];
              persistentCollections = updated;
              return updated;
            });
          }}
          onRemoveOption={(val) => {
            setCollections(prev => {
              const updated = prev.filter(i => i !== val);
              persistentCollections = updated;
              return updated;
            });
          }}
          selectPlaceholder="Select collection..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ToggleSelectField
          label="Colour Variant"
          value={form.colour}
          onChange={val => set('colour', val)}
          options={colorFamilies}
          onAddOption={(val) => {
            setColorFamilies(prev => {
              const updated = [...prev, val];
              persistentColorFamilies = updated;
              return updated;
            });
          }}
          onRemoveOption={(val) => {
            setColorFamilies(prev => {
              const updated = prev.filter(i => i !== val);
              persistentColorFamilies = updated;
              return updated;
            });
          }}
          selectPlaceholder="Select color..."
        />
        <ToggleSelectField
          label="Shade Value"
          value={form.shade}
          onChange={val => set('shade', val)}
          options={shadeOptions}
          onAddOption={(val) => {
            setShadeOptions(prev => {
              const updated = [...prev, val];
              persistentShadeOptions = updated;
              return updated;
            });
          }}
          onRemoveOption={(val) => {
            setShadeOptions(prev => {
              const updated = prev.filter(i => i !== val);
              persistentShadeOptions = updated;
              return updated;
            });
          }}
          selectPlaceholder="Select shade..."
        />
      </div>

      <div>
        <Label>Description</Label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Short product description…" className={`${inputCls} resize-none`} />
      </div>

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
      {/* NEW: Searchable Tags Input */}
      <div>
        <Label>Searchable Tags (Comma Separated)</Label>
        <input 
          value={form.tags} 
          onChange={e => set('tags', e.target.value)} 
          placeholder="e.g., mint, dark green, eco-friendly" 
          className={inputCls} 
        />
        <p className="text-[10px] text-gray-400 mt-1 pl-0.5">Add alternate names or keywords to help users find this tile in search.</p>
      </div>

      {saveError && (
        <div className="flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {saveError}
        </div>
      )}

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
