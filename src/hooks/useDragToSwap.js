import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';

// ── Shared helper: swap two items in an array by value ──
function swapItems(arr, fromVal, toVal) {
  const next = [...arr];
  const fromIdx = next.indexOf(fromVal);
  const toIdx = next.indexOf(toVal);
  if (fromIdx === -1 || toIdx === -1) return arr;
  [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
  return next;
}

// ── Persistent order initializer ──
function loadOrder(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

export function useDragToSwap() {

  // ── Collection drag state ──
  const [draggedCollection, setDraggedCollection] = useState(null);
  const [dragOverCollection, setDragOverCollection] = useState(null);
  const [collectionOrder, setCollectionOrder] = useState(
    () => loadOrder('pm_collectionOrder')
  );

  // ── Product drag state ──
  const [draggedProductId, setDraggedProductId] = useState(null);
  const [dragOverProductId, setDragOverProductId] = useState(null);
  const [productOrder, setProductOrder] = useState(
    () => loadOrder('pm_productOrder')
  );

  // ── API Synchronizer: Sends updated array to the database ──
  async function syncProductOrderWithBackend(updatedIdsArray) {
    try {
      await fetch(`${BASE_URL}/products/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: updatedIdsArray }),
      });
    } catch (err) {
      console.error('Failed to sync layout order with backend server:', err);
    }
  }

  // ─────────────────────────────────────────────
  // COLLECTION HELPERS
  // ─────────────────────────────────────────────

  function getOrderedCollections(uniqueCollections) {
    return [
      ...collectionOrder.filter(c => uniqueCollections.includes(c)),
      ...uniqueCollections.filter(c => !collectionOrder.includes(c)),
    ];
  }

  const collectionDragHandlers = (col) => ({
    draggable: true,
    onDragStart: (e) => {
      setDraggedCollection(col);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragOver: (e) => {
      e.preventDefault();
      if (col !== draggedCollection) setDragOverCollection(col);
    },
   onDrop: (e, currentOrderedCollections) => {
      e.preventDefault();
      if (!draggedCollection || draggedCollection === col) return;

      setCollectionOrder(prev => {
        const base = prev.length > 0 ? [...prev] : [...currentOrderedCollections];
        currentOrderedCollections.forEach(c => {
          if (!base.includes(c)) base.push(c);
        });
        const next = swapItems(base, draggedCollection, col);
        localStorage.setItem('pm_collectionOrder', JSON.stringify(next));
        
        // 👇 ADD THIS FETCH CALL HERE TO SYNC WITH BACKEND 👇
        fetch(`${BASE_URL}/products/collections/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedCollections: next }),
        }).catch(err => console.error("Failed to sync collection order:", err));
        
        return next;
      });

      setDraggedCollection(null);
      setDragOverCollection(null);
    },
    onDragEnd: () => {
      setDraggedCollection(null);
      setDragOverCollection(null);
    },
  });

  function getCollectionDragClass(col) {
    const isDragging = draggedCollection === col;
    const isDraggingOver = dragOverCollection === col;
    return [
      'cursor-grab active:cursor-grabbing',
      isDragging
        ? 'opacity-40 scale-95 border-dashed border-[#0b9e7a]'
        : 'hover:shadow-md hover:-translate-y-0.5 border-[#e8e8e8]',
      isDraggingOver
        ? 'ring-2 ring-[#0b9e7a] ring-offset-2 scale-105 border-[#0b9e7a]'
        : '',
    ].join(' ');
  }

  // ─────────────────────────────────────────────
  // PRODUCT HELPERS
  // ─────────────────────────────────────────────

  function getOrderedProducts(filteredProducts) {
    if (productOrder.length === 0) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      const ai = productOrder.indexOf(a._id);
      const bi = productOrder.indexOf(b._id);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }

  const productDragHandlers = (id) => ({
    draggable: true,
    onDragStart: (e) => {
      setDraggedProductId(id);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragOver: (e) => {
      e.preventDefault();
      if (id !== draggedProductId) setDragOverProductId(id);
    },
    onDrop: (e, currentOrderedProducts) => {
      e.preventDefault();
      if (!draggedProductId || draggedProductId === id) return;

      setProductOrder(prev => {
        const base = prev.length > 0 ? [...prev] : currentOrderedProducts.map(p => p._id);
        currentOrderedProducts.forEach(p => {
          if (!base.includes(p._id)) base.push(p._id);
        });
        const next = swapItems(base, draggedProductId, id);
        localStorage.setItem('pm_productOrder', JSON.stringify(next));
        
        // 🔄 Sync the execution sequence array to the MongoDB server right away!
        syncProductOrderWithBackend(next);
        
        return next;
      });

      setDraggedProductId(null);
      setDragOverProductId(null);
    },
    onDragEnd: () => {
      setDraggedProductId(null);
      setDragOverProductId(null);
    },
  });

  function getProductDragClass(id, isRow = false) {
    const isDragging = draggedProductId === id;
    const isDraggingOver = dragOverProductId === id;
    return [
      'cursor-grab active:cursor-grabbing',
      isDragging
        ? isRow ? 'opacity-40 bg-[#f0fdf9]' : 'opacity-40 scale-95 border-dashed border-[#0b9e7a]'
        : isRow ? 'hover:bg-[#fafafa]' : 'hover:shadow-md border-[#e8e8e8]',
      isDraggingOver
        ? isRow ? 'bg-[#edf9f5] outline outline-2 outline-[#0b9e7a]' : 'ring-2 ring-[#0b9e7a] ring-offset-2 scale-105'
        : '',
    ].join(' ');
  }

  function resetCollectionOrder() {
    localStorage.removeItem('pm_collectionOrder');
    setCollectionOrder([]);
  }
  function resetProductOrder() {
    localStorage.removeItem('pm_productOrder');
    setProductOrder([]);
  }

  return {
    getOrderedCollections,
    collectionDragHandlers,
    getCollectionDragClass,
    resetCollectionOrder,
    getOrderedProducts,
    productDragHandlers,
    getProductDragClass,
    resetProductOrder,
  };
}









