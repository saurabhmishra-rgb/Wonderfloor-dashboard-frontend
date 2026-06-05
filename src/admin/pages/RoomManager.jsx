import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UploadRoomModal from '../components/UploadRoomModal';

// ── Icons (same as Overview) ──
const Icon = {
  grid:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  photo:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  stack:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  users:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  settings:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  upload:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
};

// ── Nav items (same as Overview) ──
const navItems = [
  { label: 'Overview',      icon: 'grid',     key: 'overview', path: '/admin',          group: null },
  { label: 'Room images',   icon: 'photo',    key: 'rooms',    path: '/admin/rooms',    group: 'MANAGE' },
  { label: 'Tile products', icon: 'stack',    key: 'products', path: '/admin/products', group: null },
  { label: 'Admin users',   icon: 'users',    key: 'users',    path: '/admin/sidebar',  group: 'SETTINGS' },
  { label: 'Settings',      icon: 'settings', key: 'settings', path: '/admin/settings', group: null },
];

const categories = ['All', 'School', 'Office', 'Sports', 'Residential', 'Hospital', 'Industrial'];

export default function RoomManager() {
  const [activeTab, setActiveTab] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const activePage = navItems.find(item => item.path === location.pathname)?.key || 'rooms';

  async function fetchRoomsData() {
    setLoading(true);
    try {
      const response = await fetch('https://wonderfloor-dashboard.vercel.app/rooms');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRoomsData(); }, []);

  const filteredRooms = activeTab === 'All'
    ? rooms
    : rooms.filter(room => room.category && room.category.includes(activeTab));

  const getCount = (cat) =>
    cat === 'All' ? rooms.length : rooms.filter(r => r.category && r.category.includes(cat)).length;

  return (
    <div className="flex h-screen w-full font-sans bg-[#f4f4f5] text-[#111111] overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] shrink-0 bg-white border-r border-[#e8e8e8] flex flex-col">
        <div className="px-5 pt-5 pb-[18px] border-b border-[#e8e8e8]">
          <div className="text-[17px] font-semibold text-[#111111] tracking-tight">Wonderfloor</div>
          <div className="text-xs text-[#aaaaaa] mt-0.5">Admin panel</div>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map((item, i) => {
            const isActive = activePage === item.key;
            const showGroup = item.group && item.group !== navItems[i - 1]?.group;
            return (
              <div key={item.key}>
                {showGroup && (
                  <div className="text-[10px] font-semibold tracking-[0.08em] text-[#bbbbbb] px-5 pt-3.5 pb-1.5 uppercase">
                    {item.group}
                  </div>
                )}
                <button
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2.5 w-full px-5 py-[9px] border-l-2 text-[13px] text-left transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? 'bg-[#edf9f5] border-[#0b9e7a] text-[#0b9e7a] font-medium'
                      : 'bg-transparent border-transparent text-[#888888] font-normal hover:text-[#333333] hover:bg-[#f5f5f5]'
                  }`}
                >
                  <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'}`}>
                    {Icon[item.icon]}
                  </span>
                  {item.label}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="px-5 pt-3.5 pb-[18px] border-t border-[#e8e8e8]">
          <div className="text-[11px] text-[#aaaaaa]">Logged in as</div>
          <div className="text-[13px] font-medium text-[#333333] mt-0.5">Admin</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-[58px] border-b border-[#e8e8e8] flex items-center justify-between px-7 shrink-0 bg-white">
          <h1 className="text-base font-medium text-[#111111] m-0">Room images</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#0b9e7a] hover:bg-[#09866a] text-white px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium shadow-sm"
          >
            {Icon.upload} Upload new room
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-6 px-7">

          {/* Subtitle */}
          <p className="text-sm text-[#aaaaaa] mb-5">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} in library
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-7">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                  activeTab === category
                    ? 'bg-[#0b9e7a] text-white border border-[#0b9e7a] shadow-sm'
                    : 'bg-white border border-[#e0e0e0] text-[#666666] hover:border-[#aaaaaa] hover:text-[#111111]'
                }`}
              >
                {category}
                <span className={`ml-1.5 text-xs ${activeTab === category ? 'opacity-80' : 'text-[#aaaaaa]'}`}>
                  {getCount(category)}
                </span>
              </button>
            ))}
          </div>

          {/* Grid / States */}
          {loading ? (
            <div className="text-center py-24 text-[#aaaaaa] text-sm">
              <svg className="mx-auto mb-3 opacity-30 animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Loading rooms from database...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-24 text-[#aaaaaa] border-2 border-dashed border-[#e0e0e0] rounded-2xl bg-white">
              <svg className="mx-auto mb-3 opacity-30" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className="text-sm font-medium text-[#888888]">No rooms found</p>
              <p className="text-xs text-[#aaaaaa] mt-1">Click "Upload new room" to add one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredRooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="h-44 w-full overflow-hidden bg-[#f5f5f5] relative">
                    <img
                      src={room.previewUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {room.maskUrl && (
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold bg-white text-[#0b9e7a] border border-[#0b9e7a] px-2 py-0.5 rounded-full shadow-sm">
                        + mask
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-[14px] font-semibold text-[#111111] leading-tight truncate" title={room.name}>
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f0f0f0] text-[#666666]">
                        {room.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <UploadRoomModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { fetchRoomsData(); setIsModalOpen(false); }}
        />
      )}
    </div>
  );
}

// import { useState } from 'react';
// // 1. IMPORT THE MODAL COMPONENT
// import UploadRoomModal from '../components/UploadRoomModal'; 

// // ── MOCK DATA (Sirf UI dekhne ke liye) ──
// const initialRooms = [
//   { id: '1', name: 'School Option 1', category: 'School Flooring', hasMask: true, status: 'Live', color: 'bg-[#b8d2b2]' },
//   { id: '2', name: 'School Option 2', category: 'School Flooring', hasMask: true, status: 'Live', color: 'bg-[#b8cce4]' },
//   { id: '3', name: 'Office Option 1', category: 'Office Flooring', hasMask: false, status: 'Live', color: 'bg-[#e0cdb8]' },
//   { id: '4', name: 'Residential Option 5', category: 'Residential Flooring', hasMask: true, status: 'Live', color: 'bg-[#d0c6e0]' },
//   { id: '5', name: 'Sports Option 1', category: 'Sports Flooring', hasMask: false, status: 'Live', color: 'bg-[#c6dfc6]' },
//   { id: '6', name: 'Hospital Option 1', category: 'Hospital Flooring', hasMask: false, status: 'Live', color: 'bg-[#e0dcd3]' },
// ];

// const categories = ['All', 'School', 'Office', 'Sports', 'Residential', 'Hospital'];

// export default function RoomManager() {
//   const [activeTab, setActiveTab] = useState('All');
//   const [rooms] = useState(initialRooms);
  
//   // 2. ADD STATE TO CONTROL THE MODAL
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Filter logic based on tabs
//   const filteredRooms = activeTab === 'All' 
//     ? rooms 
//     : rooms.filter(room => room.category.includes(activeTab));

//   // Count logic for tabs
//   const getCount = (cat) => cat === 'All' ? rooms.length : rooms.filter(r => r.category.includes(cat)).length;

//   return (
//     <div className="min-h-screen bg-[#2b2b2b] text-gray-200 p-6 md:p-8 font-sans">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8 border-b border-[#3f3f3f] pb-4">
//         <h1 className="text-2xl font-semibold text-white">Room images</h1>
        
//         {/* 3. ADD onClick HANDLER TO OPEN MODAL */}
//         <button 
//           onClick={() => setIsModalOpen(true)}
//           className="flex items-center gap-2 bg-transparent border border-gray-500 hover:border-gray-300 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
//         >
//           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
//             <polyline points="17 8 12 3 7 8"></polyline>
//             <line x1="12" y1="3" x2="12" y2="15"></line>
//           </svg>
//           Upload new room
//         </button>
//       </div>

//       {/* Tabs */}
//       <div className="flex flex-wrap gap-3 mb-8">
//         {categories.map((category) => (
//           <button
//             key={category}
//             onClick={() => setActiveTab(category)}
//             className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
//               activeTab === category 
//                 ? 'bg-[#0f6b6b] text-white border border-[#0f6b6b]' 
//                 : 'bg-transparent border border-[#444] text-gray-300 hover:bg-[#333]'
//             }`}
//           >
//             {category} ({getCount(category)})
//           </button>
//         ))}
//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {filteredRooms.map((room) => (
//           <div key={room.id} className="bg-[#333333] border border-[#444] rounded-xl overflow-hidden flex flex-col">
//             {/* Mock Image Area (Using Colors for now) */}
//             <div className={`h-40 w-full ${room.color}`}></div>
            
//             <div className="p-4 flex flex-col flex-1">
//               <h3 className="text-lg font-bold text-white leading-tight">{room.name}</h3>
//               <div className="flex items-center gap-2 mt-1 mb-4">
//                 <span className="text-sm text-gray-400">{room.category}</span>
//                 {room.hasMask && (
//                   <span className="text-[10px] font-bold bg-[#e0f0e0] text-green-800 px-2 py-0.5 rounded-full">
//                     + mask
//                   </span>
//                 )}
//               </div>
              
//               <div className="mt-auto flex items-center justify-between">
//                 <div className="flex gap-2">
//                   <button className="p-2 border border-[#555] rounded hover:bg-[#444] text-gray-300 transition-colors cursor-pointer">
//                     Edit
//                   </button>
//                 </div>
//                 <span className="text-xs font-bold bg-[#e0f0e0] text-green-800 px-3 py-1 rounded-full border border-green-200">
//                   {room.status}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* 4. CONDITIONALLY RENDER THE MODAL AT THE BOTTOM */}
//       {isModalOpen && (
//         <UploadRoomModal 
//           onClose={() => setIsModalOpen(false)} 
//           onSuccess={() => {
//             console.log('Success! Later we will refresh the room grid here.');
//             setIsModalOpen(false); // Make sure to close the modal on success
//           }} 
//         />
//       )}
      
//     </div>
//   );
// }