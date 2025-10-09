<!-- dc6a1d68-52d9-42bc-8cc6-93e73fadd511 99ce1313-b284-4b1f-9270-03acb889ae44 -->
# 한글 프롬프트 자동 번역 기능 구현

## 1. 무료 번역 라이브러리 설치

- `@vitalets/google-translate-api` 패키지 설치
- 무료이며 별도 API 키 불필요

## 2. 번역 API 엔드포인트 생성

**파일**: `app/api/translate/route.ts` (새 파일)

- POST 요청으로 텍스트를 받아 한글→영어 번역
- 한글 감지: `/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/` 정규식 사용
- 에러 처리 및 폴백 로직 포함
```typescript
export async function POST(request: Request) {
  const { text } = await request.json();
  // 한글 감지
  const hasKorean = /[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(text);
  if (!hasKorean) return { translated: text, original: text, isTranslated: false };
  
  // Google Translate API 사용
  const result = await translate(text, { to: 'en' });
  return { translated: result.text, original: text, isTranslated: true };
}
```


## 3. PromptInput 컴포넌트 수정

**파일**: `components/generate/PromptInput.tsx`

### 상태 추가

- `translatedPrompt`: 번역된 프롬프트 저장
- `isTranslating`: 번역 진행 상태
- `showTranslation`: 번역 결과 표시 여부

### UI 변경사항

- 프롬프트 입력창 아래에 번역 결과 표시 영역 추가
- 한글 입력 감지 시 자동으로 번역 API 호출 (debounce 500ms)
- 번역 중 로딩 인디케이터 표시
- 번역 결과를 접을 수 있는 토글 버튼
```typescript
// 번역 결과 표시 예시
{translatedPrompt && (
  <div className="mt-2 p-3 bg-white/5 rounded-lg">
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/60">번역된 프롬프트</span>
      <button onClick={() => setShowTranslation(!showTranslation)}>
        {showTranslation ? '접기' : '펼치기'}
      </button>
    </div>
    {showTranslation && (
      <p className="text-sm text-white/80 mt-1">{translatedPrompt}</p>
    )}
  </div>
)}
```


## 4. 이미지 생성 로직 수정

**파일**: `app/generate/page.tsx`

### handleGenerate 함수 수정

- 번역된 프롬프트가 있으면 번역된 버전 사용
- 없으면 원본 프롬프트 사용
- API 요청 시 원본과 번역본 모두 전달 (메타데이터 저장용)
```typescript
const handleGenerate = async () => {
  const promptToUse = translatedPrompt || state.prompt;
  const response = await MockApi.generateImages({
    prompt: promptToUse,
    originalPrompt: state.prompt, // 원본도 함께 전달
    styleId: state.selectedStyle.id,
  });
};
```


## 5. 타입 정의 업데이트

**파일**: `lib/types/index.ts`

- `GenerationRequest`에 `originalPrompt?: string` 필드 추가
- `GeneratedImage`에 `originalPrompt?: string` 필드 추가

## 6. 디바운스 유틸리티 추가

**파일**: `lib/utils.ts`

- 번역 API 호출을 최적화하기 위한 debounce 함수 추가
- 사용자가 입력을 멈춘 후 500ms 후에 번역 시작

## 구현 순서

1. 번역 라이브러리 설치 및 API 엔드포인트 생성
2. 타입 정의 업데이트
3. PromptInput 컴포넌트에 번역 기능 추가
4. 이미지 생성 페이지에서 번역된 프롬프트 사용
5. 테스트 및 UX 개선

### To-dos

- [x] @vitalets/google-translate-api 패키지 설치
- [x] 번역 API 엔드포인트 생성 (app/api/translate/route.ts)
- [x] 타입 정의 업데이트 (originalPrompt 필드 추가)
- [x] 디바운스 유틸리티 함수 추가
- [x] PromptInput 컴포넌트에 자동 번역 기능 추가
- [x] 이미지 생성 페이지에서 번역된 프롬프트 사용
- [x] 한글 프롬프트로 이미지 생성 테스트

## ✅ 구현 완료!

모든 계획이 성공적으로 구현되었습니다. 한글 프롬프트 자동 번역 기능이 완전히 작동하며, 사용자가 한글로 입력한 프롬프트가 자동으로 영어로 번역되어 더 나은 이미지 생성 결과를 제공합니다.

### 테스트 결과
- **입력**: "산 위의 아름다운 일몰과 호수 반사"
- **번역**: "Beautiful sunset over the mountains and reflection in the lake"
- **결과**: 4개의 고품질 이미지 성공적으로 생성