// import { useState } from 'react';

// const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:8000';

// // ── Shared helper: swap two items in an array by value ──
// function swapItems(arr, fromVal, toVal) {
//   const next = [...arr];
//   const fromIdx = next.indexOf(fromVal);
//   const toIdx = next.indexOf(toVal);
//   if (fromIdx === -1 || toIdx === -1) return arr;
//   [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
//   return next;
// }

// // ── Persistent order initializer ──
// // ✅ FIX: Always verify parsed value is an array — guards against
// //    objects being written to the same localStorage key by other code.
// function loadOrder(key) {
//   try {
//     const parsed = JSON.parse(localStorage.getItem(key));
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// }

// export function useDragToSwap() {

//   // ── Collection drag state ──
//   const [draggedCollection, setDraggedCollection] = useState(null);
//   const [dragOverCollection, setDragOverCollection] = useState(null);
//   const [collectionOrder, setCollectionOrder] = useState(
//     () => loadOrder('pm_collectionOrder')
//   );

//   // ── Product drag state ──
//   const [draggedProductId, setDraggedProductId] = useState(null);
//   const [dragOverProductId, setDragOverProductId] = useState(null);
//   const [productOrder, setProductOrder] = useState(
//     () => loadOrder('pm_productOrder')
//   );

//   // ── API Synchronizer: Sends updated array to the database ──
//   async function syncProductOrderWithBackend(updatedIdsArray) {
//     try {
//       await fetch(`${BASE_URL}/products/reorder`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ orderedIds: updatedIdsArray }),
//       });
//     } catch (err) {
//       console.error('Failed to sync layout order with backend server:', err);
//     }
//   }

//   // ─────────────────────────────────────────────
//   // COLLECTION HELPERS
//   // ─────────────────────────────────────────────

//   function getOrderedCollections(uniqueCollections) {
//     return [
//       ...collectionOrder.filter(c => uniqueCollections.includes(c)),
//       ...uniqueCollections.filter(c => !collectionOrder.includes(c)),
//     ];
//   }

//   const collectionDragHandlers = (col) => ({
//     draggable: true,
//     onDragStart: (e) => {
//       setDraggedCollection(col);
//       e.dataTransfer.effectAllowed = 'move';
//     },
//     onDragOver: (e) => {
//       e.preventDefault();
//       if (col !== draggedCollection) setDragOverCollection(col);
//     },
//     onDrop: (e, currentOrderedCollections) => {
//       e.preventDefault();
//       if (!draggedCollection || draggedCollection === col) return;

//       setCollectionOrder(prev => {
//         const base = prev.length > 0 ? [...prev] : [...currentOrderedCollections];
//         currentOrderedCollections.forEach(c => {
//           if (!base.includes(c)) base.push(c);
//         });
//         const next = swapItems(base, draggedCollection, col);
//         localStorage.setItem('pm_collectionOrder', JSON.stringify(next));

