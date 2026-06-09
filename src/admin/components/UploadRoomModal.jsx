import { useState, useRef } from 'react';

const INITIAL_ROOM_CATEGORIES = [
  'Industrial Flooring', 'Office Flooring', 'Residential Flooring', 
  'School Flooring', 'Sports Flooring', 'Supermarket Flooring', 
  'Transport Flooring', 'Hospital Flooring', 'Auditorium Flooring', 
  'Hotel/ Hospitality Flooring'
];

const INITIAL_PRODUCT_COLLECTIONS = [
  'Braavo', 'Krayons', 'Durofloor', 'Siggma', 'Orbit', 'Stoneland Monza', 
  'Meteor', 'Aventus', 'Timberworld 1.5mm', 'Timberland Exotica 2mm', 
  'Timberland Maestro 3mm', 'Timberland Herringbone'
];

export default function UploadRoomModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Collections state (now dynamic) ──
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [collections, setCollections] = useState(INITIAL_PRODUCT_COLLECTIONS);
  const [newCollectionInput, setNewCollectionInput] = useState('');

  // ── Industry Category state (now dynamic) ──
  const [categories, setCategories] = useState(INITIAL_ROOM_CATEGORIES);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // ── Image previews ──
  const [basePreview, setBasePreview] = useState(null);
  const [maskPreview, setMaskPreview] = useState(null);

  const formRef = useRef(null);

  // ── Toggle a collection on/off ──
  const toggleCollection = (collection) => {
    setSelectedCollections(prev =>
      prev.includes(collection)
        ? prev.filter(c => c !== collection)
        : [...prev, collection]
    );
  };

  // ── Add a brand new custom industry category ──
  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    const clean = newCategoryInput.trim();
    if (!clean) return;
    if (!categories.includes(clean)) {
      setCategories(prev => [...prev, clean]);
    }
    setNewCategoryInput('');
  };

  // ── Add a brand new custom product collection ──
  const handleAddCustomCollection = (e) => {
    e.preventDefault();
    const clean = newCollectionInput.trim();
    if (!clean) return;
    if (!collections.includes(clean)) {
      setCollections(prev => [...prev, clean]);
    }
    if (!selectedCollections.includes(clean)) {
      setSelectedCollections(prev => [...prev, clean]);
    }
    setNewCollectionInput('');
  };

  const handleImageChange = (e, setPreview) => {
    const file = e.target.files[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(formRef.current);
    formData.append('supportedCollections', JSON.stringify(selectedCollections));

    try {
      const response = await fetch('http://localhost:8000/upload/room', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload room');
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Upload failed', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">Upload New Room</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Room Name */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Room Name</label>
              <input
                type="text" name="name" required
                placeholder="e.g., School Option 7"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* ── Industry Category — dropdown + inline adder ── */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-600">Industry Category</label>
              </div>
              <div className="relative">
                <select
                  name="category" required
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select industry...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>

              {/* Inline custom category adder */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="Add custom industry..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-[#0b9e7a] text-slate-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* ── Supported Product Collections — checkboxes + inline adder ── */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-2">
              Supported Product Collections
            </label>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {collections.map(collection => (
                  <label key={collection} className="flex items-center gap-2.5 cursor-pointer group py-1">
                    <input
                      type="checkbox" className="hidden"
                      checked={selectedCollections.includes(collection)}
                      onChange={() => toggleCollection(collection)}
                    />
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all
                      ${selectedCollections.includes(collection)
                        ? 'bg-[#0b9e7a] border-[#0b9e7a]'
                        : 'bg-slate-50 border-slate-300 group-hover:border-slate-400'}`}>
                      {selectedCollections.includes(collection) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                      {collection}
                    </span>
                  </label>
                ))}
              </div>

              {/* Inline custom collection adder */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  value={newCollectionInput}
                  onChange={(e) => setNewCollectionInput(e.target.value)}
                  placeholder="Type new collection name..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-[#0b9e7a] focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCollection}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-[#0b9e7a] text-slate-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  + Add Custom
                </button>
              </div>
            </div>
          </div>

          {/* ── Image Uploads ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Base Image — required */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">
                Base Image (JPG/PNG)
                <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="relative w-full h-40 bg-white border-2 border-dashed border-slate-200 hover:border-[#0b9e7a] rounded-xl flex items-center justify-center overflow-hidden transition-all group cursor-pointer shadow-sm">
                <input
                  type="file" name="baseImage" accept="image/*" required
                  onChange={(e) => handleImageChange(e, setBasePreview)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                {basePreview ? (
                  <>
                    <img src={basePreview} alt="Base Preview" className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                      <span className="text-slate-800 text-xs font-semibold bg-white px-3 py-1.5 rounded-md shadow-md">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center pointer-events-none text-slate-400 group-hover:text-[#0b9e7a] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="text-xs font-medium">Upload Room Photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Mask Image — OPTIONAL ── */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-600">
                  Mask Image (PNG)
                </label>
                {/* Optional badge */}
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full">
                  Optional
                </span>
              </div>
              <div className="relative w-full h-40 bg-white border-2 border-dashed border-slate-200 hover:border-[#0b9e7a] rounded-xl flex items-center justify-center overflow-hidden transition-all group cursor-pointer shadow-sm">
                {/* ↓ No `required` attribute — submit always proceeds without it */}
                <input
                  type="file" name="maskImage" accept="image/png"
                  onChange={(e) => handleImageChange(e, setMaskPreview)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                {maskPreview ? (
                  <>
                    <img
                      src={maskPreview} alt="Mask Preview"
                      className="w-full h-full object-contain bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlMmU4ZjAiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+')] bg-repeat"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                      <span className="text-slate-800 text-xs font-semibold bg-white px-3 py-1.5 rounded-md shadow-md">Change Mask</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center pointer-events-none text-slate-400 group-hover:text-[#0b9e7a] transition-colors gap-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span className="text-xs font-medium">Upload Floor Mask</span>
                    <span className="text-[10px] text-slate-400">Skip for 2D rooms</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2 shrink-0">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#0b9e7a] hover:bg-[#098264] transition-colors shadow-sm shadow-[#0b9e7a]/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? 'Uploading...' : 'Save Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}