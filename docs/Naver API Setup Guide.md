# 네이버 Papago 번역 API 설정 가이드

이 문서는 AIPixels 프로젝트에서 네이버 Papago 번역 API를 설정하는 방법을 설명합니다.

## 1. 네이버 개발자 센터 가입

### 1.1 개발자 센터 접속
1. [네이버 개발자 센터](https://developers.naver.com) 접속
2. 네이버 계정으로 로그인 (없으면 회원가입)

### 1.2 개발자 등록
1. "개발자 등록" 클릭
2. 필수 정보 입력:
   - 개발자명
   - 연락처
   - 이메일
   - 개발 목적
3. 약관 동의 후 등록 완료

## 2. Papago 번역 API 신청

### 2.1 애플리케이션 등록
1. 개발자 센터 대시보드에서 "Application" → "애플리케이션 등록" 클릭
2. 애플리케이션 정보 입력:
   - 애플리케이션 이름: `AIPixels Translation Service`
   - 사용 API: `Papago 번역 API` 선택
   - 서비스 환경: `Web` 선택
   - 로그인 오픈 API 서비스 환경: `개발용` 선택

### 2.2 API 신청
1. "API 신청" 버튼 클릭
2. 신청 사유 작성:
   ```
   AI 이미지 생성 서비스에서 사용자 프롬프트 번역을 위해 Papago 번역 API를 사용합니다.
   한국어 프롬프트를 영어로 번역하여 AI 이미지 생성 모델의 품질을 향상시키는 것이 목적입니다.
   ```
3. 신청 완료 후 승인 대기 (보통 1-2일 소요)

## 3. API 키 발급

### 3.1 Client ID 및 Client Secret 확인
1. 애플리케이션 등록 완료 후 "내 애플리케이션" 메뉴에서 해당 애플리케이션 선택
2. "Client ID"와 "Client Secret" 확인 및 복사

### 3.2 API 키 보안 관리
- Client Secret은 절대 공개하지 마세요
- 환경 변수 파일(.env.local)에만 저장
- Git에 커밋하지 않도록 주의

## 4. API 사용량 제한 및 요금 정책

### 4.1 무료 사용량
- **일일 요청 수**: 10,000회
- **월간 요청 수**: 300,000회
- **초당 요청 수**: 10회

### 4.2 유료 플랜 (필요시)
- **Basic**: 월 1,000,000회까지 무료
- **Pro**: 월 5,000,000회까지 무료
- **Enterprise**: 맞춤형 요금제

### 4.3 사용량 모니터링
- 개발자 센터에서 실시간 사용량 확인 가능
- 임계치 설정 및 알림 기능 제공

## 5. API 사용 예시

### 5.1 기본 요청 형식
```javascript
const response = await fetch('https://openapi.naver.com/v1/papago/n2mt', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
    'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
  },
  body: new URLSearchParams({
    source: 'ko',
    target: 'en',
    text: '안녕하세요'
  })
});
```

### 5.2 응답 형식
```json
{
  "message": {
    "result": {
      "srcLangType": "ko",
      "tarLangType": "en",
      "translatedText": "Hello"
    }
  }
}
```

## 6. 환경 변수 설정

### 6.1 .env.local 파일에 추가
```bash
# 네이버 Papago API 설정
NAVER_CLIENT_ID=your_naver_client_id_here
NAVER_CLIENT_SECRET=your_naver_client_secret_here
```

### 6.2 환경 변수 확인
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 번역 기능 테스트
```

## 7. 문제 해결

### 7.1 일반적인 오류
- **401 Unauthorized**: API 키가 잘못되었거나 만료됨
- **429 Too Many Requests**: API 사용량 초과
- **500 Internal Server Error**: 서버 내부 오류

### 7.2 디버깅 팁
- 네트워크 탭에서 API 요청/응답 확인
- 콘솔에서 에러 메시지 확인
- API 사용량 대시보드에서 할당량 확인

## 8. 보안 주의사항

- API 키는 절대 클라이언트 사이드에 노출하지 마세요
- 서버 사이드에서만 API 호출
- 환경 변수 파일은 .gitignore에 포함
- 프로덕션 환경에서는 안전한 키 관리 시스템 사용

## 9. 추가 리소스

- [네이버 개발자 센터](https://developers.naver.com)
- [Papago 번역 API 문서](https://developers.naver.com/docs/papago/papago-nmt-api-reference.md)
- [API 사용 가이드](https://developers.naver.com/docs/papago/papago-nmt-api-guide.md)
