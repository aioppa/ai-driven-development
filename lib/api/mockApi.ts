import { ImagePost, StyleOption, Category, FeedFilters, PaginatedResponse, ApiResponse, Comment, GenerationRequest, GenerationResponse, SaveRequest, SaveResponse, ImageMetadata, GalleryImage, GalleryFilters, GalleryUpdateRequest, GalleryVisibilityRequest } from '../types';
import { mockStyles, mockCategories, mockPopularTags, mockUsers, mockImagePosts } from '../data/mockData';
import * as LocalGallery from '@/lib/services/localGallery';

// 목업 데이터는 스타일/카테고리/태그에 한해 사용합니다.

// 목업 API 함수들
export class MockApi {
  // 스타일 옵션 조회
  static async getStyles(): Promise<ApiResponse<StyleOption[]>> {
    // 실제 API 호출 시뮬레이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: mockStyles,
      success: true,
      message: '스타일 목록을 성공적으로 조회했습니다.',
    };
  }

  // 카테고리 조회
  static async getCategories(): Promise<ApiResponse<Category[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      data: mockCategories,
      success: true,
      message: '카테고리 목록을 성공적으로 조회했습니다.',
    };
  }

  // 피드 데이터 조회
  static async getFeed(
    filters: FeedFilters = { sortBy: 'latest' },
    page: number = 1,
    limit: number = 12
  ): Promise<ApiResponse<PaginatedResponse<ImagePost>>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await fetch(`/api/feed?${params.toString()}`, { cache: 'no-store' });
    let payload: PaginatedResponse<any> = { data: [], total: 0, page, limit, hasMore: false } as any;
    if (res.ok) {
      const json = await res.json();
      payload = json.data as PaginatedResponse<any>;
    }
    let data = (payload.data || []).map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));

    if (!res.ok || data.length === 0) {
      const local = LocalGallery.list('public', page, limit);
      data = local.data.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        imageUrl: g.imageUrl,
        thumbnailUrl: g.thumbnailUrl,
        prompt: '',
        author: mockUsers[0],
        tags: g.tags,
        category: g.category,
        likes: g.stats.likes,
        comments: g.stats.comments,
        isLiked: false,
        isPublic: true,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }));
      payload = { data, total: local.total, page, limit, hasMore: local.hasMore } as any;
    }

    const mapped: PaginatedResponse<ImagePost> = {
      data,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      hasMore: payload.hasMore,
    };
    return { data: mapped, success: true, message: '피드 데이터를 성공적으로 조회했습니다.' };
  }

  // 좋아요 토글
  static async toggleLike(postId: string): Promise<ApiResponse<{ isLiked: boolean; likes: number }>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const post = mockImagePosts.find(p => p.id === postId);
    if (!post) {
      return {
        data: { isLiked: false, likes: 0 },
        success: false,
        message: '포스트를 찾을 수 없습니다.',
      };
    }
    
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    
    return {
      data: {
        isLiked: post.isLiked,
        likes: post.likes,
      },
      success: true,
      message: post.isLiked ? '좋아요를 추가했습니다.' : '좋아요를 취소했습니다.',
    };
  }

  // 프롬프트 복제
  static async clonePrompt(postId: string): Promise<ApiResponse<{ prompt: string }>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const post = mockImagePosts.find(p => p.id === postId);
    if (!post) {
      return {
        data: { prompt: '' },
        success: false,
        message: '포스트를 찾을 수 없습니다.',
      };
    }
    
    return {
      data: { prompt: post.prompt },
      success: true,
      message: '프롬프트를 복제했습니다.',
    };
  }

  // 프롬프트 제출 (이미지 생성 페이지로 이동)
  static async submitPrompt(prompt: string, styleId: string): Promise<ApiResponse<{ redirectUrl: string }>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!prompt.trim()) {
      return {
        data: { redirectUrl: '' },
        success: false,
        message: '프롬프트를 입력해주세요.',
      };
    }
    
    // 실제로는 이미지 생성 API를 호출하고 결과를 받아옴
    // 여기서는 생성 페이지로 리다이렉트하는 URL을 반환
    return {
      data: { redirectUrl: `/generate?prompt=${encodeURIComponent(prompt)}&style=${styleId}` },
      success: true,
      message: '이미지 생성을 시작합니다.',
    };
  }

  // 댓글 조회
  static async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 목업 댓글 데이터
    const mockComments: Comment[] = [
      {
        id: '1',
        content: '정말 멋진 작품이네요! 어떤 프롬프트를 사용하셨나요?',
        author: mockUsers[1],
        createdAt: new Date('2024-03-15T10:30:00'),
        postId: postId,
      },
      {
        id: '2',
        content: '색감이 정말 아름다워요. 비슷한 스타일로 만들어보고 싶습니다.',
        author: mockUsers[2],
        createdAt: new Date('2024-03-15T14:20:00'),
        postId: postId,
      },
    ];
    
    return {
      data: mockComments,
      success: true,
      message: '댓글을 성공적으로 조회했습니다.',
    };
  }

  // 댓글 추가
  static async addComment(postId: string, content: string): Promise<ApiResponse<Comment>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!content.trim()) {
      return {
        data: {} as Comment,
        success: false,
        message: '댓글 내용을 입력해주세요.',
      };
    }
    
    const newComment: Comment = {
      id: Date.now().toString(),
      content: content.trim(),
      author: mockUsers[0], // 현재 사용자 (목업)
      createdAt: new Date(),
      postId: postId,
    };
    
    return {
      data: newComment,
      success: true,
      message: '댓글을 성공적으로 추가했습니다.',
    };
  }

  // 이미지 생성 (서버 API 라우트 사용)
  static async generateImages(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      // 서버 API 라우트를 통해 이미지 생성 요청
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          styleId: request.styleId,
          userId: request.userId,
          sessionId: request.sessionId,
          imageSize: request.imageSize,
          // Ensure server receives an aspect ratio even if only imageSize is provided
          aspectRatio: request.imageSize?.ratio || '1:1',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      try {
        if (result?.success && Array.isArray(result.images)) {
          LocalGallery.addGenerated(result.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl || img.url,
            prompt: img.prompt || request.prompt,
            styleId: img.styleId || request.styleId,
            createdAt: new Date(),
          })));
        }
      } catch {}
      return result;
    } catch (error) {
      console.error('Image generation failed:', error);
      return {
        success: false,
        images: [],
        generationTime: 0,
        remainingCredits: 17,
        message: `이미지 생성에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // 태그 자동완성
  static async getPopularTags(): Promise<ApiResponse<string[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      data: mockPopularTags,
      success: true,
      message: '인기 태그를 성공적으로 조회했습니다.',
    };
  }

  // 이미지 저장 (갤러리)
  static async saveToGallery(request: SaveRequest): Promise<SaveResponse> {
    const metaRes = await fetch(`/api/gallery/${request.imageId}/metadata`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.metadata),
    });
    if (!metaRes.ok) {
      return { success: false, message: '메타데이터 저장 실패' };
    }
    const visRes = await fetch(`/api/gallery/${request.imageId}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !!request.isPublic }),
    });
    if (!visRes.ok) {
      return { success: false, message: '공개 상태 저장 실패' };
    }
    try {
      LocalGallery.updateMetadata(request.imageId, request.metadata);
      LocalGallery.setVisibility(request.imageId, !!request.isPublic);
    } catch {}
    return { success: true, galleryId: request.imageId, message: '갤러리에 저장되었습니다.' };
  }

  // 이미지 공유 (커뮤니티)
  static async shareToCommunity(request: SaveRequest): Promise<SaveResponse> {
    const metaRes = await fetch(`/api/gallery/${request.imageId}/metadata`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.metadata),
    });
    if (!metaRes.ok) {
      return { success: false, message: '메타데이터 저장 실패' };
    }
    const visRes = await fetch(`/api/gallery/${request.imageId}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: true }),
    });
    if (!visRes.ok) {
      return { success: false, message: '공개 전환 실패' };
    }
    try {
      LocalGallery.updateMetadata(request.imageId, request.metadata);
      LocalGallery.setVisibility(request.imageId, true);
    } catch {}
    return { success: true, feedId: request.imageId, message: '커뮤니티에 공유되었습니다.' };
  }

  // 갤러리 조회
  static async getGallery(
    tab: 'private' | 'public' = 'private',
    _filters: GalleryFilters = { tags: [], category: '', sortBy: 'latest', searchQuery: '' },
    page: number = 1,
    limit: number = 12
  ): Promise<ApiResponse<PaginatedResponse<GalleryImage>>> {
    const params = new URLSearchParams({ tab, page: String(page), limit: String(limit) });
    const res = await fetch(`/api/gallery?${params.toString()}`, { cache: 'no-store' });
    let payload: PaginatedResponse<any> = { data: [], total: 0, page, limit, hasMore: false } as any;
    if (res.ok) {
      const json = await res.json();
      payload = json.data as PaginatedResponse<any>;
    }

    let data = (payload.data || []).map((g: any) => ({
      ...g,
      createdAt: new Date(g.createdAt),
      updatedAt: new Date(g.updatedAt),
    }));

    if (!res.ok || data.length === 0) {
      const local = LocalGallery.list(tab, page, limit);
      data = local.data;
      payload = { data, total: local.total, page, limit, hasMore: local.hasMore } as any;
    }

    const mapped: PaginatedResponse<GalleryImage> = {
      data,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      hasMore: payload.hasMore,
    };
    return { data: mapped, success: true, message: '갤러리 데이터를 성공적으로 조회했습니다.' };
  }

  // 갤러리 이미지 편집
  static async updateGalleryImage(imageId: string, updateData: GalleryUpdateRequest): Promise<ApiResponse<{ id: string; updatedAt: Date }>> {
    // TODO: 개별 필드 업데이트 라우트가 필요하면 구현
    await new Promise(resolve => setTimeout(resolve, 100));
    return { data: { id: imageId, updatedAt: new Date() }, success: true };
  }

  // 갤러리 이미지 공개 상태 전환
  static async toggleGalleryVisibility(imageId: string, isPublic: boolean): Promise<ApiResponse<{ id: string; isPublic: boolean; feedId?: string }>> {
    const res = await fetch(`/api/gallery/${imageId}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic }),
    });
    if (!res.ok) {
      return { data: { id: imageId, isPublic }, success: false, message: '상태 변경 실패' };
    }
    const json = await res.json();
    return { data: json.data, success: true, message: isPublic ? '이미지가 공개되었습니다.' : '이미지가 비공개로 설정되었습니다.' };
  }

  // 갤러리 이미지 삭제
  static async deleteGalleryImage(imageId: string): Promise<ApiResponse<{ id: string }>> {
    const res = await fetch(`/api/gallery/${imageId}`, { method: 'DELETE' });
    if (!res.ok) {
      return { data: { id: imageId }, success: false, message: '삭제 실패' };
    }
    const json = await res.json();
    return { data: json.data, success: true, message: '이미지가 삭제되었습니다.' };
  }

  // 갤러리 태그 조회
  static async getGalleryTags(): Promise<ApiResponse<string[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 현재 사용자의 모든 태그 목록
    const userTags = Array.from(new Set(
      mockImagePosts
        .filter(post => post.author.id === mockUsers[0].id)
        .flatMap(post => post.tags)
    ));
    
    return {
      data: userTags,
      success: true,
      message: '갤러리 태그를 성공적으로 조회했습니다.',
    };
  }
}

