import { TranslationHistory } from '@/lib/types';

export class TranslationHistoryService {
  private readonly STORAGE_KEY = 'translationHistory';
  private readonly MAX_HISTORY_SIZE = 50;

  // 번역 이력 저장
  async saveHistory(history: Omit<TranslationHistory, 'id' | 'timestamp'>): Promise<TranslationHistory> {
    const newHistory: TranslationHistory = {
      ...history,
      id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    if (typeof window !== 'undefined') {
      try {
        const existingHistory = await this.getHistory();
        const updatedHistory = [newHistory, ...existingHistory].slice(0, this.MAX_HISTORY_SIZE);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to save translation history:', error);
        throw error;
      }
    }

    return newHistory;
  }

  // 번역 이력 조회
  async getHistory(): Promise<TranslationHistory[]> {
    if (typeof window !== 'undefined') {
      try {
        const history = localStorage.getItem(this.STORAGE_KEY);
        return history ? JSON.parse(history) : [];
      } catch (error) {
        console.error('Failed to get translation history:', error);
        return [];
      }
    }
    return [];
  }

  // 특정 이력 조회
  async getHistoryById(id: string): Promise<TranslationHistory | null> {
    const history = await this.getHistory();
    return history.find(item => item.id === id) || null;
  }

  // 번역 이력 삭제
  async deleteHistory(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const existingHistory = await this.getHistory();
        const updatedHistory = existingHistory.filter(item => item.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to delete translation history:', error);
        throw error;
      }
    }
  }

  // 모든 이력 삭제
  async clearHistory(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear translation history:', error);
        throw error;
      }
    }
  }

  // 번역 이력 검색
  async searchHistory(query: string): Promise<TranslationHistory[]> {
    const history = await this.getHistory();
    const lowercaseQuery = query.toLowerCase();
    
    return history.filter(item => 
      item.original.toLowerCase().includes(lowercaseQuery) ||
      item.translated.toLowerCase().includes(lowercaseQuery)
    );
  }

  // 엔진별 이력 조회
  async getHistoryByEngine(engine: 'naver' | 'mymemory' | 'simple'): Promise<TranslationHistory[]> {
    const history = await this.getHistory();
    return history.filter(item => item.engine === engine);
  }

  // 최근 이력 조회 (지정된 개수만큼)
  async getRecentHistory(limit: number = 10): Promise<TranslationHistory[]> {
    const history = await this.getHistory();
    return history.slice(0, limit);
  }

  // 이력 통계 조회
  async getHistoryStats(): Promise<{
    total: number;
    byEngine: Record<string, number>;
    byDate: Record<string, number>;
  }> {
    const history = await this.getHistory();
    
    const byEngine = history.reduce((acc, item) => {
      acc[item.engine] = (acc[item.engine] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDate = history.reduce((acc, item) => {
      const date = new Date(item.timestamp).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: history.length,
      byEngine,
      byDate
    };
  }

  // 이력 내보내기 (JSON 형식)
  async exportHistory(): Promise<string> {
    const history = await this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  // 이력 가져오기 (JSON 형식)
  async importHistory(jsonData: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const importedHistory = JSON.parse(jsonData);
        
        // 데이터 유효성 검사
        if (!Array.isArray(importedHistory)) {
          throw new Error('Invalid history format');
        }

        // 기존 이력과 병합
        const existingHistory = await this.getHistory();
        const mergedHistory = [...importedHistory, ...existingHistory]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, this.MAX_HISTORY_SIZE);

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedHistory));
      } catch (error) {
        console.error('Failed to import translation history:', error);
        throw error;
      }
    }
  }

  // 이력 백업 (클라우드 저장소 연동 시 사용)
  async backupHistory(): Promise<{
    data: TranslationHistory[];
    timestamp: number;
    version: string;
  }> {
    const history = await this.getHistory();
    return {
      data: history,
      timestamp: Date.now(),
      version: '1.0.0'
    };
  }

  // 이력 복원
  async restoreHistory(backup: {
    data: TranslationHistory[];
    timestamp: number;
    version: string;
  }): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        // 데이터 유효성 검사
        if (!Array.isArray(backup.data)) {
          throw new Error('Invalid backup format');
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backup.data));
      } catch (error) {
        console.error('Failed to restore translation history:', error);
        throw error;
      }
    }
  }
}
