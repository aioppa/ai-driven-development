# 데이터베이스 스키마 설계

AIPixels 서비스의 전체 데이터베이스 스키마 설계 문서입니다.

## 📋 목차

1. [개요](#개요)
2. [테이블 구조](#테이블-구조)
3. [관계도](#관계도)
4. [인덱스 전략](#인덱스-전략)
5. [마이그레이션](#마이그레이션)

---

## 개요

### 사용 기술
- **ORM**: Drizzle ORM
- **데이터베이스**: PostgreSQL
- **인증**: Clerk (외부 서비스 - 사용자 정보는 Clerk DB에서 관리)

### 설계 원칙
- **Clerk 통합**: 사용자 테이블 없이 `clerk_user_id`를 직접 참조
- MVP 기능에 필요한 모든 테이블 포함
- 확장 가능한 구조 (팔로우 기능 등 미래 기능 포함)
- 적절한 인덱스로 쿼리 성능 최적화
- Cascade Delete로 데이터 무결성 보장

---

## 테이블 구조

### 1. user_credits (사용자 크레딧)
이미지 생성 제한을 위한 크레딧 시스템입니다. Clerk userId를 직접 참조합니다.

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | serial | 기본키 | PK |
| clerk_user_id | varchar(255) | Clerk 사용자 ID | NOT NULL |
| credits | integer | 보유 크레딧 | NOT NULL, DEFAULT 10 |
| last_refill_at | timestamp | 마지막 충전일 | NOT NULL, DEFAULT NOW |
| created_at | timestamp | 생성일 | NOT NULL, DEFAULT NOW |
| updated_at | timestamp | 수정일 | NOT NULL, DEFAULT NOW |

**인덱스**: `user_credits_clerk_user_id_idx` (clerk_user_id) - UNIQUE

**비즈니스 로직**:
- 신규 사용자는 10 크레딧으로 시작
- 이미지 생성 시 1 크레딧 차감
- 일일 크레딧 자동 충전 가능

---

### 2. images (이미지)
생성된 AI 이미지의 모든 정보를 저장합니다.

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | serial | 기본키 | PK |
| clerk_user_id | varchar(255) | 생성자 Clerk ID | NOT NULL |
| **이미지 정보** | | | |
| title | varchar(255) | 제목 | - |
| description | text | 설명 | - |
| file_path | text | 이미지 파일 경로 | NOT NULL |
| thumbnail_url | text | 썸네일 URL | - |
| **생성 정보** | | | |
| prompt | text | 원본 프롬프트 (한글) | NOT NULL |
| translated_prompt | text | 번역된 프롬프트 (영어) | - |
| negative_prompt | text | 제외 프롬프트 | - |
| **설정** | | | |
| category | enum | 카테고리 | - |
| image_size | enum | 이미지 크기 | DEFAULT 'medium' |
| style | enum | 이미지 스타일 | - |
| color_tone | enum | 색조 | - |
| visibility | enum | 공개 상태 | NOT NULL, DEFAULT 'private' |
| **메타데이터** | | | |
| width | integer | 가로 크기 | - |
| height | integer | 세로 크기 | - |
| replicate_id | varchar(255) | Replicate 예측 ID | - |
| **태그** | | | |
| tags | text[] | 태그 배열 | - |
| **통계** | | | |
| view_count | integer | 조회수 | DEFAULT 0 |
| like_count | integer | 좋아요 수 | DEFAULT 0 |
| comment_count | integer | 댓글 수 | DEFAULT 0 |
| download_count | integer | 다운로드 수 | DEFAULT 0 |
| **권한 설정** | | | |
| allow_download | boolean | 다운로드 허용 | DEFAULT true |
| allow_comments | boolean | 댓글 허용 | DEFAULT true |
| **타임스탬프** | | | |
| created_at | timestamp | 생성일 | NOT NULL, DEFAULT NOW |
| updated_at | timestamp | 수정일 | NOT NULL, DEFAULT NOW |

**ENUM 타입**:
- `visibility`: 'private' | 'public'
- `category`: 'portrait' | 'landscape' | 'character' | 'abstract' | 'animal' | 'architecture' | 'food' | 'fashion' | 'other'
- `image_size`: 'small' | 'medium' | 'large'
- `style`: 'realistic' | 'artistic' | 'anime' | 'cartoon' | 'digital-art' | 'oil-painting' | 'watercolor' | '3d-render'
- `color_tone`: 'vibrant' | 'pastel' | 'warm' | 'cool' | 'monochrome' | 'dark' | 'bright' | 'natural'

**인덱스**:
- `images_clerk_user_id_idx` (clerk_user_id)
- `images_visibility_idx` (visibility)
- `images_category_idx` (category)
- `images_created_at_idx` (created_at)

---

### 3. likes (좋아요)
사용자가 이미지에 누른 좋아요 정보입니다.

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | serial | 기본키 | PK |
| clerk_user_id | varchar(255) | Clerk 사용자 ID | NOT NULL |
| image_id | integer | 이미지 ID | FK (images), NOT NULL |
| created_at | timestamp | 생성일 | NOT NULL, DEFAULT NOW |

**인덱스**:
- `likes_user_image_idx` (clerk_user_id, image_id) - UNIQUE (중복 좋아요 방지)
- `likes_image_id_idx` (image_id)
- `likes_clerk_user_id_idx` (clerk_user_id)

---

### 4. comments (댓글)
이미지에 달린 댓글 정보입니다. 대댓글 기능도 지원합니다.

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | serial | 기본키 | PK |
| clerk_user_id | varchar(255) | 작성자 Clerk ID | NOT NULL |
| image_id | integer | 이미지 ID | FK (images), NOT NULL |
| parent_comment_id | integer | 부모 댓글 ID (대댓글용) | FK (comments), NULL |
| content | text | 댓글 내용 | NOT NULL |
| like_count | integer | 좋아요 수 | DEFAULT 0 |
| created_at | timestamp | 생성일 | NOT NULL, DEFAULT NOW |
| updated_at | timestamp | 수정일 | NOT NULL, DEFAULT NOW |

**인덱스**:
- `comments_image_id_idx` (image_id)
- `comments_clerk_user_id_idx` (clerk_user_id)
- `comments_parent_comment_id_idx` (parent_comment_id)

---

### 5. comment_likes (댓글 좋아요)
댓글에 대한 좋아요 정보입니다.

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | serial | 기본키 | PK |
| clerk_user_id | varchar(255) | Clerk 사용자 ID | NOT NULL |
| comment_id | integer | 댓글 ID | FK (comments), NOT NULL |
| created_at | timestamp | 생성일 | NOT NULL, DEFAULT NOW |

**인덱스**:
- `comment_likes_user_comment_idx` (clerk_user_id, comment_id) - UNIQUE

---

### 6. follows (팔로우)
사용자 간 팔로우 관계입니다. (MVP 이후 단계)

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| id | serial | 기본키 | PK |
| follower_clerk_user_id | varchar(255) | 팔로워 Clerk ID | NOT NULL |
| following_clerk_user_id | varchar(255) | 팔로잉 Clerk ID | NOT NULL |
| created_at | timestamp | 생성일 | NOT NULL, DEFAULT NOW |

**인덱스**:
- `follows_follower_following_idx` (follower_clerk_user_id, following_clerk_user_id) - UNIQUE
- `follows_follower_id_idx` (follower_clerk_user_id)
- `follows_following_id_idx` (following_clerk_user_id)

---

## 관계도

```
Clerk Users (외부) 
    ↓ clerk_user_id
    ├──> user_credits (1:1)
    ├──> images (1:N)
    ├──> likes (1:N)
    ├──> comments (1:N)
    ├──> comment_likes (1:N)
    └──> follows (N:N, self-referencing)

images (1) ─────< (N) likes
images (1) ─────< (N) comments

comments (1) ─────< (N) comment_likes
comments (1) ─────< (N) comments (self-referencing for replies)
```

---

## Clerk 통합 패턴

### 사용자 정보 가져오기
```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

// 현재 사용자 ID만 필요한 경우
const { userId } = await auth();

// 전체 사용자 정보가 필요한 경우 (이름, 이메일, 프로필 이미지 등)
const user = await currentUser();
```

### 데이터 저장 시
```typescript
const { userId } = await auth();

await db.insert(images).values({
  clerkUserId: userId!,
  imageUrl: 'https://...',
  prompt: 'A beautiful sunset',
  // ...
});
```

### 사용자 정보와 함께 조회
```typescript
import { clerkClient } from '@clerk/nextjs/server';

const images = await db.select().from(images).where(eq(images.visibility, 'public'));

// Clerk에서 사용자 정보 가져오기
const client = await clerkClient();
const userIds = [...new Set(images.map(img => img.clerkUserId))];
const users = await client.users.getUserList({ userId: userIds });

// 결합
const imagesWithUsers = images.map(img => ({
  ...img,
  user: users.find(u => u.id === img.clerkUserId)
}));
```

---

## 인덱스 전략

### 쿼리 최적화를 위한 인덱스

1. **Clerk 사용자 조회**: `clerk_user_id_idx` (모든 테이블)
2. **피드 조회** (공개 이미지, 최신순):
   - `images_visibility_idx`
   - `images_created_at_idx`
3. **카테고리별 필터링**: `images_category_idx`
4. **사용자별 이미지 조회**: `images_clerk_user_id_idx`
5. **좋아요 중복 방지**: `likes_user_image_idx` (UNIQUE)
6. **태그 검색**: `tags_name_idx`, `tags_slug_idx`

---

## 마이그레이션

### 마이그레이션 생성

```bash
# 스키마 변경사항을 기반으로 마이그레이션 파일 생성
npm run db:generate

# 또는 Drizzle Kit 직접 사용
npx drizzle-kit generate
```

### 마이그레이션 실행

```bash
# 데이터베이스에 마이그레이션 적용
npm run db:push

# 또는 Drizzle Kit 직접 사용
npx drizzle-kit push
```

### 마이그레이션 파일 위치
`supabase/migrations/` 디렉토리에 생성됩니다.

---

## 주요 쿼리 예시

### 1. 커뮤니티 피드 조회 (최신순)
```typescript
const publicImages = await db
  .select()
  .from(images)
  .where(eq(images.visibility, 'public'))
  .orderBy(desc(images.createdAt))
  .limit(20);
```

### 2. 사용자별 갤러리 조회
```typescript
const { userId } = await auth();

const userImages = await db
  .select()
  .from(images)
  .where(eq(images.clerkUserId, userId!))
  .orderBy(desc(images.createdAt));
```

### 3. 카테고리별 이미지 조회
```typescript
const categoryImages = await db
  .select()
  .from(images)
  .where(
    and(
      eq(images.visibility, 'public'),
      eq(images.category, 'portrait')
    )
  )
  .orderBy(desc(images.likeCount));
```

### 4. 태그로 이미지 검색
```typescript
const taggedImages = await db
  .select()
  .from(images)
  .where(
    and(
      eq(images.visibility, 'public'),
      sql`'anime' = ANY(${images.tags})`
    )
  )
  .orderBy(desc(images.createdAt));
```

### 5. 이미지 상세 + 좋아요 여부
```typescript
const { userId } = await auth();

const imageDetail = await db
  .select({
    image: images,
    isLiked: sql<boolean>`EXISTS(
      SELECT 1 FROM ${likes} 
      WHERE ${likes.imageId} = ${images.id} 
      AND ${likes.clerkUserId} = ${userId}
    )`
  })
  .from(images)
  .where(eq(images.id, imageId));
```

### 6. 사용자 크레딧 조회 및 생성
```typescript
const { userId } = await auth();

let userCredit = await db
  .select()
  .from(userCredits)
  .where(eq(userCredits.clerkUserId, userId!))
  .limit(1);

if (!userCredit.length) {
  // 신규 사용자: 크레딧 레코드 생성
  userCredit = await db
    .insert(userCredits)
    .values({ clerkUserId: userId!, credits: 10 })
    .returning();
}
```

---

## 성능 고려사항

### 1. 통계 필드 (비정규화)
- `like_count`, `comment_count`, `view_count` 등은 비정규화된 필드입니다
- 매번 JOIN 없이 빠른 조회 가능
- 좋아요/댓글 추가/삭제 시 트리거 또는 애플리케이션 레벨에서 업데이트 필요

### 2. Clerk 데이터 캐싱
- Clerk API 호출은 비용이 들 수 있으므로 필요시 캐싱 고려
- 대량의 사용자 정보는 한 번에 조회 (`getUserList`)

### 3. 인덱스 최적화
- 복합 인덱스 활용으로 쿼리 성능 향상
- UNIQUE 인덱스로 데이터 무결성 보장

### 4. Cascade Delete
- 이미지 삭제 시 연관된 좋아요, 댓글 자동 삭제
- Clerk 사용자 삭제는 Webhook으로 처리 가능

### 5. 페이지네이션
- 커서 기반 페이지네이션 권장 (created_at 기준)
- 대용량 데이터에서도 일관된 성능 제공

---

## Clerk Webhook 처리

사용자가 Clerk에서 삭제되면 해당 사용자의 데이터도 정리해야 합니다:

```typescript
// app/api/webhooks/clerk/route.ts
export async function POST(req: Request) {
  const { type, data } = await req.json();
  
  if (type === 'user.deleted') {
    const clerkUserId = data.id;
    
    // 사용자의 모든 데이터 삭제 (CASCADE로 자동 처리됨)
    await db.delete(images).where(eq(images.clerkUserId, clerkUserId));
    await db.delete(userCredits).where(eq(userCredits.clerkUserId, clerkUserId));
    await db.delete(likes).where(eq(likes.clerkUserId, clerkUserId));
    await db.delete(comments).where(eq(comments.clerkUserId, clerkUserId));
    await db.delete(commentLikes).where(eq(commentLikes.clerkUserId, clerkUserId));
  }
  
  return Response.json({ success: true });
}
```

---

## 향후 확장 계획

### MVP 이후 추가 기능
1. **팔로우 시스템**: `follows` 테이블 활성화
2. **알림 시스템**: `notifications` 테이블 추가
3. **컬렉션**: 이미지 북마크/저장 기능
4. **신고 시스템**: `reports` 테이블 추가
5. **이미지 버전 관리**: 같은 프롬프트로 재생성한 이미지 연결

---

## 참고 문서
- [Drizzle ORM 공식 문서](https://orm.drizzle.team/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Clerk 공식 문서](https://clerk.com/docs)
- [AIPixels PRD](./PRD.md)

