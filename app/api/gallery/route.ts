import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq, desc } from 'drizzle-orm';

function getPublicUrl(filePath: string): string {
  // 이미 절대 URL(https:// 또는 http://)이면 그대로 반환
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${baseUrl}/storage/v1/object/public/images/${filePath}`;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    const { searchParams } = new URL(request.url);
    const tab = (searchParams.get('tab') || 'private') as 'private' | 'public';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const offset = (page - 1) * limit;

    if (tab === 'private') {
      if (!userId) {
        return NextResponse.json({
          success: false,
          message: '로그인이 필요합니다.',
        }, { status: 401 });
      }
    }

    // DB 미설정 시 즉시 폴백
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        data: { data: [], total: 0, page, limit, hasMore: false },
        message: 'Database not configured - returning empty gallery.'
      });
    }

    // 지연 로드하여 DB 연결 오류를 try/catch로 안전 처리
    const { db } = await import('@/db');
    const { images } = await import('@/db/schema');

    const whereClause = tab === 'private'
      ? eq(images.clerkUserId, userId!)
      : eq(images.visibility, 'public');

    const rows = await db
      .select()
      .from(images)
      .where(whereClause)
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((row) => ({
      id: String(row.id),
      title: row.title || '',
      description: row.description || '',
      tags: row.tags || [],
      category: row.category || 'other',
      thumbnailUrl: row.thumbnailUrl || getPublicUrl(row.filePath),
      imageUrl: getPublicUrl(row.filePath),
      isPublic: row.visibility === 'public',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      stats: {
        views: row.viewCount || 0,
        likes: row.likeCount || 0,
        comments: row.commentCount || 0,
      },
    }));

    // 간단한 페이지네이션 정보 (총 개수 쿼리 생략)
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
  } catch (error) {
    console.error('[API] Gallery GET error:', error);
    const baseMsg = typeof (error as any)?.message === 'string' ? (error as any).message : '';
    const stackMsg = typeof (error as any)?.stack === 'string' ? (error as any).stack : '';
    let serialized = '';
    try { serialized = JSON.stringify(error, Object.getOwnPropertyNames(error as any)); } catch {}
    const combined = `${baseMsg} ${stackMsg} ${serialized}`;
    const transient = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ECONNRESET|EAI_AGAIN|timeout/i.test(combined);

    if (!process.env.DATABASE_URL || transient) {
      return NextResponse.json({
        success: true,
        data: { data: [], total: 0, page: 1, limit: 12, hasMore: false },
        message: 'Gallery fallback: database unavailable.'
      });
    }

    return NextResponse.json({ success: false, message: '갤러리 데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}


