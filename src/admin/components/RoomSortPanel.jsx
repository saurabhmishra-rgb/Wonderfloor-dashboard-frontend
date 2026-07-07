import { useState } from 'react';

export default function RoomSortPanel({ rooms, onSave, onClose }) {
  const [orderedList, setOrderedList] = useState(rooms);
  const [saving, setSaving] = useState(false);

  function moveItem(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= orderedList.length) return;
    const updated = Array.from(orderedList);
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setOrderedList(updated);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(orderedList.map((r) => r._id));
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-[#e8e8e8] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">
            Arrange Selected ({orderedList.length})
          </h2>
          <button onClick={onClose} className="text-[#aaaaaa] hover:text-[#333] cursor-pointer">✕</button>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          {orderedList.map((room, index) => (
            <div key={room._id} className="flex items-center gap-3 bg-[#f8f8f8] border border-[#eee] rounded-lg p-2">
              <span className="text-xs font-bold text-[#0b9e7a] w-5 text-center">{index + 1}</span>
              <img src={room.previewUrl} alt={room.name} className="w-10 h-10 rounded-md object-cover shrink-0" />
              <span className="text-xs font-medium text-gray-700 truncate flex-1">{room.name}</span>
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => moveItem(index, -1)} disabled={index === 0}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#ddd] disabled:opacity-30 cursor-pointer hover:border-[#0b9e7a]">▲</button>
                <button onClick={() => moveItem(index, 1)} disabled={index === orderedList.length - 1}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#ddd] disabled:opacity-30 cursor-pointer hover:border-[#0b9e7a]">▼</button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3.5 border-t border-[#e8e8e8] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-[#666] bg-[#f5f5f5] hover:bg-[#eee] cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#0b9e7a] hover:bg-[#09866a] disabled:opacity-50 cursor-pointer">
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
