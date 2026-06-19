// ProductEdit.jsx
import { useState, useEffect } from 'react';
import ToggleSelectField from './ToggleSelectField';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';

// ─── 1. Initial Constants ─────────────────────────────────────────────────────
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

// ── Color swatch map (vibrant dots shown next to each color name) ──────────────
const COLOR_SWATCH_MAP = {
  Grey: '#9CA3AF', Beige: '#D4B483', Brown: '#92400E', Black: '#374151',
  White: '#E2E8F0', Blue: '#3B82F6', Green: '#10B981', Red: '#EF4444',
  Orange: '#F97316', Yellow: '#EAB308', Purple: '#8B5CF6', Pink: '#EC4899',
};
const INITIAL_THICKNESS_OPTIONS = [
  '1.0mm', '1.5mm', '2.0mm', '2.5mm', '3.0mm', '3.5mm', '4.0mm', '5.0mm',
];
const INITIAL_STYLE_OPTIONS = [
  'Homogeneous Flooring', 'Cushion Vinyl', 'Heterogeneous Flooring',
  'SPC Flooring', 'WPC Flooring', 'Printed Vinyl',
];
const INITIAL_PATTERN_OPTIONS = [
  'Non-Directional', 'Directional', 'Herringbone', 'Random', 'Linear',
];
const INITIAL_USER_INDUSTRIES = [
  'Industrial Flooring', 'Office Flooring', 'Residential Flooring',
  'School Flooring', 'Sports Flooring', 'Hotel/ Hospitality Flooring',
];
const INITIAL_APPLICATION_AREAS = [
  'Living Room', 'Bedroom', 'Kitchen', 'Bathroom',
  'Office', 'Corridor / Hallway', 'Retail Space',
  'Hospital / Healthcare', 'Basement', 'Outdoor',
];

// ─── 2. Persistent Memory ─────────────────────────────────────────────────────
let persistentNavCategories    = [...INITIAL_NAV_CATEGORIES];
let persistentCollections      = [...INITIAL_COLLECTIONS];
let persistentColorFamilies    = [...INITIAL_COLOR_FAMILIES];
let persistentShadeOptions     = [...INITIAL_SHADES];
let persistentThicknessOptions = [...INITIAL_THICKNESS_OPTIONS];
let persistentStyleOptions     = [...INITIAL_STYLE_OPTIONS];
let persistentPatternOptions   = [...INITIAL_PATTERN_OPTIONS];
let persistentIndustries       = [...INITIAL_USER_INDUSTRIES];
let persistentApplicationAreas = [...INITIAL_APPLICATION_AREAS];

// ─── 3. Helper Functions & UI Primitives ──────────────────────────────────────
const Label = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{children}</p>
);

const inputCls =
  'w-full px-3 py-2 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-lg ' +
  'focus:outline-none focus:border-[#0b9e7a] focus:ring-2 focus:ring-[#0b9e7a]/10 ' +
  'placeholder-gray-300 transition-all duration-150';

