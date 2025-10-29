import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
// Polyfill RouteContext type for Next.js v15 app router
type RouteContext<_Path extends string> = { params: Promise<{ id: string }> };
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { images } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<'/api/gallery/[id]'>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const imageId = Number(id);
    if (!Number.isFinite(imageId)) {
      return NextResponse.json({ success: false, message: 'Invalid image id' }, { status: 400 });
    }

    const deleted = await db.delete(images)
      .where(and(eq(images.id, imageId), eq(images.clerkUserId, userId)))
      .returning({ id: images.id });

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ success: false, message: 'Not found or no permission' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: String(deleted[0].id) } });
  } catch (error) {
    console.error('[API] DELETE gallery image error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete image' }, { status: 500 });
  }
}


