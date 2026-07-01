import { useState, useRef, useEffect } from 'react';

const Label = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{children}</p>
);

const inputCls =
  'w-full px-3 py-2 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-lg ' +
  'focus:outline-none focus:border-[#0b9e7a] focus:ring-2 focus:ring-[#0b9e7a]/10 ' +
  'placeholder-gray-300 transition-all duration-150';

export default function ToggleSelectField({
  label,
  value,
  onChange,
  options,
  onAddOption,
  onRemoveOption,
  onEditOption,
  selectPlaceholder = 'Select…',
  createPlaceholder,
  multiple = false, // 🌟 NEW PROP: Supports multi-select checkbox mode
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // State for "Create New" inline mode
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // State for editing the CURRENTLY APPLIED item directly
  const [isEditingApplied, setIsEditingApplied] = useState(false);
  const [inlineEditVal, setInlineEditVal] = useState('');

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🌟 FIX: Safely normalize incoming value into an array format for clean matching
  const selectedArray = multiple
    ? (Array.isArray(value) ? value : (value ? value.split(',').map(s => s.trim()).filter(Boolean) : []))
    : [];

  const handleToggle = () => {
    setIsCustom((prev) => !prev);
    setIsOpen(false);
    setIsEditingApplied(false);
  };

  // 🌟 FIX: Multi-select collection toggle handler
  const handleSelect = (val) => {
    if (multiple) {
      if (val === '') {
        onChange(Array.isArray(value) ? [] : '');
      } else {
        const updated = selectedArray.includes(val)
          ? selectedArray.filter(v => v !== val)
          : [...selectedArray, val];
        
        // Return type matches parent type context (array or comma string)
        onChange(Array.isArray(value) ? updated : updated.join(', '));
      }
    } else {
      onChange(val);
      setIsOpen(false);
    }
  };

  // --- Create New Handler ---
  const handleAddCustomInline = () => {
    const val = customValue.trim();
    if (val) {
      if (!options.includes(val)) onAddOption(val);
      
      if (multiple) {
        const updated = [...new Set([...selectedArray, val])];
        onChange(Array.isArray(value) ? updated : updated.join(', '));
      } else {
        onChange(val);
      }
      
      setIsCustom(false);
      setCustomValue('');
    }
  };

  // --- Edit Currently Applied Item Handlers ---
  const handleStartEditingApplied = (e) => {
    e.stopPropagation();
    setInlineEditVal(value);
    setIsEditingApplied(true);
    setIsOpen(false);
  };

  const handleSaveAppliedEdit = (e) => {
    e?.stopPropagation();
    const trimmed = inlineEditVal.trim();
    
    if (trimmed && trimmed !== value) {
      if (!options.includes(trimmed)) {
        onEditOption(value, trimmed);
      }
      onChange(trimmed);
    }
    setIsEditingApplied(false);
  };

  const handleCancelAppliedEdit = (e) => {
    e?.stopPropagation();
    setIsEditingApplied(false);
  };

  // Text string mapping label display
  const displayLabel = multiple
    ? (selectedArray.length > 0 ? selectedArray.join(', ') : '')
    : value;

  return (
    <div ref={dropdownRef} className="relative">
      <div className="flex justify-between items-center mb-1.5">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={handleToggle}
          className="text-xs text-[#0b9e7a] hover:text-[#098264] hover:underline font-semibold cursor-pointer transition-colors"
        >
          {isCustom ? 'Select Existing' : '+ Create New'}
        </button>
      </div>

      {isCustom ? (
        /* ── Create New Mode ── */
        <div className="flex gap-2">
          <input
            type="text"
            autoFocus
            placeholder={createPlaceholder || `Enter new ${label.toLowerCase()}…`}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomInline()}
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleAddCustomInline}
            className="px-4 bg-gray-100 hover:bg-[#0b9e7a] text-gray-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            Add
          </button>
        </div>
      ) : isEditingApplied ? (
        /* ── Edit Applied Item Mode ── */
        <div className="flex items-center gap-1.5 w-full">
          <input
            type="text"
            autoFocus
            value={inlineEditVal}
            onChange={(e) => setInlineEditVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveAppliedEdit(e);
              if (e.key === 'Escape') handleCancelAppliedEdit(e);
            }}
            className="flex-1 px-3 py-2 text-[13px] text-gray-800 bg-white border border-[#0b9e7a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b9e7a]/20 shadow-sm transition-all"
          />
          <button
            type="button"
            onClick={handleSaveAppliedEdit}
            className="p-2 bg-[#0b9e7a] text-white rounded-lg hover:bg-[#098264] transition-colors shadow-sm cursor-pointer"
            title="Save changes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleCancelAppliedEdit}
            className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            title="Cancel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        /* ── Standard Dropdown Mode ── */
        <div className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="group w-full bg-white border border-gray-200 rounded-lg pl-3 pr-2 py-2 text-[13px] focus-within:border-[#0b9e7a] transition-all flex justify-between items-center cursor-pointer select-none min-h-[38px]"
          >
            <span className={displayLabel ? 'text-gray-800 truncate pr-2' : 'text-gray-400'}>
              {displayLabel || selectPlaceholder}
            </span>
            
            <div className="flex items-center gap-1 text-gray-400 shrink-0">
              {/* 🌟 EDIT PENCIL ICON - Hidden on multi-select to avoid editing joined option chains directly */}
              {value && !multiple && (
                <button
                  type="button"
                  onClick={handleStartEditingApplied}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#0b9e7a] hover:bg-[#0b9e7a]/10 rounded transition-all"
                  title="Edit current selection"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              )}
              {/* Dropdown Chevron */}
              <div className="p-1">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Dropdown List */}
          {isOpen && (
            <ul className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1">
              <li
                onClick={() => handleSelect('')}
                className="px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-50 cursor-pointer italic"
              >
                Clear selection...
              </li>
              {options.map((opt) => {
                const isChecked = multiple ? selectedArray.includes(opt) : value === opt;
                return (
                  <li
                    key={opt}
                    className="group px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 flex justify-between items-center cursor-pointer min-h-[36px]"
                    onClick={() => handleSelect(opt)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* 🌟 CUSTOM CHECKBOX DESIGN */}
                      {multiple && (
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 transition-all ${isChecked ? 'bg-[#0b9e7a] border-[#0b9e7a]' : 'bg-white border-gray-300'}`}>
                          {isChecked && (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      )}
                      <span className="truncate flex-1">{opt}</span>
                    </div>
                    
                    {/* Remove Option Icon inside dropdown */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveOption(opt);
                        if (multiple) {
                          const safeFiltered = selectedArray.filter(i => i !== opt);
                          onChange(Array.isArray(value) ? safeFiltered : safeFiltered.join(', '));
                        } else if (value === opt) {
                          onChange('');
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-200/60 opacity-0 group-hover:opacity-100 transition-all ml-2 shrink-0"
                      title={`Delete ${opt}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

