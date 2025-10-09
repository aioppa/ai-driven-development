'use client';

import React from 'react';
import { ImageMetadata } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  onSave: () => void;
  onShare: () => void;
  metadata: ImageMetadata;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onShare,
  metadata,
}) => {
  const isFormValid = metadata.title.trim() && metadata.category;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* 저장 버튼 */}
        <Button
          onClick={onSave}
          disabled={!isFormValid}
          className={cn(
            'flex-1 sm:flex-none px-8 py-4 text-lg font-semibold transition-all duration-300',
            isFormValid
              ? 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
          )}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>갤러리에 저장</span>
          </div>
        </Button>

        {/* 공유 버튼 */}
        <Button
          onClick={onShare}
          disabled={!isFormValid}
          className={cn(
            'flex-1 sm:flex-none px-8 py-4 text-lg font-semibold transition-all duration-300',
            isFormValid
              ? 'bg-[#3A6BFF] hover:bg-[#2F5DCC] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
          )}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>커뮤니티 공유</span>
          </div>
        </Button>
      </div>

      {/* 버튼 설명 */}
      <div className="mt-4 text-center space-y-2">
        <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span>저장: 개인 갤러리에 비공개로 저장</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#3A6BFF] rounded-full"></div>
            <span>공유: 커뮤니티 피드에 공개</span>
          </div>
        </div>
        
        {!isFormValid && (
          <p className="text-yellow-400 text-sm">
            제목과 카테고리를 입력해야 저장/공유할 수 있습니다.
          </p>
        )}
      </div>

      {/* 추가 정보 */}
      <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <h4 className="text-white font-medium mb-2">💡 팁</h4>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• <strong>저장</strong>: 이미지를 개인 갤러리에 저장하여 나중에 다시 볼 수 있습니다.</li>
          <li>• <strong>공유</strong>: 다른 사용자들과 이미지를 공유하고 피드백을 받을 수 있습니다.</li>
          <li>• 저장 후에도 언제든지 공개 설정을 변경할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};
