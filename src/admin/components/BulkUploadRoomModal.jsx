import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const TEMPLATE_ROWS = [
  {
    name: 'School Option 7',
    category: 'School Flooring',
    supportedCollections: 'Krayons,Rhythm,Trendo Chips',
    baseImageFile: 'school7.jpg',
    maskImageFile: 'school7_mask.png',
  },
  {
    name: 'Office Option 5',
    category: 'Office Flooring',
    supportedCollections: 'Siggma,Ornate',
    baseImageFile: 'office5.jpg',
    maskImageFile: '',
  },
];

// Download a prefilled Excel template
function downloadTemplate() {
  const ws = XLSX.utils.json_to_sheet(TEMPLATE_ROWS);

  // Column widths
  ws['!cols'] = [
    { wch: 25 }, { wch: 28 }, { wch: 40 }, { wch: 22 }, { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rooms');
  XLSX.writeFile(wb, 'wonderfloor_rooms_template.xlsx');
}

export default function BulkUploadRoomModal({ onClose, onSuccess }) {
  const [rows, setRows]               = useState([]);         // parsed Excel rows
  const [imageFiles, setImageFiles]   = useState({});         // { filename: File }
  const [statuses, setStatuses]       = useState([]);         // per-row upload status
  const [isUploading, setIsUploading] = useState(false);
  const [parseError, setParseError]   = useState(null);
  const [isDone, setIsDone]           = useState(false);

  const excelRef = useRef(null);
  const imagesRef = useRef(null);

  // ── Parse Excel ──
  function handleExcelChange(e) {
    setParseError(null);
    setRows([]);
    setStatuses([]);
    setIsDone(false);

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb   = XLSX.read(evt.target.result, { type: 'binary' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

        // Validate required columns
        const required = ['name', 'category', 'baseImageFile'];
        const missing  = required.filter(col => !Object.keys(data[0] || {}).includes(col));
        if (missing.length) {
          setParseError(`Missing columns: ${missing.join(', ')}. Download the template to see the correct format.`);
          return;
        }

        setRows(data);
        setStatuses(data.map(() => ({ state: 'pending', message: '' })));
      } catch {
        setParseError('Could not read the Excel file. Make sure it is a valid .xlsx file.');
      }
    };
    reader.readAsBinaryString(file);
  }

  // ── Collect all selected images into a lookup map by filename ──
  function handleImagesChange(e) {
    const files = Array.from(e.target.files);
    const map   = {};
    files.forEach(f => { map[f.name] = f; });
    setImageFiles(map);
  }

  // ── Upload all rows ──
  async function handleUpload() {
    if (rows.length === 0) return;

    setIsUploading(true);
    setIsDone(false);
    const newStatuses = rows.map(() => ({ state: 'pending', message: '' }));
    setStatuses([...newStatuses]);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Mark as uploading
      newStatuses[i] = { state: 'uploading', message: 'Uploading...' };
      setStatuses([...newStatuses]);

      // Validate base image exists
      const baseFile = imageFiles[row.baseImageFile];
      if (!baseFile) {
        newStatuses[i] = { state: 'error', message: `Base image "${row.baseImageFile}" not found in selected images` };
        setStatuses([...newStatuses]);
        continue;
      }

      // Build FormData
      const formData = new FormData();
      formData.append('name', row.name);
      formData.append('category', row.category);

      const collections = row.supportedCollections
        ? row.supportedCollections.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      formData.append('supportedCollections', JSON.stringify(collections));
      formData.append('baseImage', baseFile);

      // Mask is optional
      const maskFile = imageFiles[row.maskImageFile];
      if (maskFile) formData.append('maskImage', maskFile);

      try {
        const res = await fetch('https://wonderfloor-dashboard.vercel.app/upload/room', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Upload failed');

        newStatuses[i] = { state: 'success', message: 'Uploaded ✓' };
      } catch (err) {
        newStatuses[i] = { state: 'error', message: err.message };
      }

      setStatuses([...newStatuses]);
    }

    setIsUploading(false);
    setIsDone(true);

    // If at least one succeeded, refresh the room list
    if (newStatuses.some(s => s.state === 'success')) {
      onSuccess?.();
    }
  }

  const successCount = statuses.filter(s => s.state === 'success').length;
  const errorCount   = statuses.filter(s => s.state === 'error').length;

  // Which base images are still missing after files are selected
  const missingImages = rows
    .map(r => r.baseImageFile)
    .filter(name => name && !imageFiles[name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Bulk Upload Rooms</h2>
            <p className="text-xs text-slate-400 mt-0.5">Upload many rooms at once using an Excel sheet + images</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">

          {/* ── Step 1: Download template ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#0b9e7a] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-slate-700">Download the Excel template</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">
                  Fill in: <code className="bg-slate-100 px-1 rounded">name</code>,{' '}
                  <code className="bg-slate-100 px-1 rounded">category</code>,{' '}
                  <code className="bg-slate-100 px-1 rounded">supportedCollections</code> (comma-separated),{' '}
                  <code className="bg-slate-100 px-1 rounded">baseImageFile</code>,{' '}
                  <code className="bg-slate-100 px-1 rounded">maskImageFile</code> (optional)
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download template.xlsx
                </button>
              </div>
            </div>
          </div>

          {/* ── Step 2: Upload Excel ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#0b9e7a] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-slate-700 mb-2">Upload your filled Excel file</p>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-[#0b9e7a] rounded-lg cursor-pointer transition-colors group">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-[#0b9e7a] transition-colors">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                    {rows.length > 0 ? `✓ ${rows.length} rows loaded` : 'Click to select .xlsx file'}
                  </span>
                  <input
                    ref={excelRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleExcelChange}
                  />
                </label>
                {parseError && (
                  <p className="text-xs text-red-500 mt-2 font-medium">{parseError}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Step 3: Upload Images ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#0b9e7a] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-slate-700 mb-0.5">Select all room images</p>
                <p className="text-xs text-slate-400 mb-2">
                  Filenames must match the <code className="bg-slate-100 px-1 rounded">baseImageFile</code> and <code className="bg-slate-100 px-1 rounded">maskImageFile</code> columns exactly.
                </p>
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 hover:border-[#0b9e7a] rounded-lg cursor-pointer transition-colors group">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-[#0b9e7a] transition-colors">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                    {Object.keys(imageFiles).length > 0
                      ? `✓ ${Object.keys(imageFiles).length} image(s) selected`
                      : 'Click to select images (hold Ctrl/Cmd for multiple)'}
                  </span>
                  <input
                    ref={imagesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImagesChange}
                  />
                </label>

                {/* Missing images warning */}
                {missingImages.length > 0 && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <p className="text-xs font-semibold text-amber-700 mb-1">
                      ⚠ {missingImages.length} base image(s) not yet selected:
                    </p>
                    <ul className="text-xs text-amber-600 space-y-0.5">
                      {missingImages.map(name => (
                        <li key={name} className="font-mono">{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Preview Table ── */}
          {rows.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-slate-700">{rows.length} rooms to upload</p>
                {isDone && (
                  <span className="text-xs font-semibold text-[#0b9e7a]">
                    {successCount} succeeded · {errorCount} failed
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Name', 'Category', 'Collections', 'Base Image', 'Mask', 'Status'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const status    = statuses[i];
                      const hasBase   = !!imageFiles[row.baseImageFile];
                      const hasMask   = row.maskImageFile ? !!imageFiles[row.maskImageFile] : null;

                      return (
                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 font-medium text-slate-700 whitespace-nowrap">{row.name || '—'}</td>
                          <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{row.category || '—'}</td>
                          <td className="px-3 py-2.5 text-slate-400 max-w-[160px] truncate" title={row.supportedCollections}>
                            {row.supportedCollections || '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`flex items-center gap-1 font-mono ${hasBase ? 'text-[#0b9e7a]' : 'text-red-400'}`}>
                              {hasBase ? '✓' : '✗'} {row.baseImageFile}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            {row.maskImageFile ? (
                              <span className={`font-mono ${hasMask ? 'text-[#0b9e7a]' : 'text-amber-500'}`}>
                                {hasMask ? '✓' : '?'} {row.maskImageFile}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {status?.state === 'pending'   && <span className="text-slate-300">Waiting</span>}
                            {status?.state === 'uploading' && (
                              <span className="text-blue-500 flex items-center gap-1">
                                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                Uploading
                              </span>
                            )}
                            {status?.state === 'success'   && <span className="text-[#0b9e7a] font-semibold">✓ Done</span>}
                            {status?.state === 'error'     && (
                              <span className="text-red-500 font-semibold" title={status.message}>✗ Error</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isDone ? 'Close' : 'Cancel'}
          </button>

          <button
            onClick={handleUpload}
            disabled={isUploading || rows.length === 0 || missingImages.length > 0}
            className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#0b9e7a] hover:bg-[#098264] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Uploading {statuses.filter(s => s.state === 'success').length}/{rows.length}...
              </>
            ) : isDone ? (
              `Upload Again`
            ) : (
              `Upload ${rows.length} Room${rows.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
