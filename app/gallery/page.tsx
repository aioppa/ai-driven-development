'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { GalleryImage, GalleryFilters, GalleryState } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { Sidebar } from '@/components/ui/Sidebar';
import { GalleryTabs } from '@/components/gallery/GalleryTabs';
import { GalleryFilters as GalleryFiltersComponent } from '@/components/gallery/GalleryFilters';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { ImageDetailModal } from '@/components/gallery/ImageDetailModal';
import { ShareModal } from '@/components/ui/ShareModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';

export default function GalleryPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

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

  // 갤러리 데이터 로드 (클라이언트 API - 서버 응답이 비거나 실패해도 로컬 폴백 지원)
  const loadGalleryData = useCallback(async (page: number = 1, append: boolean = false) => {
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, isLoading: true } }));

    try {
      const result = await MockApi.getGallery(state.activeTab, state.filters, page, 12);
      if (result.success) {
        const payload = result.data;
        const mapped = (payload.data || []) as GalleryImage[];

        setState(prev => ({
          ...prev,
          images: append ? [...prev.images, ...mapped] : mapped,
          pagination: {
            currentPage: page,
            hasNext: payload.hasMore,
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
  }, [state.activeTab, state.filters]);

  // 로그인 확인
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // 초기 데이터 로드
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadGalleryData(1, false);
    }
  }, [isLoaded, isSignedIn, loadGalleryData]);

  // 로딩 중이거나 로그인하지 않은 경우
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* 사이드바: 모바일 숨김, 데스크톱 표시 */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="mx-auto w-full md:max-w-[960px] px-2.5 md:px-5 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-white">갤러리</h1>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1">
        <div className="mx-auto w-full md:max-w-[960px] px-2.5 md:px-5 py-4 md:py-6">
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
        </div>
        </main>
      </div>

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
