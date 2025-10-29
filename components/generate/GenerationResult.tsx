'use client';

import React, { useState } from 'react';
import { GeneratedImage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ImageZoomModal } from './ImageZoomModal';

interface GenerationResultProps {
  images: GeneratedImage[];
  selectedImage: GeneratedImage | null;
  onImageSelect: (image: GeneratedImage) => void;
}

export const GenerationResult: React.FC<GenerationResultProps> = ({
  images,
  selectedImage,
  onImageSelect,
}) => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<GeneratedImage | null>(null);
  const [showZoomModal, setShowZoomModal] = useState(false);

  // 이미지 확대 핸들러
  const handleImageZoom = (image: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation(); // 선택 이벤트 방지
    setZoomImage(image);
    setShowZoomModal(true);
  };

  // 확대 모달 닫기
  const handleCloseZoomModal = () => {
    setShowZoomModal(false);
    setZoomImage(null);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* 결과 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">
            생성된 이미지 ({images.length}개)
          </h3>
          <p className="text-white/60 text-sm mt-1">
            원하는 이미지를 클릭하여 선택하세요
          </p>
        </div>
        
        {selectedImage && (
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>이미지 선택됨</span>
          </div>
        )}
      </div>

      {/* 이미지 그리드 - 50% 확대 */}
      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              'relative group cursor-pointer transition-all duration-300',
              selectedImage?.id === image.id
                ? 'transform scale-105'
                : 'hover:scale-105'
            )}
            onClick={() => onImageSelect(image)}
            onMouseEnter={() => setHoveredImage(image.id)}
            onMouseLeave={() => setHoveredImage(null)}
          >
            {/* 이미지 컨테이너 - 50% 확대 */}
            <div className={cn(
              'relative aspect-[4/3] rounded-xl overflow-hidden transition-all duration-300',
              selectedImage?.id === image.id
                ? 'ring-4 ring-[#3A6BFF] shadow-lg shadow-[#3A6BFF]/30'
                : 'ring-2 ring-white/20 hover:ring-white/40'
            )}>
              {/* 이미지 */}
              <img
                src={image.thumbnailUrl}
                alt={`Generated image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* 오버레이 */}
              <div className={cn(
                'absolute inset-0 transition-all duration-300',
                selectedImage?.id === image.id
                  ? 'bg-[#3A6BFF]/20'
                  : 'bg-black/0 group-hover:bg-black/30'
              )}>
                {/* 선택 표시 */}
                {selectedImage?.id === image.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-[#3A6BFF] rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* 호버 시 확대 아이콘 */}
                {hoveredImage === image.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={(e) => handleImageZoom(image, e)}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      title="이미지 확대 보기"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* 이미지 번호 */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 font-semibold text-sm shadow-lg">
              {index + 1}
            </div>
            
            {/* 프롬프트 미리보기 (호버 시) */}
            {hoveredImage === image.id && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/80 backdrop-blur-sm rounded-b-xl">
                <p className="text-white text-xs line-clamp-2">
                  {image.prompt}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 선택된 이미지 정보 */}
      {selectedImage && (
        <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={selectedImage.thumbnailUrl}
                alt="Selected image"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium mb-2">선택된 이미지</h4>
              <p className="text-white/70 text-sm line-clamp-3">
                {selectedImage.prompt}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-white/60">
                <span>생성 시간: {new Date(selectedImage.createdAt).toLocaleTimeString()}</span>
                <span>스타일 ID: {selectedImage.styleId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 액션 힌트 */}
      <div className="mt-4 text-center">
        <p className="text-white/60 text-sm">
          이미지를 선택한 후 아래에서 제목과 태그를 입력하세요
        </p>
        <p className="text-white/50 text-xs mt-1">
          이미지에 마우스를 올리면 확대 아이콘이 나타납니다
        </p>
      </div>

      {/* 이미지 확대 모달 */}
      <ImageZoomModal
        image={zoomImage}
        isOpen={showZoomModal}
        onClose={handleCloseZoomModal}
      />
    </div>
  );
};
