import { useState, useRef } from 'react';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';

// ─── Initial data constants ───────────────────────────────────────────────────
const INITIAL_NAV_CATEGORIES = ['Flooring Products', 'Luxury Vinyl Tile'];
const INITIAL_COLLECTIONS = [
  'Braavo', 'Krayons', 'Durofloor', 'Siggma', 'Orbit', 'Stoneland Monza',
  'Meteor', 'Aventus', 'Timberworld 1.5mm', 'Timberland Exotica 2mm',
  'Timberland Maestro 3mm', 'Timberland Widex', 'Timberland Herringbone',
  'Grandeure Supreme',
];
const INITIAL_SHADES   = ['Light', 'Medium', 'Dark'];
const INITIAL_COLOR_FAMILIES = [
  'Grey', 'Beige', 'Brown', 'Black', 'White',
  'Blue', 'Green', 'Red', 'Orange', 'Yellow', 'Purple', 'Pink',
];
const INITIAL_USER_INDUSTRIES = [
  
  'Industrial Flooring', 'Office Flooring', 'Residential Flooring', 
  'School Flooring', 'Sports Flooring', 'Supermarket Flooring', 
  'Transport Flooring', 'Hospital Flooring', 'Auditorium Flooring', 
  'Hotel/ Hospitality Flooring',

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
const INITIAL_APPLICATION_AREAS = [
  'Living Room', 'Bedroom', 'Kitchen', 'Bathroom',
  'Office', 'Corridor / Hallway', 'Retail Space',
  'Hospital / Healthcare', 'Basement', 'Outdoor',
];

// ── Color swatch map ──────────────────────────────────────────────────────────
const COLOR_SWATCH_MAP = {
  Grey: '#9CA3AF', Beige: '#D4B483', Brown: '#92400E', Black: '#374151',
  White: '#E2E8F0', Blue: '#3B82F6', Green: '#10B981', Red: '#EF4444',
  Orange: '#F97316', Yellow: '#EAB308', Purple: '#8B5CF6', Pink: '#EC4899',
};

// ─── Persistent memory ────────────────────────────────────────────────────────
let persistentNavCategories    = [...INITIAL_NAV_CATEGORIES];
let persistentCollections      = [...INITIAL_COLLECTIONS];
let persistentColorFamilies    = [...INITIAL_COLOR_FAMILIES];
let persistentShadeOptions     = [...INITIAL_SHADES];
let persistentIndustries       = [...INITIAL_USER_INDUSTRIES];
let persistentThicknessOptions = [...INITIAL_THICKNESS_OPTIONS];
let persistentStyleOptions     = [...INITIAL_STYLE_OPTIONS];
let persistentPatternOptions   = [...INITIAL_PATTERN_OPTIONS];
let persistentApplicationAreas = [...INITIAL_APPLICATION_AREAS];

// ─── Image compression ────────────────────────────────────────────────────────
const compressImage = (file, { maxDimension = 1200, quality = 0.8 } = {}) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        const ratio  = Math.min(maxDimension / width, maxDimension / height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(width  * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Canvas compression failed')); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          },
          'image/jpeg', quality,
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = evt.target.result;
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });

const formatBytes = (b) => {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

// ─── Shared icon: X ──────────────────────────────────────────────────────────
const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
);
const CheckIcon = ({ size = 10, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
    <path d="M19 9l-7 7-7-7" />
  </svg>
);

// ─── ToggleSelectField  (single-select, unchanged) ────────────────────────────
function ToggleSelectField({
  label, name, required = true, options, onAddOption, onRemoveOption,
  selectPlaceholder = 'Select…', createPlaceholder,
}) {
  const [isCustom, setIsCustom]       = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [selectedValue, setSelected]  = useState('');
  const [isOpen, setIsOpen]           = useState(false);

  const handleAddCustom = () => {
    const val = customValue.trim();
    if (!val) return;
    if (!options.includes(val)) onAddOption(val);
    setSelected(val);
    setIsCustom(false);
    setCustomValue('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-[13px] font-semibold text-slate-600">{label}</label>
        <button type="button" onClick={() => { setIsCustom(p => !p); setIsOpen(false); }}
          className="text-xs text-[#0b9e7a] hover:text-[#098264] hover:underline font-semibold cursor-pointer transition-colors">
          {isCustom ? 'Select Existing' : '+ Create New'}
        </button>
      </div>

      {isCustom ? (
        <div className="flex gap-2">
          <input type="text" name={name} required={required}
            placeholder={createPlaceholder || `Enter new ${label.toLowerCase()}…`}
            value={customValue} onChange={e => setCustomValue(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button type="button" onClick={handleAddCustom}
            className="px-3 bg-slate-100 hover:bg-[#0b9e7a] text-slate-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer">
            Add
          </button>
        </div>
      ) : (
        <div className="relative">
          <input type="hidden" name={name} value={selectedValue} required={required} />
          <div onClick={() => setIsOpen(p => !p)}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm transition-all flex justify-between items-center cursor-pointer select-none hover:border-slate-300">
            <span className={selectedValue ? 'text-slate-800' : 'text-slate-400'}>
              {selectedValue || selectPlaceholder}
            </span>
            <span className="text-slate-400"><ChevronIcon open={isOpen} /></span>
          </div>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
              <ul className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1">
                <li onClick={() => { setSelected(''); setIsOpen(false); }}
                  className="px-4 py-2 text-sm text-slate-400 hover:bg-slate-50 cursor-pointer">
                  {selectPlaceholder}
                </li>
                {options.map(opt => (
                  <li key={opt}
                    className="group px-4 py-2 text-sm text-slate-800 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                    onClick={() => { setSelected(opt); setIsOpen(false); }}>
                    <span className="truncate flex-1">{opt}</span>
                    <button type="button"
                      onClick={e => { e.stopPropagation(); onRemoveOption(opt); if (selectedValue === opt) setSelected(''); }}
                      className="text-slate-300 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all ml-2">
                      <XIcon size={12} />
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

// ─── MultiSelectDropdown — dropdown trigger + checkbox list inside ─────────────
function MultiSelectDropdown({
  label, name, options, selected, onToggle, onAddOption, onRemoveOption,
  placeholder = 'Select…', addPlaceholder, showSwatches = false,
}) {
  const [isOpen, setIsOpen]     = useState(false);
  const [newInput, setNewInput] = useState('');

  // Trigger label: show dots + names, or "N selected" when many
  const triggerContent = () => {
    if (selected.length === 0) return null;
    return (
      <span className="flex items-center gap-1.5 flex-1 min-w-0">
        {showSwatches && selected.slice(0, 4).map(s => (
          <span key={s} className="w-3 h-3 rounded-full border border-slate-200 shrink-0"
            style={{ backgroundColor: COLOR_SWATCH_MAP[s] || '#94a3b8' }} />
        ))}
        <span className="truncate text-slate-800 text-sm">
          {selected.length <= 2
            ? selected.join(', ')
            : `${selected.slice(0, 2).join(', ')} +${selected.length - 2} more`}
        </span>
      </span>
    );
  };

  const handleAdd = () => {
    const val = newInput.trim();
    if (!val) return;
    if (!options.includes(val)) onAddOption(val);
    if (!selected.includes(val)) onToggle(val);
    setNewInput('');
  };

  return (
    <div>
      {/* Label row */}
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-[13px] font-semibold text-slate-600">{label}</label>
        {selected.length > 0 && (
          <span className="text-[11px] text-[#0b9e7a] font-semibold">
            {selected.length} selected
          </span>
        )}
      </div>

      {/* Hidden input carries the JSON array */}
      <input type="hidden" name={name} value={JSON.stringify(selected)} />

      <div className="relative">
        {/* Trigger */}
        <div onClick={() => setIsOpen(p => !p)}
          className={`w-full bg-white border rounded-lg px-4 py-2.5 text-sm transition-all flex justify-between items-center cursor-pointer select-none
            ${isOpen ? 'border-[#0b9e7a] ring-1 ring-[#0b9e7a]' : 'border-slate-200 hover:border-slate-300'}`}>
          {selected.length > 0
            ? triggerContent()
            : <span className="text-slate-400">{placeholder}</span>
          }
          <span className="text-slate-400 ml-2 shrink-0"><ChevronIcon open={isOpen} /></span>
        </div>

        {/* Dropdown panel */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
            <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">

              {/* Checkbox list */}
              <ul className="max-h-52 overflow-y-auto py-1">
                {options.map(opt => {
                  const checked = selected.includes(opt);
                  const swatch  = showSwatches ? (COLOR_SWATCH_MAP[opt] || null) : null;
                  return (
                    <li key={opt}
                      className="group flex items-center justify-between px-3 py-2 hover:bg-slate-50 cursor-pointer"
                      onClick={() => onToggle(opt)}>

                      {/* Checkbox + label */}
                      <span className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Custom checkbox */}
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                          ${checked
                            ? 'bg-[#0b9e7a] border-[#0b9e7a]'
                            : 'bg-slate-50 border-slate-300 group-hover:border-slate-400'}`}>
                          {checked && <CheckIcon />}
                        </span>

                        {/* Color swatch dot */}
                        {swatch && (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0"
                            style={{ backgroundColor: swatch }} />
                        )}

                        <span className="text-sm text-slate-700 truncate">{opt}</span>
                      </span>

                      {/* Remove option button */}
                      <button type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onRemoveOption(opt);
                          if (checked) onToggle(opt); // deselect if was selected
                        }}
                        className="text-slate-300 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all ml-1 shrink-0"
                        title={`Remove ${opt}`}>
                        <XIcon size={12} />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Add custom footer */}
              <div className="border-t border-slate-100 p-2 flex gap-2 bg-slate-50/60">
                <input
                  type="text"
                  value={newInput}
                  onChange={e => setNewInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                  placeholder={addPlaceholder || `Add custom…`}
                  onClick={e => e.stopPropagation()}
                  className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:border-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button type="button" onClick={e => { e.stopPropagation(); handleAdd(); }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#0b9e7a] text-slate-600 hover:text-white rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap">
                  + Add
                </button>
              </div>

            </div>
          </>
        )}
      </div>

      {/* Selected pills below trigger */}
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

// ─── UploadTileModal ──────────────────────────────────────────────────────────
export default function UploadTileModal({ onClose, onSuccess }) {
  const [loading,     setLoading]     = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [error,       setError]       = useState(null);

  // Multi-select states
  const [selectedIndustries,       setSelectedIndustries]       = useState([]);
  const [selectedApplicationAreas, setSelectedApplicationAreas] = useState([]);
  const [selectedColors,           setSelectedColors]           = useState([]);
  const [selectedThicknessValues,  setSelectedThicknessValues]  = useState([]);

  // Options lists
  const [navCategories,    setNavCategories]    = useState(persistentNavCategories);
  const [collections,      setCollections]      = useState(persistentCollections);
  const [colorFamilies,    setColorFamilies]    = useState(persistentColorFamilies);
  const [shadeOptions,     setShadeOptions]     = useState(persistentShadeOptions);
  const [industries,       setIndustries]       = useState(persistentIndustries);
  const [thicknessOptions, setThicknessOptions] = useState(persistentThicknessOptions);
  const [styleOptions,     setStyleOptions]     = useState(persistentStyleOptions);
  const [patternOptions,   setPatternOptions]   = useState(persistentPatternOptions);
  const [applicationAreas, setApplicationAreas] = useState(persistentApplicationAreas);

  const [newIndustryInput,        setNewIndustryInput]        = useState('');
  const [newApplicationAreaInput, setNewApplicationAreaInput] = useState('');
  const [tilePreview,   setTilePreview]   = useState(null);
  const [tileFileMeta,  setTileFileMeta]  = useState(null);

  const formRef    = useRef(null);
  const rawFileRef = useRef(null);

  // ── Toggle helpers ──────────────────────────────────────────────────────────
  const toggleIndustry        = v => setSelectedIndustries(p        => p.includes(v) ? p.filter(i => i !== v) : [...p, v]);
  const toggleApplicationArea = v => setSelectedApplicationAreas(p  => p.includes(v) ? p.filter(a => a !== v) : [...p, v]);
  const toggleColor           = v => setSelectedColors(p            => p.includes(v) ? p.filter(c => c !== v) : [...p, v]);
  const toggleThickness       = v => setSelectedThicknessValues(p   => p.includes(v) ? p.filter(t => t !== v) : [...p, v]);

  // ── Add custom industry / application area ──────────────────────────────────
  const handleAddCustomIndustry = e => {
    e.preventDefault();
    const val = newIndustryInput.trim();
    if (!val) return;
    if (!industries.includes(val)) setIndustries(p => { const u = [...p, val]; persistentIndustries = u; return u; });
    if (!selectedIndustries.includes(val)) setSelectedIndustries(p => [...p, val]);
    setNewIndustryInput('');
  };

  const handleAddCustomApplicationArea = e => {
    e.preventDefault();
    const val = newApplicationAreaInput.trim();
    if (!val) return;
    if (!applicationAreas.includes(val)) setApplicationAreas(p => { const u = [...p, val]; persistentApplicationAreas = u; return u; });
    if (!selectedApplicationAreas.includes(val)) setSelectedApplicationAreas(p => [...p, val]);
    setNewApplicationAreaInput('');
  };

  // ── Tile file picker ────────────────────────────────────────────────────────
  const handleTileChange = e => {
    const file = e.target.files[0];
    if (!file) { setTilePreview(null); setTileFileMeta(null); rawFileRef.current = null; return; }
    rawFileRef.current = file;
    setTilePreview(URL.createObjectURL(file));
    setTileFileMeta({ originalSize: file.size, compressedSize: null });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const rawFile = rawFileRef.current;
      if (!rawFile) throw new Error('No image selected');

      setUploadStage('Compressing image…');
      const compressedFile = await compressImage(rawFile);
      setTileFileMeta(p => ({ ...p, compressedSize: compressedFile.size }));

      setUploadStage('Preparing upload…');
      const sigRes = await fetch(`${BASE_URL}/sign-upload?folder=wonderfloor/tiles`);
      if (!sigRes.ok) throw new Error('Could not get upload credentials');
      const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

      setUploadStage('Uploading image to Cloudinary…');
      const cloudinaryForm = new FormData();
      cloudinaryForm.append('file', compressedFile);
      cloudinaryForm.append('signature', signature);
      cloudinaryForm.append('timestamp', String(timestamp));
      cloudinaryForm.append('api_key', apiKey);
      cloudinaryForm.append('folder', folder);

      const cloudRes  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: cloudinaryForm });
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudData.error?.message || 'Cloudinary upload failed');

      setUploadStage('Saving product…');
      const formData = new FormData(formRef.current);
      formData.delete('tileImage');
      formData.append('imageUrl', cloudData.secure_url);

      // Arrays as JSON
      formData.append('userIndustry',    JSON.stringify(selectedIndustries));
      formData.append('applicationArea', JSON.stringify(selectedApplicationAreas));
      // colour & thickness already appended via hidden inputs from MultiSelectDropdown
      // (the hidden inputs use name="colour" and name="thickness")

      // Tags
      const rawTags = formData.get('tags');
      if (rawTags) formData.set('tags', JSON.stringify(rawTags.split(',').map(t => t.trim()).filter(Boolean)));

      const response = await fetch(`${BASE_URL}/upload/product`, { method: 'POST', body: formData });
      const data     = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save product');

      // Persist auto-saver
      const sv = n => formData.get(n);
      if (sv('navCategory')      && !persistentNavCategories.includes(sv('navCategory')))       persistentNavCategories    = [...persistentNavCategories,    sv('navCategory')];
      if (sv('accordionCategory')&& !persistentCollections.includes(sv('accordionCategory')))   persistentCollections      = [...persistentCollections,      sv('accordionCategory')];
      if (sv('shade')            && !persistentShadeOptions.includes(sv('shade')))               persistentShadeOptions     = [...persistentShadeOptions,     sv('shade')];
      if (sv('style')            && !persistentStyleOptions.includes(sv('style')))               persistentStyleOptions     = [...persistentStyleOptions,     sv('style')];
      if (sv('pattern')          && !persistentPatternOptions.includes(sv('pattern')))           persistentPatternOptions   = [...persistentPatternOptions,   sv('pattern')];
      selectedColors.forEach(c  => { if (!persistentColorFamilies.includes(c))    persistentColorFamilies    = [...persistentColorFamilies,    c]; });
      selectedThicknessValues.forEach(t => { if (!persistentThicknessOptions.includes(t)) persistentThicknessOptions = [...persistentThicknessOptions, t]; });

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();

    } catch (err) {
      setError(err.message);
      setLoading(false);
      setUploadStage('');
    }
  };

  // ── Size badge ──────────────────────────────────────────────────────────────
  const SizeBadge = () => {
    if (!tileFileMeta?.originalSize) return null;
    const { originalSize, compressedSize } = tileFileMeta;
    if (!compressedSize)
      return <span className="text-[10px] text-slate-400 font-medium mt-0.5 block text-center">{formatBytes(originalSize)}</span>;
    const pct = Math.round((1 - compressedSize / originalSize) * 100);
    return (
      <span className="text-[10px] font-semibold mt-0.5 block text-center text-[#0b9e7a]">
        {formatBytes(originalSize)} → {formatBytes(compressedSize)}
        {pct > 0 && <span className="ml-1 opacity-70">({pct}% saved)</span>}
      </span>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">Add New Flooring Product</h2>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-50">
            <XIcon size={20} />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>
          )}

          {/* ── Core Details ────────────────────────────────────────────────── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Core Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product Name</label>
                <input type="text" name="name" required placeholder="e.g., Pastel Mint"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">SKU Code</label>
                <input type="text" name="sku" required placeholder="e.g., WF/KR/0010"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all uppercase placeholder:text-slate-400" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Physical Size</label>
                <input type="text" name="size" required placeholder="e.g., 2mtr x 15mtr (Roll)"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400" />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Searchable Tags (Comma Separated)</label>
                <input type="text" name="tags" placeholder="e.g., mint, dark green, eco-friendly, pastel"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400" />
                <span className="text-[10px] text-slate-400 mt-1 block">Add alternate names or keywords to help users find this tile in search.</span>
              </div>

            </div>
          </div>

          {/* ── Classification ──────────────────────────────────────────────── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Classification</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              <ToggleSelectField
                label="Main Nav Category" name="navCategory"
                options={navCategories}
                onAddOption={v => setNavCategories(p => { const u = [...p, v]; persistentNavCategories = u; return u; })}
                onRemoveOption={v => setNavCategories(p => { const u = p.filter(i => i !== v); persistentNavCategories = u; return u; })}
                selectPlaceholder="Select tab…" createPlaceholder="e.g., Outdoor Flooring"
              />

              <ToggleSelectField
                label="Product Collection" name="accordionCategory"
                options={collections}
                onAddOption={v => setCollections(p => { const u = [...p, v]; persistentCollections = u; return u; })}
                onRemoveOption={v => setCollections(p => { const u = p.filter(i => i !== v); persistentCollections = u; return u; })}
                selectPlaceholder="Select collection…" createPlaceholder="Enter new collection name"
              />

              <ToggleSelectField
                label="Shade" name="shade"
                options={shadeOptions}
                onAddOption={v => setShadeOptions(p => { const u = [...p, v]; persistentShadeOptions = u; return u; })}
                onRemoveOption={v => setShadeOptions(p => { const u = p.filter(i => i !== v); persistentShadeOptions = u; return u; })}
                selectPlaceholder="Select shade…" createPlaceholder="e.g., Extra Dark"
              />

              {/* ── Color — multi-select dropdown ── */}
              <MultiSelectDropdown
                label="Color" name="colour"
                options={colorFamilies}
                selected={selectedColors}
                onToggle={toggleColor}
                onAddOption={v => setColorFamilies(p => { const u = [...p, v]; persistentColorFamilies = u; return u; })}
                onRemoveOption={v => { setColorFamilies(p => { const u = p.filter(i => i !== v); persistentColorFamilies = u; return u; }); setSelectedColors(p => p.filter(c => c !== v)); }}
                placeholder="Select color(s)…"
                addPlaceholder="e.g., Terra Cotta"
                showSwatches={true}
              />

              {/* ── Thickness — multi-select dropdown ── */}
              <MultiSelectDropdown
                label="Thickness" name="thickness"
                options={thicknessOptions}
                selected={selectedThicknessValues}
                onToggle={toggleThickness}
                onAddOption={v => setThicknessOptions(p => { const u = [...p, v]; persistentThicknessOptions = u; return u; })}
                onRemoveOption={v => { setThicknessOptions(p => { const u = p.filter(i => i !== v); persistentThicknessOptions = u; return u; }); setSelectedThicknessValues(p => p.filter(t => t !== v)); }}
                placeholder="Select thickness(es)…"
                addPlaceholder="e.g., 4.5mm"
                showSwatches={false}
              />

              <ToggleSelectField
                label="Style" name="style" required={false}
                options={styleOptions}
                onAddOption={v => setStyleOptions(p => { const u = [...p, v]; persistentStyleOptions = u; return u; })}
                onRemoveOption={v => setStyleOptions(p => { const u = p.filter(i => i !== v); persistentStyleOptions = u; return u; })}
                selectPlaceholder="Select style…" createPlaceholder="e.g., Cushion Vinyl"
              />

              <ToggleSelectField
                label="Pattern / Layout" name="pattern" required={false}
                options={patternOptions}
                onAddOption={v => setPatternOptions(p => { const u = [...p, v]; persistentPatternOptions = u; return u; })}
                onRemoveOption={v => setPatternOptions(p => { const u = p.filter(i => i !== v); persistentPatternOptions = u; return u; })}
                selectPlaceholder="Select pattern…" createPlaceholder="e.g., Directional"
              />

              {/* ── Product Link ── */}
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product Link</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  <input type="url" name="productLink" placeholder="https://example.com/product-page"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Optional URL to a product datasheet, catalogue page, or external listing.</span>
              </div>

            </div>
          </div>

          {/* ── User Industries ─────────────────────────────────────────────── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">User Industries</p>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {industries.map(ind => (
                  <div key={ind} className="relative group flex items-center justify-between py-1 px-2 border border-transparent hover:border-slate-100 rounded-lg transition-all">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input type="checkbox" className="hidden" checked={selectedIndustries.includes(ind)} onChange={() => toggleIndustry(ind)} />
                      <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${selectedIndustries.includes(ind) ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-slate-50 border-slate-300 group-hover:border-slate-400'}`}>
                        {selectedIndustries.includes(ind) && <CheckIcon />}
                      </div>
                      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate pr-4">{ind}</span>
                    </label>
                    <button type="button"
                      onClick={() => { setIndustries(p => { const u = p.filter(i => i !== ind); persistentIndustries = u; return u; }); setSelectedIndustries(p => p.filter(i => i !== ind)); }}
                      className="text-slate-300 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <XIcon size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <input type="text" value={newIndustryInput} onChange={e => setNewIndustryInput(e.target.value)}
                  placeholder="Type other custom industry recommendation..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400" />
                <button type="button" onClick={handleAddCustomIndustry}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-[#0b9e7a] text-slate-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap">
                  + Add Custom
                </button>
              </div>
            </div>
          </div>

          {/* ── Application Areas ───────────────────────────────────────────── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Application Areas</p>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {applicationAreas.map(area => (
                  <div key={area} className="relative group flex items-center justify-between py-1 px-2 border border-transparent hover:border-slate-100 rounded-lg transition-all">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input type="checkbox" className="hidden" checked={selectedApplicationAreas.includes(area)} onChange={() => toggleApplicationArea(area)} />
                      <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${selectedApplicationAreas.includes(area) ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-slate-50 border-slate-300 group-hover:border-slate-400'}`}>
                        {selectedApplicationAreas.includes(area) && <CheckIcon />}
                      </div>
                      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate pr-4">{area}</span>
                    </label>
                    <button type="button"
                      onClick={() => { setApplicationAreas(p => { const u = p.filter(a => a !== area); persistentApplicationAreas = u; return u; }); setSelectedApplicationAreas(p => p.filter(a => a !== area)); }}
                      className="text-slate-300 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <XIcon size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <input type="text" value={newApplicationAreaInput} onChange={e => setNewApplicationAreaInput(e.target.value)}
                  placeholder="Type a custom application area..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400" />
                <button type="button" onClick={handleAddCustomApplicationArea}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-[#0b9e7a] text-slate-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap">
                  + Add Custom
                </button>
              </div>
            </div>
          </div>

          {/* ── Media & Description ─────────────────────────────────────────── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Media & Description</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product Description</label>
                <textarea name="description" rows="5"
                  placeholder="Enter product description for the details modal..."
                  className="w-full h-32 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all resize-none placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Flooring Texture Image (JPG/PNG)</label>
                <div className="relative w-full h-32 bg-white border-2 border-dashed border-slate-200 hover:border-[#0b9e7a] rounded-xl flex items-center justify-center overflow-hidden transition-all group cursor-pointer shadow-sm">
                  <input type="file" accept="image/*" required onChange={handleTileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  {tilePreview ? (
                    <>
                      <img src={tilePreview} alt="Tile Texture Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                        <span className="text-slate-800 text-xs font-semibold bg-white px-3 py-1.5 rounded-md shadow-md">Change Texture</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center pointer-events-none text-slate-400 group-hover:text-[#0b9e7a] transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="text-xs font-medium">Upload seamless texture</span>
                    </div>
                  )}
                </div>
                <SizeBadge />
              </div>
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2 shrink-0">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#0b9e7a] hover:bg-[#098264] transition-colors shadow-sm shadow-[#0b9e7a]/20 disabled:opacity-50 cursor-pointer flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  {uploadStage || 'Uploading…'}
                </>
              ) : 'Save Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
