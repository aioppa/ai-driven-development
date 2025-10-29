'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageSize {
  id: string;
  name: string;
  ratio: string;
  width: number;
  height: number;
  description: string;
}

interface ImageSizeSelectorProps {
  selectedSize: ImageSize;
  onSizeChange: (size: ImageSize) => void;
}

const imageSizes: ImageSize[] = [
  {
    id: '1:1',
    name: '정사각형',
    ratio: '1:1',
    width: 1024,
    height: 1024,
    description: 'SNS용 정사각형'
  },
  {
    id: '3:4',
    name: '세로형',
    ratio: '3:4',
    width: 768,
    height: 1024,
    description: '모바일 세로형'
  },
  {
    id: '4:3',
    name: '가로형',
    ratio: '4:3',
    width: 1024,
    height: 768,
    description: '데스크톱 가로형'
  },
  {
    id: '16:9',
    name: '와이드',
    ratio: '16:9',
    width: 1024,
    height: 576,
    description: '배경화면용'
  },
  {
    id: '9:16',
    name: '모바일',
    ratio: '9:16',
    width: 576,
    height: 1024,
    description: '모바일 세로형'
  },
  {
    id: '2:3',
    name: '인쇄용',
    ratio: '2:3',
    width: 768,
    height: 1152,
    description: '인쇄물 세로형'
  }
];

export const ImageSizeSelector: React.FC<ImageSizeSelectorProps> = ({
  selectedSize,
  onSizeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSizeSelect = (size: ImageSize) => {
    onSizeChange(size);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* 작고 심플한 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-200 relative overflow-hidden",
          isOpen
            ? "border-blue-500 bg-blue-500/20"
            : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
        )}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white">{selectedSize.name}</span>
        </div>
        
        <svg 
          className={cn(
            "w-4 h-4 text-white/60 transition-transform duration-200",
            isOpen ? "rotate-180" : ""
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-xl z-[100]">
            <div className="p-2 max-h-64 overflow-y-auto">
              {imageSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleSizeSelect(size)}
                  className={cn(
                    "w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left hover:bg-white/10",
                    selectedSize.id === size.id
                      ? "bg-blue-500/20 text-white"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white font-bold">{size.ratio}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{size.name}</div>
                    <div className="text-xs opacity-75">{size.description}</div>
                  </div>
                  <div className="text-xs opacity-60">
                    {size.width} × {size.height}
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
