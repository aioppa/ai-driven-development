'use client';

import React from 'react';
import { ImagePost } from '@/lib/types';
import { FeedCard } from './FeedCard';

interface FeedGridProps {
  posts: ImagePost[];
  onPromptClone?: (postId: string) => void;
  onLikeToggle?: (postId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
}

export const FeedGrid: React.FC<FeedGridProps> = ({ 
  posts, 
  onPromptClone, 
  onLikeToggle,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  isLoadingMore = false
}) => {
  if (!posts || posts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-white/50 text-6xl mb-4">🎨</div>
        <h3 className="text-white/70 text-xl font-medium mb-2">이미지가 없습니다</h3>
        <p className="text-white/50">
          아직 공유된 이미지가 없습니다. 
          <a href="/generate" className="text-blue-400 hover:text-blue-300 ml-1">
            첫 번째 이미지를 만들어보세요
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 피드 그리드 - 12개 그리드 레이아웃 */}
      {isLoading && posts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white/20 rounded-xl aspect-square" />
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
                onLikeToggle={onLikeToggle}
              />
            ))}
          </div>

          {/* 더보기 버튼 */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white px-8 py-3 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? '로딩 중...' : '더 보기'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

