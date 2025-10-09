'use client';

import React, { useState, useRef, useEffect } from 'react';
import { StyleOption } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StyleDropdownButtonProps {
  styles: StyleOption[];
  selectedStyle: StyleOption | null;
  onStyleSelect: (styleId: string) => void;
}

export const StyleDropdownButton: React.FC<StyleDropdownButtonProps> = ({
  styles,
  selectedStyle,
  onStyleSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStyleSelect = (styleId: string) => {
    onStyleSelect(styleId);
    setIsOpen(false);
  };

  if (styles.length === 0) {
    return (
      <div className="w-full">
        <button
          disabled
          className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/70 cursor-not-allowed flex items-center justify-between"
        >
          <span>스타일 로딩 중...</span>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full z-[9999]" ref={dropdownRef}>
      {/* 스타일 선택 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-6 py-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white flex items-center justify-between transition-all duration-200 hover:bg-white/20',
          isOpen
            ? 'border-[#3A6BFF] shadow-lg shadow-[#3A6BFF]/20'
            : 'border-white/20 hover:border-white/30'
        )}
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg font-medium">Styles</span>
          {selectedStyle && (
            <>
              <span className="text-white/50">•</span>
              <span className="text-white/70 text-sm">{selectedStyle.name}</span>
            </>
          )}
        </div>
        
        <svg
          className={cn(
            'w-5 h-5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl z-[9999] max-h-80 overflow-y-auto">
          <div className="p-2">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-150 hover:bg-gray-100',
                  selectedStyle?.id === style.id && 'bg-[#3A6BFF]/10 border border-[#3A6BFF]/20'
                )}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={style.thumbnail}
                    alt={style.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{style.name}</span>
                    {style.isPopular && (
                      <span className="bg-[#FFBC00] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        인기
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1">{style.description}</p>
                </div>
                {selectedStyle?.id === style.id && (
                  <div className="w-5 h-5 bg-[#3A6BFF] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
