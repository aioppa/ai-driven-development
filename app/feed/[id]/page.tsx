'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImagePost, Comment } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { CommentModal } from '@/components/feed/CommentModal';
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

  const handleShare = async () => {
    if (!post) return;
    
    const shareData = {
      title: post.title,
      text: post.description || post.title,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        console.log('공유가 취소되었습니다.');
      }
    } else {
      // Web Share API를 지원하지 않는 경우 클립보드에 복사
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      } catch (error) {
        console.error('클립보드 복사 실패:', error);
      }
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6BFF]"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">오류</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#3A6BFF] text-white px-6 py-3 rounded-lg hover:bg-[#2F5DCC] transition-colors"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#3A6BFF] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">AIPixels</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/gallery" className="text-gray-600 hover:text-[#3A6BFF] transition-colors">
                갤러리
              </Link>
              <Link href="/feed" className="text-gray-600 hover:text-[#3A6BFF] transition-colors">
                커뮤니티
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측: 이미지 섹션 */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => window.open(post.imageUrl, '_blank')}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors"
                  title="이미지 확대"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare()}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors"
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
          <div className="space-y-6">
            {/* 작성자 정보 */}
            <div className="flex items-center space-x-3">
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{post.author.username}</h3>
                <p className="text-sm text-gray-500">
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
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">프롬프트</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{post.prompt}</p>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-6 py-4 border-t border-gray-200">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  'flex items-center space-x-2 text-lg transition-colors',
                  isLiked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-500 hover:text-red-500'
                )}
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
                <span className="font-medium">{likes}</span>
              </button>

              <button 
                onClick={() => setIsCommentModalOpen(true)}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 text-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 text-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="font-medium">공유</span>
              </button>
            </div>

            {/* 댓글 작성 */}
            <div className="space-y-4">
              <form onSubmit={handleSubmitComment} className="flex space-x-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A6BFF] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className={cn(
                    'px-6 py-3 rounded-lg font-medium transition-colors text-base',
                    newComment.trim() && !isSubmittingComment
                      ? 'bg-[#3A6BFF] text-white hover:bg-[#2F5DCC]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  {isSubmittingComment ? '작성 중...' : '작성'}
                </button>
              </form>

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-lg">아직 댓글이 없습니다.</p>
                    <p className="text-sm mt-2">첫 번째 댓글을 작성해보세요!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.username}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {comment.author.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

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
