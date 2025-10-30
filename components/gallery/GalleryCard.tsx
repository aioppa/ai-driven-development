'use client';

import { useState } from 'react';
import { GalleryImage } from '@/lib/types';
import { ImageZoomModal } from '../generate/ImageZoomModal';

interface GalleryCardProps {
  image: GalleryImage;
  onSelect: (image: GalleryImage) => void;
  onVisibilityToggle: (imageId: string, isPublic: boolean) => void;
  onDelete: (imageId: string) => void;
  onShare?: (image: GalleryImage) => void;
}

export function GalleryCard({ image, onSelect, onVisibilityToggle, onDelete, onShare }: GalleryCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

  const handleVisibilityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVisibilityToggle(image.id, !image.isPublic);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(image.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(image);
    }
  };

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowZoomModal(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(image)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 이미지 */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={image.thumbnailUrl}
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* 상태 표시 */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              image.isPublic
                ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
            }`}
          >
            {image.isPublic ? '공개' : '비공개'}
          </span>
        </div>

        {/* 확대 버튼 (항상 표시) */}
        <div className="absolute bottom-3 right-3">
          <button
            onClick={handleZoom}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
            title="이미지 확대 보기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>

        {/* 액션 버튼들 */}
        {showActions && (
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={handleShare}
              className="p-2 bg-blue-500/50 backdrop-blur-sm rounded-lg text-white hover:bg-blue-500/70 transition-colors"
              title="공유"
            >
              📤
            </button>
            <button
              onClick={handleVisibilityToggle}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
              title={image.isPublic ? '비공개로 변경' : '공개로 변경'}
            >
              {image.isPublic ? '🔒' : '🌐'}
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-500/50 backdrop-blur-sm rounded-lg text-white hover:bg-red-500/70 transition-colors"
              title="삭제"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4 space-y-3">
        {/* 제목 */}
        <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-blue-300 transition-colors">
          {image.title}
        </h3>

        {/* 태그 */}
        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {image.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 rounded text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
            {image.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/50">
                +{image.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 통계 및 날짜 */}
        <div className="flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center space-x-3">
            <span>👁️ {image.stats.views}</span>
            <span>❤️ {image.stats.likes}</span>
            <span>💬 {image.stats.comments}</span>
          </div>
          <span>{formatDate(image.createdAt)}</span>
        </div>
      </div>

      {/* 이미지 확대 모달 */}
      <ImageZoomModal
        image={showZoomModal ? {
          id: image.id,
          url: image.imageUrl,
          thumbnailUrl: image.thumbnailUrl,
          prompt: image.title,
          originalPrompt: image.description,
          styleId: 'gallery',
          createdAt: image.createdAt,
          predictionId: undefined
        } : null}
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
      />
    </div>
  );
}
