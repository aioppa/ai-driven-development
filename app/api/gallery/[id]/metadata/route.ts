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

    // 안전한 JSON 파싱
    let body: any = {};
    try {
      body = await request.json();
    } catch {}
    const { title, description, tags, category } = body || {};

    // DB가 없거나 ID가 숫자가 아닌 경우: 개발 모드 폴백 성공 처리
    const isDbConfigured = !!process.env.DATABASE_URL;
    const numericId = Number(id);
    const isNumericId = Number.isFinite(numericId);

    if (!isDbConfigured || !isNumericId) {
      return NextResponse.json({
        success: true,
        message: isDbConfigured ? 'Non-persistent metadata updated (dev mode, non-numeric id)' : 'Database not configured - metadata accepted (dev mode) ',
        data: { id, updatedAt: new Date() }
      });
    }

    const updateData: Partial<typeof images.$inferInsert> = {};
    if (typeof title === 'string') updateData.title = title;
    if (typeof description === 'string') updateData.description = description;
    // tags: 문자열 배열만 허용, 문자열인 경우 쉼표 구분으로 분해
    if (Array.isArray(tags)) {
      updateData.tags = tags.filter((t: unknown) => typeof t === 'string') as string[];
    } else if (typeof tags === 'string') {
      const parsed = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      if (parsed.length > 0) updateData.tags = parsed as any;
    }

    // category: 한글 → 영문 enum 매핑 허용
    const categoryMap: Record<string, string> = {
      '인물': 'portrait',
      '풍경': 'landscape',
      '캐릭터': 'character',
      '추상': 'abstract',
      '동물': 'animal',
      '건축': 'architecture',
      '음식': 'food',
      '패션': 'fashion',
      '기타': 'other',
    };
    const allowedCategories = new Set([
      'portrait', 'landscape', 'character', 'abstract', 'animal', 'architecture', 'food', 'fashion', 'other',
    ]);
    if (typeof category === 'string') {
      const trimmed = category.trim();
      const normalized = categoryMap[trimmed] || trimmed.toLowerCase();
      if (!allowedCategories.has(normalized)) {
        return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 });
      }
      updateData.category = normalized as any;
    }
    updateData.updatedAt = new Date();

    const { db } = await import('@/db');
    const { images } = await import('@/db/schema');
    const updated = await db.update(images)
      .set(updateData)
      .where(and(eq(images.id, numericId), eq(images.clerkUserId, userId)))
      .returning({ id: images.id, updatedAt: images.updatedAt });

    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, message: 'Not found or no permission' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: String(updated[0].id), updatedAt: updated[0].updatedAt } });
  } catch (error) {
    console.error('[API] PATCH gallery metadata error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update metadata' }, { status: 500 });
  }
}


