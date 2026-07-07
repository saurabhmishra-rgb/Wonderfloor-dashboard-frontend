// components/PositionInput.jsx


export default function PositionInput({ roomId, currentIndex, totalItems, onPositionChange }) {
  // Total items ke hisab se [1, 2, 3...] ki array banayenge
  const positionOptions = Array.from({ length: totalItems }, (_, i) => i + 1);

  return (
    <div 
      className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-slate-200 px-2 py-1 rounded-lg shadow-sm"
      onClick={(e) => e.stopPropagation()} // Modal open hone se rokne ke liye
    >
      <span className="text-[10px] font-bold text-gray-400 uppercase select-none">Pos:</span>
      <select
        value={currentIndex + 1}
        onChange={(e) => onPositionChange(roomId, e.target.value)}
        className="bg-slate-100 border border-slate-300 rounded text-xs font-bold py-0.5 px-1 focus:outline-none focus:border-[#0b9e7a] text-slate-800 cursor-pointer text-center"
      >
        {positionOptions.map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );
}
