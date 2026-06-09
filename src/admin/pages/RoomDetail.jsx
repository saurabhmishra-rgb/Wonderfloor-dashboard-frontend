// RoomDetailModal.jsx
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:8000';

export default function RoomDetailModal({ roomId, onClose }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    let isMounted = true; // Prevents updating state on unmounted modal components
    
    async function fetchRoomDetails() {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/rooms/${roomId}`);
        if (!response.ok) throw new Error('Room not found');
        const data = await response.json();
        if (isMounted) setRoom(data);
      } catch (error) {
        console.error('Error fetching room parameters:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchRoomDetails();
    return () => { isMounted = false; };
  }, [roomId]);

  // Lock container context scroll layer
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!roomId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
      {/* Backdrop Click Handler */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Window Panel Frame */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] z-10 animate-fade-in">
        
        {/* Absolute High-Z Close Trigger Icon Option */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-700 bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-100 transition-all cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {loading ? (
          <div className="w-full flex flex-col items-center justify-center py-40 text-sm text-[#aaaaaa]">
            <svg className="animate-spin mb-3 text-[#0b9e7a]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Syncing workspace canvas layers...
          </div>
        ) : !room ? (
          <div className="w-full flex flex-col items-center justify-center py-28 px-6 text-center gap-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm font-medium text-gray-500">Target document metadata could not be fetched.</p>
            <button onClick={onClose} className="px-4 py-2 bg-[#0b9e7a] text-white rounded-lg text-sm font-medium shadow-sm hover:bg-[#09866a] transition-colors cursor-pointer">
              Close Window
            </button>
          </div>
        ) : (
          <>
            {/* LEFT SIDE: Image Display Canvas Panel */}
            <div className="w-full md:w-[50%] bg-[#fafafa] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
              <div className="aspect-[4/3] w-full rounded-xl border border-gray-200/70 bg-white overflow-hidden shadow-xs relative group">
                <img 
                  src={room.previewUrl} 
                  alt={room.name} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-102" 
                  onError={e => { e.target.src = 'https://placehold.co/600x450?text=Asset+Missing'; }}
                />
              </div>
              <span className="absolute bottom-4 left-6 bg-gray-200/50 text-gray-400 text-[9px] font-mono px-2 py-0.5 rounded">
                ID: {room._id}
              </span>
            </div>

            {/* RIGHT SIDE: Detailed Config Specification Info Block */}
            <div className="flex-1 p-8 flex flex-col justify-between bg-white min-w-0">
              <div className="space-y-5">
                {/* Categorization Badge Headers */}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#edf9f5] text-[#0b9e7a] text-xs font-semibold rounded-full tracking-wide">
                    {room.category || 'Standard Environment'}
                  </span>
                  {room.maskUrl ? (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-xs font-semibold rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Vision Mask Pre-Compiled
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200/60 text-xs font-semibold rounded-full">
                      Base Mapping Plane Only
                    </span>
                  )}
                </div>

                {/* Primary Structural Title Metrics */}
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 truncate">{room.name}</h2>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">
                    Wonderfloor Interior Visualization Document
                  </p>
                </div>

                <hr className="border-gray-100" />

                {/* Dynamic Collections Attachment Segment */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Supported Product Ecosystems</p>
                  <div className="flex flex-wrap gap-1.5">
                    {room.supportedCollections?.length > 0 ? (
                      room.supportedCollections.map((col, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-medium rounded-md whitespace-nowrap">
                          {col}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Universal Scope Matching Active</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER BUTTONS WITH COMPLEMENTARY INLINE ICONS */}
              <div className="pt-5 border-t border-gray-100 mt-8 flex gap-3">
                <a 
                  href={room.previewUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all shadow-xs text-center"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Inspect Base
                </a>
                
                {room.maskUrl && (
                  <a 
                    href={room.maskUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#0b9e7a] hover:bg-[#09866a] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    Inspect Mask
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}