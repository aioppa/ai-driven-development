'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePost } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { cn } from '@/lib/utils';
import { CommentModal } from './CommentModal';

interface FeedCardProps {
  post: ImagePost;
  onPromptClone?: (prompt: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, onPromptClone }) => {
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
      const response = await MockApi.toggleLike(post.id);
      if (response.success) {
        setIsLiked(response.data.isLiked);
        setLikes(response.data.likes);
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
      const response = await MockApi.clonePrompt(post.id);
      if (response.success && onPromptClone) {
        onPromptClone(response.data.prompt);
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
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleViewDetail}
    >
      {/* 이미지 */}
      <div className="aspect-square relative">
        <img
          src={post.thumbnailUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
              {post.title}
            </h3>
            {post.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                {post.description}
              </p>
            )}
          </div>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center mb-3">
          <img
            src={post.author.avatar}
            alt={post.author.username}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm text-gray-600">{post.author.username}</span>
          <span className="text-xs text-gray-400 ml-2">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{post.tags.length - 3}개 더
              </span>
            )}
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                'flex items-center space-x-1 text-sm transition-colors',
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-500 hover:text-red-500'
              )}
            >
              <svg
                className={cn('w-4 h-4', isLiked && 'fill-current')}
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
              <span>{likes}</span>
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation(); // 클릭 이벤트 전파 방지
                setIsCommentModalOpen(true);
              }}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{post.comments}</span>
            </button>
          </div>

          <button
            onClick={handleClonePrompt}
            className="flex items-center space-x-1 text-gray-500 hover:text-[#3A6BFF] text-sm transition-colors"
            title="프롬프트 복제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden sm:inline">복제</span>
          </button>
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

