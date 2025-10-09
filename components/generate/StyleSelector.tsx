'use client';

import React from 'react';
import { StyleOption } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StyleSelectorProps {
  styles: StyleOption[];
  selectedStyle: StyleOption | null;
  onStyleSelect: (styleId: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  styles,
  selectedStyle,
  onStyleSelect,
}) => {
  if (styles.length === 0) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-5 gap-3 max-w-4xl mx-auto">
          {Array.from({ length: 25 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white/20 rounded-lg h-20"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-3 max-w-4xl mx-auto">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleSelect(style.id)}
            className={cn(
              'relative group aspect-square rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3A6BFF] focus:ring-offset-2 focus:ring-offset-transparent',
              selectedStyle?.id === style.id
                ? 'ring-2 ring-[#3A6BFF] transform scale-105'
                : 'hover:scale-105 hover:ring-2 hover:ring-white/30'
            )}
          >
            {/* 스타일 썸네일 */}
            <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
              <img
                src={style.thumbnail}
                alt={style.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            {/* 오버레이 */}
            <div className={cn(
              'absolute inset-0 rounded-lg transition-all duration-200',
              selectedStyle?.id === style.id
                ? 'bg-[#3A6BFF]/80'
                : 'bg-black/0 group-hover:bg-black/40'
            )}>
              {/* 스타일 이름 */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className={cn(
                  'text-xs font-medium text-center transition-colors duration-200',
                  selectedStyle?.id === style.id
                    ? 'text-white'
                    : 'text-white/80 group-hover:text-white'
                )}>
                  {style.name}
                </p>
              </div>
              
              {/* 인기 스타일 표시 */}
              {style.isPopular && (
                <div className="absolute top-1 right-1">
                  <span className="bg-[#FFBC00] text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    인기
                  </span>
                </div>
              )}
              
              {/* 선택 표시 */}
              {selectedStyle?.id === style.id && (
                <div className="absolute top-1 left-1">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#3A6BFF]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            {/* 호버 시 툴팁 */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {style.description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
            </div>
          </button>
        ))}
      </div>
      
      {/* 선택된 스타일 정보 */}
      {selectedStyle && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img
                src={selectedStyle.thumbnail}
                alt={selectedStyle.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">{selectedStyle.name}</p>
              <p className="text-white/60 text-sm">{selectedStyle.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
