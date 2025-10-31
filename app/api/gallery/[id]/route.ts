import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

// API 핸들러의 context 타입을 명시적으로 정의 (가독성 및 재사용성 향상)
interface RouteContext {
  params: Promise<{ id: string }>;
}

// API 응답의 성공/실패 타입을 정의
type DeleteSuccessResponse = NextResponse<{ success: true; data: { id: string } }>;
type DeleteErrorResponse = NextResponse<{ success: false; message: string }>;
type DeleteApiResponse = DeleteSuccessResponse | DeleteErrorResponse;

/**
 * 갤러리 이미지 삭제 API: /api/gallery/[id]
 * - URL 경로 파라미터(id)를 사용하여 특정 이미지를 삭제합니다.
 * - 반드시 사용자 인증(Clerk) 및 소유권 확인을 거칩니다.
 */
export async function DELETE(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest,
  context: RouteContext // 정의된 인터페이스 사용
): Promise<DeleteApiResponse> { // 반환 타입을 명시적으로 정의
  
  // 1. 사용자 인증 확인
  const { userId } = auth();
  if (!userId) {
    // 인증되지 않은 사용자는 401 Unauthorized 응답
    return NextResponse.json(
      { success: false, message: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    // 2. 경로 파라미터(id) 추출 및 유효성 검사
    const { id } = await context.params; // context.params를 await로 처리
    const imageId = Number(id);

    if (!Number.isFinite(imageId)) {
      // id가 유효한 숫자가 아니면 400 Bad Request 응답
      return NextResponse.json(
        { success: false, message: '요청된 이미지 ID 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 3. 데이터베이스에서 이미지 삭제 (소유자 확인 포함)
    const deletedImages = await db
      .delete(images)
      .where(and(eq(images.id, imageId), eq(images.clerkUserId, userId)))
      .returning({ deletedId: images.id }); // 삭제된 id만 반환

    // 4. 삭제 결과 확인
    if (deletedImages.length === 0) {
      // 삭제된 레코드가 없으면, 해당 이미지가 없거나 사용자에게 삭제 권한이 없는 경우
      return NextResponse.json(
        { success: false, message: '요청된 이미지를 찾을 수 없거나 삭제 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 5. 성공 응답
    // 삭제된 이미지의 id를 문자열로 변환하여 응답
    return NextResponse.json({
      success: true,
      data: { id: String(deletedImages[0].deletedId) },
    });

  } catch (error) {
    // 6. 예외 처리
    console.error('[API_GALLERY_DELETE_ERROR]', error);
    // 서버 내부 오류 시 500 Internal Server Error 응답
    return NextResponse.json(
      { success: false, message: '서버 내부 오류로 인해 이미지 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}