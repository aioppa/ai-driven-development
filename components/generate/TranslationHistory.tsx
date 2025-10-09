'use client';

import React, { useState, useEffect } from 'react';
import { TranslationHistory } from '@/lib/types';
import { TranslationHistoryService } from '@/lib/services/translationHistory';
import { cn } from '@/lib/utils';

interface TranslationHistoryProps {
  onSelectHistory: (history: TranslationHistory) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const TranslationHistoryComponent: React.FC<TranslationHistoryProps> = ({
  onSelectHistory,
  onClose,
  isOpen
}) => {
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<TranslationHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const historyService = new TranslationHistoryService();

  // 이력 로드
  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const historyData = await historyService.getHistory();
      setHistory(historyData);
      setFilteredHistory(historyData);
    } catch (err: any) {
      setError('번역 이력을 불러오는데 실패했습니다.');
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 이력 삭제
  const handleDeleteHistory = async (id: string) => {
    try {
      await historyService.deleteHistory(id);
      await loadHistory(); // 이력 다시 로드
    } catch (err: any) {
      setError('이력 삭제에 실패했습니다.');
      console.error('Failed to delete history:', err);
    }
  };

  // 모든 이력 삭제
  const handleClearAllHistory = async () => {
    if (window.confirm('모든 번역 이력을 삭제하시겠습니까?')) {
      try {
        await historyService.clearHistory();
        await loadHistory();
      } catch (err: any) {
        setError('이력 삭제에 실패했습니다.');
        console.error('Failed to clear history:', err);
      }
    }
  };

  // 검색 및 필터링
  useEffect(() => {
    let filtered = history;

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.original.toLowerCase().includes(query) ||
        item.translated.toLowerCase().includes(query)
      );
    }

    // 엔진 필터링
    if (selectedEngine !== 'all') {
      filtered = filtered.filter(item => item.engine === selectedEngine);
    }

    setFilteredHistory(filtered);
  }, [history, searchQuery, selectedEngine]);

  // 컴포넌트 마운트 시 이력 로드
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  // 엔진 아이콘 및 색상
  const getEngineInfo = (engine: string) => {
    switch (engine) {
      case 'naver':
        return { icon: '🌐', color: 'text-green-400', name: '네이버' };
      case 'mymemory':
        return { icon: '💾', color: 'text-blue-400', name: 'MyMemory' };
      case 'simple':
        return { icon: '📝', color: 'text-yellow-400', name: '간단번역' };
      default:
        return { icon: '❓', color: 'text-gray-400', name: '알 수 없음' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">번역 이력</h2>
              <p className="text-white/70 text-sm mt-1">
                총 {history.length}개의 번역 이력
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="p-6 border-b border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 검색 입력 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="번역 내용 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* 엔진 필터 */}
            <div className="flex gap-2">
              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30"
              >
                <option value="all">모든 엔진</option>
                <option value="naver">네이버</option>
                <option value="mymemory">MyMemory</option>
                <option value="simple">간단번역</option>
              </select>

              {/* 전체 삭제 버튼 */}
              {history.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                >
                  전체 삭제
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 이력 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-300">{error}</p>
              <button
                onClick={loadHistory}
                className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70">
                {searchQuery || selectedEngine !== 'all' 
                  ? '검색 결과가 없습니다.' 
                  : '번역 이력이 없습니다.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => {
                const engineInfo = getEngineInfo(item.engine);
                return (
                  <div
                    key={item.id}
                    className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{engineInfo.icon}</span>
                          <span className={`text-xs font-medium ${engineInfo.color}`}>
                            {engineInfo.name}
                          </span>
                          <span className="text-xs text-white/50">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-white/70 text-sm">원문:</p>
                            <p className="text-white text-sm">{item.original}</p>
                          </div>
                          <div>
                            <p className="text-white/70 text-sm">번역:</p>
                            <p className="text-white text-sm">{item.translated}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => onSelectHistory(item)}
                          className="px-3 py-1 bg-[#3A6BFF] text-white rounded-lg hover:bg-[#2F5DCC] transition-colors text-sm"
                        >
                          사용
                        </button>
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-1 text-white/50 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-white/20">
          <div className="flex items-center justify-between text-sm text-white/70">
            <p>최근 50개의 번역 이력이 저장됩니다.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