//         fetch(`${BASE_URL}/products/collections/reorder`, {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ orderedCollections: next }),
//         }).catch(err => console.error('Failed to sync collection order:', err));

//         return next;
//       });

//       setDraggedCollection(null);
//       setDragOverCollection(null);
//     },
//     onDragEnd: () => {
//       setDraggedCollection(null);
//       setDragOverCollection(null);
//     },
//   });

//   function getCollectionDragClass(col) {
//     const isDragging = draggedCollection === col;
//     const isDraggingOver = dragOverCollection === col;
//     return [
//       'cursor-grab active:cursor-grabbing',
//       isDragging
//         ? 'opacity-40 scale-95 border-dashed border-[#0b9e7a]'
//         : 'hover:shadow-md hover:-translate-y-0.5 border-[#e8e8e8]',
//       isDraggingOver
//         ? 'ring-2 ring-[#0b9e7a] ring-offset-2 scale-105 border-[#0b9e7a]'
//         : '',
//     ].join(' ');
//   }

//   // ─────────────────────────────────────────────
//   // PRODUCT HELPERS
//   // ─────────────────────────────────────────────

// function getOrderedProducts(filteredProducts) {
//   // 1. Check if ANY product in the list has an assigned database order
//   const hasDbOrder = filteredProducts.some(p => p.productOrder !== undefined && p.productOrder !== 99999);

//   // 2. If DB order exists, ignore localStorage and sort by DB order
//   if (hasDbOrder) {
//     return [...filteredProducts].sort((a, b) => {
//       const oA = a.productOrder || 99999;
//       const oB = b.productOrder || 99999;
//       return oA - oB;
//     });
//   }

//   // 3. Only if no DB order exists, use the Drag-and-Drop localStorage order
//   if (productOrder.length === 0) return filteredProducts;
  
//   return [...filteredProducts].sort((a, b) => {
//     const ai = productOrder.indexOf(a._id);
//     const bi = productOrder.indexOf(b._id);
//     if (ai === -1) return 1;
//     if (bi === -1) return -1;
//     return ai - bi;
//   });
// }

//   const productDragHandlers = (id) => ({
//     draggable: true,
//     onDragStart: (e) => {
//       setDraggedProductId(id);
//       e.dataTransfer.effectAllowed = 'move';
//     },
//     onDragOver: (e) => {
//       e.preventDefault();
//       if (id !== draggedProductId) setDragOverProductId(id);
//     },
//     onDrop: (e, currentOrderedProducts) => {
//       e.preventDefault();
//       if (!draggedProductId || draggedProductId === id) return;

//       setProductOrder(prev => {
//         const base = prev.length > 0 ? [...prev] : currentOrderedProducts.map(p => p._id);
//         currentOrderedProducts.forEach(p => {
//           if (!base.includes(p._id)) base.push(p._id);
//         });
//         const next = swapItems(base, draggedProductId, id);
//         localStorage.setItem('pm_productOrder', JSON.stringify(next));

//         syncProductOrderWithBackend(next);

//         return next;
//       });

//       setDraggedProductId(null);
//       setDragOverProductId(null);
//     },
//     onDragEnd: () => {
//       setDraggedProductId(null);
//       setDragOverProductId(null);
//     },
//   });

//   function getProductDragClass(id, isRow = false) {
//     const isDragging = draggedProductId === id;
//     const isDraggingOver = dragOverProductId === id;
//     return [
//       'cursor-grab active:cursor-grabbing',
//       isDragging
//         ? isRow ? 'opacity-40 bg-[#f0fdf9]' : 'opacity-40 scale-95 border-dashed border-[#0b9e7a]'
//         : isRow ? 'hover:bg-[#fafafa]' : 'hover:shadow-md border-[#e8e8e8]',
//       isDraggingOver
//         ? isRow ? 'bg-[#edf9f5] outline outline-2 outline-[#0b9e7a]' : 'ring-2 ring-[#0b9e7a] ring-offset-2 scale-105'
//         : '',
//     ].join(' ');
//   }

//   function resetCollectionOrder() {
//     localStorage.removeItem('pm_collectionOrder');
//     setCollectionOrder([]);
//   }
//   function resetProductOrder() {
//     localStorage.removeItem('pm_productOrder');
//     setProductOrder([]);
//   }

//   return {
//     getOrderedCollections,
//     collectionDragHandlers,
//     getCollectionDragClass,
//     resetCollectionOrder,
//     getOrderedProducts,
//     productDragHandlers,
//     getProductDragClass,
//     resetProductOrder,
//   };
// }
