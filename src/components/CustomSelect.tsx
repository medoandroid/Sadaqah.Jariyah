import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps<T = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxMenuHeight?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomSelect<T = string | number>({
  value,
  onChange,
  options,
  placeholder = 'اختر من القائمة...',
  label,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  searchable,
  searchPlaceholder = 'ابحث في القائمة...',
  maxMenuHeight = 'max-h-60',
  size = 'md',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Automatically enable search if there are more than 8 options
  const isSearchEnabled = searchable !== undefined ? searchable : options.length > 8;

  // Selected Option
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  // Filtered Options
  const filteredOptions = useMemo(() => {
    if (!isSearchEnabled || !searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  }, [options, searchQuery, isSearchEnabled]);

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation & ESC handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Determine direction to open (upward or downward) to prevent clipping
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const requiredSpace = 240; // Approximate menu height

      if (spaceBelow < requiredSpace && rect.top > requiredSpace) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }

      if (isSearchEnabled && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
  }, [isOpen, isSearchEnabled]);

  // Sizes mapping
  const sizeStyles = {
    sm: 'py-1.5 px-2.5 text-xs rounded-xl min-h-[34px]',
    md: 'py-2 px-3 text-xs sm:text-sm rounded-xl min-h-[40px]',
    lg: 'py-2.5 px-3.5 text-sm rounded-2xl min-h-[46px]',
  }[size];

  return (
    <div className={`relative text-right ${className}`} ref={containerRef} dir="rtl">
      {label && (
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearchQuery('');
          }
        }}
        className={`w-full flex items-center justify-between gap-2.5 bg-white dark:bg-stone-850 border transition-all cursor-pointer select-none text-right ${sizeStyles} ${
          isOpen
            ? 'border-amber-600 dark:border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
            : 'border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-stone-600 shadow-2xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-100 dark:bg-stone-900' : ''} ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="shrink-0 text-amber-700 dark:text-amber-400">{selectedOption.icon}</span>
          )}

          <div className="min-w-0 flex-1 truncate">
            {selectedOption ? (
              <span className="font-bold text-stone-900 dark:text-stone-100 truncate block">
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-stone-400 font-normal">{placeholder}</span>
            )}
          </div>

          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-[10px] font-bold shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-amber-600 dark:text-amber-400' : ''
          }`}
        />
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-amber-300/80 dark:border-stone-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${menuClassName}`}
          role="listbox"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Optional Search Bar */}
          {isSearchEnabled && (
            <div className="p-2 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pr-8 pl-7 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-500 font-medium"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div
            className={`${maxMenuHeight} overflow-y-auto p-1.5 space-y-1 overscroll-contain`}
            style={{ scrollbarGutter: 'stable' }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      if (!option.disabled) {
                        onChange(option.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100/80 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-amber-50/70 dark:hover:bg-stone-800 hover:text-amber-900 dark:hover:text-amber-300'
                    } ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {option.icon && (
                        <span className="shrink-0 text-amber-700 dark:text-amber-400">{option.icon}</span>
                      )}

                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm block truncate">{option.label}</span>
                        {option.sublabel && (
                          <span className="text-[11px] text-stone-400 block truncate">{option.sublabel}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {option.badge && (
                        <span className="px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-bold">
                          {option.badge}
                        </span>
                      )}

                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-stone-400">
                لا توجد نتائج مطابقة لـ "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
