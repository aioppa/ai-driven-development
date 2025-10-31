
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise 로 받기
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params; // ✅ await로 열기
    const imageId = Number(id);
    if (!Number.isFinite(imageId)) {
      return NextResponse.json({ success: false, message: '잘못된 이미지 ID' }, { status: 400 });
    }

    const deleted = await db
      .delete(images)
      .where(and(eq(images.id, imageId), eq(images.clerkUserId, userId)))
      .returning({ id: images.id });

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ success: false, message: '없거나 권한 없음' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: String(deleted[0].id) } });
  } catch (error) {
    console.error('[API] DELETE gallery image error:', error);
    return NextResponse.json({ success: false, message: '삭제 실패' }, { status: 500 });
  }
}
