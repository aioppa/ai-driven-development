'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StyleOption } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { cn } from '@/lib/utils';

interface StyleDropdownProps {
  selectedStyle?: string;
  onStyleSelect: (styleId: string) => void;
}

export const StyleDropdown: React.FC<StyleDropdownProps> = ({
  selectedStyle,
  onStyleSelect,
}) => {
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStyles = async () => {
      try {
        const response = await MockApi.getStyles();
        if (response.success) {
          setStyles(response.data);
          // 첫 번째 인기 스타일을 기본 선택
          const popularStyle = response.data.find(style => style.isPopular);
          if (popularStyle && !selectedStyle) {
            onStyleSelect(popularStyle.id);
          }
        } else {
          setError(response.message || '스타일을 불러올 수 없습니다.');
        }
      } catch (err) {
        setError('스타일을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStyles();
  }, [selectedStyle, onStyleSelect]);

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

  const selectedStyleData = styles.find(style => style.id === selectedStyle);

  const handleStyleSelect = (styleId: string) => {
    onStyleSelect(styleId);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="relative">
        <button
          disabled
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white/70 cursor-not-allowed flex items-center justify-between"
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

  if (error) {
    return (
      <div className="relative">
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors"
        >
          <span>스타일 로드 실패 - 클릭하여 재시도</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 드롭다운 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white flex items-center justify-between transition-all duration-200 hover:bg-white/20',
          isOpen
            ? 'border-[#3A6BFF] shadow-lg shadow-[#3A6BFF]/20'
            : 'border-white/20 hover:border-white/30'
        )}
      >
        <div className="flex items-center space-x-3">
          {selectedStyleData && (
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={selectedStyleData.thumbnail}
                alt={selectedStyleData.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="text-left">
            <div className="font-medium">
              {selectedStyleData ? selectedStyleData.name : '스타일을 선택하세요'}
            </div>
            {selectedStyleData && (
              <div className="text-xs text-white/60">
                {selectedStyleData.description}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedStyleData?.isPopular && (
            <span className="bg-[#FFBC00] text-white text-xs px-2 py-1 rounded-full font-semibold">
              인기
            </span>
          )}
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
        </div>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={cn(
                  'w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-150 hover:bg-gray-100',
                  selectedStyle === style.id && 'bg-[#3A6BFF]/10 border border-[#3A6BFF]/20'
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
                {selectedStyle === style.id && (
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
