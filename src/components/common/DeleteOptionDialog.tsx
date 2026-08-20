import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DropdownOption } from './SearchableDropdown';

interface DeleteOptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (replacementValue?: string) => void;
  optionName: string;
  usageCount: number;
  availableOptions: DropdownOption[];
  isDarkMode: boolean;
}

export function DeleteOptionDialog({
  isOpen,
  onClose,
  onConfirm,
  optionName,
  usageCount,
  availableOptions,
  isDarkMode
}: DeleteOptionDialogProps) {
  const [replacementValue, setReplacementValue] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setReplacementValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validOptions = availableOptions.filter(o => o.value !== optionName);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-md rounded-2xl p-6 shadow-2xl relative border",
        isDarkMode ? "bg-[#14161C] border-white/10 text-white" : "bg-white border-neutral-200 text-neutral-900"
      )}>
        <button 
          onClick={onClose}
          className={cn("absolute top-6 right-6 p-2 rounded transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200")}
        >
          <X className="w-4 h-4 text-white/70" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold">Delete "{optionName}"?</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm opacity-80">
            Are you sure you want to delete this custom option?
          </p>

          {usageCount > 0 && (
            <div className={cn("p-4 rounded-lg border", isDarkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200")}>
              <p className="text-sm font-semibold mb-2">
                This option is currently used in {usageCount} entr{usageCount === 1 ? 'y' : 'ies'}.
              </p>
              <p className="text-xs mb-3 opacity-80">
                Please select a replacement to avoid orphaned records:
              </p>
              <select 
                value={replacementValue}
                onChange={e => setReplacementValue(e.target.value)}
                className={cn("w-full px-3 py-2 rounded border focus:outline-none text-sm", isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-[#3B82F6]/50" : "bg-white border-neutral-300 focus:border-[#3B82F6]")}
              >
                <option value="" disabled>Select a replacement...</option>
                {validOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)' }}>
          <button 
            onClick={onClose}
            className={cn("px-6 py-2 rounded font-semibold text-xs transition-colors", isDarkMode ? "text-white/70 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100")}
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(usageCount > 0 ? replacementValue : undefined)}
            disabled={usageCount > 0 && !replacementValue}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded font-semibold transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Option
          </button>
        </div>
      </div>
    </div>
  );
}
