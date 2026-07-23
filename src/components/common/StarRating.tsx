import React, { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  isDarkMode?: boolean;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, isDarkMode = true, readonly = false, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (readonly || !onChange || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let rating = (x / rect.width) * 10;
    rating = Math.max(0, Math.min(10, rating));
    // Round to nearest 0.1
    rating = Math.round(rating * 10) / 10;
    setHoverValue(rating);
    if (isDragging) {
      onChange(rating);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    handleMove(e.clientX);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (readonly || !onChange) return;
    setIsDragging(true);
    handleMove(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (readonly || !onChange) return;
    setIsDragging(false);
    if (hoverValue !== null) {
      onChange(hoverValue);
    }
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onPointerLeave = () => {
    if (!isDragging) {
      setHoverValue(null);
    }
  };
  
  // Also handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readonly || !onChange) return;
    let step = 0.5;
    if (e.shiftKey) step = 0.1;
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(10, value + step));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(0, value - step));
    }
  };

  const displayValue = hoverValue !== null ? hoverValue : (value || 0);
  const percentage = (displayValue / 10) * 100;
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };
  
  const iconSize = sizeClasses[size];

  return (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-3 w-full overflow-hidden">
      <div className="flex flex-col gap-2 shrink-0">
        <div 
          ref={containerRef}
          className={cn(
            "relative inline-flex", 
            !readonly && "cursor-pointer touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
          )}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          onKeyDown={handleKeyDown}
          tabIndex={readonly ? -1 : 0}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-label="Rating"
        >
          {/* Empty stars */}
          <div className="flex">
            {[...Array(10)].map((_, i) => (
              <Star key={`empty-${i}`} className={cn(iconSize, isDarkMode ? "text-white/20" : "text-neutral-300")} />
            ))}
          </div>
          
          {/* Filled stars wrapper */}
          <div 
            className="absolute top-0 left-0 h-full overflow-hidden flex pointer-events-none"
            style={{ width: `${percentage}%` }}
          >
            <div className="flex">
              {[...Array(10)].map((_, i) => (
                <Star key={`filled-${i}`} className={cn(iconSize, "fill-[#3B82F6] text-[#3B82F6]")} />
              ))}
            </div>
          </div>
        </div>
        
        {!readonly && onChange && (
          <div className="flex items-center px-1">
             <input 
                type="range" 
                min="0" max="10" step="0.1" 
                value={value} 
                onChange={(e) => onChange(Number(e.target.value))}
                className={cn(
                  "w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#3B82F6]",
                  isDarkMode ? "bg-white/10" : "bg-neutral-200"
                )}
                aria-label="Rating slider"
                tabIndex={-1}
              />
          </div>
        )}
      </div>
      
      {/* Numeric display */}
      <div className={cn("font-mono font-medium text-sm flex-shrink-0 pt-1 sm:pt-0", isDarkMode ? "text-white/80" : "text-neutral-600")}>
        {displayValue.toFixed(1)} / 10
      </div>
    </div>
  );
}
