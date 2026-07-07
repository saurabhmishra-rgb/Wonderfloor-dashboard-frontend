// hooks/useRoomSort.js
import { useState } from 'react';

export function useRoomSort(rooms, setRooms, filteredRooms, fetchRoomsData) {
  const [isSorting, setIsSorting] = useState(false);

  async function handleManualPositionChange(roomId, newPositionValue) {
    const targetIndex = parseInt(newPositionValue, 10) - 1;
    if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= filteredRooms.length) return;

    const currentFilteredList = Array.from(filteredRooms);
    const targetItemIdx = currentFilteredList.findIndex(r => r._id === roomId);
    if (targetItemIdx === -1 || targetItemIdx === targetIndex) return;

    // 1. Array se item ko nikal kar naye index par insert karein (Splice auto-shift karta hai)
    const [movedItem] = currentFilteredList.splice(targetItemIdx, 1);
    currentFilteredList.splice(targetIndex, 0, movedItem);

    // 2. Global master array (`rooms`) mein un sabhi items ke updated indices reflect karein
    const updatedRooms = rooms.map(room => {
      const newIdx = currentFilteredList.findIndex(i => i._id === room._id);
      return newIdx !== -1 ? { ...room, position: newIdx } : room;
    });

    // 3. UI ko completely fresh sequential sort order ke sath refresh karein
    setRooms(updatedRooms.sort((a, b) => a.position - b.position));
    setIsSorting(true);

    // 4. Backend database sync hit karein
    try {
      const response = await fetch('https://wonderfloor-dashboard.vercel.app/rooms/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: currentFilteredList.map(i => i._id) }),
      });
      if (!response.ok) throw new Error('Failed to save sequence');
    } catch (error) {
      console.error("Sorting sync failed:", error);
      fetchRoomsData(); // Failure par safe rollback data state reset karein
    } finally {
      setIsSorting(false);
    }
  }

 // 🆕 NAYA FUNCTION: Sirf selected rooms ka order save karega,
  // baaki rooms apni original relative position par rahenge
  async function handleSaveSelectedOrder(reorderedSelectedIds) {
    const selectedSet = new Set(reorderedSelectedIds);
    const fullOrder = [];
    let pointer = 0;

    // filteredRooms ke current sequence mein jahan bhi selected room mila,
    // usko naye reordered sequence se replace karte jao
    filteredRooms.forEach((room) => {
      if (selectedSet.has(room._id)) {
        fullOrder.push(reorderedSelectedIds[pointer]);
        pointer++;
      } else {
        fullOrder.push(room._id);
      }
    });

    // Optimistic UI update
    const updatedRooms = rooms.map((room) => {
      const newIdx = fullOrder.indexOf(room._id);
      return newIdx !== -1 ? { ...room, position: newIdx } : room;
    });
    setRooms(updatedRooms.sort((a, b) => a.position - b.position));
    setIsSorting(true);

    try {
      const response = await fetch('https://wonderfloor-dashboard.vercel.app/rooms/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: fullOrder }),
      });
      if (!response.ok) throw new Error('Failed to save selected sequence');
    } catch (error) {
      console.error('Selected sort sync failed:', error);
      fetchRoomsData(); // rollback
    } finally {
      setIsSorting(false);
    }
  }

  return { handleManualPositionChange, handleSaveSelectedOrder, isSorting };
}
