'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StyleSelector } from '@/components/main/StyleSelector';
import { MockApi } from '@/lib/api/mockApi';
import { useRouter } from 'next/navigation';

interface PromptInputProps {
  onPromptSubmit?: (prompt: string, styleId: string) => void;
  selectedStyle?: string;
  onStyleSelect?: (styleId: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  onPromptSubmit,
  selectedStyle,
  onStyleSelect,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요.');
      return;
    }

    if (!selectedStyle) {
      setError('스타일을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await MockApi.submitPrompt(prompt, selectedStyle);
      
      if (response.success) {
        // 이미지 생성 페이지로 이동
        router.push(response.data.redirectUrl);
      } else {
        setError(response.message || '오류가 발생했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="원하는 이미지를 설명해주세요... (예: 고양이가 우주에서 춤추는 모습)"
              value={prompt}
              onChange={handlePromptChange}
              error={error}
              maxLength={200}
              className="text-center text-xl h-16 border-2 border-[#3A6BFF] shadow-lg focus:shadow-xl transition-all duration-300"
            />
            <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
              <span>최대 200자</span>
              <span>{prompt.length}/200</span>
            </div>
          </div>
          
          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            disabled={!prompt.trim() || !selectedStyle}
            className="px-8 py-4 h-16 text-lg font-semibold whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </Button>
        </div>
        
        {/* 스타일 선택 영역 */}
        <div className="mt-6">
          <StyleSelector
            selectedStyle={selectedStyle}
            onStyleSelect={onStyleSelect || (() => {})}
            hideTitle={true}
          />
        </div>
      </form>
    </div>
  );
};

