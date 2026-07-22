import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDarkMode: boolean;
  className?: string;
  allowAdd?: boolean;
  addLabel?: string;
  onAdd?: (newOption: string) => void;
}

export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  isDarkMode,
  className,
  allowAdd = false,
  addLabel = "Add",
  onAdd
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value) || { value, label: value };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Sort options alphabetically, keeping "Other" at the end if it exists.
  const sortedOptions = [...options].sort((a, b) => {
    if (a.value === 'all' || b.value === 'all') return a.value === 'all' ? -1 : 1;
    if (a.value === 'other' || a.label.toLowerCase() === 'other') return 1;
    if (b.value === 'other' || b.label.toLowerCase() === 'other') return -1;
    return a.label.localeCompare(b.label);
  });

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, isOpen]);

  useEffect(() => {
    if (focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);
  
  const filteredOptions = sortedOptions.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleAdd = () => {
    if (onAdd && searchQuery.trim()) {
      onAdd(searchQuery.trim());
      onChange(searchQuery.trim());
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-2 rounded border focus:outline-none text-sm transition-colors flex items-center justify-between",
          isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-neutral-200 text-neutral-900",
          isOpen && (isDarkMode ? "border-[#3B82F6]/50" : "border-[#3B82F6]")
        )}
      >
        <span className="truncate">{selectedOption.label || placeholder}</span>
        <ChevronDown className="w-4 h-4 opacity-70 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute z-50 w-full mt-1 rounded-md border shadow-lg overflow-hidden",
          isDarkMode ? "bg-[#1A1D24] border-white/10" : "bg-white border-neutral-200"
        )}>
          <div className="p-2 border-b flex items-center gap-2" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <Search className="w-4 h-4 opacity-70 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className={cn("bg-transparent border-none focus:outline-none text-sm w-full", isDarkMode ? "text-white" : "text-neutral-900")}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[focusedIndex].value);
                  } else if (focusedIndex === filteredOptions.length && allowAdd) {
                    handleAdd();
                  } else if (filteredOptions.length > 0 && focusedIndex === -1) {
                    handleSelect(filteredOptions[0].value);
                  } else if (allowAdd && onAdd) {
                    handleAdd();
                  }
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setFocusedIndex(prev => Math.min(prev + 1, allowAdd && searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase()) ? filteredOptions.length : filteredOptions.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setFocusedIndex(prev => Math.max(prev - 1, 0));
                }
              }}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  ref={el => optionsRef.current[index] = el}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between transition-colors",
                    isDarkMode ? "text-white" : "text-neutral-900",
                    focusedIndex === index 
                      ? (isDarkMode ? "bg-white/10" : "bg-neutral-100") 
                      : (isDarkMode ? "hover:bg-white/10" : "hover:bg-neutral-100")
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check className="w-4 h-4 shrink-0 text-[#3B82F6]" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-center opacity-70">
                No results found.
              </div>
            )}
            
            {allowAdd && searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase()) && (
              <button
                type="button"
                onMouseEnter={() => setFocusedIndex(filteredOptions.length)}
                onClick={handleAdd}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 mt-1 border-t transition-colors",
                  isDarkMode ? "text-white border-white/10" : "text-[#3B82F6] border-neutral-100",
                  focusedIndex === filteredOptions.length
                    ? (isDarkMode ? "bg-white/10" : "bg-neutral-100")
                    : (isDarkMode ? "hover:bg-white/10" : "hover:bg-neutral-100")
                )}
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">{addLabel} "{searchQuery.trim()}"</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
