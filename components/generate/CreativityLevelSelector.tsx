'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CreativityLevelSelectorProps {
  selectedLevel: number;
  onLevelChange: (level: number) => void;
}

export const CreativityLevelSelector: React.FC<CreativityLevelSelectorProps> = ({
  selectedLevel,
  onLevelChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const levels = [
    { value: 1, label: '보수적', description: '안전하고 예측 가능한 결과', color: 'bg-green-500' },
    { value: 2, label: '균형', description: '적당한 창의성과 안정성', color: 'bg-yellow-500' },
    { value: 3, label: '창의적', description: '독창적이고 새로운 아이디어', color: 'bg-orange-500' },
    { value: 4, label: '매우 창의적', description: '높은 수준의 혁신적 결과', color: 'bg-red-500' },
    { value: 5, label: '극도로 창의적', description: '최대한 혁신적이고 예술적', color: 'bg-purple-500' },
  ];

  const selectedLevelData = levels.find(l => l.value === selectedLevel);

  const handleLevelSelect = (level: number) => {
    onLevelChange(level);
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
          <div className={cn(
            "w-4 h-4 rounded flex items-center justify-center text-white font-bold text-xs",
            selectedLevelData?.color
          )}>
            {selectedLevel}
          </div>
          <span className="text-sm font-medium text-white">{selectedLevelData?.label}</span>
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-xl z-[90]">
            <div className="p-2 max-h-64 overflow-y-auto">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleLevelSelect(level.value)}
                  className={cn(
                    "w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left hover:bg-white/10",
                    selectedLevel === level.value
                      ? "bg-blue-500/20 text-white"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs",
                    level.color
                  )}>
                    {level.value}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">레벨 {level.value}: {level.label}</div>
                    <div className="text-xs opacity-75">{level.description}</div>
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
