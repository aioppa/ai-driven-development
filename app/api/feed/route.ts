import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';

function getPublicUrl(filePath: string): string {
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${baseUrl}/storage/v1/object/public/images/${filePath}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const offset = (page - 1) * limit;
    
    // DB 미설정 시 즉시 폴백
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        data: { data: [], total: 0, page, limit, hasMore: false },
        message: 'Database not configured - returning empty feed.'
      });
    }

    const { db } = await import('@/db');
    const { images } = await import('@/db/schema');

    const rows = await db
      .select()
      .from(images)
      .where(eq(images.visibility, 'public'))
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((row) => ({
      id: String(row.id),
      title: row.title || '',
      description: row.description || '',
      imageUrl: getPublicUrl(row.filePath),
      thumbnailUrl: row.thumbnailUrl || getPublicUrl(row.filePath),
      prompt: row.prompt,
      author: {
        id: row.clerkUserId,
        username: row.clerkUserId,
        createdAt: row.createdAt,
      },
      tags: row.tags || [],
      category: row.category || 'other',
      likes: row.likeCount || 0,
      comments: row.commentCount || 0,
      isLiked: false,
      isPublic: true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    const hasMore = data.length === limit;

    return NextResponse.json({
      success: true,
      data: {
        data,
        total: offset + data.length + (hasMore ? 1 : 0),
        page,
        limit,
        hasMore,
      }
    });
  } catch (error: any) {
    console.error('[API] Feed GET error:', error);
    // 네트워크/연결 오류 시 폴백: 빈 목록 반환 (중첩된 cause까지 검사)
    const baseMsg = typeof error?.message === 'string' ? error.message : '';
    const stackMsg = typeof error?.stack === 'string' ? error.stack : '';
    let serialized = '';
    try { serialized = JSON.stringify(error, Object.getOwnPropertyNames(error)); } catch {}
    const combined = `${baseMsg} ${stackMsg} ${serialized}`;
    const transient = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ECONNRESET|EAI_AGAIN|timeout/i.test(combined);

    if (!process.env.DATABASE_URL || transient) {
      return NextResponse.json({
        success: true,
        data: { data: [], total: 0, page: 1, limit: 15, hasMore: false },
        message: 'Feed fallback: database unavailable.'
      });
    }

    return NextResponse.json({ success: false, message: '피드 데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}


