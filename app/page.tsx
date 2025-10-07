'use client';

import { useState } from 'react';
import { PromptInput } from '@/components/main/PromptInput';
import { StyleSelector } from '@/components/main/StyleSelector';
import { FeedGrid } from '@/components/feed/FeedGrid';
import Link from 'next/link';

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [, setClonedPrompt] = useState<string>('');

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handlePromptClone = (prompt: string) => {
    setClonedPrompt(prompt);
    // 프롬프트가 복제되면 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#3A6BFF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AIPixels</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/gallery" className="text-gray-600 hover:text-[#3A6BFF] transition-colors">
                갤러리
              </Link>
            <Link href="/feed" className="text-gray-600 hover:text-[#3A6BFF] transition-colors">
              커뮤니티
            </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 히어로 섹션 */}
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI로 만드는
            <span className="text-[#3A6BFF]"> 창작의 세계</span>
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            텍스트만으로 고품질 이미지를 생성하고, 커뮤니티와 함께 창작의 즐거움을 나누세요.
          </p>

          {/* 프롬프트 입력 섹션 */}
          <div className="mb-12">
            <PromptInput
              selectedStyle={selectedStyle}
              onStyleSelect={handleStyleSelect}
            />
          </div>

          {/* 스타일 선택 섹션 */}
          <div className="mb-16">
            <StyleSelector
              selectedStyle={selectedStyle}
              onStyleSelect={handleStyleSelect}
            />
          </div>
        </section>

        {/* 커뮤니티 피드 섹션 */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              커뮤니티 피드
            </h3>
            <p className="text-gray-600">
              다른 사용자들의 창작물을 구경하고 영감을 얻어보세요
            </p>
          </div>
          
          <FeedGrid onPromptClone={handlePromptClone} />
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 AIPixels. 모든 권리 보유.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
