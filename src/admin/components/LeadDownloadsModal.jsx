// admin/components/LeadDownloadsModal.jsx
import { useState, useEffect } from 'react';

const NODE_BACKEND_URL = 'https://wonderfloor-dashboard.vercel.app';

const formatDateTime = (raw) =>
  raw
    ? new Date(raw).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export default function LeadDownloadsModal({ phone, name, onClose }) {
  const [downloads, setDownloads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!phone) return;

    let cancelled = false;

    async function loadDownloads() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${NODE_BACKEND_URL}/leads/downloads/${phone}`);
        const data = await res.json();
        if (!cancelled) {
          setDownloads(data?.success ? data.downloads : []);
        }
      } catch (err) {
        console.error('Lead downloads fetch failed:', err);
        if (!cancelled) setError('Downloads load nahi ho paaye.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDownloads();
    return () => {
      cancelled = true;
    };
  }, [phone]);

 const handleDeleteDownload = async (downloadId) => {
    if (!window.confirm('Delete this download record?')) return;
    try {
      const res = await fetch(`${NODE_BACKEND_URL}/leads/downloads/entry/${downloadId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDownloads((prev) => prev.filter((d) => d._id !== downloadId));
      } else {
        alert('Delete failed.');
      }
    } catch (err) {
      console.error('Download delete failed:', err);
      alert('Could not connect to server.');
    }
  };

  const handleDeleteAllDownloads = async () => {
    if (downloads.length === 0) return;
    if (!window.confirm(`Delete ALL ${downloads.length} download records for this lead? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${NODE_BACKEND_URL}/leads/downloads/${phone}/all`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDownloads([]);
      } else {
        alert('Delete all failed.');
      }
    } catch (err) {
      console.error('Delete all downloads failed:', err);
      alert('Could not connect to server.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-[#eeeeee] shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-[#1a1a1a] truncate">
              {name || 'Unnamed'}
            </h3>
            <p className="text-[12px] text-[#999999]">{phone}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888888] hover:bg-[#f5f5f5] hover:text-[#333333] transition-colors cursor-pointer shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[360px] overflow-y-auto px-5 py-3">
          {isLoading ? (
            <div className="h-[160px] flex items-center justify-center text-[#aaaaaa] text-sm">
              Loading…
            </div>
          ) : error ? (
            <div className="h-[160px] flex items-center justify-center text-red-500 text-sm text-center px-4">
              {error}
            </div>
          ) : downloads.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-[#aaaaaa] text-sm">
            There is no any download here
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#f0f0f0]">
              {downloads.map((d, i) => (
                <div key={d._id || i} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#333333] truncate">
                      {d.productName || 'Unknown product'}
                    </div>
                    {d.productSku && (
                      <div className="text-[11px] text-[#aaaaaa] truncate">{d.productSku}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#999999] tabular-nums">
                      {formatDateTime(d.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDeleteDownload(d._id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-colors"
                      title="Delete this record"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
      <div className="px-5 py-3 border-t border-[#f0f0f0] flex justify-between items-center">
          <span className="text-[11px] text-[#999999]">
            {isLoading ? '' : `${downloads.length} download${downloads.length === 1 ? '' : 's'}`}
          </span>
          <div className="flex items-center gap-2">
            {downloads.length > 0 && (
              <button
                onClick={handleDeleteAllDownloads}
                className="text-[12px] font-medium px-4 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
              >
                Delete All History
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[12px] font-medium px-4 py-2 rounded-lg bg-[#f5f5f5] text-[#555555] hover:bg-[#eeeeee] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
