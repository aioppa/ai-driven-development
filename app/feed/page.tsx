'use client';

import { useState, useEffect } from 'react';
import { ImagePost, FeedFilters } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { Header } from '@/components/ui/Header';
import { FeedFilters as FeedFiltersComponent } from '@/components/feed/FeedFilters';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';

export default function FeedPage() {
  const [posts, setPosts] = useState<ImagePost[]>([]);
  const [filters, setFilters] = useState<FeedFilters>({
    sortBy: 'latest',
    category: '',
    tags: [],
    search: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasMore: true,
    isLoading: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 피드 데이터 로드
  const loadFeedData = async (page: number = 1, append: boolean = false) => {
    setPagination(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await MockApi.getFeed(filters, page, 12);
      
      if (response.success) {
        setPosts(prev => append ? [...prev, ...response.data.data] : response.data.data);
        setPagination({
          currentPage: page,
          hasMore: response.data.hasMore,
          isLoading: false,
        });
        setError(null);
      } else {
        setError('피드 데이터를 불러오는데 실패했습니다.');
        setPagination(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
      setPagination(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadFeedData(1, false);
  }, [filters]);

  // 필터 변경
  const handleFiltersChange = (newFilters: FeedFilters) => {
    setFilters(newFilters);
  };

  // 프롬프트 복제
  const handlePromptClone = async (postId: string) => {
    try {
      const response = await MockApi.clonePrompt(postId);
      if (response.success) {
        setToast({ 
          message: '프롬프트가 복제되었습니다. 메인페이지로 이동합니다.', 
          type: 'success' 
        });
        // 메인페이지로 이동하면서 프롬프트 전달
        setTimeout(() => {
          window.location.href = `/?prompt=${encodeURIComponent(response.data.prompt)}`;
        }, 1500);
      } else {
        setToast({ message: '프롬프트 복제에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: '네트워크 오류가 발생했습니다.', type: 'error' });
    }
  };

  // 좋아요 토글
  const handleLikeToggle = async (postId: string) => {
    try {
      const response = await MockApi.toggleLike(postId);
      if (response.success) {
        // 로컬 상태 업데이트
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isLiked: response.data.isLiked, likes: response.data.likes }
            : post
        ));
      } else {
        setToast({ message: '좋아요 처리에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: '네트워크 오류가 발생했습니다.', type: 'error' });
    }
  };

  // 무한 스크롤
  const handleLoadMore = () => {
    if (pagination.hasMore && !pagination.isLoading) {
      loadFeedData(pagination.currentPage + 1, true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 헤더 */}
      <Header title="AIPixels" subtitle="커뮤니티" />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 제목 */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">커뮤니티 피드</h2>
          <p className="text-white/70 text-lg">
            다른 사용자들이 만든 멋진 AI 이미지들을 탐색하고 영감을 받아보세요
          </p>
        </div>

        {/* 필터 및 검색 */}
        <FeedFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* 피드 그리드 */}
        <FeedGrid
          posts={posts}
          onPromptClone={handlePromptClone}
          onLikeToggle={handleLikeToggle}
          onLoadMore={handleLoadMore}
          hasMore={pagination.hasMore}
          isLoading={pagination.isLoading}
        />

        {/* 로딩 스피너 */}
        {pagination.isLoading && posts.length === 0 && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </main>

      {/* 토스트 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
