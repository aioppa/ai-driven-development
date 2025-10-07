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

