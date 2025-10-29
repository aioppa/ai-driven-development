'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ImagePost, Comment } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { Sidebar } from '@/components/ui/Sidebar';
import { CommentModal } from '@/components/feed/CommentModal';
import { ShareModal } from '@/components/ui/ShareModal';
import { cn } from '@/lib/utils';

export default function FeedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<ImagePost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        // 목업 데이터에서 해당 ID의 포스트 찾기
        const response = await MockApi.getFeed({ sortBy: 'latest' }, 1, 12);
        if (response.success) {
          const foundPost = response.data.data.find(p => p.id === params.id);
          if (foundPost) {
            setPost(foundPost);
            setIsLiked(foundPost.isLiked);
            setLikes(foundPost.likes);
            // 목업 댓글 데이터 로드
            setComments([
              {
                id: '1',
                content: '정말 멋진 이미지네요! 프롬프트가 인상적입니다.',
                author: {
                  id: '4',
                  username: '아트러버',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                  createdAt: new Date('2024-02-15'),
                },
                postId: foundPost.id,
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
                postId: foundPost.id,
                createdAt: new Date('2024-03-15T14:20:00'),
              },
            ]);
          } else {
            setError('포스트를 찾을 수 없습니다.');
          }
        } else {
          setError('포스트를 불러올 수 없습니다.');
        }
      } catch {
        setError('오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadPost();
    }
  }, [params.id]);

  const handleLike = async () => {
    if (isLiking || !post) return;
    
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

  const handleClonePrompt = async () => {
    if (!post) return;
    
    try {
      const response = await MockApi.clonePrompt(post.id);
      if (response.success) {
        // 메인 페이지로 이동하면서 프롬프트 전달
        router.push(`/?prompt=${encodeURIComponent(response.data.prompt)}`);
      }
    } catch (error) {
      console.error('프롬프트 복제 중 오류:', error);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !post) return;

    setIsSubmittingComment(true);
    
    // 목업 댓글 추가
    const comment = {
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
    setIsSubmittingComment(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">오류</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-black/50 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">상세페이지</h1>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측: 이미지 섹션 */}
          <div className="space-y-4">
            <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-auto"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => window.open(post.imageUrl, '_blank')}
                  className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                  title="이미지 확대"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare()}
                  className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                  title="공유하기"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 우측: 상세 정보 및 댓글 섹션 */}
          <div className="flex flex-col space-y-3">
            {/* 작성자 정보 */}
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-white text-base">{post.author.username}</h3>
                <p className="text-xs text-white/70">
                  {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* 프롬프트 섹션 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <h4 className="text-base font-semibold text-white mb-2">프롬프트</h4>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/80 text-sm leading-relaxed">{post.prompt}</p>
              </div>
            </div>

            {/* 태그 섹션 */}
            {post.tags && post.tags.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <h4 className="text-base font-semibold text-white mb-2">태그</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-medium hover:bg-blue-500/30 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-4 py-2 border-t border-white/10">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  'flex items-center space-x-1.5 text-sm transition-colors',
                  isLiked
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-white/70 hover:text-red-400'
                )}
              >
                <svg
                  className={cn('w-5 h-5', isLiked && 'fill-current')}
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
                <span className="font-medium">{likes}</span>
              </button>

              <button 
                onClick={() => setIsCommentModalOpen(true)}
                className="flex items-center space-x-1.5 text-white/70 hover:text-white text-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="font-medium">{comments.length}</span>
              </button>

              <button
                onClick={() => handleShare()}
                className="flex items-center space-x-1.5 text-white/70 hover:text-white text-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="font-medium text-xs">공유</span>
              </button>
            </div>

            {/* 댓글 작성 및 목록 */}
            <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 min-h-0">
              <form onSubmit={handleSubmitComment} className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50 text-sm"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-colors text-sm',
                    newComment.trim() && !isSubmittingComment
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                  )}
                >
                  {isSubmittingComment ? '작성 중...' : '작성'}
                </button>
              </form>

              {/* 댓글 목록 */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 600px)' }}>
                {comments.length === 0 ? (
                  <div className="text-center text-white/50 py-6">
                    <p className="text-base">아직 댓글이 없습니다.</p>
                    <p className="text-xs mt-1">첫 번째 댓글을 작성해보세요!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-2">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.username}
                        className="w-7 h-7 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-0.5">
                          <span className="font-medium text-xs text-white">
                            {comment.author.username}
                          </span>
                          <span className="text-xs text-white/50">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>

      {/* 공유 모달 */}
      {showShareModal && post && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={post.title}
          description={post.description || post.prompt}
          imageUrl={post.imageUrl}
          url={window.location.href}
        />
      )}

      {/* 댓글 모달 */}
      {post && (
        <CommentModal
          post={post}
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
        />
      )}
    </div>
  );
}
