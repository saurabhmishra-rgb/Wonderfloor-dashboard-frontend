import { useState } from 'react';

const NODE_BACKEND_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'https://wonderfloor-dashboard.vercel.app';

export default function VisibilityToggle({ productId, initialVisible, onToggle }) {
  const [isVisible, setIsVisible] = useState(initialVisible ?? true);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation(); // prevent card click
    if (loading) return;
    
    const nextVisibility = !isVisible;
    setLoading(true);

    try {
      // 1. URL FIXED: Removed "/visibility" from the end
      // 2. PAYLOAD ADDED: Sending headers and JSON body
      const res = await fetch(`${NODE_BACKEND_URL}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible: nextVisibility }),
      });

      // 3. PARSING FIXED: Only update state if the response was successful 
      // (prevents the HTML/JSON parsing crash)
      if (res.ok) {
        setIsVisible(nextVisibility);
        onToggle?.(productId, nextVisibility);
      } else {
        throw new Error(`Server responded with status: ${res.status}`);
      }
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isVisible ? 'Visible in Visualizer — click to hide' : 'Hidden in Visualizer — click to show'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors duration-200 cursor-pointer focus:outline-none
        ${loading ? 'opacity-50 cursor-wait' : ''}
        ${isVisible
          ? 'bg-[#0b9e7a] border-[#0b9e7a]'
          : 'bg-gray-300 border-gray-300'
        }`}
    >
      <span
        className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform duration-200
          ${isVisible ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  );
}
