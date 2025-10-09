'use client';

interface GalleryTabsProps {
  activeTab: 'private' | 'public';
  onTabChange: (tab: 'private' | 'public') => void;
}

export function GalleryTabs({ activeTab, onTabChange }: GalleryTabsProps) {
  return (
    <div className="mb-8">
      <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1">
        <button
          onClick={() => onTabChange('private')}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'private'
              ? 'bg-white text-slate-900 shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          내 갤러리
        </button>
        <button
          onClick={() => onTabChange('public')}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'public'
              ? 'bg-white text-slate-900 shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          공개 이미지
        </button>
      </div>
    </div>
  );
}
