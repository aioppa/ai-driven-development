'use client';

import React, { useState, useEffect } from 'react';
import { GeneratedImage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ImageZoomModalProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  image,
  isOpen,
  onClose
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(2.0); // 기본적으로 2배 확대된 상태로 시작
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
      
      // body 스크롤 차단
      document.body.style.overflow = 'hidden';
    } else {
      // body 스크롤 복원
      document.body.style.overflow = 'unset';
    }
    
    // cleanup 함수
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 이미지 로드 완료 시
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // 줌 인/아웃
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(2.0); // 리셋 시에도 2배로 설정
    setPosition({ x: 0, y: 0 });
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1.2) { // 1.2배 이상일 때만 드래그 가능
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1.2) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 휠 줌
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

  // 키보드 이벤트 및 휠 이벤트 차단
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
      }
    };

    // 모달 외부에서의 휠 이벤트 차단
    const handleWheelBlock = (e: WheelEvent) => {
      if (isOpen) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 터치 이벤트 차단 (모바일에서의 스크롤 방지)
    const handleTouchMove = (e: TouchEvent) => {
      if (isOpen) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('wheel', handleWheelBlock, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheelBlock);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
      onClick={(e) => {
        // 모달 외부 클릭 시 닫기
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-6xl h-[90vh] flex flex-col bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300"
        onWheel={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm rounded-t-2xl border-b border-white/10">
          <div className="flex items-center space-x-4">
            <h3 className="text-white font-semibold">이미지 확대 보기</h3>
            <div className="flex items-center space-x-2 text-white/70 text-sm">
              <span>줌: {Math.round(zoomLevel * 100)}%</span>
              <span>•</span>
              <span>스타일: {image.styleId}</span>
              <span>•</span>
              <span className="text-green-400">확대 보기</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 줌 컨트롤 */}
            <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title="줌 아웃 (-)"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <button
                onClick={handleResetZoom}
                className="px-3 py-2 text-white text-sm hover:bg-white/20 rounded transition-colors"
                title="줌 리셋 (0)"
              >
                200%
              </button>
              
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title="줌 인 (+)"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded transition-colors"
              title="닫기 (ESC)"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 이미지 컨테이너 */}
        <div 
          className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchMove={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          onTouchEnd={(e) => e.preventDefault()}
          style={{ minHeight: '45vh', maxHeight: '60vh' }}
        >
          {/* 로딩 스피너 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* 이미지 */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out',
              isDragging ? 'cursor-grabbing' : zoomLevel > 1.2 ? 'cursor-grab' : 'cursor-default'
            )}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center'
            }}
          >
            <div className="relative">
              <img
                src={image.url}
                alt={image.prompt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onLoad={handleImageLoad}
                onMouseDown={handleMouseDown}
                draggable={false}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '70vh'
                }}
              />
              {/* 이미지 테두리 효과 */}
              <div className="absolute inset-0 rounded-lg border-2 border-white/10 pointer-events-none"></div>
            </div>
          </div>

          {/* 줌 레벨 표시 */}
          {zoomLevel !== 2.0 && (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <span className="text-white text-sm font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        <div className="p-4 bg-black/30 backdrop-blur-sm rounded-b-2xl border-t border-white/10 overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div className="w-full">
            <h4 className="text-white font-medium mb-2">프롬프트</h4>
            <p className="text-white/80 text-sm leading-relaxed break-words">
              {image.prompt}
            </p>
            {image.originalPrompt && image.originalPrompt !== image.prompt && (
              <div className="mt-3">
                <h5 className="text-white/70 text-xs font-medium mb-1">원본 프롬프트</h5>
                <p className="text-white/60 text-xs leading-relaxed break-words">
                  {image.originalPrompt}
                </p>
              </div>
            )}
            
            <div className="mt-3 text-white/60 text-xs space-y-1">
              <div>생성 시간: {new Date(image.createdAt).toLocaleString()}</div>
              <div>스타일 ID: {image.styleId}</div>
              {image.predictionId && (
                <div>예측 ID: {image.predictionId}</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
