import { TranslationRequest, TranslationResponse, TranslationHistory } from '@/lib/types';

// 번역 엔진 인터페이스
interface TranslationEngine {
  name: string;
  priority: number;
  translate(request: TranslationRequest): Promise<TranslationResponse>;
  isAvailable(): boolean;
}

// 네이버 Papago 번역 서비스
export class NaverTranslationService implements TranslationEngine {
  name = 'naver';
  priority = 1;

  isAvailable(): boolean {
    return !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET);
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    if (!this.isAvailable()) {
      throw new Error('Naver API credentials not configured');
    }

    const { text, source = 'ko', target = 'en' } = request;
    
    try {
      const response = await fetch('https://openapi.naver.com/v1/papago/n2mt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!
        },
        body: new URLSearchParams({
          source,
          target,
          text
        })
      });

      if (!response.ok) {
        throw new Error(`Naver API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.message?.result?.translatedText) {
        return {
          translated: result.message.result.translatedText,
          original: text,
          isTranslated: true,
          success: true,
          engine: 'naver'
        };
      } else {
        throw new Error('Invalid response from Naver API');
      }
    } catch (error: any) {
      console.error('Naver translation failed:', error);
      throw new Error(`Naver translation failed: ${error.message}`);
    }
  }
}

// MyMemory 번역 서비스
export class MyMemoryTranslationService implements TranslationEngine {
  name = 'mymemory';
  priority = 2;

  isAvailable(): boolean {
    return true; // MyMemory는 항상 사용 가능
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, source = 'ko', target = 'en' } = request;
    
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`MyMemory API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.responseStatus === 200 && result.responseData?.translatedText) {
        return {
          translated: result.responseData.translatedText,
          original: text,
          isTranslated: true,
          success: true,
          engine: 'mymemory'
        };
      } else {
        throw new Error(`MyMemory error: ${result.responseDetails || 'Translation failed'}`);
      }
    } catch (error: any) {
      console.error('MyMemory translation failed:', error);
      throw new Error(`MyMemory translation failed: ${error.message}`);
    }
  }
}

// 간단한 번역 서비스 (백업용)
export class SimpleTranslationService implements TranslationEngine {
  name = 'simple';
  priority = 3;

  isAvailable(): boolean {
    return true; // 항상 사용 가능
  }

  // 간단한 한글-영어 매핑
  private simpleTranslations: Record<string, string> = {
    '안녕하세요': 'Hello',
    '안녕': 'Hi',
    '고마워': 'Thank you',
    '고마워요': 'Thank you',
    '감사합니다': 'Thank you',
    '죄송합니다': 'Sorry',
    '미안해': 'Sorry',
    '미안해요': 'Sorry',
    '사과': 'Apple',
    '고양이': 'Cat',
    '개': 'Dog',
    '물': 'Water',
    '불': 'Fire',
    '하늘': 'Sky',
    '땅': 'Ground',
    '산': 'Mountain',
    '바다': 'Sea',
    '강': 'River',
    '나무': 'Tree',
    '꽃': 'Flower',
    '집': 'House',
    '학교': 'School',
    '병원': 'Hospital',
    '음식': 'Food',
    '밥': 'Rice',
    '빵': 'Bread',
    '우유': 'Milk',
    '커피': 'Coffee',
    '차': 'Tea',
    '사람': 'Person',
    '남자': 'Man',
    '여자': 'Woman',
    '아이': 'Child',
    '아기': 'Baby',
    '친구': 'Friend',
    '가족': 'Family',
    '아버지': 'Father',
    '어머니': 'Mother',
    '형': 'Brother',
    '누나': 'Sister',
    '동생': 'Younger sibling',
    '일': 'Work',
    '공부': 'Study',
    '놀이': 'Play',
    '게임': 'Game',
    '음악': 'Music',
    '영화': 'Movie',
    '책': 'Book',
    '자동차': 'Car',
    '비행기': 'Airplane',
    '기차': 'Train',
    '버스': 'Bus',
    '자전거': 'Bicycle',
    '시간': 'Time',
    '날짜': 'Date',
    '오늘': 'Today',
    '어제': 'Yesterday',
    '내일': 'Tomorrow',
    '아침': 'Morning',
    '점심': 'Lunch',
    '저녁': 'Evening',
    '밤': 'Night',
    '좋은': 'Good',
    '나쁜': 'Bad',
    '큰': 'Big',
    '작은': 'Small',
    '예쁜': 'Pretty',
    '아름다운': 'Beautiful',
    '새로운': 'New',
    '오래된': 'Old',
    '빠른': 'Fast',
    '느린': 'Slow',
    '뜨거운': 'Hot',
    '차가운': 'Cold',
    '따뜻한': 'Warm',
    '시원한': 'Cool',
    '맛있는': 'Delicious',
    '달콤한': 'Sweet',
    '쓴': 'Bitter',
    '매운': 'Spicy',
    '신': 'Sour',
    '짠': 'Salty',
    '빨간': 'Red',
    '파란': 'Blue',
    '노란': 'Yellow',
    '초록': 'Green',
    '검은': 'Black',
    '흰': 'White',
    '회색': 'Gray',
    '보라': 'Purple',
    '주황': 'Orange',
    '분홍': 'Pink',
    '갈색': 'Brown'
  };

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, source = 'ko', target = 'en' } = request;
    
    if (source !== 'ko' || target !== 'en') {
      throw new Error('Simple translation only supports Korean to English');
    }

    const words = text.split(/\s+/);
    const translatedWords = words.map(word => {
      // 정확한 매칭
      if (this.simpleTranslations[word]) {
        return this.simpleTranslations[word];
      }
      
      // 부분 매칭 (단어가 포함된 경우)
      for (const [korean, english] of Object.entries(this.simpleTranslations)) {
        if (word.includes(korean)) {
          return word.replace(korean, english);
        }
      }
      
      return word; // 번역할 수 없으면 원본 반환
    });
    
    const translatedText = translatedWords.join(' ');
    
    return {
      translated: translatedText,
      original: text,
      isTranslated: translatedText !== text,
      success: true,
      engine: 'simple'
    };
  }
}

