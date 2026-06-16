import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:8000';

// ─── Initial data constants ───────────────────────────────────────────────────
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

// ─── Persistent Memory (Lives outside the modal lifecycle) ────────────────────
let persistentRoomCategories     = [...INITIAL_ROOM_CATEGORIES];
let persistentProductCollections = [...INITIAL_PRODUCT_COLLECTIONS];

export default function RoomDetail({ roomId, initialMode = 'view', onClose }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(initialMode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  
  // Track dynamic list updates
  const [categories, setCategories] = useState(persistentRoomCategories);
  const [collections, setCollections] = useState(persistentProductCollections);
  
  // Dropdown open states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);

  // Inline custom text input fields
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [customCollection, setCustomCollection] = useState('');
  const [isCustomCollectionMode, setIsCustomCollectionMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    supportedCollections: [], // Upgraded to array track manipulation
    newRoomImage: null, 
    newMaskImage: null  
  });

  useEffect(() => {
    setIsEditing(initialMode === 'edit');
  }, [initialMode]);

  useEffect(() => {
    if (!roomId) return;
    let isMounted = true; 
    
    async function fetchRoomDetails() {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/rooms/${roomId}`);
        if (!response.ok) throw new Error('Room not found');
        const data = await response.json();
        if (isMounted) {
          setRoom(data);
          setFormData({
            name: data.name || '',
            category: data.category || '',
            supportedCollections: data.supportedCollections || [], // Array format integration
            newRoomImage: null,
            newMaskImage: null
          });
        }
      } catch (error) {
        console.error('Error fetching room parameters:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchRoomDetails();
    return () => { isMounted = false; };
  }, [roomId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  // Helper actions for Multi-Select collections array tracking setup
  const toggleCollectionItem = (item) => {
    setFormData(prev => {
      const current = prev.supportedCollections;
      const updated = current.includes(item) 
        ? current.filter(c => c !== item) 
        : [...current, item];
      return { ...prev, supportedCollections: updated };
    });
  };

  // Add customized Category inline
  const handleAddCustomCategoryInline = () => {
    const val = customCategory.trim();
    if (!val) return;
    if (!categories.includes(val)) {
      setCategories(prev => {
        const updated = [...prev, val];
        persistentRoomCategories = updated;
        return updated;
      });
    }
    setFormData(prev => ({ ...prev, category: val }));
    setIsCustomCategoryMode(false);
    setCustomCategory('');
  };

  // Add customized Collection item inline
  const handleAddCustomCollectionInline = () => {
    const val = customCollection.trim();
    if (!val) return;
    if (!collections.includes(val)) {
      setCollections(prev => {
        const updated = [...prev, val];
        persistentProductCollections = updated;
        return updated;
      });
    }
    if (!formData.supportedCollections.includes(val)) {
      setFormData(prev => ({ ...prev, supportedCollections: [...prev.supportedCollections, val] }));
    }
    setIsCustomCollectionMode(false);
    setCustomCollection('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('supportedCollections', JSON.stringify(formData.supportedCollections));

      if (formData.newRoomImage) {
        payload.append('previewImage', formData.newRoomImage); 
      }
      if (formData.newMaskImage) {
        payload.append('maskImage', formData.newMaskImage);    
      }

      const response = await fetch(`${BASE_URL}/rooms/${roomId}`, {
        method: 'PATCH', 
        body: payload
      });

      if (!response.ok) throw new Error('Failed to update room');
      
      const updatedRoom = await response.json();
      setRoom(updatedRoom); 
      setIsEditing(false);  
      setFormData(prev => ({ 
        ...prev, 
        supportedCollections: updatedRoom.supportedCollections || [],
        newRoomImage: null, 
        newMaskImage: null 
      }));
      
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Failed to save changes. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!roomId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] z-10 animate-fade-in">
        
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
                  src={formData.newRoomImage ? URL.createObjectURL(formData.newRoomImage) : room.previewUrl} 
                  alt={room.name} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-102" 
                  onError={e => { e.target.src = 'https://placehold.co/600x450?text=Asset+Missing'; }}
                />
                {formData.newRoomImage && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                    Unsaved Preview
                  </span>
                )}
              </div>
              <span className="absolute bottom-4 left-6 bg-gray-200/50 text-gray-400 text-[9px] font-mono px-2 py-0.5 rounded">
                ID: {room._id}
              </span>
            </div>

            {/* RIGHT SIDE: Detailed Config Specification Info Block */}
            <div className="flex-1 p-8 flex flex-col justify-between bg-white min-w-0 overflow-y-auto">
              
              {isEditing ? (
                /* EDIT MODE FORM */
                <div className="space-y-4">
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-2">Edit Room Details</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Room Name Input */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Room Name</label>
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#0b9e7a] focus:ring-1 focus:ring-[#0b9e7a] transition-all"
                        placeholder="e.g. Modern Living Room"
                      />
                    </div>

                    {/* Upgraded Category Custom Dropdown */}
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Category</label>
                        <button
                          type="button"
                          onClick={() => { setIsCustomCategoryMode(!isCustomCategoryMode); setIsCategoryOpen(false); }}
                          className="text-[11px] text-[#0b9e7a] font-semibold hover:underline"
                        >
                          {isCustomCategoryMode ? 'Select Existing' : '+ Create New'}
                        </button>
                      </div>

                      {isCustomCategoryMode ? (
                        <div className="flex gap-2 mt-1.5">
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Add custom industry..."
                            className="flex-1 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0b9e7a]"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomCategoryInline}
                            className="px-3 bg-gray-100 hover:bg-[#0b9e7a] text-gray-600 hover:text-white rounded-lg text-xs font-semibold transition-all"
                          >
                            Add
                          </button>
                        </div>
                      ) : (
                        <div className="relative mt-1.5">
                          <div
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 flex justify-between items-center cursor-pointer select-none"
                          >
                            <span className={formData.category ? 'text-gray-800' : 'text-gray-400'}>
                              {formData.category || 'Select industry...'}
                            </span>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform text-gray-400 ${isCategoryOpen ? 'rotate-180' : ''}`}>
                              <path d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>

                          {isCategoryOpen && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setIsCategoryOpen(false)}></div>
                              <ul className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto py-1">
                                {categories.map(cat => (
                                  <li
                                    key={cat}
                                    className="group px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 flex justify-between items-center cursor-pointer"
                                    onClick={() => { setFormData({ ...formData, category: cat }); setIsCategoryOpen(false); }}
                                  >
                                    <span className="truncate flex-1">{cat}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCategories(prev => {
                                          const updated = prev.filter(c => c !== cat);
                                          persistentRoomCategories = updated;
                                          return updated;
                                        });
                                        if (formData.category === cat) setFormData({ ...formData, category: '' });
                                      }}
                                      className="text-gray-400 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
                  </div>

                  {/* Upgraded Multi-Select Supported Collections Interface */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Supported Collections</label>
                      <button
                        type="button"
                        onClick={() => { setIsCustomCollectionMode(!isCustomCollectionMode); setIsCollectionsOpen(false); }}
                        className="text-[11px] text-[#0b9e7a] font-semibold hover:underline"
                      >
                        {isCustomCollectionMode ? 'Select Existing' : '+ Create New'}
                      </button>
                    </div>

                    {isCustomCollectionMode ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customCollection}
                          onChange={(e) => setCustomCollection(e.target.value)}
                          placeholder="Type new collection name..."
                          className="flex-1 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0b9e7a]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCollectionInline}
                          className="px-3 bg-gray-100 hover:bg-[#0b9e7a] text-gray-600 hover:text-white rounded-lg text-xs font-semibold transition-all"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div
                          onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
                          className="w-full min-h-[40px] bg-gray-50 border border-gray-200 rounded-lg p-1.5 flex flex-wrap gap-1 items-center justify-between cursor-pointer"
                        >
                          <div className="flex flex-wrap gap-1 flex-1">
                            {formData.supportedCollections.length === 0 ? (
                              <span className="text-gray-400 text-sm pl-1.5">Select supported ecosystems...</span>
                            ) : (
                              formData.supportedCollections.map(col => (
                                <span key={col} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#edf9f5] border border-[#0b9e7a]/20 text-[#0b9e7a] text-xs font-semibold rounded-md">
                                  {col}
                                  <span 
                                    onClick={(e) => { e.stopPropagation(); toggleCollectionItem(col); }}
                                    className="hover:bg-[#0b9e7a]/10 rounded-sm p-0.5 text-[#0b9e7a]/60 hover:text-[#0b9e7a]"
                                  >
                                    ×
                                  </span>
                                </span>
                              ))
                            )}
                          </div>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`text-gray-400 mr-1 shrink-0 transition-transform ${isCollectionsOpen ? 'rotate-180' : ''}`}>
                            <path d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {isCollectionsOpen && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setIsCollectionsOpen(false)}></div>
                            <ul className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1">
                              {collections.map(col => {
                                const isChecked = formData.supportedCollections.includes(col);
                                return (
                                  <li
                                    key={col}
                                    onClick={() => toggleCollectionItem(col)}
                                    className="group px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 flex justify-between items-center cursor-pointer select-none"
                                  >
                                    <span className={`truncate ${isChecked ? 'text-[#0b9e7a] font-semibold' : ''}`}>{col}</span>
                                    <div className="flex items-center gap-2">
                                      {isChecked && (
                                        <span className="text-[#0b9e7a] text-xs font-bold">✓</span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCollections(prev => {
                                            const updated = prev.filter(c => c !== col);
                                            persistentProductCollections = updated;
                                            return updated;
                                          });
                                          setFormData(prev => ({
                                            ...prev,
                                            supportedCollections: prev.supportedCollections.filter(c => c !== col)
                                          }));
                                        }}
                                        className="text-gray-400 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                      </button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Image Upload Inputs */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Replace Images (Optional)</label>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between cursor-pointer w-full px-3 py-2.5 bg-gray-50 border border-gray-200 border-dashed rounded-lg hover:border-[#0b9e7a] hover:bg-[#edf9f5] transition-all group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-[#0b9e7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <span className="text-xs font-medium text-gray-600 group-hover:text-[#0b9e7a] truncate">
                            {formData.newRoomImage ? formData.newRoomImage.name : 'Upload new Base Room Image'}
                          </span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'newRoomImage')} />
                        <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">Browse</span>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer w-full px-3 py-2.5 bg-gray-50 border border-gray-200 border-dashed rounded-lg hover:border-[#0b9e7a] hover:bg-[#edf9f5] transition-all group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-[#0b9e7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                          <span className="text-xs font-medium text-gray-600 group-hover:text-[#0b9e7a] truncate">
                            {formData.newMaskImage ? formData.newMaskImage.name : 'Upload new Vision Mask Image'}
                          </span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'newMaskImage')} />
                        <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">Browse</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                /* VIEW MODE DISPLAY */
                <div className="space-y-5">
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

                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-bold tracking-tight text-gray-900 truncate">{room.name}</h2>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-gray-400 hover:text-[#0b9e7a] hover:bg-[#edf9f5] rounded-md transition-colors"
                        title="Edit Details"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">
                      Wonderfloor Interior Visualization Document
                    </p>
                  </div>

                  <hr className="border-gray-100" />

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
              )}

              {/* ACTION FOOTER BUTTONS */}
              <div className="pt-5 border-t border-gray-100 mt-6 flex gap-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setIsCategoryOpen(false);
                        setIsCollectionsOpen(false);
                        setIsCustomCategoryMode(false);
                        setIsCustomCollectionMode(false);
                        setFormData({
                          name: room.name || '',
                          category: room.category || '',
                          supportedCollections: room.supportedCollections || [],
                          newRoomImage: null,
                          newMaskImage: null
                        });
                      }} 
                      disabled={isSaving}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0b9e7a] hover:bg-[#09866a] disabled:bg-opacity-70 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <a 
                      href={room.previewUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-all shadow-xs text-center"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
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
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}