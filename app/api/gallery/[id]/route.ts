import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * 갤러리 이미지 삭제 API
 * @param _request NextRequest (현재 사용되지 않음)
 * @param context - URL 경로 파라미터를 포함하는 객체. { params: { id: '...' } }
 * Vercel 빌드 환경에서 params가 Promise일 수 있으므로 비동기 처리합니다.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const { id: imageIdStr } = await context.params; // context.params를 await로 처리
    const imageId = Number(imageIdStr);

    if (!Number.isFinite(imageId)) {
      // id가 유효한 숫자가 아니면 400 Bad Request 응답
      return NextResponse.json(
        { success: false, message: '잘못된 형식의 이미지 ID입니다.' },
        { status: 400 }
      );
    }

    // 3. 데이터베이스에서 이미지 삭제
    //    - 이미지 ID가 일치하는지 확인
    //    - 요청한 사용자가 이미지의 소유자인지 확인 (중요!)
    const deletedImages = await db
      .delete(images)
      .where(and(eq(images.id, imageId), eq(images.clerkUserId, userId)))
      .returning({ deletedId: images.id });

    // 4. 삭제 결과 확인
    if (deletedImages.length === 0) {
      // 삭제된 레코드가 없으면, 해당 이미지가 없거나 사용자의 소유가 아님
      // 404 Not Found 응답
      return NextResponse.json(
        { success: false, message: '해당 이미지를 찾을 수 없거나 삭제 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 5. 성공 응답
    return NextResponse.json({
      success: true,
      data: { id: String(deletedImages[0].deletedId) },
    });

  } catch (error) {
    // 6. 예외 처리
    console.error('[API_GALLERY_DELETE_ERROR]', error);
    // 서버 내부 오류 시 500 Internal Server Error 응답
    return NextResponse.json(
      { success: false, message: '이미지 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}