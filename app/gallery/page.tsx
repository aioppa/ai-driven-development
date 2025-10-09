'use client';

import { useState, useEffect } from 'react';
import { GalleryImage, GalleryFilters, GalleryState } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { Header } from '@/components/ui/Header';
import { GalleryTabs } from '@/components/gallery/GalleryTabs';
import { GalleryFilters as GalleryFiltersComponent } from '@/components/gallery/GalleryFilters';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { ImageDetailModal } from '@/components/gallery/ImageDetailModal';
import { ShareModal } from '@/components/ui/ShareModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';

export default function GalleryPage() {
  const [state, setState] = useState<GalleryState>({
    activeTab: 'private',
    images: [],
    selectedImage: null,
    filters: {
      tags: [],
      category: '',
      sortBy: 'latest',
      searchQuery: '',
    },
    pagination: {
      currentPage: 1,
      hasNext: false,
      isLoading: false,
    },
    isDetailModalOpen: false,
    isEditing: false,
    error: null,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; image: GalleryImage | null }>({
    isOpen: false,
    image: null,
  });

  // 갤러리 데이터 로드
  const loadGalleryData = async (page: number = 1, append: boolean = false) => {
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, isLoading: true } }));
    
    try {
      const response = await MockApi.getGallery(
        state.activeTab,
        state.filters,
        page,
        12
      );

      if (response.success) {
        setState(prev => ({
          ...prev,
          images: append ? [...prev.images, ...response.data.data] : response.data.data,
          pagination: {
            currentPage: page,
            hasNext: response.data.hasMore,
            isLoading: false,
          },
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: '갤러리 데이터를 불러오는데 실패했습니다.',
          pagination: { ...prev.pagination, isLoading: false },
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '네트워크 오류가 발생했습니다.',
        pagination: { ...prev.pagination, isLoading: false },
      }));
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadGalleryData(1, false);
  }, [state.activeTab, state.filters]);

  // 탭 변경
  const handleTabChange = (tab: 'private' | 'public') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  // 필터 변경
  const handleFiltersChange = (filters: GalleryFilters) => {
    setState(prev => ({ ...prev, filters }));
  };

  // 이미지 선택
  const handleImageSelect = (image: GalleryImage) => {
    setState(prev => ({ ...prev, selectedImage: image, isDetailModalOpen: true }));
  };

  // 모달 닫기
  const handleModalClose = () => {
    setState(prev => ({ 
      ...prev, 
      isDetailModalOpen: false, 
      selectedImage: null, 
      isEditing: false 
    }));
  };

  // 이미지 편집
  const handleImageEdit = (imageId: string, updateData: any) => {
    // 편집 로직 구현
    setToast({ message: '이미지 정보가 수정되었습니다.', type: 'success' });
    loadGalleryData(1, false); // 데이터 새로고침
  };

  // 공개 상태 전환
  const handleVisibilityToggle = async (imageId: string, isPublic: boolean) => {
    try {
      const response = await MockApi.toggleGalleryVisibility(imageId, isPublic);
      if (response.success) {
        setToast({ 
          message: response.message || '상태가 변경되었습니다.', 
          type: 'success' 
        });
        loadGalleryData(1, false); // 데이터 새로고침
      } else {
        setToast({ message: '상태 변경에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: '네트워크 오류가 발생했습니다.', type: 'error' });
    }
  };

  // 이미지 삭제
  const handleImageDelete = async (imageId: string) => {
    if (!confirm('정말로 이 이미지를 삭제하시겠습니까?')) return;
    
    try {
      const response = await MockApi.deleteGalleryImage(imageId);
      if (response.success) {
        // UI에서 즉시 제거
        setState(prev => ({
          ...prev,
          images: prev.images.filter(img => img.id !== imageId),
          selectedImage: prev.selectedImage?.id === imageId ? null : prev.selectedImage,
        }));
        setToast({ message: '이미지가 삭제되었습니다.', type: 'success' });
        // 데이터 새로고침 (백업)
        loadGalleryData(1, false);
      } else {
        setToast({ message: '삭제에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: '네트워크 오류가 발생했습니다.', type: 'error' });
    }
  };

  // 무한 스크롤
  const handleLoadMore = () => {
    if (state.pagination.hasNext && !state.pagination.isLoading) {
      loadGalleryData(state.pagination.currentPage + 1, true);
    }
  };

  // 이미지 공유
  const handleImageShare = (image: GalleryImage) => {
    setShareModal({ isOpen: true, image });
  };

  // 공유 모달 닫기
  const handleShareModalClose = () => {
    setShareModal({ isOpen: false, image: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 헤더 */}
      <Header title="AIPixels" subtitle="갤러리" />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 메뉴 */}
        <GalleryTabs 
          activeTab={state.activeTab}
          onTabChange={handleTabChange}
        />

        {/* 필터 및 검색 */}
        <GalleryFiltersComponent
          filters={state.filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* 에러 메시지 */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{state.error}</p>
          </div>
        )}

        {/* 이미지 그리드 */}
        <GalleryGrid
          images={state.images}
          onImageSelect={handleImageSelect}
          onVisibilityToggle={handleVisibilityToggle}
          onImageDelete={handleImageDelete}
          onImageShare={handleImageShare}
          onLoadMore={handleLoadMore}
          hasMore={state.pagination.hasNext}
          isLoading={state.pagination.isLoading}
        />

        {/* 로딩 스피너 */}
        {state.pagination.isLoading && state.images.length === 0 && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </main>

      {/* 상세보기 모달 */}
      {state.selectedImage && (
        <ImageDetailModal
          image={state.selectedImage}
          isOpen={state.isDetailModalOpen}
          onClose={handleModalClose}
          onEdit={handleImageEdit}
          onVisibilityToggle={handleVisibilityToggle}
          onDelete={handleImageDelete}
        />
      )}

      {/* 공유 모달 */}
      {shareModal.isOpen && shareModal.image && (
        <ShareModal
          isOpen={shareModal.isOpen}
          onClose={handleShareModalClose}
          title={shareModal.image.title}
          description={shareModal.image.description}
          imageUrl={shareModal.image.imageUrl}
          url={`${window.location.origin}/gallery/${shareModal.image.id}`}
        />
      )}

      {/* 토스트 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
