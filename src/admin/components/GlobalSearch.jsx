// GlobalSearch.jsx
import { useSearch } from './SearchContext';

export default function GlobalSearch() {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <div className="relative w-full max-w-xs md:max-w-sm">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search names, categories ..."
        className="w-full pl-9 pr-8 py-1.5 text-xs md:text-[13px] text-gray-800 bg-white border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0b9e7a] focus:ring-2 focus:ring-[#0b9e7a]/10 transition-all duration-150 placeholder-gray-400/80 shadow-sm"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
