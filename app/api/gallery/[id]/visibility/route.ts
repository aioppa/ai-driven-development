import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let isPublic = false;
    try {
      const body = await request.json();
      isPublic = !!body?.isPublic;
    } catch {}

    const isDbConfigured = !!process.env.DATABASE_URL;
    const numericId = Number(id);
    const isNumericId = Number.isFinite(numericId);

    // DB 미설정 또는 비정규(문자열) ID인 경우 개발 모드 폴백으로 성공 처리
    if (!isDbConfigured || !isNumericId) {
      return NextResponse.json({ success: true, data: { id, isPublic } });
    }

    // 소유권 확인 후 visibility 업데이트
    const { db } = await import('@/db');
    const { images } = await import('@/db/schema');
    const updated = await db.update(images)
      .set({ visibility: isPublic ? 'public' : 'private' })
      .where(and(eq(images.id, numericId), eq(images.clerkUserId, userId)))
      .returning({ id: images.id, visibility: images.visibility });

    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, message: 'Not found or no permission' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { id: String(updated[0].id), isPublic }
    });
  } catch (error) {
    console.error('[API] PATCH gallery visibility error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update visibility' }, { status: 500 });
  }
}


