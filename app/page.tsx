'use client';

import { useState } from 'react';
import { PromptInput } from '@/components/main/PromptInput';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 미래지향적 배경 패턴 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10"></div>
      
      {/* 애니메이션 원형 요소들 */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
      {/* 헤더 */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#3A6BFF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold text-white">AIPixels</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/gallery" className="text-white/80 hover:text-white transition-colors">
                갤러리
              </Link>
            <Link href="/feed" className="text-white/80 hover:text-white transition-colors">
              커뮤니티
            </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* 히어로 섹션 */}
        <section className="text-center mb-16">
          {/* AIPixels 브랜딩 */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-8">
              {/* 가상 이미지 미리보기 */}
              <div className="relative max-w-xs">
                <div className="aspect-square bg-gradient-to-br from-[#3A6BFF] via-purple-500 to-pink-500 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-3 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <p className="text-sm font-medium">AI 생성 이미지</p>
                      <p className="text-xs opacity-75">여기에 결과가 표시됩니다</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-[#FFBC00] text-white text-xs px-2 py-1 rounded-full font-semibold">
                  NEW
                </div>
              </div>
              
              {/* AIPixels 브랜드명 */}
              <h1 className="text-6xl md:text-7xl font-bold text-white">
                <span className="text-[#3A6BFF]">AI</span>Pixels
              </h1>
            </div>
          </div>

          {/* 프롬프트 입력 섹션 */}
          <div className="mb-16">
            <PromptInput
              selectedStyle={selectedStyle}
              onStyleSelect={handleStyleSelect}
            />
          </div>
        </section>

        {/* 커뮤니티 피드 섹션 */}
        <section>
          <FeedGrid onPromptClone={handlePromptClone} />
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white/70">
            <p>&copy; 2024 AIPixels. 모든 권리 보유.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
