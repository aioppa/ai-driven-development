'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { cn, debounce } from '@/lib/utils';
import { TranslationHistoryComponent } from './TranslationHistory';
import { TranslationHistory } from '@/lib/types';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
  onTranslatedPromptChange?: (translatedPrompt: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  error,
  onTranslatedPromptChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [translatedPrompt, setTranslatedPrompt] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // 번역 함수
  const translateText = useCallback(async (text: string) => {
    const trimmedText = text.trim();
    
    if (!trimmedText) {
      setTranslatedPrompt('');
      onTranslatedPromptChange?.('');
      setTranslationError(null);
      return;
    }

    // 한글 감지
    const hasKorean = /[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(trimmedText);
    
    if (!hasKorean) {
      setTranslatedPrompt('');
      onTranslatedPromptChange?.('');
      setTranslationError(null);
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: trimmedText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.isTranslated) {
          setTranslatedPrompt(result.translated);
          onTranslatedPromptChange?.(result.translated);
          setShowTranslation(true);
          setTranslationError(null); // 성공 시 에러 상태 초기화
        } else {
          // 번역이 필요하지 않은 경우 (영어 등)
          setTranslatedPrompt('');
          onTranslatedPromptChange?.('');
          setTranslationError(null);
        }
      } else {
        // 번역 실패 시 상태 초기화
        setTranslatedPrompt('');
        onTranslatedPromptChange?.('');
        
        // 에러 타입에 따른 메시지 설정
        let errorMessage = result.error || '번역에 실패했습니다.';
        if (result.errorType === 'TooManyRequestsError') {
          errorMessage = '번역 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.';
        } else if (result.errorType === 'TimeoutError') {
          errorMessage = '번역 시간이 초과되었습니다. 다시 시도해주세요.';
        }
        
        setTranslationError(errorMessage);
        setShowTranslation(false);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      // 네트워크 오류 등으로 실패한 경우 상태 초기화
      setTranslationError('번역 서비스에 연결할 수 없습니다.');
      setTranslatedPrompt('');
      onTranslatedPromptChange?.('');
      setShowTranslation(false);
    } finally {
      setIsTranslating(false);
    }
  }, [onTranslatedPromptChange]);

  // 디바운스된 번역 함수
  const debouncedTranslate = useCallback(
    debounce(translateText, 500),
    [translateText]
  );

  // 프롬프트 변경 시 번역 실행
  useEffect(() => {
    debouncedTranslate(prompt);
  }, [prompt, debouncedTranslate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGenerating && prompt.trim()) {
      onGenerate();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isGenerating && prompt.trim()) {
        onGenerate();
      }
    }
  };

  const isDisabled = isGenerating || !prompt.trim() || prompt.length > 500;

  // 번역 이력 선택 핸들러
  const handleSelectHistory = (history: TranslationHistory) => {
    onPromptChange(history.original);
    setShowHistory(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          {/* 프롬프트 입력 필드 */}
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="원하는 이미지를 자세히 설명해주세요... (예: 고양이가 우주에서 춤추는 모습)"
            maxLength={500}
            rows={5}
            className={cn(
              'w-full px-5 py-3 bg-white/10 backdrop-blur-sm border-2 rounded-xl text-white placeholder-white/50 resize-none transition-all duration-300 focus:outline-none text-base',
              isFocused
                ? 'border-[#3A6BFF] shadow-lg shadow-[#3A6BFF]/20'
                : 'border-white/20 hover:border-white/30',
              error && 'border-red-500'
            )}
            disabled={isGenerating}
          />
          
          {/* 글자 수 표시 */}
          <div className={cn(
            "absolute bottom-3 right-3 text-xs transition-colors",
            prompt.length > 450 ? "text-red-400" : 
            prompt.length > 400 ? "text-yellow-400" : 
            "text-white/60"
          )}>
            {prompt.length}/500
          </div>

          {/* 번역 이력 버튼 */}
          <div className="absolute top-3 right-3">
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="번역 이력 보기"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 번역 결과 표시 */}
        {(translatedPrompt || isTranslating || translationError) && (
          <div className="mt-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-white/60">번역된 프롬프트</span>
                {isTranslating && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-400">번역 중...</span>
                  </div>
                )}
              </div>
              {translatedPrompt && (
                <button
                  type="button"
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="text-xs text-white/60 hover:text-white/80 transition-colors"
                >
                  {showTranslation ? '접기' : '펼치기'}
                </button>
              )}
            </div>
            
            {translationError && (
              <div className="flex items-center justify-between text-red-400 text-xs mb-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{translationError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => translateText(prompt)}
                  disabled={isTranslating}
                  className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-500 transition-colors"
                >
                  {isTranslating ? '재시도 중...' : '재시도'}
                </button>
              </div>
            )}
            
            {translatedPrompt && showTranslation && (
              <div className="space-y-2">
                <p className="text-sm text-white/80 leading-relaxed">
                  {translatedPrompt}
                </p>
                <div className="flex items-center space-x-2 text-xs text-white/50">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>이 번역된 프롬프트로 이미지가 생성됩니다</span>
                </div>
              </div>
            )}
          </div>
        )}


        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* 글자 수 초과 경고 */}
        {prompt.length > 500 && (
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>프롬프트가 500자를 초과했습니다. ({prompt.length}/500)</span>
          </div>
        )}

        {/* 생성 버튼 */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isDisabled}
            className={cn(
              'px-8 py-4 text-lg font-semibold transition-all duration-300',
              isDisabled
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                : 'bg-[#3A6BFF] hover:bg-[#2F5DCC] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            )}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>생성 중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI 이미지 생성</span>
              </div>
            )}
          </Button>
        </div>

      </form>

      {/* 번역 이력 모달 */}
      <TranslationHistoryComponent
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectHistory={handleSelectHistory}
      />
    </div>
  );
};
