'use client';

import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  imageUrl?: string;
  url?: string;
}

export function ShareModal({ isOpen, onClose, title, description, imageUrl, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const shareText = description ? `${title} - ${description}` : title;

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (error) {
        console.log('공유가 취소되었습니다.');
      }
    } else {
      // Web Share API를 지원하지 않는 경우 클립보드에 복사
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  const handleDownloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${title}.jpg`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 */}
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">공유하기</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 space-y-4">
          {/* 이미지 미리보기 */}
          {imageUrl && (
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt={title}
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}

          {/* 제목 */}
          <div className="text-center">
            <h3 className="text-white font-medium text-lg">{title}</h3>
            {description && (
              <p className="text-white/70 text-sm mt-1">{description}</p>
            )}
          </div>

          {/* 공유 옵션들 */}
          <div className="space-y-3">
            {/* 웹 공유 또는 링크 복사 */}
            <button
              onClick={handleWebShare}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-200 hover:text-blue-100 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="font-medium">
                {navigator.share ? '공유하기' : '링크 복사'}
              </span>
            </button>

            {/* 링크 복사 (Web Share API 지원 시) */}
            {navigator.share && (
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">
                  {copied ? '복사됨!' : '링크 복사'}
                </span>
              </button>
            )}

            {/* 이미지 다운로드 */}
            {imageUrl && (
              <button
                onClick={handleDownloadImage}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-200 hover:text-green-100 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">이미지 다운로드</span>
              </button>
            )}
          </div>

          {/* URL 표시 */}
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-white/50 text-xs mb-1">공유 URL:</p>
            <p className="text-white/70 text-sm break-all">{shareUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
