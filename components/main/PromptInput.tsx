'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface PromptInputProps {
  onPromptSubmit?: (prompt: string, styleId: string) => void;
  selectedStyle?: string;
  onStyleSelect?: (styleId: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = () => {
  const router = useRouter();

  const handleCreateImage = () => {
    // 이미지 생성 페이지로 직접 이동
    router.push('/generate');
  };

  return (
    <div className="w-full flex justify-center">
      <button
        onClick={handleCreateImage}
        className="group relative px-12 py-6 bg-gradient-to-r from-[#3A6BFF] to-[#2F5DCC] text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
      >
        {/* 버튼 배경 효과 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#3A6BFF] to-[#2F5DCC] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        
        {/* 버튼 내용 */}
        <div className="relative flex items-center space-x-3">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>이미지 창작</span>
        </div>
        
        {/* 호버 시 추가 효과 */}
        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  );
};

