import { ImagePost, StyleOption, Category, FeedFilters, PaginatedResponse, ApiResponse, Comment, GenerationRequest, GenerationResponse, SaveRequest, SaveResponse, ImageMetadata, GalleryImage, GalleryFilters, GalleryUpdateRequest, GalleryVisibilityRequest } from '../types';
import { mockImagePosts, mockStyles, mockCategories, mockUsers, mockPopularTags, simulateImageSave } from '../data/mockData';

// 갤러리 이미지 데이터를 메모리에서 관리
let galleryImages: GalleryImage[] = [];

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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 더 많은 데이터를 생성하기 위해 기존 데이터를 복제하고 변형
    let allPosts = [...mockImagePosts];
    
    // 기존 데이터를 복제하여 더 많은 데이터 생성 (최대 50개)
    for (let i = 0; i < 3; i++) {
      const duplicatedPosts = mockImagePosts.map((post, index) => ({
        ...post,
        id: `${post.id}_copy_${i}_${index}`,
        title: `${post.title} (${i + 2})`,
        createdAt: new Date(post.createdAt.getTime() - (i + 1) * 24 * 60 * 60 * 1000), // 하루씩 이전 날짜
        likes: Math.floor(Math.random() * 100) + 10, // 랜덤 좋아요 수
        comments: Math.floor(Math.random() * 20), // 랜덤 댓글 수
      }));
      allPosts = [...allPosts, ...duplicatedPosts];
    }
    
    let filteredPosts = [...allPosts];
    
    // 정렬
    if (filters.sortBy === 'popular') {
      filteredPosts.sort((a, b) => b.likes - a.likes);
    } else {
      filteredPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    // 카테고리 필터
    if (filters.category) {
      filteredPosts = filteredPosts.filter(post => post.category === filters.category);
    }
    
    // 태그 필터
    if (filters.tags && filters.tags.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        filters.tags!.some(tag => post.tags.includes(tag))
      );
    }
    
    // 검색 필터
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.description?.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    return {
      data: {
        data: paginatedPosts,
        total: filteredPosts.length,
        page,
        limit,
        hasMore: endIndex < filteredPosts.length,
      },
      success: true,
      message: '피드 데이터를 성공적으로 조회했습니다.',
    };
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
        },
        body: JSON.stringify({
          prompt: request.prompt,
          styleId: request.styleId,
          userId: request.userId,
          sessionId: request.sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
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
    return await simulateImageSave(request.imageId, request.metadata, request.isPublic);
  }

  // 이미지 공유 (커뮤니티)
  static async shareToCommunity(request: SaveRequest): Promise<SaveResponse> {
    return await simulateImageSave(request.imageId, request.metadata, true);
  }

  // 갤러리 조회
  static async getGallery(
    tab: 'private' | 'public' = 'private',
    filters: GalleryFilters = { tags: [], category: '', sortBy: 'latest', searchQuery: '' },
    page: number = 1,
    limit: number = 12
  ): Promise<ApiResponse<PaginatedResponse<GalleryImage>>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 갤러리 데이터가 비어있으면 초기 데이터 생성 (한 번만)
    if (galleryImages.length === 0) {
      const currentUser = mockUsers[0];
      galleryImages = mockImagePosts
        .filter(post => post.author.id === currentUser.id)
        .map(post => ({
          id: post.id,
          title: post.title,
          description: post.description || '',
          tags: post.tags,
          category: post.category,
          thumbnailUrl: post.thumbnailUrl,
          imageUrl: post.imageUrl,
          isPublic: post.isPublic,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          stats: {
            views: Math.floor(Math.random() * 1000) + 50,
            likes: post.likes,
            comments: post.comments,
          }
        }));
    }
    
    let filteredGalleryImages = [...galleryImages];

    // 탭별 필터링
    if (tab === 'public') {
      filteredGalleryImages = filteredGalleryImages.filter(img => img.isPublic);
    }

    // 검색 필터
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase();
      filteredGalleryImages = filteredGalleryImages.filter(img => 
        img.title.toLowerCase().includes(searchTerm) ||
        img.description.toLowerCase().includes(searchTerm) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // 카테고리 필터
    if (filters.category) {
      filteredGalleryImages = filteredGalleryImages.filter(img => img.category === filters.category);
    }

    // 태그 필터
    if (filters.tags.length > 0) {
      filteredGalleryImages = filteredGalleryImages.filter(img => 
        filters.tags.some(tag => img.tags.includes(tag))
      );
    }

    // 정렬
    switch (filters.sortBy) {
      case 'oldest':
        filteredGalleryImages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'likes':
        filteredGalleryImages.sort((a, b) => b.stats.likes - a.stats.likes);
        break;
      case 'title':
        filteredGalleryImages.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // latest
        filteredGalleryImages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedImages = filteredGalleryImages.slice(startIndex, endIndex);

    return {
      data: {
        data: paginatedImages,
        total: filteredGalleryImages.length,
        page,
        limit,
        hasMore: endIndex < filteredGalleryImages.length,
      },
      success: true,
      message: '갤러리 데이터를 성공적으로 조회했습니다.',
    };
  }

  // 갤러리 이미지 편집
  static async updateGalleryImage(imageId: string, updateData: GalleryUpdateRequest): Promise<ApiResponse<{ id: string; updatedAt: Date }>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: {
        id: imageId,
        updatedAt: new Date(),
      },
      success: true,
      message: '이미지 정보가 수정되었습니다.',
    };
  }

  // 갤러리 이미지 공개 상태 전환
  static async toggleGalleryVisibility(imageId: string, isPublic: boolean): Promise<ApiResponse<{ id: string; isPublic: boolean; feedId?: string }>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: {
        id: imageId,
        isPublic,
        feedId: isPublic ? `feed_${Date.now()}` : undefined,
      },
      success: true,
      message: isPublic ? '이미지가 공개되었습니다.' : '이미지가 비공개로 설정되었습니다.',
    };
  }

  // 갤러리 이미지 삭제
  static async deleteGalleryImage(imageId: string): Promise<ApiResponse<{ id: string }>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 실제로 갤러리 데이터에서 이미지 삭제
    const initialLength = galleryImages.length;
    galleryImages = galleryImages.filter(img => img.id !== imageId);
    
    if (galleryImages.length < initialLength) {
      return {
        data: { id: imageId },
        success: true,
        message: '이미지가 삭제되었습니다.',
      };
    } else {
      return {
        data: { id: imageId },
        success: false,
        message: '이미지를 찾을 수 없습니다.',
      };
    }
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

