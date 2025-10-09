'use client';

import { useState } from 'react';
import { GalleryImage, GalleryUpdateRequest } from '@/lib/types';
import { ShareModal } from '@/components/ui/ShareModal';
import { MockApi } from '@/lib/api/mockApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ImageDetailModalProps {
  image: GalleryImage;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (imageId: string, updateData: GalleryUpdateRequest) => void;
  onVisibilityToggle: (imageId: string, isPublic: boolean) => void;
  onDelete: (imageId: string) => void;
}

export function ImageDetailModal({
  image,
  isOpen,
  onClose,
  onEdit,
  onVisibilityToggle,
  onDelete,
}: ImageDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editData, setEditData] = useState({
    title: image.title,
    description: image.description,
    tags: image.tags.join(', '),
    category: image.category,
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: GalleryUpdateRequest = {
        title: editData.title,
        description: editData.description,
        tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        category: editData.category,
      };

      const response = await MockApi.updateGalleryImage(image.id, updateData);
      if (response.success) {
        onEdit(image.id, updateData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: image.title,
      description: image.description,
      tags: image.tags.join(', '),
      category: image.category,
    });
    setIsEditing(false);
  };

  const handleVisibilityToggle = () => {
    onVisibilityToggle(image.id, !image.isPublic);
  };

  const handleDelete = () => {
    if (confirm('정말로 이 이미지를 삭제하시겠습니까?')) {
      onDelete(image.id);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* 이미지 영역 */}
          <div className="lg:w-1/2 p-6">
            <div className="relative">
              <img
                src={image.imageUrl}
                alt={image.title}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
              
              {/* 다운로드 버튼 */}
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = image.imageUrl;
                  link.download = `${image.title}.jpg`;
                  link.click();
                }}
                className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                title="다운로드"
              >
                ⬇️
              </button>
            </div>
          </div>

          {/* 정보 영역 */}
          <div className="lg:w-1/2 p-6 flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? '이미지 편집' : '이미지 상세'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 편집 폼 */}
            <div className="flex-1 space-y-6 overflow-y-auto">
              {/* 제목 */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  제목
                </label>
                {isEditing ? (
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="이미지 제목을 입력하세요"
                    maxLength={50}
                  />
                ) : (
                  <p className="text-white text-lg">{image.title}</p>
                )}
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  설명
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="이미지에 대한 설명을 입력하세요"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={200}
                  />
                ) : (
                  <p className="text-white/80">{image.description || '설명이 없습니다.'}</p>
                )}
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  태그
                </label>
                {isEditing ? (
                  <Input
                    value={editData.tags}
                    onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                    placeholder="태그를 쉼표로 구분하여 입력하세요"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {image.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm border border-blue-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  카테고리
                </label>
                {isEditing ? (
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="인물" className="bg-slate-800">인물</option>
                    <option value="풍경" className="bg-slate-800">풍경</option>
                    <option value="동물" className="bg-slate-800">동물</option>
                    <option value="건축" className="bg-slate-800">건축</option>
                    <option value="추상" className="bg-slate-800">추상</option>
                    <option value="기타" className="bg-slate-800">기타</option>
                  </select>
                ) : (
                  <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                    {image.category}
                  </span>
                )}
              </div>

              {/* 통계 */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  통계
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{image.stats.views}</div>
                    <div className="text-white/70 text-sm">조회수</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{image.stats.likes}</div>
                    <div className="text-white/70 text-sm">좋아요</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{image.stats.comments}</div>
                    <div className="text-white/70 text-sm">댓글</div>
                  </div>
                </div>
              </div>

              {/* 날짜 정보 */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  생성일
                </label>
                <p className="text-white/80">{formatDate(image.createdAt)}</p>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    취소
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setShowShareModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    공유
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    편집
                  </Button>
                  <Button
                    onClick={handleVisibilityToggle}
                    className={`${
                      image.isPublic
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    {image.isPublic ? '비공개로 변경' : '공개로 변경'}
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    삭제
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 공유 모달 */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={image.title}
          description={image.description}
          imageUrl={image.imageUrl}
          url={`${window.location.origin}/gallery/${image.id}`}
        />
      )}
    </div>
  );
}
