// DeleteProductModal.jsx
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:8000';

export default function DeleteProductModal({ product, onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll layer when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  async function handleDelete() {
    setIsDeleting(true);
    setError('');
    
    try {
      // Changed endpoint from /rooms/ to /products/
      const res = await fetch(`${BASE_URL}/products/${product._id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error(`Delete failed with status: ${res.status}`);
      
      onSuccess();
    } catch (err) {
      console.error('Delete product error:', err);
      setError('Failed to delete product. Please check your connection.');
      setIsDeleting(false);
    }
  }

  // Changed 'room' to 'product'
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 flex flex-col gap-4">
        
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Delete Product</h2>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to permanently remove <strong className="text-gray-800">{product.name}</strong> from the system?
            </p>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? 'Removing...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}