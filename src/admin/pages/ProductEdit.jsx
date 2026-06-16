// ProductEdit.jsx
import { useState, useEffect } from 'react';
import ToggleSelectField from './ToggleSelectField';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:8000';

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

// ─── 2. Persistent Memory (Module Scope prevents ESLint 'no-undef') ───────────
let persistentNavCategories    = [...INITIAL_NAV_CATEGORIES];
let persistentCollections      = [...INITIAL_COLLECTIONS];
let persistentColorFamilies    = [...INITIAL_COLOR_FAMILIES];
let persistentShadeOptions     = [...INITIAL_SHADES];
let persistentThicknessOptions = [...INITIAL_THICKNESS_OPTIONS];
let persistentStyleOptions     = [...INITIAL_STYLE_OPTIONS];
let persistentPatternOptions   = [...INITIAL_PATTERN_OPTIONS];

// ─── 3. Helper Functions & UI Primitives ──────────────────────────────────────
const Label = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{children}</p>
);

const inputCls =
  'w-full px-3 py-2 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-lg ' +
  'focus:outline-none focus:border-[#0b9e7a] focus:ring-2 focus:ring-[#0b9e7a]/10 ' +
  'placeholder-gray-300 transition-all duration-150';

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
    userIndustry:      p.userIndustry      ?? [],
    img:               p.img               ?? '',
    tags:              Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
  };
}

// ─── 4. Main Component ────────────────────────────────────────────────────────
export default function ProductEdit({ product, onCancel, onSaveSuccess }) {
  const [form, setForm] = useState(toForm(product));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Local State mapped to Global Persistent Variables
  const [navCategories, setNavCategories] = useState(persistentNavCategories);
  const [collections, setCollections] = useState(persistentCollections);
  const [colorFamilies, setColorFamilies] = useState(persistentColorFamilies);
  const [shadeOptions, setShadeOptions] = useState(persistentShadeOptions);
  const [thicknessOptions, setThicknessOptions] = useState(persistentThicknessOptions);
  const [styleOptions, setStyleOptions] = useState(persistentStyleOptions);
  const [patternOptions, setPatternOptions] = useState(persistentPatternOptions);

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

  function commitTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,+$/, '');
      if (tag && !form.userIndustry.includes(tag)) set('userIndustry', [...form.userIndustry, tag]);
      setTagInput('');
    }
  }

  const removeTag = tag => set('userIndustry', form.userIndustry.filter(t => t !== tag));

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'userIndustry') {
          formData.append(key, JSON.stringify(form[key]));
        } else if (key === 'tags') {
          formData.append(key, JSON.stringify((form[key] || '').split(',').map(t => t.trim()).filter(Boolean)));
        } else {
          formData.append(key, form[key]);
        }
      });

      if (selectedFile) formData.append('tileImage', selectedFile);

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
            <ToggleSelectField
              label="Colour Variant"
              value={form.colour}
              onChange={val => set('colour', val)}
              options={colorFamilies}
              onAddOption={val => setColorFamilies(p => { const u = [...p, val]; persistentColorFamilies = u; return u; })}
              onRemoveOption={val => setColorFamilies(p => { const u = p.filter(i => i !== val); persistentColorFamilies = u; return u; })}
              onEditOption={(oldVal, newVal) => setColorFamilies(p => { const u = p.map(i => i === oldVal ? newVal : i); persistentColorFamilies = u; return u; })}
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
            <ToggleSelectField
              label="Thickness"
              value={form.thickness}
              onChange={val => set('thickness', val)}
              options={thicknessOptions}
              onAddOption={val => setThicknessOptions(p => { const u = [...p, val]; persistentThicknessOptions = u; return u; })}
              onRemoveOption={val => setThicknessOptions(p => { const u = p.filter(i => i !== val); persistentThicknessOptions = u; return u; })}
              onEditOption={(oldVal, newVal) => setThicknessOptions(p => { const u = p.map(i => i === oldVal ? newVal : i); persistentThicknessOptions = u; return u; })}
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

          <div>
            <Label>Target Sectors</Label>
            <div className="min-h-[42px] flex flex-wrap gap-1.5 p-2 bg-white border border-gray-200 rounded-lg focus-within:border-[#0b9e7a] focus-within:ring-2 focus-within:ring-[#0b9e7a]/10 transition-all cursor-text" onClick={e => e.currentTarget.querySelector('input')?.focus()}>
              {form.userIndustry.map(tag => (
                <span key={tag} className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-[#edf9f5] border border-[#0b9e7a]/20 text-[#0b9e7a] text-[11px] font-semibold rounded-md whitespace-nowrap">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-[#0b9e7a]/50 hover:text-[#0b9e7a] leading-none hover:bg-[#0b9e7a]/10 rounded p-0.5 transition-colors"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </span>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={commitTag} placeholder={form.userIndustry.length === 0 ? 'Type a sector, press Enter…' : ''} className="flex-1 min-w-[130px] text-[13px] text-gray-800 placeholder-gray-300 bg-transparent outline-none py-0.5 px-1" />
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