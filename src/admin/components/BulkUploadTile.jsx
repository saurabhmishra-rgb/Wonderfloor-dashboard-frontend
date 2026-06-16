// BulkUploadTile.jsx
import { useState, useRef } from 'react';

export default function BulkImageUploadModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // File staging states
  const [dataFile, setDataFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  const dataInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Handle Data Sheet selection (.csv or .xlsx)
  const handleDataChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'csv' && extension !== 'xlsx') {
        setError("Please upload only valid data spreadsheet formats (.csv, .xlsx).");
        return;
      }
      setError(null);
      setDataFile(file);
    }
  };

  // Handle Multiple Images selection
  const handleImagesChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const validImages = filesArray.filter(file => file.type.startsWith('image/'));
      
      if (validImages.length !== filesArray.length) {
        setError("Non-image files were automatically filtered out of the staging selection.");
      } else {
        setError(null);
      }
      
      setImageFiles(validImages);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dataFile) {
      setError("Please attach your filled data spreadsheet (Step 2) before continuing.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', dataFile);
    imageFiles.forEach(fileObj => {
      formData.append('images', fileObj);
    });

    try {
      const response = await fetch('https://wonderfloor-dashboard.vercel.app/upload/bulk-products-combined', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process bulk import stream.');

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e293b]/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Bulk Upload Products</h2>
            <p className="text-xs text-slate-400 mt-0.5">Upload many products at once using an Excel or CSV sheet + texture images</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Form Body Wrapper */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 bg-slate-50/50 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs font-medium shrink-0 animate-pulse">
              {error}
            </div>
          )}

          {/* ── STEP 1: DOWNLOAD TEMPLATE ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#0b9e7a] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-700">Download the data template</h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Fill in columns exactly: <code className="bg-slate-50 px-1 py-0.5 border border-slate-200 rounded font-mono text-[11px] text-slate-600">name</code>, <code className="bg-slate-50 px-1 py-0.5 border border-slate-200 rounded font-mono text-[11px] text-slate-600">sku</code>, <code className="bg-slate-50 px-1 py-0.5 border border-slate-200 rounded font-mono text-[11px] text-slate-600">size</code>, <code className="bg-slate-50 px-1 py-0.5 border border-slate-200 rounded font-mono text-[11px] text-slate-600">navCategory</code>, <code className="bg-slate-50 px-1 py-0.5 border border-slate-200 rounded font-mono text-[11px] text-slate-600">accordionCategory</code>, <code className="bg-slate-50 px-1 py-0.5 border border-slate-200 rounded font-mono text-[11px] text-slate-600">colour</code>, <code className="bg-slate-50 px-1 py-0.5 border border-slate-200 rounded font-mono text-[11px] text-slate-600">shade</code>.
              </p>
              <a 
                href="http://localhost:8000/templates/product_bulk_template.csv" 
                download
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white rounded-lg text-slate-600 font-semibold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download template.csv
              </a>
            </div>
          </div>

          {/* ── STEP 2: UPLOAD DATA SHEET ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#0b9e7a] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-700">Upload your filled data file</h3>
              <input type="file" ref={dataInputRef} accept=".csv, .xlsx" onChange={handleDataChange} className="hidden" />
              
              <div 
                onClick={() => dataInputRef.current.click()}
                className={`mt-2.5 border border-dashed rounded-lg py-4 px-4 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  dataFile ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:bg-slate-50/80'
                }`}
              >
                <svg className={dataFile ? 'text-emerald-500' : 'text-slate-400'} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span className="text-xs font-medium text-slate-600">
                  {dataFile ? `Selected: ${dataFile.name}` : "Click to select data file (.csv, .xlsx)"}
                </span>
              </div>
            </div>
          </div>

          {/* ── STEP 3: UPLOAD IMAGES STREAM ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#0b9e7a] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-700">Select all product images</h3>
                {imageFiles.length > 0 && (
                  <button type="button" onClick={() => setImageFiles([])} className="text-[10px] text-red-500 font-semibold hover:underline cursor-pointer">Clear Images</button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Image filenames should match your product SKUs closely so the index sync runner maps them properly.
              </p>
              
              <input type="file" ref={imageInputRef} accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
              <div 
                onClick={() => imageInputRef.current.click()}
                className={`mt-2.5 border border-dashed rounded-lg py-5 px-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                  imageFiles.length > 0 ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:bg-slate-50/80'
                }`}
              >
                <svg className={imageFiles.length > 0 ? 'text-emerald-500' : 'text-slate-400'} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span className="text-xs font-medium text-slate-600">
                  {imageFiles.length > 0 ? `Selected ${imageFiles.length} images for bulk upload` : "Click to select texture files (hold Ctrl/Cmd for multiple selection)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls Footer */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-slate-100 bg-white shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading || !dataFile} 
            className="px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0b9e7a] hover:bg-[#098264] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {loading ? 'Processing records dataset...' : `Upload ${imageFiles.length} Product${imageFiles.length !== 1 ? 's' : ''}`}
          </button>
        </div>

      </div>
    </div>
  );
}
