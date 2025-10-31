'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ImagePost, FeedFilters } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { Sidebar } from '@/components/ui/Sidebar';
import { FeedFilters as FeedFiltersComponent } from '@/components/feed/FeedFilters';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';

export default function FeedPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  
  // 모든 hooks를 먼저 선언
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
      const response = await MockApi.getFeed(filters, page, 15);
      
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

  // 로그인 확인
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // 초기 데이터 로드
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadFeedData(1, false);
    }
  }, [filters, isLoaded, isSignedIn]);

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

  // 로딩 중이거나 로그인하지 않은 경우
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* 사이드바: 모바일 숨김, 데스크톱 표시 */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="mx-auto w-full md:max-w-[960px] px-2.5 md:px-5 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-white">커뮤니티</h1>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1">
        <div className="mx-auto w-full md:max-w-[960px] px-2.5 md:px-5 py-4 md:py-6">

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
        </div>
        </main>
      </div>

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
