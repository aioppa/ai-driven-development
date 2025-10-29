import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  varchar,
  pgEnum,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

// 이미지 공개 상태
export const visibilityEnum = pgEnum('visibility', ['private', 'public']);

// 카테고리 타입
export const categoryEnum = pgEnum('category', [
  'portrait',    // 인물
  'landscape',   // 풍경
  'character',   // 캐릭터
  'abstract',    // 추상
  'animal',      // 동물
  'architecture',// 건축
  'food',        // 음식
  'fashion',     // 패션
  'other'        // 기타
]);

// 이미지 크기
export const imageSizeEnum = pgEnum('image_size', ['small', 'medium', 'large']);

// 이미지 스타일
export const imageStyleEnum = pgEnum('image_style', [
  'realistic',      // 사실적
  'artistic',       // 예술적
  'anime',          // 애니메이션
  'cartoon',        // 만화
  'digital-art',    // 디지털 아트
  'oil-painting',   // 유화
  'watercolor',     // 수채화
  '3d-render',      // 3D 렌더링
]);

// 색조 (Color Tone)
export const colorToneEnum = pgEnum('color_tone', [
  'vibrant',        // 생생한
  'pastel',         // 파스텔
  'warm',           // 따뜻한
  'cool',           // 차가운
  'monochrome',     // 단색
  'dark',           // 어두운
  'bright',         // 밝은
  'natural',        // 자연스러운
]);

// ============================================
// TABLES
// ============================================

// 사용자 크레딧 (이미지 생성 제한)
// Clerk userId를 직접 참조합니다
export const userCredits = pgTable('user_credits', {
  id: serial('id').primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),
  credits: integer('credits').notNull().default(10), // 기본 10 크레딧
  lastRefillAt: timestamp('last_refill_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clerkUserIdIdx: uniqueIndex('user_credits_clerk_user_id_idx').on(table.clerkUserId),
}));

// 이미지 테이블
export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),
  
  // 이미지 정보
  title: varchar('title', { length: 255 }),
  description: text('description'),
  filePath: text('file_path').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  
  // 생성 정보
  prompt: text('prompt').notNull(), // 원본 프롬프트
  translatedPrompt: text('translated_prompt'), // 번역된 프롬프트
  negativePrompt: text('negative_prompt'),
  
  // 이미지 설정
  category: categoryEnum('category'),
  imageSize: imageSizeEnum('image_size').default('medium'),
  style: imageStyleEnum('style'), // 이미지 스타일
  colorTone: colorToneEnum('color_tone'), // 색조
  visibility: visibilityEnum('visibility').default('public').notNull(),
  
  // 메타데이터
  width: integer('width'),
  height: integer('height'),
  replicateId: varchar('replicate_id', { length: 255 }), // Replicate 예측 ID
  
  // 태그
  tags: text('tags').array(), // 태그 배열
  
  // 통계
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  
  // 설정
  allowDownload: boolean('allow_download').default(true).notNull(),
  allowComments: boolean('allow_comments').default(true).notNull(),
  
  // 타임스탬프
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clerkUserIdIdx: index('images_clerk_user_id_idx').on(table.clerkUserId),
  visibilityIdx: index('images_visibility_idx').on(table.visibility),
  categoryIdx: index('images_category_idx').on(table.category),
  createdAtIdx: index('images_created_at_idx').on(table.createdAt),
}));

// 좋아요 테이블
export const likes = pgTable('likes', {
  id: serial('id').primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),
  imageId: integer('image_id').notNull().references(() => images.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userImageIdx: uniqueIndex('likes_user_image_idx').on(table.clerkUserId, table.imageId),
  imageIdIdx: index('likes_image_id_idx').on(table.imageId),
  clerkUserIdIdx: index('likes_clerk_user_id_idx').on(table.clerkUserId),
}));

// 댓글 테이블
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),
  imageId: integer('image_id').notNull().references(() => images.id, { onDelete: 'cascade' }),
  parentCommentId: integer('parent_comment_id'), // 대댓글용
  content: text('content').notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  imageIdIdx: index('comments_image_id_idx').on(table.imageId),
  clerkUserIdIdx: index('comments_clerk_user_id_idx').on(table.clerkUserId),
  parentCommentIdIdx: index('comments_parent_comment_id_idx').on(table.parentCommentId),
}));

// 댓글 좋아요 테이블
export const commentLikes = pgTable('comment_likes', {
  id: serial('id').primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),
  commentId: integer('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userCommentIdx: uniqueIndex('comment_likes_user_comment_idx').on(table.clerkUserId, table.commentId),
}));

// 팔로우 테이블 (MVP 이후 단계지만 스키마 포함)
export const follows = pgTable('follows', {
  id: serial('id').primaryKey(),
  followerClerkUserId: varchar('follower_clerk_user_id', { length: 255 }).notNull(),
  followingClerkUserId: varchar('following_clerk_user_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  followerFollowingIdx: uniqueIndex('follows_follower_following_idx').on(table.followerClerkUserId, table.followingClerkUserId),
  followerIdIdx: index('follows_follower_id_idx').on(table.followerClerkUserId),
  followingIdIdx: index('follows_following_id_idx').on(table.followingClerkUserId),
}));

// ============================================
// RELATIONS
// ============================================

export const imagesRelations = relations(images, ({ many }) => ({
  likes: many(likes),
  comments: many(comments),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  image: one(images, {
    fields: [likes.imageId],
    references: [images.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  image: one(images, {
    fields: [comments.imageId],
    references: [images.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
  }),
  replies: many(comments),
  commentLikes: many(commentLikes),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
}));

// ============================================
// TYPES
// ============================================

export type UserCredit = typeof userCredits.$inferSelect;
export type NewUserCredit = typeof userCredits.$inferInsert;

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;

export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type CommentLike = typeof commentLikes.$inferSelect;
export type NewCommentLike = typeof commentLikes.$inferInsert;

export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
