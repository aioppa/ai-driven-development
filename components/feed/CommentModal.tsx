'use client';

import React, { useState, useEffect } from 'react';
import { ImagePost, Comment, CommentModalProps } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { cn } from '@/lib/utils';

// 목업 댓글 데이터
const mockComments: Comment[] = [
  {
    id: '1',
    content: '정말 멋진 이미지네요! 프롬프트가 인상적입니다.',
    author: {
      id: '4',
      username: '아트러버',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2024-02-15'),
    },
    postId: '1',
    createdAt: new Date('2024-03-15T10:30:00'),
  },
  {
    id: '2',
    content: '색감이 정말 아름다워요. 어떤 스타일을 사용하셨나요?',
    author: {
      id: '5',
      username: '디자인매니아',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2024-02-20'),
    },
    postId: '1',
    createdAt: new Date('2024-03-15T14:20:00'),
  },
  {
    id: '3',
    content: '이런 아이디어는 어떻게 생각해내셨나요? 대단합니다!',
    author: {
      id: '6',
      username: '크리에이터킴',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      createdAt: new Date('2024-02-25'),
    },
    postId: '1',
    createdAt: new Date('2024-03-15T16:45:00'),
  },
];

export const CommentModal: React.FC<CommentModalProps> = ({ post, isOpen, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 목업 댓글 데이터 로드
      setComments(mockComments.filter(comment => comment.postId === post.id));
    }
  }, [isOpen, post.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    // 목업 댓글 추가
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      author: {
        id: 'current-user',
        username: '나',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date(),
      },
      postId: post.id,
      createdAt: new Date(),
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setIsSubmitting(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">댓글 {comments.length}개</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 포스트 정보 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h4 className="font-medium text-gray-900">{post.author.username}</h4>
              <p className="text-sm text-gray-500">{post.title}</p>
            </div>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">아직 댓글이 없습니다.</p>
              <p className="text-sm mt-2">첫 번째 댓글을 작성해보세요!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.username}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-base text-gray-900">
                        {comment.author.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 댓글 작성 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmitComment} className="flex space-x-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A6BFF] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-colors text-base',
                newComment.trim() && !isSubmitting
                  ? 'bg-[#3A6BFF] text-white hover:bg-[#2F5DCC]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              {isSubmitting ? '작성 중...' : '작성'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
