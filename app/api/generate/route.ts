import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ReplicateAPI } from '@/lib/api/replicate';
import { AIPixelsGenerationRequest } from '@/lib/types/replicate';

export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();
    
    // 인증되지 않은 사용자는 이미지 생성 불가
    if (!clerkUserId) {
      console.warn('[보안] 미인증 사용자의 이미지 생성 시도 차단');
      return NextResponse.json(
        { 
          error: '로그인이 필요합니다. 이미지를 생성하려면 먼저 로그인해주세요.',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // 사용자 ID 유효성 검증
    if (typeof clerkUserId !== 'string' || clerkUserId.trim() === '') {
      console.error('[보안] 유효하지 않은 Clerk 사용자 ID:', clerkUserId);
      return NextResponse.json(
        { 
          error: '인증 정보가 올바르지 않습니다.',
          code: 'INVALID_AUTH'
        },
        { status: 401 }
      );
    }

    console.log(`[API] 이미지 생성 요청 - 사용자: ${clerkUserId}`);

    // 요청 본문 파싱
    const body = await request.json();
    const { prompt, styleId, sessionId, aspectRatio, numOutputs, imageSize } = body;

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

    // Replicate API 토큰 확인 (필수)
    console.log('REPLICATE_API_TOKEN exists:', !!process.env.REPLICATE_API_TOKEN);
    console.log('REPLICATE_API_TOKEN length:', process.env.REPLICATE_API_TOKEN?.length);
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: '이미지 생성 서비스가 설정되지 않았습니다. REPLICATE_API_TOKEN을 설정해주세요.' },
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
    const resolvedAspectRatio = (imageSize?.ratio as string) || aspectRatio || '1:1';
    const generationRequest: AIPixelsGenerationRequest = {
      prompt: prompt.trim(),
      styleId,
      userId: clerkUserId,
      sessionId,
      aspectRatio: resolvedAspectRatio,
      numOutputs: 1
    };

    // Replicate API를 통한 이미지 생성
    const result = await ReplicateAPI.generateImages(generationRequest);

    if (result.success && result.images && result.images.length > 0) {
      // TODO: 사용자 크레딧 차감
      // await deductUserCredits(clerkUserId, 1);

      // Replicate에서 생성된 이미지 URL들 추출
      const replicateImageUrls = result.images.map(img => img.url);

      // Supabase Storage에 이미지 저장 시도
      console.log(`[${clerkUserId}] 이미지 저장 시작...`, replicateImageUrls.length, '개');
      
      let savedImages: Array<{
        id: string;
        url: string;
        thumbnailUrl: string;
        prompt: string;
        styleId: string;
        createdAt: Date;
        predictionId?: string;
        clerkUserId: string;
      }> = [];
      let storageEnabled = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (storageEnabled) {
        // 동적 임포트: Storage 서비스는 DB에 의존할 수 있으므로 필요 시에만 로드
        const { saveMultipleImages } = await import('@/lib/services/imageStorage');
        // Supabase Storage가 설정된 경우에만 저장 시도
        const saveResults = await saveMultipleImages(replicateImageUrls, {
          clerkUserId,
          prompt: prompt.trim(),
          translatedPrompt: undefined, // TODO: 번역 기능 추가 시 업데이트
          styleId,
          replicateId: result.predictionId,
          aspectRatio: aspectRatio || '1:1',
        });

        // 저장 결과 검증
        const failedSaves = saveResults.filter(r => !r.success);
        const successfulSaves = saveResults.filter(r => r.success);
        
        if (failedSaves.length > 0) {
          console.error(`[${clerkUserId}] 일부 이미지 저장 실패:`, failedSaves);
          
          // 모든 이미지 저장 실패 시 경고하지만 Replicate URL 사용
          if (failedSaves.length === saveResults.length) {
            console.warn(`[${clerkUserId}] Storage 저장 실패 - Replicate URL 사용`);
            storageEnabled = false; // Storage 비활성화로 전환
          }
        }

        // 성공적으로 저장된 이미지들의 Public URL
        if (successfulSaves.length > 0) {
          savedImages = successfulSaves
            .filter(r => r.publicUrl)
            .map((r, index) => ({
              id: r.imageId!.toString(),
              url: r.publicUrl!,
              thumbnailUrl: r.publicUrl!,
              prompt: prompt.trim(),
              styleId,
              createdAt: new Date(),
              predictionId: result.predictionId,
              clerkUserId,
            }));
        }

        // 부분 실패한 항목들에 대해 Replicate URL 기반으로 DB에도 기록
        if (failedSaves.length > 0 && successfulSaves.length > 0) {
          const indicesOfFailures = saveResults
            .map((r, idx) => ({ ok: r.success, idx }))
            .filter(x => !x.ok)
            .map(x => x.idx);

          const fallbackForFailures = indicesOfFailures.map((i) => result.images[i]).filter(Boolean);

          if (fallbackForFailures.length > 0) {
            try {
              if (!process.env.DATABASE_URL) {
                console.warn('[환경] DATABASE_URL이 없어 부분 실패 항목 DB 저장을 건너뜁니다.');
              } else {
                const { db } = await import('@/db');
                const { images } = await import('@/db/schema');
                const values = fallbackForFailures.map((img) => ({
                  clerkUserId,
                  filePath: img.url,
                  prompt: prompt.trim(),
                  translatedPrompt: undefined,
                  replicateId: result.predictionId,
                  style: styleId as any,
                  width: undefined,
                  height: undefined,
                  visibility: 'private' as const,
                  thumbnailUrl: img.thumbnailUrl || img.url,
                }));

                const inserted = await db.insert(images).values(values).returning({ id: images.id, filePath: images.filePath, thumbnailUrl: images.thumbnailUrl });

                const appended = inserted.map((row) => ({
                  id: String(row.id),
                  url: row.filePath,
                  thumbnailUrl: row.thumbnailUrl || row.filePath,
                  prompt: prompt.trim(),
                  styleId,
                  createdAt: new Date(),
                  predictionId: result.predictionId,
                  clerkUserId,
                }));

                savedImages = [...savedImages, ...appended];
              }
            } catch (e) {
              console.error(`[${clerkUserId}] 부분 실패 항목 DB 저장 실패:`, e);
            }
          }
        }
      }

      // Storage 저장 실패 또는 비활성화 시 Replicate URL 직접 사용 + DB에도 기록
      if (!storageEnabled || savedImages.length === 0) {
        console.log(`[${clerkUserId}] Storage 비활성화 - Replicate URL 직접 사용 및 DB 저장`);
        const fallback = result.images.map((img) => ({
          id: img.id,
          url: img.url,
          thumbnailUrl: img.thumbnailUrl || img.url,
          prompt: prompt.trim(),
          styleId,
          createdAt: new Date(img.createdAt),
          predictionId: result.predictionId,
          clerkUserId,
        }));

        // DB에 외부 URL 기반으로 메타데이터 저장 (filePath에 외부 URL 저장)
        try {
          if (!process.env.DATABASE_URL) {
            console.warn('[환경] DATABASE_URL이 없어 DB 저장을 건너뜁니다.');
            savedImages = fallback;
          } else {
            const { db } = await import('@/db');
            const { images } = await import('@/db/schema');
            const values = fallback.map((f) => ({
              clerkUserId,
              filePath: f.url, // 외부 URL 저장
              prompt: prompt.trim(),
              translatedPrompt: undefined,
              replicateId: result.predictionId,
              style: styleId as any,
              width: undefined,
              height: undefined,
              visibility: 'private' as const,
              thumbnailUrl: f.thumbnailUrl,
            }));

            const inserted = await db.insert(images).values(values).returning({ id: images.id, filePath: images.filePath, thumbnailUrl: images.thumbnailUrl });

            savedImages = inserted.map((row) => ({
              id: String(row.id),
              url: row.filePath,
              thumbnailUrl: row.thumbnailUrl || row.filePath,
              prompt: prompt.trim(),
              styleId,
              createdAt: new Date(),
              predictionId: result.predictionId,
              clerkUserId,
            }));
          }
        } catch (e) {
          console.error(`[${clerkUserId}] 외부 URL 이미지 DB 저장 실패:`, e);
          // DB 저장도 실패한 경우, 응답은 생성 결과만 반환
          savedImages = fallback;
        }
      }

      console.log(`[${clerkUserId}] 이미지 생성 완료 - ${savedImages.length}개 반환`);

      return NextResponse.json({
        success: true,
        images: savedImages,
        generationTime: result.generationTime,
        remainingCredits: result.remainingCredits,
        message: storageEnabled 
          ? `${savedImages.length}개의 이미지가 성공적으로 생성 및 저장되었습니다.`
          : `${savedImages.length}개의 이미지가 성공적으로 생성되었습니다. (Storage 비활성화)`,
        savedCount: savedImages.length,
        totalCount: replicateImageUrls.length,
        userId: clerkUserId,
        storageEnabled, // Storage 활성화 여부 전달
      }, { status: 201 });
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
    console.error('[API] Image generation error:', error);
    
    // 에러 타입에 따른 응답
    if (error instanceof Error) {
      // Replicate API 에러
      if (error.message.includes('REPLICATE_API_TOKEN')) {
        return NextResponse.json(
          { 
            error: '이미지 생성 서비스가 설정되지 않았습니다.',
            code: 'SERVICE_NOT_CONFIGURED'
          },
          { status: 500 }
        );
      }
      
      // 타임아웃 에러
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: '생성 시간이 초과되었습니다. 다시 시도해주세요.',
            code: 'TIMEOUT'
          },
          { status: 408 }
        );
      }

      // Storage/Database 에러
      if (error.message.includes('Storage') || error.message.includes('database')) {
        return NextResponse.json(
          { 
            error: '이미지 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            code: 'STORAGE_ERROR',
            details: error.message
          },
          { status: 500 }
        );
      }

      // 인증 에러
      if (error.message.includes('auth') || error.message.includes('permission')) {
        return NextResponse.json(
          { 
            error: '인증 오류가 발생했습니다. 다시 로그인해주세요.',
            code: 'AUTH_ERROR'
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        code: 'UNKNOWN_ERROR'
      },
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
