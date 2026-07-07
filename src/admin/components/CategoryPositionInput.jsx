// components/CategoryPositionInput.jsx

export default function CategoryPositionInput({ catName, currentIndex, totalItems, onOrderChange }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-lg">
      <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">
        {catName.replace(' Flooring', '')}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase select-none">Tab Order:</span>
        <select
          value={currentIndex}
          onChange={(e) => onOrderChange(catName, e.target.value)}
          className="bg-white border border-slate-300 rounded text-xs font-bold py-0.5 px-1.5 text-slate-800 focus:border-[#0b9e7a] outline-none cursor-pointer"
        >
          {Array.from({ length: totalItems }, (_, idx) => (
            <option key={idx} value={idx}>
              {idx + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
