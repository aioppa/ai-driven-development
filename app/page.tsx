'use client';

import { useState, useEffect } from 'react';
import { PromptInput } from '@/components/main/PromptInput';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { Header } from '@/components/ui/Header';
import { ImagePost } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';

export default function Home() {
  const [posts, setPosts] = useState<ImagePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // 피드 데이터 로드
  const loadPosts = async (sortType: 'latest' | 'popular' = sortBy, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setCurrentPage(1);
      }
      
      const pageToLoad = append ? currentPage + 1 : 1;
      const response = await MockApi.getFeed({ sortBy: sortType }, pageToLoad, 12);
      
      if (response.success) {
        if (append) {
          setPosts(prev => [...prev, ...response.data.data]);
          setCurrentPage(prev => prev + 1);
        } else {
          setPosts(response.data.data);
          setCurrentPage(1);
        }
        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.error('피드 로드 실패:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadPosts();
  }, []);

  const handlePromptClone = (postId: string) => {
    // 프롬프트가 복제되면 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: 'latest' | 'popular') => {
    setSortBy(newSort);
    loadPosts(newSort, false);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadPosts(sortBy, true);
    }
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
      <Header className="relative z-10" />

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

          {/* 이미지 창작 버튼 섹션 */}
          <div className="mb-16">
            <PromptInput />
          </div>
        </section>

        {/* 커뮤니티 피드 섹션 */}
        <section>
          {/* 정렬 버튼 */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center space-x-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-1">
              <button
                onClick={() => handleSortChange('latest')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  sortBy === 'latest'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => handleSortChange('popular')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  sortBy === 'popular'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                인기순
              </button>
            </div>
          </div>
          
          <FeedGrid 
            posts={posts}
            onPromptClone={handlePromptClone}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
          />
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white/70">
            <p>&copy; 2025 AIPixels. 의 모든 권리와 소유는 (주)한유 기업에게 있습니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
