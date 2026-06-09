import { useState, useRef } from 'react';
const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:8000';

const NAV_CATEGORIES = [
  { id: 'Flooring Products', label: 'Flooring Products' },
  { id: 'Luxury Vinyl Tile', label: 'Luxury Vinyl Tile' }
];

const INITIAL_ACCORDION_CATEGORIES = [
  'Braavo', 'Krayons', 'Durofloor', 'Siggma', 'Orbit', 'Stoneland Monza',
  'Meteor', 'Aventus', 'Timberworld 1.5mm', 'Timberland Exotica 2mm',
  'Timberland Maestro 3mm', 'Timberland Widex', 'Timberland Herringbone',
  'Grandeure Supreme'
];

const SHADES = ['Light', 'Medium', 'Dark'];
const COLOR_FAMILIES = ['Grey', 'Beige', 'Brown', 'Black', 'White', 'Blue', 'Green', 'Red', 'Orange', 'Yellow', 'Purple', 'Pink'];

const INITIAL_USER_INDUSTRIES = [
  'Industrial Flooring', 'Office Flooring', 'Residential Flooring',
  'School Flooring', 'Sports Flooring', 'Hotel/ Hospitality Flooring'
];

// ─── Image Compression Utility ───────────────────────────────────────────────
// Resizes the image to max 1200px on the longest side and re-encodes as JPEG
// at 80% quality. This typically reduces a 4–8 MB photo to under 400 KB,
// preventing Cloudinary's 499 TimeoutError on slow connections.
const compressImage = (file, { maxDimension = 1200, quality = 0.8 } = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(maxDimension / width, maxDimension / height, 1); // never upscale
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(width  * ratio);
        canvas.height = Math.round(height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Canvas compression failed')); return; }
            // Preserve original filename but force .jpg extension
            const compressed = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            );
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = evt.target.result;
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
};

