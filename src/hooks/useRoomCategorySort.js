// hooks/useCategorySort.js
import { useState } from 'react';

export function useCategorySort(rooms, setRooms, fetchRoomsData) {

  const [isUpdatingCat, setIsUpdatingCat] = useState(false);

  // Extract unique full category names (not 'All') from current rooms state
  const getUniqueCategories = () => {
    return Array.from(new Set(rooms.map(r => r.category).filter(Boolean)));
  };

  async function handleCategoryTierShift(categoryName, newOrderValue) {
    const targetIndex = parseInt(newOrderValue, 10);
    const uniqueCats = getUniqueCategories();
    
    const oldIndex = uniqueCats.indexOf(categoryName);
    if (oldIndex === -1 || targetIndex < 0 || targetIndex >= uniqueCats.length) return;

    // Shift category within array
    uniqueCats.splice(oldIndex, 1);
    uniqueCats.splice(targetIndex, 0, categoryName);

    // Optimistic state updates locally
    const reorderedRooms = rooms.map(room => ({
      ...room,
      categoryOrder: uniqueCats.indexOf(room.category)
    }));

    // ✅ 2. Safe Sorting: Array copy banakar sort kiya taaki React mutation glitch na ho
    const sortedRooms = [...reorderedRooms].sort((a, b) => {
      if (a.categoryOrder !== b.categoryOrder) {
        return a.categoryOrder - b.categoryOrder;
      }
      return (a.position || 0) - (b.position || 0);
    });

    setRooms(sortedRooms);
    setIsUpdatingCat(true);

    try {
      const response = await fetch('https://wonderfloor-dashboard.vercel.app/rooms/categories/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedCategories: uniqueCats }),
      });
      if (!response.ok) throw new Error('Failed to update category tree layout');
    } catch (error) {
      console.error("Category shift crash:", error);
      fetchRoomsData(); // Fallback on failure
    } finally {
      setIsUpdatingCat(false);
    }
  }

  // ✅ 3. Return fixed: Ab isUpdatingCat use hone ke liye ready hai, ESLint error chala jayega
  return { handleCategoryTierShift, getUniqueCategories, isUpdatingCat };
}
