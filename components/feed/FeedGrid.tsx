'use client';

import React, { useState, useEffect } from 'react';
import { ImagePost, FeedFilters } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { FeedCard } from './FeedCard';

interface FeedGridProps {
  onPromptClone?: (prompt: string) => void;
}

export const FeedGrid: React.FC<FeedGridProps> = ({ onPromptClone }) => {
  const [posts, setPosts] = useState<ImagePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FeedFilters>({ sortBy: 'latest' });

  const loadPosts = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      const response = await MockApi.getFeed(filters, pageNum, 12);
      
      if (response.success) {
        if (reset) {
          setPosts(response.data.data);
        } else {
          setPosts(prev => [...prev, ...response.data.data]);
        }
        setHasMore(response.data.hasMore);
        setPage(pageNum);
      } else {
        setError(response.message || '피드를 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('피드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1, true);
  }, [filters]);

  const handleSortChange = (sortBy: 'latest' | 'popular') => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadPosts(page + 1, false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => {
            setError('');
            setIsLoading(true);
            loadPosts(1, true);
          }}
          className="text-[#3A6BFF] hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 정렬 탭 */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => handleSortChange('latest')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filters.sortBy === 'latest'
                ? 'bg-white text-[#3A6BFF] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => handleSortChange('popular')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filters.sortBy === 'popular'
                ? 'bg-white text-[#3A6BFF] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            인기순
          </button>
        </div>
      </div>

      {/* 피드 그리드 */}
      {isLoading && posts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-square mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                onPromptClone={onPromptClone}
              />
            ))}
          </div>

          {/* 더보기 버튼 */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="bg-[#3A6BFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2F5DCC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '로딩 중...' : '더 보기'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

