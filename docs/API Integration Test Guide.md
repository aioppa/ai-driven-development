# API 연동 테스트 가이드

이 문서는 Replicate API 연동이 제대로 작동하는지 테스트하는 방법을 설명합니다.

## 사전 준비

### 1. 환경 변수 설정
```bash
# .env.local 파일에 Replicate API 토큰 설정
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

### 2. 필요한 패키지 설치
```bash
npm install replicate
```

## 테스트 방법

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. 브라우저에서 테스트
1. `http://localhost:3000/generate` 접속
2. 프롬프트 입력 (예: "A beautiful sunset over mountains")
3. 스타일 선택
4. "AI 이미지 생성" 버튼 클릭
5. 이미지 생성 과정 확인

### 3. API 엔드포인트 직접 테스트

#### 이미지 생성 API 테스트
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "styleId": "1",
    "userId": "test-user",
    "sessionId": "test-session"
  }'
```

#### 예측 상태 확인 API 테스트
```bash
curl -X GET http://localhost:3000/api/predictions/{prediction_id}
```

## 예상 결과

### 성공적인 응답
```json
{
  "success": true,
  "images": [
    {
      "id": "gen_1234567890_0",
      "url": "https://replicate.delivery/pbxt/...",
      "thumbnailUrl": "https://replicate.delivery/pbxt/...",
      "prompt": "A beautiful sunset over mountains",
      "styleId": "1",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "predictionId": "abc123"
    }
  ],
  "generationTime": 15.5,
  "remainingCredits": 17,
  "message": "이미지가 성공적으로 생성되었습니다.",
  "predictionId": "abc123"
}
```

### 에러 응답
```json
{
  "error": "프롬프트가 필요합니다.",
  "success": false,
  "images": [],
  "generationTime": 0,
  "remainingCredits": 17
}
```

## 문제 해결

### 1. API 토큰 오류
```
Error: REPLICATE_API_TOKEN is not set
```
**해결방법:** `.env.local` 파일에 올바른 API 토큰 설정

### 2. 네트워크 오류
```
Error: Failed to create prediction
```
**해결방법:** 
- 인터넷 연결 확인
- Replicate 서비스 상태 확인
- API 토큰 유효성 확인

### 3. 타임아웃 오류
```
Error: Prediction timeout - maximum attempts reached
```
**해결방법:**
- 프롬프트 길이 줄이기
- 더 간단한 프롬프트로 테스트
- Replicate 서버 상태 확인

### 4. 이미지 도메인 오류
```
Error: Invalid src prop
```
**해결방법:** `next.config.ts`에 Replicate 도메인 추가 확인

## 성능 모니터링

### 생성 시간 측정
- 일반적인 생성 시간: 10-30초
- 타임아웃 임계값: 60초
- 최대 재시도 횟수: 30회

### 크레딧 사용량
- 이미지 1개 생성당 1 크레딧 소모
- 일일 무료 크레딧: 20개
- 프리미엄 사용자: 100개

## 로그 확인

### 서버 로그
```bash
# 개발 서버 실행 시 콘솔에서 로그 확인
npm run dev
```

### 브라우저 개발자 도구
1. F12 키로 개발자 도구 열기
2. Network 탭에서 API 요청 확인
3. Console 탭에서 에러 메시지 확인

## 추가 테스트 시나리오

### 1. 다양한 프롬프트 테스트
- 짧은 프롬프트: "cat"
- 긴 프롬프트: "A detailed painting of a medieval castle..."
- 한국어 프롬프트: "아름다운 산 풍경"
- 영어 프롬프트: "Beautiful mountain landscape"

### 2. 다양한 스타일 테스트
- 사실적 (styleId: "1")
- 애니메이션 (styleId: "2")
- 디지털 아트 (styleId: "3")
- 미니멀 (styleId: "4")
- 판타지 (styleId: "5")

### 3. 에러 상황 테스트
- 빈 프롬프트
- 200자 초과 프롬프트
- 금칙어 포함 프롬프트
- 잘못된 스타일 ID

## 성공 기준

✅ **API 연동 성공 기준:**
1. 이미지 생성 요청이 성공적으로 처리됨
2. 생성된 이미지가 정상적으로 표시됨
3. 에러 상황에서 적절한 에러 메시지 표시
4. 생성 시간이 60초 이내 완료
5. 다양한 프롬프트와 스타일에서 정상 작동
