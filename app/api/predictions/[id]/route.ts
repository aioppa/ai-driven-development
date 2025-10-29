import { NextRequest, NextResponse } from 'next/server';
import { ReplicateAPI } from '@/lib/api/replicate';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await context.params;

    if (!predictionId) {
      return NextResponse.json(
        { error: '예측 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Replicate API 토큰 확인
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: '이미지 생성 서비스가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 예측 상태 조회
    const prediction = await ReplicateAPI.getPrediction(predictionId);

    return NextResponse.json({
      success: true,
      data: {
        id: prediction.id,
        status: prediction.status,
        created_at: prediction.created_at,
        input: prediction.input,
        output: prediction.output,
        error: prediction.error,
        logs: prediction.logs,
        metrics: prediction.metrics
      }
    });

  } catch (error) {
    console.error('Prediction status API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: '예측을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('REPLICATE_API_TOKEN')) {
        return NextResponse.json(
          { error: '이미지 생성 서비스가 설정되지 않았습니다.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: '예측 상태 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 예측 취소 API
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await context.params;

    if (!predictionId) {
      return NextResponse.json(
        { error: '예측 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Replicate API 토큰 확인
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: '이미지 생성 서비스가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 예측 취소
    await ReplicateAPI.cancelPrediction(predictionId);

    return NextResponse.json({
      success: true,
      message: '예측이 취소되었습니다.'
    });

  } catch (error) {
    console.error('Prediction cancellation API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: '예측을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('already completed')) {
        return NextResponse.json(
          { error: '이미 완료된 예측은 취소할 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: '예측 취소에 실패했습니다.' },
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
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
