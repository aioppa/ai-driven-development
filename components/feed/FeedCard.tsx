'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePost } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { cn } from '@/lib/utils';
import { CommentModal } from './CommentModal';

interface FeedCardProps {
  post: ImagePost;
  onPromptClone?: (postId: string) => void;
  onLikeToggle?: (postId: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, onPromptClone, onLikeToggle }) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      if (onLikeToggle) {
        onLikeToggle(post.id);
      } else {
        const response = await MockApi.toggleLike(post.id);
        if (response.success) {
          setIsLiked(response.data.isLiked);
          setLikes(response.data.likes);
        }
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleClonePrompt = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    try {
      if (onPromptClone) {
        onPromptClone(post.id);
      } else {
        const response = await MockApi.clonePrompt(post.id);
        if (response.success) {
          // 메인페이지로 이동하면서 프롬프트 전달
          window.location.href = `/?prompt=${encodeURIComponent(response.data.prompt)}`;
        }
      }
    } catch (error) {
      console.error('프롬프트 복제 중 오류:', error);
    }
  };

  const handleViewDetail = () => {
    router.push(`/feed/${post.id}`);
  };

  return (
    <div 
      className="group relative bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/30"
      onClick={handleViewDetail}
    >
      {/* 이미지 */}
      <div className="aspect-square relative">
        <img
          src={post.thumbnailUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* 호버 시 오버레이 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300">
          {/* 호버 시 액션 버튼들 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center space-x-6">
              {/* 좋아요 버튼 */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  'flex flex-col items-center space-y-1 p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110',
                  isLiked
                    ? 'bg-red-500/80 text-white'
                    : 'bg-white/20 text-white hover:bg-red-500/80'
                )}
                title="좋아요"
              >
                <svg
                  className={cn('w-6 h-6', isLiked && 'fill-current')}
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-xs font-medium">{likes}</span>
              </button>

              {/* 댓글 버튼 */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                className="flex flex-col items-center space-y-1 p-3 rounded-full bg-white/20 text-white hover:bg-blue-500/80 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                title="댓글"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-xs font-medium">{post.comments}</span>
              </button>

              {/* 프롬프트 복제 버튼 */}
              <button
                onClick={handleClonePrompt}
                className="flex flex-col items-center space-y-1 p-3 rounded-full bg-white/20 text-white hover:bg-[#3A6BFF]/80 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                title="프롬프트 복제"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs font-medium">복제</span>
              </button>
            </div>
          </div>
        </div>

        {/* 이미지 하단 정보 (호버 시에만 표시) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">
            {post.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>{post.author.username}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* 댓글 모달 */}
      <CommentModal
        post={post}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
      />
    </div>
  );
};

