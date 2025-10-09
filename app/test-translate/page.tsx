'use client';

import { useState } from 'react';
import { TranslationHistoryService } from '@/lib/services/translationHistory';
import { TranslationHistory } from '@/lib/types';

interface TranslationResult {
  engine: string;
  translated: string;
  responseTime: number;
  success: boolean;
  error?: string;
}

export default function TestTranslatePage() {
  const [text, setText] = useState('안녕하세요');
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const historyService = new TranslationHistoryService();

  // 번역 이력 로드
  const loadHistory = async () => {
    try {
      const historyData = await historyService.getHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // 모든 번역 엔진 테스트
  const testAllTranslations = async () => {
    setLoading(true);
    setResults([]);
    
    const engines = [
      { name: 'naver', url: '/api/translate', params: { text, source: 'ko', target: 'en' } },
      { name: 'mymemory', url: '/api/translate', params: { text, source: 'ko', target: 'en' } },
      { name: 'simple', url: '/api/translate', params: { text, source: 'ko', target: 'en' } }
    ];

    const promises = engines.map(async (engine) => {
      const startTime = Date.now();
      try {
        const response = await fetch(engine.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(engine.params),
        });

        const data = await response.json();
        const responseTime = Date.now() - startTime;

        return {
          engine: engine.name,
          translated: data.translated || '',
          responseTime,
          success: data.success || false,
          error: data.error
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        return {
          engine: engine.name,
          translated: '',
          responseTime,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.all(promises);
    setResults(results);
    setLoading(false);
  };

  // 엔진 정보 가져오기
  const getEngineInfo = (engine: string) => {
    switch (engine) {
      case 'naver':
        return { name: '네이버 Papago', color: 'text-green-400', icon: '🌐' };
      case 'mymemory':
        return { name: 'MyMemory', color: 'text-blue-400', icon: '💾' };
      case 'simple':
        return { name: '간단번역', color: 'text-yellow-400', icon: '📝' };
      default:
        return { name: '알 수 없음', color: 'text-gray-400', icon: '❓' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">번역 품질 비교 테스트</h1>
          <p className="text-white/70 text-lg">네이버, MyMemory, 간단번역 엔진의 성능을 비교해보세요</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 테스트 입력 영역 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">번역 테스트</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">한글 텍스트:</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 resize-none"
                  placeholder="번역할 한글 텍스트를 입력하세요"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={testAllTranslations}
                  disabled={loading || !text.trim()}
                  className="flex-1 px-4 py-3 bg-[#3A6BFF] hover:bg-[#2F5DCC] disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  {loading ? '번역 중...' : '모든 엔진 테스트'}
                </button>
                
                <button
                  onClick={() => {
                    setShowHistory(!showHistory);
                    if (!showHistory) loadHistory();
                  }}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  이력 보기
                </button>
              </div>
            </div>
          </div>

          {/* 결과 표시 영역 */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">번역 결과</h2>
            
            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/70">번역 테스트를 실행해보세요</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => {
                  const engineInfo = getEngineInfo(result.engine);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.success 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{engineInfo.icon}</span>
                          <span className={`font-medium ${engineInfo.color}`}>
                            {engineInfo.name}
                          </span>
                        </div>
                        <div className="text-sm text-white/60">
                          {result.responseTime}ms
                        </div>
                      </div>
                      
                      {result.success ? (
                        <div>
                          <p className="text-white/80 text-sm mb-1">번역 결과:</p>
                          <p className="text-white font-medium">{result.translated}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-red-300 text-sm">오류: {result.error}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 번역 이력 모달 */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-4xl max-h-[80vh] flex flex-col">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">번역 이력</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/70">번역 이력이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, 20).map((item) => {
                      const engineInfo = getEngineInfo(item.engine);
                      return (
                        <div
                          key={item.id}
                          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                        >
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
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
