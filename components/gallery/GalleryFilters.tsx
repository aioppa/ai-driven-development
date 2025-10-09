'use client';

import { useState, useEffect } from 'react';
import { GalleryFilters as GalleryFiltersType } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { Input } from '@/components/ui/Input';

interface GalleryFiltersProps {
  filters: GalleryFiltersType;
  onFiltersChange: (filters: GalleryFiltersType) => void;
}

export function GalleryFilters({ filters, onFiltersChange }: GalleryFiltersProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories] = useState([
    { id: '', name: '전체' },
    { id: '인물', name: '인물' },
    { id: '풍경', name: '풍경' },
    { id: '동물', name: '동물' },
    { id: '건축', name: '건축' },
    { id: '추상', name: '추상' },
    { id: '기타', name: '기타' },
  ]);

  // 태그 목록 로드
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await MockApi.getGalleryTags();
        if (response.success) {
          setAvailableTags(response.data);
        }
      } catch (error) {
        console.error('태그 로드 실패:', error);
      }
    };
    loadTags();
  }, []);

  // 검색어 변경
  const handleSearchChange = (searchQuery: string) => {
    onFiltersChange({ ...filters, searchQuery });
  };

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  // 정렬 변경
  const handleSortChange = (sortBy: 'latest' | 'oldest' | 'likes' | 'title') => {
    onFiltersChange({ ...filters, sortBy });
  };

  // 태그 추가
  const handleTagAdd = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      onFiltersChange({ ...filters, tags: [...filters.tags, tag] });
    }
  };

  // 태그 제거
  const handleTagRemove = (tagToRemove: string) => {
    onFiltersChange({ 
      ...filters, 
      tags: filters.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* 검색 및 필터 행 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 검색창 */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="이미지 제목, 설명, 태그로 검색..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* 카테고리 선택 */}
        <div className="lg:w-48">
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableCategories.map(category => (
              <option key={category.id} value={category.id} className="bg-slate-800 text-white">
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 정렬 선택 */}
        <div className="lg:w-48">
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="latest" className="bg-slate-800 text-white">최신순</option>
            <option value="oldest" className="bg-slate-800 text-white">오래된순</option>
            <option value="likes" className="bg-slate-800 text-white">좋아요순</option>
            <option value="title" className="bg-slate-800 text-white">제목순</option>
          </select>
        </div>
      </div>

      {/* 태그 필터 */}
      {availableTags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white/70 text-sm font-medium">태그 필터</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.slice(0, 20).map(tag => (
              <button
                key={tag}
                onClick={() => handleTagAdd(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                  filters.tags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 태그 */}
      {filters.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-white/70 text-sm font-medium">선택된 태그</h3>
          <div className="flex flex-wrap gap-2">
            {filters.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-200 border border-blue-500/30"
              >
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-blue-300 hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
