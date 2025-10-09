'use client';

import { GalleryImage } from '@/lib/types';
import { GalleryCard } from './GalleryCard';

interface GalleryGridProps {
  images: GalleryImage[];
  onImageSelect: (image: GalleryImage) => void;
  onVisibilityToggle: (imageId: string, isPublic: boolean) => void;
  onImageDelete: (imageId: string) => void;
  onImageShare?: (image: GalleryImage) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function GalleryGrid({
  images,
  onImageSelect,
  onVisibilityToggle,
  onImageDelete,
  onImageShare,
  onLoadMore,
  hasMore,
  isLoading,
}: GalleryGridProps) {
  if (images.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-white/50 text-lg mb-4">📷</div>
        <h3 className="text-white/70 text-xl font-medium mb-2">이미지가 없습니다</h3>
        <p className="text-white/50">
          아직 생성한 이미지가 없습니다. 
          <a href="/generate" className="text-blue-400 hover:text-blue-300 ml-1">
            이미지를 생성해보세요
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 이미지 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <GalleryCard
                key={image.id}
                image={image}
                onSelect={onImageSelect}
                onVisibilityToggle={onVisibilityToggle}
                onDelete={onImageDelete}
                onShare={onImageShare}
              />
            ))}
      </div>

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
}
