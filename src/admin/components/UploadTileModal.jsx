import { useState, useRef } from 'react';

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
const INITIAL_USER_INDUSTRIES = [
  'Industrial Flooring', 'Office Flooring', 'Residential Flooring',
  'School Flooring', 'Sports Flooring', 'Hotel/ Hospitality Flooring',
];

// ─── Persistent Memory (Lives outside the modal unmount lifecycle) ────────────
let persistentNavCategories = [...INITIAL_NAV_CATEGORIES];
let persistentCollections   = [...INITIAL_COLLECTIONS];
let persistentColorFamilies = [...INITIAL_COLOR_FAMILIES];
let persistentShadeOptions  = [...INITIAL_SHADES];
let persistentIndustries    = [...INITIAL_USER_INDUSTRIES];

// ─── Image Compression Utility ────────────────────────────────────────────────
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
          'image/jpeg',
          quality,
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = evt.target.result;
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });

const formatBytes = (bytes) => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── ToggleSelectField ────────────────────────────────────────────────────────
function ToggleSelectField({
  label,
  name,
  required = true,
  options,
  onAddOption,
  onRemoveOption,
  selectPlaceholder = 'Select…',
  createPlaceholder,
}) {
  const [isCustom,      setIsCustom]      = useState(false);
  const [customValue,   setCustomValue]   = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [isOpen,        setIsOpen]        = useState(false);

  const handleToggle = () => {
    setIsCustom((prev) => !prev);
    setIsOpen(false);
  };

  const handleSelect = (val) => {
    setSelectedValue(val);
    setIsOpen(false);
  };

  const handleAddCustomInline = () => {
    const val = customValue.trim();
    if (val) {
      if (!options.includes(val)) onAddOption(val);
      setSelectedValue(val); 
      setIsCustom(false);
      setCustomValue('');
    }
  };

  return (
    <div>
      {/* Label row with toggle */}
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-[13px] font-semibold text-slate-600">{label}</label>
        <button
          type="button"
          onClick={handleToggle}
          className="text-xs text-[#0b9e7a] hover:text-[#098264] hover:underline font-semibold cursor-pointer transition-colors"
        >
          {isCustom ? 'Select Existing' : '+ Create New'}
        </button>
      </div>

      {isCustom ? (
        /* ── Custom text entry ── */
        <div className="flex gap-2">
          <input
            type="text"
            name={name}
            required={required}
            placeholder={createPlaceholder || `Enter new ${label.toLowerCase()}…`}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={handleAddCustomInline}
            className="px-3 bg-slate-100 hover:bg-[#0b9e7a] text-slate-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            Add
          </button>
        </div>
      ) : (
        /* ── Custom Dropdown Menu ── */
        <div className="relative">
          <input type="hidden" name={name} value={selectedValue} required={required} />
          
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm border-slate-200 focus-within:border-[#0b9e7a] focus-within:ring-1 focus-within:ring-[#0b9e7a] transition-all flex justify-between items-center cursor-pointer select-none"
          >
            <span className={selectedValue ? 'text-slate-800' : 'text-slate-400'}>
              {selectedValue || selectPlaceholder}
            </span>
            <div className="text-slate-400">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)}></div>
              
              <ul className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1">
                <li
                  onClick={() => handleSelect('')}
                  className="px-4 py-2 text-sm text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  {selectPlaceholder}
                </li>
                {options.map((opt) => (
                  <li
                    key={opt}
                    className="group px-4 py-2 text-sm text-slate-800 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                    onClick={() => handleSelect(opt)}
                  >
                    <span className="truncate flex-1">{opt}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveOption(opt);
                        if (selectedValue === opt) setSelectedValue('');
                      }}
                      className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-all ml-2"
                      title={`Remove ${opt}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

// ─── UploadTileModal ──────────────────────────────────────────────────────────
export default function UploadTileModal({ onClose, onSuccess }) {
  const [loading,     setLoading]     = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [error,       setError]       = useState(null);

  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [tilePreview,        setTilePreview]         = useState(null);
  const [tileFileMeta,       setTileFileMeta]        = useState(null);

  // ── Persistent Synchronized Component States ────────────────────────────────
  const [navCategories,  setNavCategories]  = useState(persistentNavCategories);
  const [collections,    setCollections]    = useState(persistentCollections);
  const [colorFamilies,  setColorFamilies]  = useState(persistentColorFamilies);
  const [shadeOptions,   setShadeOptions]   = useState(persistentShadeOptions);
  const [industries,     setIndustries]     = useState(persistentIndustries);
  const [newIndustryInput, setNewIndustryInput] = useState('');

  const formRef    = useRef(null);
  const rawFileRef = useRef(null);

  // ── Industry helpers ────────────────────────────────────────────────────────
  const toggleIndustry = (industry) =>
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry],
    );

  const handleAddCustomIndustry = (e) => {
    e.preventDefault();
    const val = newIndustryInput.trim();
    if (!val) return;
    
    if (!industries.includes(val)) {
      setIndustries((prev) => {
        const updated = [...prev, val];
        persistentIndustries = updated;
        return updated;
      });
    }
    
    if (!selectedIndustries.includes(val)) {
      setSelectedIndustries((prev) => [...prev, val]);
    }
    setNewIndustryInput('');
  };

  // ── Tile file picker ────────────────────────────────────────────────────────
  const handleTileChange = (e) => {
    const file = e.target.files[0];
    if (!file) { setTilePreview(null); setTileFileMeta(null); rawFileRef.current = null; return; }
    rawFileRef.current = file;
    setTilePreview(URL.createObjectURL(file));
    setTileFileMeta({ originalSize: file.size, compressedSize: null });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const rawFile = rawFileRef.current;
      if (!rawFile) throw new Error('No image selected');

      setUploadStage('Compressing image…');
      const compressedFile = await compressImage(rawFile);
      setTileFileMeta((prev) => ({ ...prev, compressedSize: compressedFile.size }));

      setUploadStage('Preparing upload…');
      const sigRes = await fetch(`${BASE_URL}/sign-upload?folder=wonderfloor/tiles`);
      if (!sigRes.ok) throw new Error('Could not get upload credentials');
      const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

      setUploadStage('Uploading image to Cloudinary…');
      const cloudinaryForm = new FormData();
      cloudinaryForm.append('file',      compressedFile);
      cloudinaryForm.append('signature', signature);
      cloudinaryForm.append('timestamp', String(timestamp));
      cloudinaryForm.append('api_key',   apiKey);
      cloudinaryForm.append('folder',    folder);

      const cloudRes  = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: cloudinaryForm },
      );
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudData.error?.message || 'Cloudinary upload failed');

      setUploadStage('Saving product…');
      const formData = new FormData(formRef.current);
      formData.delete('tileImage');
      formData.append('imageUrl',     cloudData.secure_url);
      formData.append('userIndustry', JSON.stringify(selectedIndustries));

      const response = await fetch(`${BASE_URL}/upload/product`, { method: 'POST', body: formData });
      const data     = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save product');

      // ── Backup Submit Fallback Auto-Saver ───────────────────────────────────
      const savedNavCategory = formData.get('navCategory');
      const savedCollection  = formData.get('accordionCategory');
      const savedColour      = formData.get('colour');
      const savedShade       = formData.get('shade');

      if (savedNavCategory && !persistentNavCategories.includes(savedNavCategory)) {
        persistentNavCategories = [...persistentNavCategories, savedNavCategory];
      }
      if (savedCollection && !persistentCollections.includes(savedCollection)) {
        persistentCollections = [...persistentCollections, savedCollection];
      }
      if (savedColour && !persistentColorFamilies.includes(savedColour)) {
        persistentColorFamilies = [...persistentColorFamilies, savedColour];
      }
      if (savedShade && !persistentShadeOptions.includes(savedShade)) {
        persistentShadeOptions = [...persistentShadeOptions, savedShade];
      }

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
    const savedPct = Math.round((1 - compressedSize / originalSize) * 100);
    return (
      <span className="text-[10px] font-semibold mt-0.5 block text-center text-[#0b9e7a]">
        {formatBytes(originalSize)} → {formatBytes(compressedSize)}
        {savedPct > 0 && <span className="ml-1 opacity-70">({savedPct}% saved)</span>}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">Add New Tile Product</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* ── Main fields grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Product Name */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product Name</label>
              <input
                type="text" name="name" required
                placeholder="e.g., Pastel Mint"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">SKU Code</label>
              <input
                type="text" name="sku" required
                placeholder="e.g., WF/KR/0010"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all uppercase placeholder:text-slate-400"
              />
            </div>

            {/* Physical Size */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Physical Size</label>
              <input
                type="text" name="size" required
                placeholder="e.g., 2mtr x 15mtr (Roll)"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* ── Dynamic Toggle Select Fields ── */}
            <ToggleSelectField
              label="Main Nav Category"
              name="navCategory"
              options={navCategories}
              onAddOption={(val) => {
                setNavCategories((prev) => {
                  const updated = [...prev, val];
                  persistentNavCategories = updated;
                  return updated;
                });
              }}
              onRemoveOption={(val) => {
                setNavCategories((prev) => {
                  const updated = prev.filter((i) => i !== val);
                  persistentNavCategories = updated;
                  return updated;
                });
              }}
              selectPlaceholder="Select tab…"
              createPlaceholder="e.g., Outdoor Flooring"
            />

            <ToggleSelectField
              label="Product Collection"
              name="accordionCategory"
              options={collections}
              onAddOption={(val) => {
                setCollections((prev) => {
                  const updated = [...prev, val];
                  persistentCollections = updated;
                  return updated;
                });
              }}
              onRemoveOption={(val) => {
                setCollections((prev) => {
                  const updated = prev.filter((i) => i !== val);
                  persistentCollections = updated;
                  return updated;
                });
              }}
              selectPlaceholder="Select collection…"
              createPlaceholder="Enter new collection name"
            />

            <ToggleSelectField
              label="Color"
              name="colour"
              options={colorFamilies}
              onAddOption={(val) => {
                setColorFamilies((prev) => {
                  const updated = [...prev, val];
                  persistentColorFamilies = updated;
                  return updated;
                });
              }}
              onRemoveOption={(val) => {
                setColorFamilies((prev) => {
                  const updated = prev.filter((i) => i !== val);
                  persistentColorFamilies = updated;
                  return updated;
                });
              }}
              selectPlaceholder="Select color…"
              createPlaceholder="e.g., Terra Cotta"
            />

            <ToggleSelectField
              label="Shade"
              name="shade"
              options={shadeOptions}
              onAddOption={(val) => {
                setShadeOptions((prev) => {
                  const updated = [...prev, val];
                  persistentShadeOptions = updated;
                  return updated;
                });
              }}
              onRemoveOption={(val) => {
                setShadeOptions((prev) => {
                  const updated = prev.filter((i) => i !== val);
                  persistentShadeOptions = updated;
                  return updated;
                });
              }}
              selectPlaceholder="Select shade…"
              createPlaceholder="e.g., Extra Dark"
            />

          </div>

          {/* ── Recommended Industries ── */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-2">Recommended Industries</label>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {industries.map((ind) => (
                  <div key={ind} className="relative group flex items-center justify-between py-1 px-2 border border-transparent hover:border-slate-100 rounded-lg transition-all">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input type="checkbox" className="hidden" checked={selectedIndustries.includes(ind)} onChange={() => toggleIndustry(ind)} />
                      <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${selectedIndustries.includes(ind) ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-slate-50 border-slate-300 group-hover:border-slate-400'}`}>
                        {selectedIndustries.includes(ind) && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate pr-4">{ind}</span>
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIndustries((prev) => {
                          const updated = prev.filter((i) => i !== ind);
                          persistentIndustries = updated;
                          return updated;
                        });
                        setSelectedIndustries((prev) => prev.filter((i) => i !== ind));
                      }}
                      className="text-slate-400 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      title={`Remove ${ind}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6"  y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  value={newIndustryInput}
                  onChange={(e) => setNewIndustryInput(e.target.value)}
                  placeholder="Type other custom industry recommendation..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomIndustry}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-[#0b9e7a] text-slate-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  + Add Custom
                </button>
              </div>
            </div>
          </div>

          {/* ── Description + Texture ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product Description</label>
              <textarea
                name="description" rows="5"
                placeholder="Enter product description for the details modal..."
                className="w-full h-32 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all resize-none placeholder:text-slate-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Tile Texture Image (JPG/PNG)</label>
              <div className="relative w-full h-32 bg-white border-2 border-dashed border-slate-200 hover:border-[#0b9e7a] rounded-xl flex items-center justify-center overflow-hidden transition-all group cursor-pointer shadow-sm">
                <input
                  type="file" accept="image/*" required
                  onChange={handleTileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
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
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-xs font-medium">Upload seamless texture</span>
                  </div>
                )}
              </div>
              <SizeBadge />
            </div>
          </div>

          {/* ── Footer Actions ── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2 shrink-0">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#0b9e7a] hover:bg-[#098264] transition-colors shadow-sm shadow-[#0b9e7a]/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  {uploadStage || 'Uploading…'}
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
