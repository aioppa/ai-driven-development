
# 📑 AIPixels 기능 종합 명세서

---

## 1. 라우팅 구조 (서비스 기본 뼈대)

```
/
 ├─ / (메인페이지: 프롬프트 입력 + 커뮤니티 피드)
 ├─ /generate (이미지 생성 페이지)
 ├─ /gallery (갤러리 관리 페이지)
 └─ /feed (커뮤니티 피드 전체 페이지)
```

* **`/` 루트 경로** : 사용자가 가장 먼저 접속하는 메인페이지 (프롬프트 + 커뮤니티 피드).
* **`/generate`** : 이미지 생성 전용 페이지 (스타일 선택 + AI 생성).
* **`/gallery`** : 개인 갤러리 관리, 공개/비공개 전환.
* **`/feed`** : 전체 커뮤니티 피드 탐색 전용 페이지.

---

## 2. 메인페이지 (`/`)

### 🔹 프론트엔드

* 프롬프트 입력 (200자 제한, 포커스 효과)
* 스타일 옵션 버튼 (최근 사용 강조)
* 하단 커뮤니티 피드 (썸네일 카드, 좋아요/댓글/프롬프트 복제)
* 정렬 탭: 최신순/인기순
* 무한 스크롤 피드

### 🔹 백엔드

* 프롬프트 입력값 검증, 금칙어 필터링
* 피드 데이터 제공 (정렬/필터링/페이지네이션)
* 좋아요/댓글/프롬프트 복제 기록 저장

### 🔹 API

* `/api/prompt` (POST: 프롬프트 제출)
* `/api/feed` (GET: 피드 조회)
* `/api/feed/{id}/like` (POST: 좋아요 토글)
* `/api/feed/{id}/comment` (POST: 댓글 작성)
* `/api/prompt/clone` (POST: 프롬프트 복제)
* `/api/tags`, `/api/categories` (GET: 탐색 필터)

---

## 3. 이미지 생성 페이지 (`/generate`)

### 🔹 프론트엔드

* 스타일 옵션 선택 (카드 UI)
* 프롬프트 입력 (500자 제한)
* [AI 이미지 생성] 버튼 → 썸네일 리스트 출력
* 이미지 선택 후 → 제목/설명/태그/카테고리 입력
* [저장], [공유] 버튼 제공
* 로딩/성공/오류 알림 표시

### 🔹 백엔드

* AI 이미지 생성 모델 호출
* 사용자별 생성 횟수 제한 (예: 무료 20회/일)
* 이미지 메타데이터 DB 저장
* 저장 시 비공개, 공유 시 공개로 상태 전환

### 🔹 API

* `/api/styles` (GET: 스타일 목록)
* `/api/generate` (POST: 이미지 생성)
* `/api/gallery/save` (POST: 저장)
* `/api/gallery/share` (POST: 공유)
* `/api/tags`, `/api/categories` (GET: 자동완성/분류)

---

## 4. 갤러리 관리 페이지 (`/gallery`)

### 🔹 프론트엔드

* 탭: [내 갤러리] / [공개 이미지]
* 이미지 카드: 썸네일, 제목, 상태 표시
* 버튼: [편집] [삭제] [공개 전환]
* 무한 스크롤, 태그 검색, 카테고리 필터

### 🔹 백엔드

* 사용자별 갤러리 데이터 조회
* 이미지 편집/삭제/공개 상태 전환
* soft delete 적용 (DB flag)
* 권한 검증 (user_id 확인)

### 🔹 API

* `/api/gallery` (GET: 갤러리 조회)
* `/api/gallery/{id}` (PUT: 편집, DELETE: 삭제)
* `/api/gallery/{id}/visibility` (POST: 공개 전환)
* `/api/tags`, `/api/categories` (GET: 검색/필터)

---

## 5. 커뮤니티 피드 페이지 (`/feed`)

### 🔹 프론트엔드

* 카테고리 드롭다운, 태그 검색창
* 정렬 탭: 최신순/인기순
* 이미지 카드 리스트 (좋아요/댓글/복제 가능)
* 상세보기 모달 (큰 이미지, 설명, 댓글 스레드)
* 무한 스크롤

### 🔹 백엔드

* 공개 이미지 데이터 제공 (정렬/페이지네이션)
* 상호작용 기록 (좋아요/댓글/복제)
* 콘텐츠 검증 및 신고 처리
* 관리자 권한으로 댓글/이미지 삭제 가능

### 🔹 API

* `/api/feed` (GET: 피드 조회)
* `/api/feed/{id}/like` (POST: 좋아요)
* `/api/feed/{id}/comments` (GET: 댓글 조회)
* `/api/feed/{id}/comment` (POST: 댓글 작성)
* `/api/prompt/clone` (POST: 프롬프트 복제)
* `/api/report` (POST: 신고 – 옵션)

---

## 6. 전체 시스템 아키텍처 요약

```
[Frontend: React/Next.js]
 ├─ / (메인페이지)
 ├─ /generate (이미지 생성)
 ├─ /gallery (갤러리 관리)
 └─ /feed (커뮤니티 피드)

[Backend: Node.js/Express or Nest.js]
 ├─ Prompt API
 ├─ Gallery API
 ├─ Feed API
 ├─ Tag/Category API
 └─ Auth/Policy API

[Infra/외부 연동]
 ├─ AI 이미지 생성 API (예: Stable Diffusion, OpenAI DALL-E 등)
 ├─ Object Storage (AWS S3 / GCP Storage)
 └─ DB (PostgreSQL/MySQL + Redis 캐시)
```

---

## ✅ 최종 요약

* **루트 경로 `/` → 메인페이지**: 즉시 프롬프트 입력과 피드 탐색 제공.
* **이미지 생성**: 창작 기능 핵심, 메타데이터 입력 후 저장/공유 가능.
* **갤러리 관리**: 내 자산 관리, CRUD + 공개 설정.
* **커뮤니티 피드**: 공개 공유와 탐색/상호작용의 중심.
* **API**는 CRUD + 소셜 인터랙션 + AI 모델 호출로 구성.
* **백엔드**는 데이터 정합성과 정책 관리, **프론트엔드**는 최소 클릭·직관 UI를 담당.

