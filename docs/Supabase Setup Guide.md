# Supabase 설정 가이드

AIPixels 프로젝트에서 Supabase를 사용하여 이미지 저장 및 데이터베이스를 관리하는 방법을 설명합니다.

## 📋 목차

1. [Supabase 프로젝트 생성](#supabase-프로젝트-생성)
2. [환경 변수 설정](#환경-변수-설정)
3. [Storage 버킷 설정](#storage-버킷-설정)
4. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
5. [필요한 패키지 설치](#필요한-패키지-설치)

---

## Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 웹사이트에서 계정 생성 또는 로그인
2. "New Project" 버튼을 클릭하여 새 프로젝트 생성
3. 프로젝트 이름, 데이터베이스 비밀번호, 지역을 설정
4. 프로젝트가 생성될 때까지 대기 (약 2-3분 소요)

---

## 환경 변수 설정

### 1. Supabase URL 가져오기

1. Supabase 프로젝트 대시보드로 이동
2. 왼쪽 메뉴에서 **Settings** > **API** 클릭
3. **Project URL** 복사 (예: `https://xjmsaxfoysmrkvlwslnl.supabase.co`)

### 2. Service Role Key 가져오기

1. 같은 API 설정 페이지에서 **Service Role** 섹션으로 스크롤
2. **service_role** 키 복사 (⚠️ 주의: 이 키는 절대 클라이언트에 노출하면 안 됩니다)

### 3. Database URL 가져오기

1. **Settings** > **Database** 클릭
2. **Connection string** 섹션에서 **URI** 탭 선택
3. 연결 문자열 복사 및 `[YOUR-PASSWORD]` 부분을 실제 데이터베이스 비밀번호로 교체

### 4. .env.local 파일 업데이트

프로젝트 루트의 `.env.local` 파일에 다음 환경 변수를 추가합니다:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://xjmsaxfoysmrkvlwslnl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database 설정 (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:your_password@db.xjmsaxfoysmrkvlwslnl.supabase.co:5432/postgres
```

---

## Storage 버킷 설정

### 1. 버킷 생성

1. Supabase 대시보드에서 **Storage** 메뉴 클릭
2. **Create a new bucket** 버튼 클릭
3. 버킷 설정:
   - **Name**: `images`
   - **Public bucket**: ✅ 체크 (이미지를 공개적으로 접근 가능하게 설정)
4. **Create bucket** 클릭

### 2. 버킷 정책 설정 (선택사항)

공개 버킷으로 설정했다면 별도의 정책 설정이 필요하지 않습니다. 
하지만 더 세밀한 권한 제어가 필요하다면 Storage Policies를 설정할 수 있습니다.

**공개 읽기 허용 정책 예시:**
```sql
-- Storage Policy: 모든 사용자가 읽을 수 있도록 허용
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );
```

**인증된 사용자 업로드 허용 정책 예시:**
```sql
-- Storage Policy: 인증된 사용자만 업로드 가능
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'images' AND
  auth.role() = 'authenticated'
);
```

---

## 데이터베이스 마이그레이션

### 1. 스키마 확인

프로젝트의 `db/schema.ts` 파일에 정의된 데이터베이스 스키마를 확인합니다.

### 2. 마이그레이션 파일 생성

```bash
npm run db:generate
```

이 명령어는 Drizzle ORM을 사용하여 스키마로부터 마이그레이션 파일을 자동 생성합니다.
생성된 파일은 `supabase/migrations/` 폴더에 저장됩니다.

### 3. 마이그레이션 실행

```bash
npm run db:push
```

이 명령어는 생성된 마이그레이션을 Supabase 데이터베이스에 적용합니다.

### 4. 마이그레이션 확인

1. Supabase 대시보드에서 **Table Editor** 메뉴 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `user_credits`
   - `images`
   - `likes`
   - `comments`
   - `comment_likes`
   - `follows`

---

## 필요한 패키지 설치

### 1. Supabase JavaScript 클라이언트 설치

```bash
npm install @supabase/supabase-js
```

### 2. UUID 생성 라이브러리 설치

```bash
npm install uuid
npm install --save-dev @types/uuid
```

### 3. 설치 확인

`package.json` 파일의 `dependencies`에 다음 패키지들이 추가되었는지 확인:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "uuid": "^9.x.x"
  },
  "devDependencies": {
    "@types/uuid": "^9.x.x"
  }
}
```

---

## 테스트

### 1. 이미지 생성 API 테스트

프론트엔드에서 이미지 생성 요청을 보내거나, 다음 curl 명령어로 테스트:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a beautiful sunset over the ocean",
    "styleId": "1",
    "aspectRatio": "16:9"
  }'
```

### 2. Storage 확인

1. Supabase 대시보드 > **Storage** > **images** 버킷 클릭
2. `[clerk-user-id]/` 폴더에 이미지 파일이 업로드되었는지 확인

### 3. Database 확인

1. Supabase 대시보드 > **Table Editor** > **images** 테이블 클릭
2. 새로운 레코드가 생성되었는지 확인
3. `file_path` 컬럼에 올바른 경로가 저장되었는지 확인

---

## 트러블슈팅

### Storage 업로드 실패

**에러**: `Permission denied`

**해결 방법**:
1. Storage 버킷이 Public으로 설정되어 있는지 확인
2. Storage Policies가 올바르게 설정되어 있는지 확인
3. `SUPABASE_SERVICE_ROLE_KEY`가 올바르게 설정되어 있는지 확인

### Database 연결 실패

**에러**: `Connection refused` or `Could not connect to database`

**해결 방법**:
1. `DATABASE_URL` 환경 변수가 올바르게 설정되어 있는지 확인
2. 데이터베이스 비밀번호가 정확한지 확인
3. Supabase 프로젝트가 활성 상태인지 확인

### 마이그레이션 실패

**에러**: `Migration failed`

**해결 방법**:
1. `db/schema.ts` 파일의 문법 오류 확인
2. Drizzle ORM이 올바르게 설치되어 있는지 확인
3. 기존 마이그레이션 파일과 충돌이 없는지 확인

---

## 보안 주의사항

⚠️ **중요**: 다음 사항을 반드시 준수하세요:

1. `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 코드에 노출하지 마세요
2. `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다
3. 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요 (Vercel, AWS 등의 환경 변수 관리 기능 사용)
4. Public 버킷을 사용하는 경우, 부적절한 콘텐츠 업로드를 방지하는 추가 검증 로직을 구현하세요

---

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Storage 가이드](https://supabase.com/docs/guides/storage)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/basic-features/environment-variables)

