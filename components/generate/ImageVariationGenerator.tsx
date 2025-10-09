'use client';

import React, { useState } from 'react';
import { GeneratedImage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ImageVariationGeneratorProps {
  selectedImage: GeneratedImage;
  onGenerateVariation: (imageId: string, variationType: string, level: number, additionalPrompt?: string) => void;
  isGenerating: boolean;
}

export const ImageVariationGenerator: React.FC<ImageVariationGeneratorProps> = ({
  selectedImage,
  onGenerateVariation,
  isGenerating,
}) => {
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [variationLevel, setVariationLevel] = useState<number>(3);
  const [additionalPrompt, setAdditionalPrompt] = useState<string>('');

  const variationTypes = [
    {
      id: 'style',
      name: '스타일 변경',
      description: '다른 스타일로 변형',
      icon: '🎨',
      color: 'bg-purple-500'
    },
    {
      id: 'color',
      name: '색상 조정',
      description: '색상 톤 변경',
      icon: '🌈',
      color: 'bg-pink-500'
    },
    {
      id: 'composition',
      name: '구도 변경',
      description: '레이아웃과 구도 수정',
      icon: '📐',
      color: 'bg-blue-500'
    },
    {
      id: 'detail',
      name: '세부사항 강화',
      description: '더 자세하고 정교하게',
      icon: '🔍',
      color: 'bg-green-500'
    },
    {
      id: 'artistic',
      name: '예술적 변형',
      description: '더 창의적이고 예술적으로',
      icon: '✨',
      color: 'bg-yellow-500'
    }
  ];

  const handleGenerateVariation = () => {
    if (selectedVariation) {
      onGenerateVariation(selectedImage.id, selectedVariation, variationLevel, additionalPrompt.trim() || undefined);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">이미지 변형 생성</h3>
        <p className="text-white/70 text-sm">선택한 이미지를 기반으로 다양한 변형을 생성할 수 있습니다</p>
      </div>

      {/* 선택된 이미지 미리보기 */}
      <div className="mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={selectedImage.thumbnailUrl}
                alt={selectedImage.prompt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm mb-1">선택된 이미지</h4>
              <p className="text-white/70 text-xs line-clamp-2">{selectedImage.prompt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 변형 타입 선택 */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">변형 타입 선택</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {variationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedVariation(type.id)}
              className={cn(
                'p-4 rounded-xl text-left transition-all duration-200 border',
                selectedVariation === type.id
                  ? 'bg-white/20 border-white/40 text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg',
                  type.color
                )}>
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm mb-1">{type.name}</h5>
                  <p className="text-xs opacity-75">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 변형 레벨 선택 */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">변형 강도</h4>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/70 text-sm">변형 강도</span>
            <span className="text-white font-medium">{variationLevel}/5</span>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setVariationLevel(level)}
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200',
                  variationLevel === level
                    ? 'bg-[#3A6BFF] text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                )}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-white/60">
            {variationLevel === 1 && '매우 약한 변형 - 원본과 거의 동일'}
            {variationLevel === 2 && '약한 변형 - 원본의 특징 유지'}
            {variationLevel === 3 && '보통 변형 - 적당한 변화'}
            {variationLevel === 4 && '강한 변형 - 상당한 변화'}
            {variationLevel === 5 && '매우 강한 변형 - 완전히 다른 느낌'}
          </div>
        </div>
      </div>

      {/* 추가 프롬프트 입력 */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">추가 프롬프트 (선택사항)</h4>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <textarea
            value={additionalPrompt}
            onChange={(e) => setAdditionalPrompt(e.target.value)}
            placeholder="원하는 추가적인 변형 요소를 입력하세요... (예: 더 밝게, 어두운 톤으로, 빈티지 스타일로)"
            className="w-full bg-transparent text-white placeholder-white/50 border-none outline-none resize-none"
            rows={3}
          />
          <div className="mt-2 text-xs text-white/60">
            💡 추가 프롬프트를 입력하면 더 구체적인 변형을 생성할 수 있습니다.
          </div>
        </div>
      </div>

      {/* 변형 생성 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateVariation}
          disabled={!selectedVariation || isGenerating}
          className={cn(
            'px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2',
            selectedVariation && !isGenerating
              ? 'bg-[#3A6BFF] text-white hover:bg-[#2F5DCC] shadow-lg hover:shadow-xl'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          )}
        >
          {isGenerating ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>변형 생성 중...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>변형 생성하기</span>
            </>
          )}
        </button>
      </div>

      {/* 도움말 */}
      <div className="mt-4 p-3 bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-500/20">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-blue-300 text-xs">
            <p className="font-medium mb-1">💡 팁</p>
            <p>원본 이미지를 기반으로 선택한 변형 타입에 따라 새로운 이미지를 생성합니다. 각 변형은 원본의 특징을 유지하면서 다른 스타일이나 요소를 적용합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
