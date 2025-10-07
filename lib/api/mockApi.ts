import { ImagePost, StyleOption, Category, FeedFilters, PaginatedResponse, ApiResponse, Comment } from '../types';
import { mockImagePosts, mockStyles, mockCategories, mockUsers } from '../data/mockData';

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
    
    let filteredPosts = [...mockImagePosts];
    
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
}

