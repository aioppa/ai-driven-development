'use client';

import React, { useState, useEffect } from 'react';
import { StyleOption } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { cn } from '@/lib/utils';

interface StyleSelectorProps {
  selectedStyle?: string;
  onStyleSelect: (styleId: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onStyleSelect,
}) => {
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (isLoading) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          스타일을 선택해주세요
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-gray-200 rounded-full h-10 w-20"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-[#3A6BFF] hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        스타일을 선택해주세요
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleSelect(style.id)}
            className={cn(
              'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3A6BFF] focus:ring-offset-2',
              selectedStyle === style.id
                ? 'bg-[#3A6BFF] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900',
              style.isPopular && 'pr-8'
            )}
          >
            {style.name}
            {style.isPopular && (
              <span className="absolute top-0 right-0 bg-[#FFBC00] text-white text-xs px-1.5 py-0.5 rounded-full -translate-y-1/2 translate-x-1/2">
                인기
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

