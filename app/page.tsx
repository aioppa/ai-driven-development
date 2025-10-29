'use client';

import { useState, useEffect } from 'react';
import { PromptInput } from '@/components/main/PromptInput';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { Sidebar } from '@/components/ui/Sidebar';
import { ImagePost } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';

export default function Home() {
  const [posts, setPosts] = useState<ImagePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('popular');

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
      const response = await MockApi.getFeed({ sortBy: sortType }, pageToLoad, 9);
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-black/50 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">메인</h1>
            <div className="flex items-center space-x-4">
              {/* 정렬 버튼 */}
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
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          {/* 9개 피드 그리드 */}
          <FeedGrid
            posts={posts}
            isLoading={isLoading}
            onPromptClone={handlePromptClone}
          />

          {/* 더보기 버튼 */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white px-8 py-3 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? '로딩 중...' : '더 보기'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
