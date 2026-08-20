import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  isDarkMode: boolean;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isDarkMode, confirmLabel = 'Delete', tone = 'danger', isLoading = false }: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={isLoading ? undefined : onClose}>
      <div 
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
        className={cn(
          "w-full max-w-sm rounded-xl border shadow-xl p-6 relative",
          isDarkMode ? "bg-[#1A1D24] border-white/10" : "bg-white border-neutral-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close confirmation"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-500/20 transition-colors"
        >
          <X className={cn("w-5 h-5", isDarkMode ? "text-neutral-400" : "text-neutral-500")} />
        </button>

        <h2 id="confirmation-title" className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-neutral-900")}>
          {title}
        </h2>
        
        <p id="confirmation-message" className={cn("mb-6", isDarkMode ? "text-neutral-300" : "text-neutral-600")}>
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              isDarkMode ? "bg-white/5 hover:bg-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:cursor-wait disabled:opacity-60",
              tone === 'primary' ? "bg-[#3B82F6] hover:bg-[#2563EB]" : "bg-red-500 hover:bg-red-600"
            )}
          >
            {isLoading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
