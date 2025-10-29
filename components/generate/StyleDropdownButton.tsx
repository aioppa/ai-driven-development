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
      {/* 스타일 선택 버튼 - 작고 심플하게 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-3 py-2 bg-white/10 backdrop-blur-sm border rounded-lg text-white flex items-center justify-between transition-all duration-200 hover:bg-white/20',
          isOpen
            ? 'border-[#3A6BFF] shadow-lg shadow-[#3A6BFF]/20'
            : 'border-white/20 hover:border-white/30'
        )}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium">{selectedStyle?.name || '스타일'}</span>
        </div>
        
        <svg
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 백드롭다운 메뉴 */}
      {isOpen && (
        <>
          {/* 백드롭 */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-xl z-[9999] max-h-80 overflow-y-auto">
            <div className="p-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={cn(
                    'w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 hover:bg-white/10',
                    selectedStyle?.id === style.id
                      ? 'bg-blue-500/20 text-white'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{style.name}</div>
                    <div className="text-xs opacity-75">{style.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