// Friendly file-size label (e.g. "1.2 MB" → "342 KB")
const formatBytes = (bytes) => {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function UploadTileModal({ onClose, onSuccess }) {
  const [loading, setLoading]                   = useState(false);
  const [uploadStage, setUploadStage]           = useState('');   // progress label shown while loading
  const [error, setError]                       = useState(null);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [tilePreview, setTilePreview]           = useState(null);
  const [tileFileMeta, setTileFileMeta]         = useState(null); // { original, compressed }

  const [collections]           = useState(INITIAL_ACCORDION_CATEGORIES);
  const [isCustomCollection, setIsCustomCollection] = useState(false);
  const [industries, setIndustries]             = useState(INITIAL_USER_INDUSTRIES);
  const [newIndustryInput, setNewIndustryInput] = useState('');

  const formRef     = useRef(null);
  const rawFileRef  = useRef(null); // holds the raw File before compression

  // ── industry helpers ──
  const toggleIndustry = (industry) =>
    setSelectedIndustries(prev =>
      prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
    );

  const handleAddCustomIndustry = (e) => {
    e.preventDefault();
    const cleanValue = newIndustryInput.trim();
    if (!cleanValue) return;
    if (!industries.includes(cleanValue)) setIndustries(prev => [...prev, cleanValue]);
    if (!selectedIndustries.includes(cleanValue)) setSelectedIndustries(prev => [...prev, cleanValue]);
    setNewIndustryInput('');
  };

  // ── tile file picker ──
  const handleTileChange = (e) => {
    const file = e.target.files[0];
    if (!file) { setTilePreview(null); setTileFileMeta(null); rawFileRef.current = null; return; }
    rawFileRef.current = file;
    setTilePreview(URL.createObjectURL(file));
    setTileFileMeta({ originalSize: file.size, compressedSize: null });
  };

  // ── submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const rawFile = rawFileRef.current;
      if (!rawFile) throw new Error('No image selected');

      // ── Step 1: Compress client-side ─────────────────────────────────────────
      setUploadStage('Compressing image…');
      const compressedFile = await compressImage(rawFile);
      setTileFileMeta(prev => ({ ...prev, compressedSize: compressedFile.size }));

      // ── Step 2: Get a short-lived signed URL from our backend ─────────────────
      // The signature lets us upload directly to Cloudinary without going through
      // our server, which was causing the 499 timeout on slow connections.
      setUploadStage('Preparing upload…');
      const sigRes = await fetch(`${BASE_URL}/sign-upload?folder=wonderfloor/tiles`);
      if (!sigRes.ok) throw new Error('Could not get upload credentials');
      const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

      // ── Step 3: Upload DIRECTLY from browser to Cloudinary ───────────────────
      // File travels browser → Cloudinary only. Our server is never in the path.
      setUploadStage('Uploading image to Cloudinary…');
      const cloudinaryForm = new FormData();
      cloudinaryForm.append('file',      compressedFile);
      cloudinaryForm.append('signature', signature);
      cloudinaryForm.append('timestamp', String(timestamp));
      cloudinaryForm.append('api_key',   apiKey);
      cloudinaryForm.append('folder',    folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: cloudinaryForm }
      );
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudData.error?.message || 'Cloudinary upload failed');
      const imageUrl = cloudData.secure_url;

      // ── Step 4: Save product metadata to our backend (no file, just the URL) ──
      setUploadStage('Saving product…');
      const formData = new FormData(formRef.current);
      formData.delete('tileImage');          // don't resend the file bytes
      formData.append('imageUrl', imageUrl); // just the Cloudinary URL
      formData.append('userIndustry', JSON.stringify(selectedIndustries));

      const response = await fetch(`${BASE_URL}/upload/product`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save product');

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();

    } catch (err) {
      setError(err.message);
      setLoading(false);
      setUploadStage('');
    }
  };

  // ── size reduction badge ──
  const SizeBadge = () => {
    if (!tileFileMeta?.originalSize) return null;
    const { originalSize, compressedSize } = tileFileMeta;
    if (!compressedSize) return (
      <span className="text-[10px] text-slate-400 font-medium mt-0.5 block text-center">
        {formatBytes(originalSize)}
      </span>
    );
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Form Body */}
        <form ref={formRef} onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product Name</label>
              <input type="text" name="name" required placeholder="e.g., Pastel Mint" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">SKU Code</label>
              <input type="text" name="sku" required placeholder="e.g., WF/KR/0010" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all uppercase placeholder:text-slate-400" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Physical Size</label>
              <input type="text" name="size" required placeholder="e.g., 2mtr x 15mtr (Roll)" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Main Nav Category</label>
              <div className="relative">
                <select name="navCategory" required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all appearance-none cursor-pointer">
                  <option value="">Select tab...</option>
                  {NAV_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            {/* Collection Input Controller */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-600">Product Collection</label>
                <button
                  type="button"
                  onClick={() => setIsCustomCollection(!isCustomCollection)}
                  className="text-xs text-[#0b9e7a] hover:text-[#098264] hover:underline font-semibold cursor-pointer transition-colors"
                >
                  {isCustomCollection ? "Select Existing" : "+ Create New"}
                </button>
              </div>

              {isCustomCollection ? (
                <input
                  type="text"
                  name="accordionCategory"
                  required
                  placeholder="Enter new collection name"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
                />
              ) : (
                <div className="relative">
                  <select name="accordionCategory" required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all appearance-none cursor-pointer">
                    <option value="">Select collection...</option>
                    {collections.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Color</label>
                <div className="relative">
                  <select name="colour" required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:outline-none appearance-none cursor-pointer">
                    <option value="">Select...</option>
                    {COLOR_FAMILIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Shade</label>
                <div className="relative">
                  <select name="shade" required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:outline-none appearance-none cursor-pointer">
                    <option value="">Select...</option>
                    {SHADES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Industries */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-2">Recommended Industries</label>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {industries.map(ind => (
                  <label key={ind} className="flex items-center gap-2.5 cursor-pointer group py-1">
                    <input type="checkbox" className="hidden" checked={selectedIndustries.includes(ind)} onChange={() => toggleIndustry(ind)} />
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${selectedIndustries.includes(ind) ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-slate-50 border-slate-300 group-hover:border-slate-400'}`}>
                      {selectedIndustries.includes(ind) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">{ind}</span>
                  </label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product Description</label>
              <textarea name="description" rows="5" placeholder="Enter product description for the details modal..." className="w-full h-32 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all resize-none placeholder:text-slate-400 shadow-sm"></textarea>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Tile Texture Image (JPG/PNG)</label>
              <div className="relative w-full h-32 bg-white border-2 border-dashed border-slate-200 hover:border-[#0b9e7a] rounded-xl flex items-center justify-center overflow-hidden transition-all group cursor-pointer shadow-sm">
                {/* Hidden file input — NOT named "tileImage" so it won't go into FormData;
                    the compressed blob is injected manually in handleSubmit instead */}
                <input
                  type="file"
                  accept="image/*"
                  required
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span className="text-xs font-medium">Upload seamless texture</span>
                  </div>
                )}
              </div>
              {/* Size reduction badge shown below the uploader */}
              <SizeBadge />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2 shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
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