// ─── Small icon helpers (for MultiSelectDropdown) ─────────────────────────────
function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function CheckIcon({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function ChevronIcon({ open }) {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── MultiSelectDropdown (checkbox-based multi-select, gray theme to match this file) ──
function MultiSelectDropdown({
  label, options, selected, onToggle, onAddOption, onRemoveOption,
  placeholder = 'Select…', addPlaceholder, showSwatches = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newInput, setNewInput] = useState('');

  const handleAdd = () => {
    const val = newInput.trim();
    if (!val) return;
    if (!options.includes(val)) onAddOption(val);
    if (!selected.includes(val)) onToggle(val);
    setNewInput('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <Label>{label}</Label>
        {selected.length > 0 && (
          <span className="text-[10px] text-[#0b9e7a] font-semibold">{selected.length} selected</span>
        )}
      </div>

      <div className="relative">
        <div onClick={() => setIsOpen(p => !p)}
          className={`w-full bg-white border rounded-lg px-3 py-2 text-[13px] transition-all flex justify-between items-center cursor-pointer select-none
            ${isOpen ? 'border-[#0b9e7a] ring-2 ring-[#0b9e7a]/10' : 'border-gray-200 hover:border-gray-300'}`}>
          {selected.length > 0 ? (
            <span className="flex items-center gap-1.5 flex-1 min-w-0">
              {showSwatches && selected.slice(0, 4).map(s => (
                <span key={s} className="w-3 h-3 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: COLOR_SWATCH_MAP[s] || '#94a3b8' }} />
              ))}
              <span className="truncate text-gray-800">
                {selected.length <= 2 ? selected.join(', ') : `${selected.slice(0, 2).join(', ')} +${selected.length - 2} more`}
              </span>
            </span>
          ) : (
            <span className="text-gray-300">{placeholder}</span>
          )}
          <span className="text-gray-400 ml-2 shrink-0"><ChevronIcon open={isOpen} /></span>
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
            <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <ul className="max-h-48 overflow-y-auto py-1">
                {options.map(opt => {
                  const checked = selected.includes(opt);
                  const swatch = showSwatches ? (COLOR_SWATCH_MAP[opt] || null) : null;
                  return (
                    <li key={opt}
                      className="group flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onToggle(opt)}>
                      <span className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                          ${checked ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-gray-50 border-gray-300 group-hover:border-gray-400'}`}>
                          {checked && <CheckIcon />}
                        </span>
                        {swatch && (
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
                            style={{ backgroundColor: swatch }} />
                        )}
                        <span className="text-[13px] text-gray-700 truncate">{opt}</span>
                      </span>
                      <button type="button"
                        onClick={e => { e.stopPropagation(); onRemoveOption(opt); if (checked) onToggle(opt); }}
                        className="text-gray-300 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all ml-1 shrink-0"
                        title={`Remove ${opt}`}>
                        <XIcon size={12} />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-gray-100 p-2 flex gap-2 bg-gray-50/60">
                <input
                  type="text"
                  value={newInput}
                  onChange={e => setNewInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                  placeholder={addPlaceholder || 'Add custom…'}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-800 focus:border-[#0b9e7a] focus:outline-none transition-all placeholder:text-gray-400"
                />
                <button type="button" onClick={e => { e.stopPropagation(); handleAdd(); }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-[#0b9e7a] text-gray-600 hover:text-white rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap">
                  + Add
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(s => (
            <span key={s}
              className="inline-flex items-center gap-1 bg-[#0b9e7a]/10 text-[#0b9e7a] text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {showSwatches && (
                <span className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                  style={{ backgroundColor: COLOR_SWATCH_MAP[s] || '#94a3b8' }} />
              )}
              {s}
              <button type="button" onClick={() => onToggle(s)}
                className="text-[#0b9e7a]/50 hover:text-[#0b9e7a] ml-0.5 transition-colors">
                <XIcon size={9} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function safeParseArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    let parsed = JSON.parse(data);
    while (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    return typeof data === 'string' ? data.split(',').map(s => s.trim()) : [];
  }
}

function toForm(p) {
  return {
    name:              p.name              ?? '',
    sku:               p.sku               ?? '',
    size:              p.size              ?? '',
    navCategory:       p.navCategory       ?? '',
    accordionCategory: p.accordionCategory ?? '',
    colour:            p.colour            ?? '',
    shade:             p.shade             ?? '',
    thickness:         p.thickness         ?? '',
    style:             p.style             ?? '',
    pattern:           p.pattern           ?? '',
    productLink:       p.productLink       ?? '',
    description:       p.description       ?? '',
    img:               p.img               ?? '',
    tags:              Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
  };
}

// ─── 4. Main Component ────────────────────────────────────────────────────────
export default function ProductEdit({ product, onCancel, onSaveSuccess }) {
  const [form, setForm] = useState(toForm(product));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 🌟 FIX: Helper to safely merge existing database values into our option lists
  const syncOptions = (persistentArray, newValues) => {
    return Array.from(new Set([...persistentArray, ...newValues])).filter(Boolean);
  };

  // Merge product's existing industries into the options list
  const initialSelectedIndustries = safeParseArray(product.userIndustry);
  const [industries, setIndustries] = useState(() => {
    persistentIndustries = syncOptions(persistentIndustries, initialSelectedIndustries);
    return persistentIndustries;
  });
  const [selectedIndustries, setSelectedIndustries] = useState(initialSelectedIndustries);
  const [newIndustryInput, setNewIndustryInput] = useState('');

  // Merge product's existing application areas into the options list
  const initialSelectedAreas = safeParseArray(product.applicationArea);
  const [applicationAreas, setApplicationAreas] = useState(() => {
    persistentApplicationAreas = syncOptions(persistentApplicationAreas, initialSelectedAreas);
    return persistentApplicationAreas;
  });
  const [selectedApplicationAreas, setSelectedApplicationAreas] = useState(initialSelectedAreas);
  const [newApplicationAreaInput, setNewApplicationAreaInput] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // 🌟 FIX: Apply syncOptions to ToggleSelectFields as well so custom dropdown options don't vanish!
  const [navCategories, setNavCategories] = useState(() => { persistentNavCategories = syncOptions(persistentNavCategories, [product.navCategory]); return persistentNavCategories; });
  const [collections, setCollections] = useState(() => { persistentCollections = syncOptions(persistentCollections, [product.accordionCategory]); return persistentCollections; });

  const initialSelectedColors = safeParseArray(product.colour);
  const [colorFamilies, setColorFamilies] = useState(() => {
    persistentColorFamilies = syncOptions(persistentColorFamilies, initialSelectedColors);
    return persistentColorFamilies;
  });
  const [selectedColors, setSelectedColors] = useState(initialSelectedColors);

  const [shadeOptions, setShadeOptions] = useState(() => { persistentShadeOptions = syncOptions(persistentShadeOptions, [product.shade]); return persistentShadeOptions; });
  const initialSelectedThickness = safeParseArray(product.thickness);
  const [thicknessOptions, setThicknessOptions] = useState(() => {
    persistentThicknessOptions = syncOptions(persistentThicknessOptions, initialSelectedThickness);
    return persistentThicknessOptions;
  });
  const [selectedThicknessValues, setSelectedThicknessValues] = useState(initialSelectedThickness);

  const [styleOptions, setStyleOptions] = useState(() => { persistentStyleOptions = syncOptions(persistentStyleOptions, [product.style]); return persistentStyleOptions; });
  const [patternOptions, setPatternOptions] = useState(() => { persistentPatternOptions = syncOptions(persistentPatternOptions, [product.pattern]); return persistentPatternOptions; });

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSaveError(`Image is too large. Please use a file under 10 MB.`);
      e.target.value = ''; 
      return;
    }

    setSaveError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const toggleIndustry = (ind) =>
    setSelectedIndustries(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    );

  const handleAddCustomIndustry = () => {
    const val = newIndustryInput.trim();
    if (!val) return;
    if (!industries.includes(val)) {
      setIndustries(prev => { const u = [...prev, val]; persistentIndustries = u; return u; });
    }
    if (!selectedIndustries.includes(val)) setSelectedIndustries(prev => [...prev, val]);
    setNewIndustryInput('');
  };

  const toggleApplicationArea = (area) =>
    setSelectedApplicationAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );

  const toggleThickness = (val) =>
    setSelectedThicknessValues(prev =>
      prev.includes(val) ? prev.filter(t => t !== val) : [...prev, val]
    );

  const toggleColor = (val) =>
    setSelectedColors(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    );

  const handleAddCustomApplicationArea = () => {
    const val = newApplicationAreaInput.trim();
    if (!val) return;
    if (!applicationAreas.includes(val)) {
      setApplicationAreas(prev => { const u = [...prev, val]; persistentApplicationAreas = u; return u; });
    }
    if (!selectedApplicationAreas.includes(val)) setSelectedApplicationAreas(prev => [...prev, val]);
    setNewApplicationAreaInput('');
  };

async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const formData = new FormData();
      
      // 1. Loop through standard text fields
      Object.keys(form).forEach(key => {
        if (key === 'tags') {
          formData.set(key, JSON.stringify((form[key] || '').split(',').map(t => t.trim()).filter(Boolean)));
        } else if (key === 'thickness' || key === 'colour') {
          // skipped — handled explicitly below as multi-select arrays (style stays a plain single value)
        } else {
          formData.set(key, form[key]); // USE .set() INSTEAD OF .append()
        }
      });
      
      // 2. Explicitly SET the custom arrays so they don't duplicate
      formData.set('userIndustry', JSON.stringify(selectedIndustries));
      formData.set('applicationArea', JSON.stringify(selectedApplicationAreas));
      formData.set('thickness', JSON.stringify(selectedThicknessValues));
      formData.set('colour', JSON.stringify(selectedColors));
      
      if (selectedFile) formData.set('tileImage', selectedFile);

      const res = await fetch(`${BASE_URL}/products/${product._id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message || 'Save failed');
      }
      
      const updated = await res.json();
      onSaveSuccess(updated);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const displayImg = previewUrl || form.img || 'https://placehold.co/300x300?text=No+Image';

  return (
    <>
      <div className="w-full md:w-[42%] bg-[#fafafa] flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100 relative shrink-0">
        <div className="aspect-square w-full max-w-[300px] rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <img src={displayImg} alt={form.name} className="w-full h-full object-cover" />
        </div>
        <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-200">
          ✏ Editing
        </span>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="px-8 pt-7 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 truncate">
            Editing: {form.name || 'Untitled'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
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
            <ToggleSelectField
              label="Category"
              value={form.navCategory}
              onChange={val => set('navCategory', val)}
              options={navCategories}
              onAddOption={val => setNavCategories(p => { const u = [...p, val]; persistentNavCategories = u; return u; })}
              onRemoveOption={val => setNavCategories(p => { const u = p.filter(i => i !== val); persistentNavCategories = u; return u; })}
              onEditOption={(oldVal, newVal) => setNavCategories(p => { const u = p.map(i => i === oldVal ? newVal : i); persistentNavCategories = u; return u; })}
            />
            <ToggleSelectField
              label="Collection"
              value={form.accordionCategory}
              onChange={val => set('accordionCategory', val)}
              options={collections}
              onAddOption={val => setCollections(p => { const u = [...p, val]; persistentCollections = u; return u; })}
              onRemoveOption={val => setCollections(p => { const u = p.filter(i => i !== val); persistentCollections = u; return u; })}
              onEditOption={(oldVal, newVal) => setCollections(p => { const u = p.map(i => i === oldVal ? newVal : i); persistentCollections = u; return u; })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MultiSelectDropdown
              label="Colour Variant"
              options={colorFamilies}
              selected={selectedColors}
              onToggle={toggleColor}
              onAddOption={val => setColorFamilies(p => { const u = [...p, val]; persistentColorFamilies = u; return u; })}
              onRemoveOption={val => { setColorFamilies(p => { const u = p.filter(i => i !== val); persistentColorFamilies = u; return u; }); setSelectedColors(p => p.filter(c => c !== val)); }}
              placeholder="Select color(s)…"
              addPlaceholder="e.g., Terra Cotta"
              showSwatches={true}
            />
            <ToggleSelectField
              label="Shade Value"
              value={form.shade}
              onChange={val => set('shade', val)}
              options={shadeOptions}
              onAddOption={val => setShadeOptions(p => { const u = [...p, val]; persistentShadeOptions = u; return u; })}
              onRemoveOption={val => setShadeOptions(p => { const u = p.filter(i => i !== val); persistentShadeOptions = u; return u; })}
              onEditOption={(oldVal, newVal) => setShadeOptions(p => { const u = p.map(i => i === oldVal ? newVal : i); persistentShadeOptions = u; return u; })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MultiSelectDropdown
              label="Thickness"
              options={thicknessOptions}
              selected={selectedThicknessValues}
              onToggle={toggleThickness}
              onAddOption={val => setThicknessOptions(p => { const u = [...p, val]; persistentThicknessOptions = u; return u; })}
              onRemoveOption={val => { setThicknessOptions(p => { const u = p.filter(i => i !== val); persistentThicknessOptions = u; return u; }); setSelectedThicknessValues(p => p.filter(t => t !== val)); }}
              placeholder="Select thickness(es)…"
              addPlaceholder="e.g., 4.5mm"
            />
            <ToggleSelectField
              label="Style"
              value={form.style}
              onChange={val => set('style', val)}
              options={styleOptions}
              onAddOption={val => setStyleOptions(p => { const u = [...p, val]; persistentStyleOptions = u; return u; })}
              onRemoveOption={val => setStyleOptions(p => { const u = p.filter(i => i !== val); persistentStyleOptions = u; return u; })}
              onEditOption={(oldVal, newVal) => setStyleOptions(p => { const u = p.map(i => i === oldVal ? newVal : i); persistentStyleOptions = u; return u; })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ToggleSelectField
              label="Pattern / Layout"
              value={form.pattern}
              onChange={val => set('pattern', val)}
              options={patternOptions}
              onAddOption={val => setPatternOptions(p => { const u = [...p, val]; persistentPatternOptions = u; return u; })}
              onRemoveOption={val => setPatternOptions(p => { const u = p.filter(i => i !== val); persistentPatternOptions = u; return u; })}
              onEditOption={(oldVal, newVal) => setPatternOptions(p => { const u = p.map(i => i === oldVal ? newVal : i); persistentPatternOptions = u; return u; })}
            />
          </div>

          <div>
            <Label>Product Link</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              </span>
              <input type="url" value={form.productLink} onChange={e => set('productLink', e.target.value)} placeholder="https://example.com/product-page" className={`${inputCls} pl-9`} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Short product description…" className={`${inputCls} resize-none`} />
          </div>

          <div>
            <Label>Product Image Asset</Label>
            <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#0b9e7a] rounded-xl p-4 bg-white transition-colors duration-150">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
              <div className="flex flex-col items-center text-center gap-1 pointer-events-none">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0b9e7a" strokeWidth="2" className="mb-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="text-xs font-semibold text-gray-700">{selectedFile ? 'Change Selected Image File' : 'Click to Upload Asset File'}</p>
                <p className="text-[10px] text-gray-400">{selectedFile ? `File: ${selectedFile.name}` : 'PNG, JPG, JPEG or WEBP formats up to 10MB'}</p>
              </div>
            </div>
          </div>

          {/* ── Recommended Industries ── */}
          <div>
            <Label>Recommended Industries</Label>
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {industries.map(ind => (
                  <div key={ind} className="relative group flex items-center justify-between py-1 px-2 border border-transparent hover:border-gray-100 rounded-lg transition-all">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input type="checkbox" className="hidden" checked={selectedIndustries.includes(ind)} onChange={() => toggleIndustry(ind)} />
                      <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${selectedIndustries.includes(ind) ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-gray-50 border-gray-300 group-hover:border-gray-400'}`}>
                        {selectedIndustries.includes(ind) && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors truncate pr-4">{ind}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIndustries(prev => { const u = prev.filter(i => i !== ind); persistentIndustries = u; return u; });
                        setSelectedIndustries(prev => prev.filter(i => i !== ind));
                      }}
                      className="text-gray-400 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Remove ${ind}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <input
                  type="text" value={newIndustryInput}
                  onChange={e => setNewIndustryInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomIndustry())}
                  placeholder="Type custom industry…"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:bg-white focus:border-[#0b9e7a] focus:outline-none transition-all placeholder:text-gray-400"
                />
                <button type="button" onClick={handleAddCustomIndustry}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-[#0b9e7a] text-gray-600 hover:text-white rounded-lg text-xs font-semibold transition-all whitespace-nowrap">
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* ── Application Areas ── */}
          <div>
            <Label>Application Areas</Label>
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {applicationAreas.map(area => (
                  <div key={area} className="relative group flex items-center justify-between py-1 px-2 border border-transparent hover:border-gray-100 rounded-lg transition-all">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input type="checkbox" className="hidden" checked={selectedApplicationAreas.includes(area)} onChange={() => toggleApplicationArea(area)} />
                      <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${selectedApplicationAreas.includes(area) ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-gray-50 border-gray-300 group-hover:border-gray-400'}`}>
                        {selectedApplicationAreas.includes(area) && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors truncate pr-4">{area}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setApplicationAreas(prev => { const u = prev.filter(a => a !== area); persistentApplicationAreas = u; return u; });
                        setSelectedApplicationAreas(prev => prev.filter(a => a !== area));
                      }}
                      className="text-gray-400 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Remove ${area}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <input
                  type="text" value={newApplicationAreaInput}
                  onChange={e => setNewApplicationAreaInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomApplicationArea())}
                  placeholder="Type custom area…"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:bg-white focus:border-[#0b9e7a] focus:outline-none transition-all placeholder:text-gray-400"
                />
                <button type="button" onClick={handleAddCustomApplicationArea}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-[#0b9e7a] text-gray-600 hover:text-white rounded-lg text-xs font-semibold transition-all whitespace-nowrap">
                  + Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <Label>Searchable Tags (Comma Separated)</Label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g., mint, dark green, eco-friendly" className={inputCls} />
          </div>

          {saveError && (
            <div className="flex items-start gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {saveError}
            </div>
          )}
        </div>

        <div className="px-8 pb-7 pt-4 border-t border-gray-100 shrink-0 flex gap-3">
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#0b9e7a] text-white rounded-xl shadow-sm text-sm font-semibold flex justify-center items-center gap-2 transition-colors hover:bg-[#09866a] disabled:opacity-70">
            {saving ? <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onCancel} className="px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-200 transition-colors hover:bg-gray-100">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
