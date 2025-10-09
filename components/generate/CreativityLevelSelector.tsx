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
  const levels = [
    { value: 1, label: '보수적', description: '안전하고 예측 가능한 결과', color: 'bg-green-500' },
    { value: 2, label: '균형', description: '적당한 창의성과 안정성', color: 'bg-yellow-500' },
    { value: 3, label: '창의적', description: '독창적이고 새로운 아이디어', color: 'bg-orange-500' },
    { value: 4, label: '매우 창의적', description: '높은 수준의 혁신적 결과', color: 'bg-red-500' },
    { value: 5, label: '극도로 창의적', description: '최대한 혁신적이고 예술적', color: 'bg-purple-500' },
  ];

  return (
    <div className="w-full">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white">상상력 난이도</h3>
      </div>

      {/* 레벨 선택 슬라이더 */}
      <div className="space-y-3">
        {/* 슬라이더 */}
        <div className="relative">
          <input
            type="range"
            min="1"
            max="5"
            value={selectedLevel}
            onChange={(e) => onLevelChange(parseInt(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #10B981 0%, #F59E0B 25%, #F97316 50%, #EF4444 75%, #8B5CF6 100%)`
            }}
          />
          
          {/* 레벨 마커들 */}
          <div className="flex justify-between mt-2">
            {levels.map((level) => (
              <div
                key={level.value}
                className={cn(
                  'w-3 h-3 rounded-full cursor-pointer transition-all duration-200',
                  selectedLevel >= level.value ? level.color : 'bg-white/30',
                  selectedLevel === level.value && 'scale-125 shadow-lg'
                )}
                onClick={() => onLevelChange(level.value)}
              />
            ))}
          </div>
        </div>

        {/* 현재 선택된 레벨 정보 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-3 h-3 rounded-full',
              levels[selectedLevel - 1].color
            )} />
            <div>
              <h4 className="text-white font-medium text-sm">
                레벨 {selectedLevel}: {levels[selectedLevel - 1].label}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
