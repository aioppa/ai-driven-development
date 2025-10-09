# 환경 변수 설정 가이드

이 문서는 AIPixels 프로젝트의 환경 변수 설정 방법을 설명합니다.

## 필수 환경 변수

### 1. Replicate API 설정

```bash
# .env.local 파일에 추가
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

**설정 방법:**
1. [Replicate](https://replicate.com) 웹사이트에서 계정 생성
2. API 토큰 발급받기
3. `.env.local` 파일에 토큰 추가

### 2. 네이버 Papago API 설정

```bash
# .env.local 파일에 추가
NAVER_CLIENT_ID=meslnjfyk1
NAVER_CLIENT_SECRET=xcQjedax3LmJiYq9oVrYUSJJvoLKB9YQc5O7C7Ip
```

**설정 방법:**
1. [네이버 개발자 센터](https://developers.naver.com)에서 계정 생성
2. Papago 번역 API 신청 및 승인
3. Client ID 및 Client Secret 발급받기
4. `.env.local` 파일에 키 추가
5. 자세한 설정 방법은 `docs/Naver API Setup Guide.md` 참조

### 3. Next.js 설정

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 선택적 환경 변수 (향후 확장용)

### 데이터베이스 설정
```bash
DATABASE_URL=your_database_url_here
```

### 인증 설정
```bash
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 파일 저장소 설정 (AWS S3)
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name
```

## 환경 변수 파일 생성

1. 프로젝트 루트에 `.env.local` 파일 생성
2. 위의 환경 변수들을 복사하여 붙여넣기
3. 실제 값으로 교체

### 예시 .env.local 파일
```bash
# Replicate API 설정
REPLICATE_API_TOKEN=your_replicate_api_token_here

# 네이버 Papago API 설정
NAVER_CLIENT_ID=your_naver_client_id_here
NAVER_CLIENT_SECRET=your_naver_client_secret_here

# Next.js 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 보안 주의사항

- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- API 토큰과 같은 민감한 정보는 절대 공개 저장소에 업로드하지 마세요
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요

## 환경 변수 확인

환경 변수가 제대로 설정되었는지 확인하려면:

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
# 이미지 생성 기능 테스트
```
