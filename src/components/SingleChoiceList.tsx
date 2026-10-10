import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';

export interface SingleChoiceOption<T = string | number> {
  id: T;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  metadata?: string;
  disabled?: boolean;
}

interface SingleChoiceListProps<T = string | number> {
  options: SingleChoiceOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  layout?: 'vertical' | 'grid-2' | 'grid-3' | 'horizontal-pills';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  className?: string;
}

export function SingleChoiceList<T extends string | number>({
  options,
  selectedId,
  onSelect,
  layout = 'vertical',
  size = 'md',
  ariaLabel = 'قائمة الاختيار',
  className = '',
}: SingleChoiceListProps<T>) {
  const getLayoutClass = () => {
    switch (layout) {
      case 'grid-2':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-2.5';
      case 'grid-3':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5';
      case 'horizontal-pills':
        return 'flex flex-wrap items-center gap-2';
      case 'vertical':
      default:
        return 'flex flex-col gap-2';
    }
  };

  if (layout === 'horizontal-pills') {
    return (
      <div role="radiogroup" aria-label={ariaLabel} className={`flex flex-wrap gap-1.5 ${className}`}>
        {options.map((opt) => {
          const isSelected = opt.id === selectedId;
          return (
            <button
              key={String(opt.id)}
              role="radio"
              aria-checked={isSelected}
              disabled={opt.disabled}
              onClick={() => onSelect(opt.id)}
              type="button"
              className={`group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-700/60 ${
                isSelected
                  ? 'bg-amber-800 text-white shadow-sm ring-1 ring-amber-900/30'
                  : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 hover:text-stone-900 border border-stone-200/60'
              } ${opt.disabled ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {opt.icon && (
                <span className={`shrink-0 transition-colors ${isSelected ? 'text-amber-200' : 'text-stone-500 group-hover:text-stone-700'}`}>
                  {opt.icon}
                </span>
              )}
              <span>{opt.title}</span>
              {opt.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-amber-900/60 text-amber-200' : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {opt.badge}
                </span>
              )}
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={`${getLayoutClass()} ${className}`}>
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        const paddingClass = size === 'sm' ? 'p-2.5' : size === 'lg' ? 'p-4 sm:p-5' : 'p-3.5';

        return (
          <button
            key={String(opt.id)}
            role="radio"
            aria-checked={isSelected}
            disabled={opt.disabled}
            onClick={() => onSelect(opt.id)}
            type="button"
            className={`group relative text-right rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-700/60 ${paddingClass} ${
              isSelected
                ? 'bg-amber-50/90 border-amber-700/80 shadow-xs ring-1 ring-amber-700/40 text-amber-950'
                : 'bg-white hover:bg-stone-50/80 border-stone-200/80 hover:border-amber-300/80 text-stone-800 shadow-2xs'
            } ${opt.disabled ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Content Block */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {opt.icon && (
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-100 text-stone-600 group-hover:bg-amber-50 group-hover:text-amber-800 border border-stone-200/60'
                    }`}
                  >
                    {opt.icon}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm truncate ${isSelected ? 'text-amber-950 font-bold' : 'text-stone-900 group-hover:text-amber-900'}`}>
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isSelected
                            ? 'bg-amber-200/80 text-amber-950 border border-amber-300/70'
                            : 'bg-stone-100 text-stone-600 border border-stone-200/80'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {opt.subtitle && (
                    <div className={`text-xs mt-0.5 line-clamp-1 ${isSelected ? 'text-amber-800/80' : 'text-stone-500'}`}>
                      {opt.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Radio Indicator */}
              <div className="flex items-center gap-2 shrink-0">
                {opt.metadata && (
                  <span className={`text-[11px] font-mono ${isSelected ? 'text-amber-800 font-semibold' : 'text-stone-400'}`}>
                    {opt.metadata}
                  </span>
                )}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-amber-700 bg-amber-800 text-white shadow-xs'
                      : 'border-stone-300 bg-stone-50 group-hover:border-amber-400'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
