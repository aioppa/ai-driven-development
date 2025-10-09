import { NextRequest, NextResponse } from 'next/server';
import { ReplicateAPI } from '@/lib/api/replicate';
import { AIPixelsGenerationRequest } from '@/lib/types/replicate';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { prompt, styleId, userId, sessionId, aspectRatio, numOutputs } = body;

    // 입력 검증
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: '프롬프트는 500자 이하로 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!styleId || typeof styleId !== 'string') {
      return NextResponse.json(
        { error: '스타일 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 금칙어 검사 (간단한 예시)
    const forbiddenWords = ['nude', 'naked', 'explicit', 'adult', 'nsfw'];
    const hasForbiddenContent = forbiddenWords.some(word => 
      prompt.toLowerCase().includes(word)
    );

    if (hasForbiddenContent) {
      return NextResponse.json(
        { error: '부적절한 내용이 포함되어 있습니다. 다른 표현으로 수정해주세요.' },
        { status: 400 }
      );
    }

    // Replicate API 토큰 확인
    console.log('REPLICATE_API_TOKEN exists:', !!process.env.REPLICATE_API_TOKEN);
    console.log('REPLICATE_API_TOKEN length:', process.env.REPLICATE_API_TOKEN?.length);
    
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: '이미지 생성 서비스가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // TODO: 사용자 크레딧 확인
    // const userCredits = await checkUserCredits(userId);
    // if (userCredits <= 0) {
    //   return NextResponse.json(
    //     { error: '일일 생성 한도를 초과했습니다. 내일 다시 시도하거나 프리미엄으로 업그레이드하세요.' },
    //     { status: 429 }
    //   );
    // }

    // AIPixels 요청 형식으로 변환
    const generationRequest: AIPixelsGenerationRequest = {
      prompt: prompt.trim(),
      styleId,
      userId,
      sessionId,
      aspectRatio: aspectRatio || '1:1',
      numOutputs: 1
    };

    // Replicate API를 통한 이미지 생성
    const result = await ReplicateAPI.generateImages(generationRequest);

    if (result.success) {
      // TODO: 사용자 크레딧 차감
      // await deductUserCredits(userId, 1);

      // TODO: 생성 이력 저장
      // await saveGenerationHistory({
      //   userId,
      //   prompt,
      //   styleId,
      //   images: result.images,
      //   generationTime: result.generationTime,
      //   predictionId: result.predictionId
      // });

      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(
        { 
          error: result.message || '이미지 생성에 실패했습니다.',
          success: false,
          images: [],
          generationTime: result.generationTime,
          remainingCredits: result.remainingCredits
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Image generation API error:', error);
    
    // 에러 타입에 따른 응답
    if (error instanceof Error) {
      if (error.message.includes('REPLICATE_API_TOKEN')) {
        return NextResponse.json(
          { error: '이미지 생성 서비스가 설정되지 않았습니다.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: '생성 시간이 초과되었습니다. 다시 시도해주세요.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 지원 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
