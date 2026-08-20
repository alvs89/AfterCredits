import React from 'react';
import { LogOut, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
}

export function SignOutModal({ isOpen, onClose, onConfirm, isDarkMode }: SignOutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className={cn(
          "w-full max-w-sm rounded-xl p-6 shadow-2xl relative",
          isDarkMode ? "bg-[#16181D] text-white border border-white/10" : "bg-white text-neutral-900 border border-neutral-200"
        )}
      >
        <button 
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 p-1 rounded-md transition-colors",
            isDarkMode ? "text-white/50 hover:text-white hover:bg-white/10" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          )}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4 pt-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isDarkMode ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-600"
          )}>
            <LogOut className="w-6 h-6" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">Sign Out</h2>
            <p className={cn(
              "text-sm mb-6",
              isDarkMode ? "text-white/70" : "text-neutral-600"
            )}>
              Are you sure you want to sign out? You will need to sign in again to access your library.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className={cn(
                "flex-1 px-4 py-2 rounded-md font-medium transition-colors text-sm",
                isDarkMode ? "bg-white/5 hover:bg-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
              )}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2 rounded-md font-medium transition-colors text-sm bg-red-600 hover:bg-red-700 text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
