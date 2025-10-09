// AIPixels 타입 정의

export interface User {
  id: string;
  username: string;
  avatar?: string;
  createdAt: Date;
}

export interface ImagePost {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string;
  author: User;
  tags: string[];
  category: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  createdAt: Date;
}

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isPopular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface FeedFilters {
  sortBy: 'latest' | 'popular';
  category?: string;
  tags?: string[];
  search?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CommentModalProps {
  post: ImagePost;
  isOpen: boolean;
  onClose: () => void;
}

// 이미지 생성 관련 타입
export interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  prompt: string;
  originalPrompt?: string;
  styleId: string;
  createdAt: string;
  predictionId?: string;
}

export interface GenerationRequest {
  prompt: string;
  originalPrompt?: string;
  styleId: string;
  userId?: string;
  sessionId?: string;
}

export interface GenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  generationTime: number;
  remainingCredits: number;
  message?: string;
}

export interface ImageMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
}

export interface SaveRequest {
  imageId: string;
  metadata: ImageMetadata;
  isPublic: boolean;
}

export interface SaveResponse {
  success: boolean;
  galleryId?: string;
  feedId?: string;
  message: string;
}

export interface ImageGenerationState {
  // 스타일 관련
  availableStyles: StyleOption[];
  selectedStyle: StyleOption | null;
  
  // 프롬프트 관련
  prompt: string;
  promptError: string | null;
  
  // 생성 관련
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  selectedImage: GeneratedImage | null;
  generationError: string | null;
  
  // 메타데이터 관련
  metadata: ImageMetadata;
  
  // 사용자 제한
  remainingCredits: number;
  dailyLimit: number;
}

// 갤러리 관련 타입
export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  thumbnailUrl: string;
  imageUrl: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
}

export interface GalleryFilters {
  tags: string[];
  category: string;
  sortBy: 'latest' | 'oldest' | 'likes' | 'title';
  searchQuery: string;
}

export interface GalleryState {
  // 탭 관리
  activeTab: 'private' | 'public';
  
  // 이미지 데이터
  images: GalleryImage[];
  selectedImage: GalleryImage | null;
  
  // 필터 및 검색
  filters: GalleryFilters;
  
  // 페이지네이션
  pagination: {
    currentPage: number;
    hasNext: boolean;
    isLoading: boolean;
  };
  
  // 모달 상태
  isDetailModalOpen: boolean;
  isEditing: boolean;
  
  // 에러 상태
  error: string | null;
}

export interface GalleryUpdateRequest {
  title: string;
  description: string;
  tags: string[];
  category: string;
}

export interface GalleryVisibilityRequest {
  isPublic: boolean;
}

// 번역 관련 타입
export interface TranslationHistory {
  id: string;
  original: string;
  translated: string;
  source: 'ko' | 'en';
  target: 'en' | 'ko';
  engine: 'naver' | 'mymemory' | 'simple';
  timestamp: number;
  userId?: string;
}

export interface TranslationRequest {
  text: string;
  source?: 'ko' | 'en';
  target?: 'en' | 'ko';
}

export interface TranslationResponse {
  translated: string;
  original: string;
  isTranslated: boolean;
  success: boolean;
  engine?: 'naver' | 'mymemory' | 'simple';
  fromCache?: boolean;
  error?: string;
  errorType?: string;
}

export interface TranslationEngine {
  name: string;
  priority: number;
  isAvailable: boolean;
}

