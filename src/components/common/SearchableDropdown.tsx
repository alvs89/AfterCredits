import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus, Edit2, Trash2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  isEditable?: boolean;
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
  onEdit?: (oldValue: string, newValue: string) => void;
  onDelete?: (value: string) => void;
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
  onAdd,
  onEdit,
  onDelete
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addNewValue, setAddNewValue] = useState("");
  const optionsRef = useRef<(HTMLButtonElement | HTMLDivElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || { value, label: value };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingValue(null);
        setIsAddingNew(false);
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

  useEffect(() => {
    if (editingValue && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingValue]);

  const filteredOptions = sortedOptions.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (val: string) => {
    if (editingValue || isAddingNew) return;
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
    setIsAddingNew(false);
  };

  const handleAdd = () => {
    if (onAdd && searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase())) {
      onAdd(searchQuery.trim());
      onChange(searchQuery.trim());
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const submitEdit = (oldVal: string) => {
    if (onEdit && editInputValue.trim() && editInputValue.trim() !== oldVal) {
      if (!options.some(o => o.label.toLowerCase() === editInputValue.trim().toLowerCase())) {
         onEdit(oldVal, editInputValue.trim());
      }
    }
    setEditingValue(null);
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
                if (editingValue || isAddingNew) return;
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[focusedIndex].value);
                  } else if (focusedIndex === filteredOptions.length && allowAdd) {
                    if (searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase())) {
                      handleAdd();
                    } else {
                      setIsAddingNew(true);
                      setAddNewValue(searchQuery);
                    }
                  } else if (filteredOptions.length > 0 && focusedIndex === -1) {
                    handleSelect(filteredOptions[0].value);
                  } else if (allowAdd && onAdd) {
                    if (searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase())) {
                      handleAdd();
                    } else {
                      setIsAddingNew(true);
                      setAddNewValue(searchQuery);
                    }
                  }
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setFocusedIndex(prev => Math.min(prev + 1, allowAdd ? filteredOptions.length : filteredOptions.length - 1));
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
                <div
                  key={opt.value}
                  ref={el => { optionsRef.current[index] = el as any; }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between transition-colors group",
                    isDarkMode ? "text-white" : "text-neutral-900",
                    focusedIndex === index 
                      ? (isDarkMode ? "bg-white/10" : "bg-neutral-100") 
                      : (isDarkMode ? "hover:bg-white/10" : "hover:bg-neutral-100")
                  )}
                >
                  {editingValue === opt.value ? (
                     <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                       <input 
                         ref={inputRef}
                         type="text"
                         value={editInputValue}
                         onChange={e => setEditInputValue(e.target.value)}
                         onKeyDown={e => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             submitEdit(opt.value);
                           } else if (e.key === 'Escape') {
                             setEditingValue(null);
                           }
                         }}
                         className={cn("flex-1 bg-transparent border-b focus:outline-none text-sm px-1 py-0.5", isDarkMode ? "border-[#3B82F6]" : "border-[#3B82F6]")}
                       />
                       <button onClick={() => submitEdit(opt.value)} className="p-1 hover:bg-[#3B82F6]/20 rounded text-[#3B82F6]">
                         <Check className="w-3.5 h-3.5" />
                       </button>
                       <button onClick={() => setEditingValue(null)} className="p-1 hover:bg-red-500/20 rounded text-red-500">
                         <X className="w-3.5 h-3.5" />
                       </button>
                     </div>
                  ) : (
                    <>
                      <button 
                        type="button" 
                        onClick={() => handleSelect(opt.value)} 
                        className="flex-1 text-left flex items-center gap-2 truncate"
                      >
                        <span className="truncate">{opt.label}</span>
                        
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        {value === opt.value && !opt.isEditable && <Check className="w-4 h-4 shrink-0 text-[#3B82F6]" />}
                        {opt.isEditable && (
                          <div className={cn("flex items-center opacity-0 group-hover:opacity-100 transition-opacity", focusedIndex === index && "opacity-100")}>
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingValue(opt.value);
                                setEditInputValue(opt.label);
                              }}
                              className={cn("p-1 rounded transition-colors", isDarkMode ? "hover:bg-white/20 text-white/70 hover:text-white" : "hover:bg-neutral-300 text-neutral-500 hover:text-neutral-900")}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {onDelete && (
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(opt.value);
                                }}
                                className="p-1 rounded transition-colors hover:bg-red-500/20 text-red-500/70 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                        {value === opt.value && opt.isEditable && <Check className="w-4 h-4 shrink-0 text-[#3B82F6] ml-1" />}
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-center opacity-70">
                No results found.
              </div>
            )}
            
            {allowAdd && (
              isAddingNew ? (
                <div className="flex items-center gap-2 w-full px-3 py-2 mt-1 border-t transition-colors" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={addNewValue}
                    onChange={e => setAddNewValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (addNewValue.trim() && !options.some(o => o.label.toLowerCase() === addNewValue.trim().toLowerCase())) {
                          onAdd?.(addNewValue.trim());
                          onChange(addNewValue.trim());
                          setIsOpen(false);
                          setIsAddingNew(false);
                          setAddNewValue("");
                          setSearchQuery("");
                        }
                      } else if (e.key === 'Escape') {
                        setIsAddingNew(false);
                        setAddNewValue("");
                      }
                    }}
                    placeholder={addLabel.replace('Add ', '')}
                    className={cn("flex-1 bg-transparent border-b focus:outline-none text-sm px-1 py-0.5", isDarkMode ? "border-[#3B82F6] text-white" : "border-[#3B82F6] text-neutral-900")}
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      if (addNewValue.trim() && !options.some(o => o.label.toLowerCase() === addNewValue.trim().toLowerCase())) {
                        onAdd?.(addNewValue.trim());
                        onChange(addNewValue.trim());
                        setIsOpen(false);
                        setIsAddingNew(false);
                        setAddNewValue("");
                        setSearchQuery("");
                      }
                    }} 
                    className="p-1 hover:bg-[#3B82F6]/20 rounded text-[#3B82F6]"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { setIsAddingNew(false); setAddNewValue(""); }} className="p-1 hover:bg-red-500/20 rounded text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onMouseEnter={() => setFocusedIndex(filteredOptions.length)}
                  onClick={() => {
                    if (searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase())) {
                      handleAdd();
                    } else {
                      setIsAddingNew(true);
                      setAddNewValue(searchQuery);
                    }
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 mt-1 border-t transition-colors",
                    isDarkMode ? "text-white border-white/10" : "text-[#3B82F6] border-neutral-100",
                    focusedIndex === filteredOptions.length
                      ? (isDarkMode ? "bg-white/10" : "bg-neutral-100")
                      : (isDarkMode ? "hover:bg-white/10" : "hover:bg-neutral-100")
                  )}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase()) 
                      ? `${addLabel} "${searchQuery.trim()}"` 
                      : addLabel}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
