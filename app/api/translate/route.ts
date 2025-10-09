import { NextResponse } from 'next/server';
import { TranslationService } from '@/lib/services/translation';

// 번역 서비스 인스턴스
const translationService = new TranslationService();

export async function POST(request: Request) {
  try {
    console.log('Translation API called');
    const { text, source, target } = await request.json();
    console.log('Received text:', text);

    if (!text || typeof text !== 'string') {
      console.log('Invalid text input');
      return NextResponse.json(
        { error: '텍스트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 번역 서비스를 사용하여 번역 수행
    const result = await translationService.translate({
      text,
      source: source || 'ko',
      target: target || 'en'
    });

    // 번역 이력 저장 (성공한 경우에만)
    if (result.success && result.isTranslated) {
      await translationService.saveTranslationHistory({
        original: result.original,
        translated: result.translated,
        source: source || 'ko',
        target: target || 'en',
        engine: result.engine || 'simple'
      });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Translation API error:', error);
    
    // 요청 본문을 다시 파싱하여 원본 텍스트 가져오기
    let originalText = '';
    try {
      const body = await request.json();
      originalText = body.text || '';
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
    }
    
    // 에러 타입에 따른 메시지 설정
    let errorMessage = '번역에 실패했습니다. 원본 텍스트를 사용합니다.';
    if (error.message.includes('Naver API error')) {
      errorMessage = '네이버 번역 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.message.includes('MyMemory API error')) {
      errorMessage = '번역 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      errorMessage = '번역 시간이 초과되었습니다. 다시 시도해주세요.';
    }
    
    return NextResponse.json({
      translated: originalText,
      original: originalText,
      isTranslated: false,
      success: false,
      error: errorMessage,
      errorType: error.name || 'UnknownError'
    });
  }
}
