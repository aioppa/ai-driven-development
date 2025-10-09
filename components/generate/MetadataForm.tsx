'use client';

import React, { useState, useEffect } from 'react';
import { ImageMetadata } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { cn } from '@/lib/utils';

interface MetadataFormProps {
  metadata: ImageMetadata;
  onMetadataChange: (metadata: ImageMetadata) => void;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({
  metadata,
  onMetadataChange,
}) => {
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  // 인기 태그 로드
  useEffect(() => {
    const loadPopularTags = async () => {
      try {
        const response = await MockApi.getPopularTags();
        if (response.success) {
          setPopularTags(response.data);
        }
      } catch (error) {
        console.error('태그 로드 실패:', error);
      }
    };

    loadPopularTags();
  }, []);

  // 태그 입력 필터링
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = popularTags.filter(tag =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !metadata.tags.includes(tag)
      );
      setFilteredTags(filtered.slice(0, 5));
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  }, [tagInput, popularTags, metadata.tags]);

  const handleTitleChange = (title: string) => {
    onMetadataChange({
      ...metadata,
      title: title.slice(0, 50),
    });
  };

  const handleDescriptionChange = (description: string) => {
    onMetadataChange({
      ...metadata,
      description: description.slice(0, 200),
    });
  };

  const handleCategoryChange = (category: string) => {
    onMetadataChange({
      ...metadata,
      category,
    });
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !metadata.tags.includes(trimmedTag) && metadata.tags.length < 10) {
      onMetadataChange({
        ...metadata,
        tags: [...metadata.tags, trimmedTag],
      });
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onMetadataChange({
      ...metadata,
      tags: metadata.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    }
  };

  const categories = [
    { id: '인물', name: '인물' },
    { id: '풍경', name: '풍경' },
    { id: '캐릭터', name: '캐릭터' },
    { id: '배경', name: '배경' },
    { id: '추상', name: '추상' },
    { id: '기타', name: '기타' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 제목 입력 */}
      <div>
        <label className="block text-white font-medium mb-2">
          제목 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={metadata.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="이미지 제목을 입력하세요"
          maxLength={50}
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#3A6BFF] focus:border-transparent transition-all duration-200"
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-white/60 text-sm">최대 50자</span>
          <span className="text-white/60 text-sm">{metadata.title.length}/50</span>
        </div>
      </div>

      {/* 설명 입력 */}
      <div>
        <label className="block text-white font-medium mb-2">
          설명
        </label>
        <textarea
          value={metadata.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="이미지에 대한 설명을 입력하세요"
          maxLength={200}
          rows={3}
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#3A6BFF] focus:border-transparent transition-all duration-200 resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-white/60 text-sm">최대 200자</span>
          <span className="text-white/60 text-sm">{metadata.description.length}/200</span>
        </div>
      </div>

      {/* 태그 입력 */}
      <div>
        <label className="block text-white font-medium mb-2">
          태그 <span className="text-white/60 text-sm">(최대 10개)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            onFocus={() => tagInput.trim() && setShowTagSuggestions(true)}
            placeholder="태그를 입력하고 Enter를 누르세요"
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#3A6BFF] focus:border-transparent transition-all duration-200"
          />
          
          {/* 태그 자동완성 */}
          {showTagSuggestions && filteredTags.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-10">
              {filteredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* 입력된 태그들 */}
        {metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {metadata.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-[#3A6BFF]/20 text-[#3A6BFF] rounded-full text-sm border border-[#3A6BFF]/30"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400 transition-colors duration-150"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-2 text-white/60 text-sm">
          {metadata.tags.length}/10개 태그
        </div>
      </div>

      {/* 카테고리 선택 */}
      <div>
        <label className="block text-white font-medium mb-2">
          카테고리 <span className="text-red-400">*</span>
        </label>
        <select
          value={metadata.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3A6BFF] focus:border-transparent transition-all duration-200"
        >
          <option value="" className="bg-gray-800 text-white">카테고리를 선택하세요</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id} className="bg-gray-800 text-white">
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* 입력 완료 상태 */}
      <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <div className="flex items-center space-x-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            metadata.title.trim() ? 'bg-green-400' : 'bg-gray-400'
          )} />
          <span className="text-white/70 text-sm">제목</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            metadata.category ? 'bg-green-400' : 'bg-gray-400'
          )} />
          <span className="text-white/70 text-sm">카테고리</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            metadata.tags.length > 0 ? 'bg-green-400' : 'bg-gray-400'
          )} />
          <span className="text-white/70 text-sm">태그</span>
        </div>
      </div>
    </div>
  );
};
