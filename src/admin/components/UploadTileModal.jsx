import { useState, useRef } from 'react';

const NAV_CATEGORIES = [
  { id: 'Flooring Products', label: 'Flooring Products' },
  { id: 'Luxury Vinyl Tile', label: 'Luxury Vinyl Tile' }
];

const ACCORDION_CATEGORIES = [
  'Braavo', 'Krayons', 'Durofloor', 'Siggma', 'Orbit', 'Stoneland Monza', 
  'Meteor', 'Aventus', 'Timberworld 1.5mm', 'Timberland Exotica 2mm', 
  'Timberland Maestro 3mm', 'Timberland Widex', 'Timberland Herringbone', 
  'Grandeure Supreme'
];

const SHADES = ['Light', 'Medium', 'Dark'];
const COLOR_FAMILIES = ['Grey', 'Beige', 'Brown', 'Black', 'White', 'Blue', 'Green', 'Red', 'Orange', 'Yellow', 'Purple', 'Pink'];

const USER_INDUSTRIES = [
  'Industrial Flooring', 'Office Flooring', 'Residential Flooring', 
  'School Flooring', 'Sports Flooring', 'Hotel/ Hospitality Flooring'
];

export default function UploadTileModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [tilePreview, setTilePreview] = useState(null);
  
  const formRef = useRef(null);

  const toggleIndustry = (industry) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const handleTileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTilePreview(URL.createObjectURL(file));
    } else {
      setTilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(formRef.current);
    formData.append('userIndustry', JSON.stringify(selectedIndustries));

    try {
      const response = await fetch('http://localhost:8000/upload/product', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload product');
      }

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Upload failed", error);
      setError(error.message);
      setLoading(false);
    }
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

            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product Collection</label>
              <div className="relative">
                <select name="accordionCategory" required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] focus:outline-none transition-all appearance-none cursor-pointer">
                  <option value="">Select collection...</option>
                  {ACCORDION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
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

          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-2">Recommended Industries</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              {USER_INDUSTRIES.map(ind => (
                <label key={ind} className="flex items-center gap-2.5 cursor-pointer group py-1">
                  <input type="checkbox" className="hidden" checked={selectedIndustries.includes(ind)} onChange={() => toggleIndustry(ind)} />
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${selectedIndustries.includes(ind) ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-slate-50 border-slate-300 group-hover:border-slate-400'}`}>
                    {selectedIndustries.includes(ind) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">{ind}</span>
                </label>
              ))}
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
                <input 
                  type="file" 
                  name="tileImage" 
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
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2 shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#0b9e7a] hover:bg-[#098264] transition-colors shadow-sm shadow-[#0b9e7a]/20 disabled:opacity-50 cursor-pointer flex items-center gap-2">
              {loading ? 'Uploading...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}