// 통합 번역 서비스
export class TranslationService {
  private engines: TranslationEngine[] = [
    new NaverTranslationService(),
    new MyMemoryTranslationService(),
    new SimpleTranslationService()
  ];

  // 캐시 관리
  private cache = new Map<string, { result: TranslationResponse; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30분
  private readonly MAX_CACHE_SIZE = 100;

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { text } = request;
    
    if (!text || typeof text !== 'string') {
      return {
        translated: '',
        original: '',
        isTranslated: false,
        success: false,
        error: '텍스트가 필요합니다.'
      };
    }

    const normalizedText = text.trim();
    
    if (!normalizedText) {
      return {
        translated: '',
        original: '',
        isTranslated: false,
        success: true
      };
    }

    // 한글 감지
    const hasKorean = /[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(normalizedText);
    
    if (!hasKorean) {
      return {
        translated: normalizedText,
        original: normalizedText,
        isTranslated: false,
        success: true
      };
    }

    // 캐시 확인
    const cacheKey = `${normalizedText}_${request.source || 'ko'}_${request.target || 'en'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return {
        ...cached.result,
        fromCache: true
      };
    }

    // 사용 가능한 엔진들을 우선순위 순으로 정렬
    const availableEngines = this.engines
      .filter(engine => engine.isAvailable())
      .sort((a, b) => a.priority - b.priority);

    let lastError: Error | null = null;

    // 각 엔진을 순서대로 시도
    for (const engine of availableEngines) {
      try {
        console.log(`Trying ${engine.name} translation for: "${normalizedText}"`);
        
        const result = await engine.translate({
          ...request,
          text: normalizedText
        });

        console.log(`${engine.name} translation successful: "${result.translated}"`);

        // 캐시에 저장
        this.cache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });

        // 캐시 크기 관리
        this.manageCacheSize();

        return result;
      } catch (error: any) {
        console.error(`${engine.name} translation failed:`, error);
        lastError = error;
        continue;
      }
    }

    // 모든 엔진이 실패한 경우
    return {
      translated: normalizedText,
      original: normalizedText,
      isTranslated: false,
      success: false,
      error: `모든 번역 서비스가 실패했습니다: ${lastError?.message || 'Unknown error'}`,
      errorType: 'AllEnginesFailed'
    };
  }

  private manageCacheSize(): void {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      // 가장 오래된 항목들을 제거
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  // 번역 이력 저장
  async saveTranslationHistory(history: Omit<TranslationHistory, 'id' | 'timestamp'>): Promise<void> {
    const newHistory: TranslationHistory = {
      ...history,
      id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    // 로컬 스토리지에 저장 (클라이언트 사이드에서 처리)
    if (typeof window !== 'undefined') {
      try {
        const existingHistory = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        const updatedHistory = [newHistory, ...existingHistory].slice(0, 50); // 최근 50개만 유지
        localStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to save translation history:', error);
      }
    }
  }

  // 번역 이력 조회
  async getTranslationHistory(): Promise<TranslationHistory[]> {
    if (typeof window !== 'undefined') {
      try {
        const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        return history;
      } catch (error) {
        console.error('Failed to get translation history:', error);
        return [];
      }
    }
    return [];
  }

  // 번역 이력 삭제
  async deleteTranslationHistory(historyId: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const existingHistory = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        const updatedHistory = existingHistory.filter((item: TranslationHistory) => item.id !== historyId);
        localStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to delete translation history:', error);
      }
    }
  }

  // 번역 이력 검색
  async searchTranslationHistory(query: string): Promise<TranslationHistory[]> {
    const history = await this.getTranslationHistory();
    const lowercaseQuery = query.toLowerCase();
    
    return history.filter(item => 
      item.original.toLowerCase().includes(lowercaseQuery) ||
      item.translated.toLowerCase().includes(lowercaseQuery)
    );
  }
}
