# AIPixels 컴포넌트 기능명세서

## 📋 목차
- [사이드바 (Sidebar)](#사이드바-sidebar)
- [헤더 (Header)](#헤더-header)
- [프로필 이미지 모달 (ProfileImageModal)](#프로필-이미지-모달-profileimagemodal)

---

## 🎯 사이드바 (Sidebar)

### 📍 위치
- 파일: `components/ui/Sidebar.tsx`
- 화면: 모든 페이지 왼쪽 고정

### 🎨 디자인 스펙

#### 레이아웃
- **너비**: 256px (w-64)
- **높이**: 전체 화면 (h-screen)
- **배경색**: `bg-gray-900`
- **텍스트 색상**: `text-white`
- **테두리**: 우측에 `border-r border-gray-800`

#### 구조
```
┌─────────────────────────┐
│      AIPixels 로고       │  ← 상단 로고 영역
├─────────────────────────┤
│                         │
│    • 생성               │  ← 네비게이션 메뉴
│    • 갤러리             │
│    • 커뮤니티           │
│                         │
│                         │
│                         │
├─────────────────────────┤
│   크레딧 정보 박스       │  ← 하단 정보 영역
│   프로필 정보 박스       │
└─────────────────────────┘
```

### 🔧 주요 기능

#### 1. 로고 영역
- **크기**: 40px × 40px
- **스타일**: 
  - 배경: `bg-gradient-to-br from-blue-500 to-purple-600`
  - 모양: `rounded-lg`
  - 그림자: `shadow-lg`
- **텍스트**: "AIPixels" (2xl, bold)
- **기능**: 클릭 시 홈("/") 페이지로 이동

#### 2. 네비게이션 메뉴
**메뉴 항목:**
| 이름 | 경로 | 아이콘 | 설명 |
|------|------|--------|------|
| 생성 | `/generate` | ⚙️ 생성 아이콘 | 이미지 생성 페이지 |
| 갤러리 | `/gallery` | 🖼️ 갤러리 아이콘 | 개인 갤러리 페이지 |
| 커뮤니티 | `/` | 👥 커뮤니티 아이콘 | 커뮤니티 피드 페이지 |

**상태별 스타일:**
- **활성 상태** (현재 페이지):
  - 배경: `bg-blue-600`
  - 텍스트: `text-white`
  - 그림자: `shadow-md`
- **비활성 상태**:
  - 배경: 투명
  - 텍스트: `text-gray-300`
  - 호버 시: `bg-gray-800 text-white`

**패딩 및 간격:**
- 각 항목: `p-3`
- 항목 간 간격: `space-y-2`
- 아이콘-텍스트 간격: `space-x-3`

#### 3. 크레딧 정보 박스
- **위치**: 사이드바 하단, 프로필 정보 위
- **배경**: `bg-blue-500/20`
- **테두리**: `border border-blue-500/30`
- **패딩**: `p-3`
- **모양**: `rounded-lg`

**표시 내용:**
- 아이콘: 시계 아이콘 (파란색)
- 텍스트: "사용 가능" (small, medium)
- 값: "20개" (large, bold, blue-400)
- 부가 정보: "일일 한도: 20개" (xs, blue-300)

#### 4. 프로필 정보 박스
- **위치**: 사이드바 최하단
- **배경**: `bg-gray-800/50`
- **호버 시**: `bg-gray-700/50`
- **패딩**: `p-3`
- **모양**: `rounded-lg`
- **커서**: `cursor-pointer`

**표시 내용:**
- **프로필 이미지** (40px × 40px):
  - 기본: 그라디언트 배경 + 사용자 아이콘
  - 업로드 시: 사용자 이미지 표시
  - 호버 시: 반투명 오버레이 + 이미지 변경 아이콘
- **사용자 정보**:
  - 이름: "사용자 이름" (sm, medium, white)
  - 이메일: "user@example.com" (xs, gray-400)
- **화살표 아이콘**: 오른쪽 끝 (호버 시 나타남)

**상호작용:**
- 클릭 시: 프로필 이미지 변경 모달 열기
- 호버 시: 배경색 변경 + 화살표 표시

### 📱 반응형 디자인
- **모바일**: 현재 구현되어 있지 않음 (향후 햄버거 메뉴로 전환 예정)
- **태블릿**: 동일한 고정 사이드바
- **데스크톱**: 동일한 고정 사이드바

### 🔗 의존성
- `next/link`: 네비게이션
- `next/navigation`: 현재 경로 확인 (`usePathname`)
- `@/lib/utils`: `cn` 함수 (클래스 병합)
- `ProfileImageModal`: 프로필 이미지 변경 모달

### 📊 상태 관리
```typescript
const [showProfileModal, setShowProfileModal] = useState(false);
const [profileImage, setProfileImage] = useState<string | null>(null);
const pathname = usePathname(); // 현재 경로
```

---

## 📄 헤더 (Header)

### 📍 위치
- 파일: `components/ui/Header.tsx`
- **현재 상태**: 사이드바로 대체되어 사용되지 않음

### ⚠️ 변경 사항
- **이전**: 모든 페이지 상단에 표시
- **현재**: 사이드바로 기능 통합
- **제거된 페이지**: `generate`, `gallery`, `feed`

### 🔄 마이그레이션
헤더의 주요 기능이 사이드바로 이동:
- **로고** → 사이드바 상단
- **네비게이션** → 사이드바 메뉴
- **프로필/크레딧** → 사이드바 하단

---

## 🖼️ 프로필 이미지 모달 (ProfileImageModal)

### 📍 위치
- 파일: `components/ui/ProfileImageModal.tsx`
- 화면: 사이드바 프로필 클릭 시 중앙에 모달로 표시

### 🎨 디자인 스펙

#### 모달 레이아웃
- **배경**: `fixed inset-0 bg-black/50 backdrop-blur-sm`
- **z-index**: `z-[200]`
- **컨테이너**:
  - 최대 너비: `max-w-md`
  - 배경: `bg-gray-900`
  - 테두리: `border border-white/20 rounded-xl`
  - 그림자: `shadow-2xl`
  - 최대 높이: `max-h-[90vh]`
  - 스크롤: `overflow-y-auto`

#### 구조
```
┌─────────────────────────────┐
│  프로필 이미지 변경    [X]   │  ← 헤더
├─────────────────────────────┤
│                             │
│      [미리보기 이미지]       │  ← 미리보기 영역
│                             │
├─────────────────────────────┤
│   이미지 업로드              │
│   [파일 선택]  [제거]        │  ← 업로드 섹션
├─────────────────────────────┤
│   기본 아바타                │
│   [A1] [A2] [A3]            │  ← 아바타 선택
│   [A4] [A5] [A6]            │
├─────────────────────────────┤
│             [취소]  [저장]   │  ← 버튼 영역
└─────────────────────────────┘
```

### 🔧 주요 기능

#### 1. 헤더
- **제목**: "프로필 이미지 변경" (xl, bold, white)
- **닫기 버튼**:
  - 크기: 32px × 32px
  - 배경: `bg-white/10`
  - 호버 시: `bg-white/20`
  - 모양: `rounded-full`
  - 아이콘: X 표시

#### 2. 미리보기 영역
- **이미지 크기**: 96px × 96px
- **위치**: 중앙 정렬
- **스타일**:
  - 모양: `rounded-full`
  - 테두리: `border-4 border-white/20`
- **기본 이미지**: 그라디언트 배경 + 사용자 아이콘
- **레이블**: "미리보기" (sm, white/70)

#### 3. 이미지 업로드 섹션
**제목**: "이미지 업로드" (lg, semibold, white)

**파일 선택 버튼:**
- 배경: `bg-blue-600`
- 호버 시: `bg-blue-700`
- 비활성화 시: `bg-blue-600/50`
- 텍스트: "파일 선택" 또는 "업로드 중..."
- 크기: `flex-1 px-4 py-2`
- 모양: `rounded-lg`

**제거 버튼:**
- 배경: `bg-red-600`
- 호버 시: `bg-red-700`
- 텍스트: "제거"
- 표시 조건: 이미지가 선택되었을 때만
- 크기: `px-4 py-2`
- 모양: `rounded-lg`

**지원 파일 형식**: `image/*`

#### 4. 기본 아바타 선택
**제목**: "기본 아바타" (lg, semibold, white)

**그리드 레이아웃:**
- 컬럼: `grid-cols-3`
- 간격: `gap-3`
- 총 6개 아바타

**아바타 버튼:**
- 크기: 정사각형 (aspect-square)
- 모양: `rounded-lg`
- 테두리:
  - 기본: `border-2 border-white/20`
  - 선택 시: `border-blue-500 ring-2 ring-blue-500/50`
- 호버 시: `border-white/40`
- 이미지: 플레이스홀더 이미지

**아바타 목록:**
```typescript
[
  { id: 'avatar1', name: '기본 아바타 1', url: '/api/placeholder/100/100?text=A1' },
  { id: 'avatar2', name: '기본 아바타 2', url: '/api/placeholder/100/100?text=A2' },
  { id: 'avatar3', name: '기본 아바타 3', url: '/api/placeholder/100/100?text=A3' },
  { id: 'avatar4', name: '기본 아바타 4', url: '/api/placeholder/100/100?text=A4' },
  { id: 'avatar5', name: '기본 아바타 5', url: '/api/placeholder/100/100?text=A5' },
  { id: 'avatar6', name: '기본 아바타 6', url: '/api/placeholder/100/100?text=A6' },
]
```

#### 5. 버튼 영역
**취소 버튼:**
- 스타일: 텍스트 버튼
- 색상: `text-white/70`
- 호버 시: `text-white`
- 크기: `px-4 py-2`

**저장 버튼:**
- 배경: `bg-blue-600`
- 호버 시: `bg-blue-700`
- 비활성화 시: `bg-blue-600/50 cursor-not-allowed`
- 비활성화 조건: 이미지가 선택되지 않았을 때
- 크기: `px-6 py-2`
- 모양: `rounded-lg`

### 📊 상태 관리
```typescript
interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
}

// 내부 상태
const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
```

### 🔄 상호작용 플로우

#### 파일 업로드
```
1. "파일 선택" 클릭
   ↓
2. 파일 선택 대화상자 열림
   ↓
3. 이미지 파일 선택
   ↓
4. FileReader로 Data URL 변환
   ↓
5. selectedImage 상태 업데이트
   ↓
6. 미리보기에 이미지 표시
```

#### 아바타 선택
```
1. 아바타 버튼 클릭
   ↓
2. selectedImage 상태 업데이트
   ↓
3. 선택된 아바타에 파란색 테두리 표시
   ↓
4. 미리보기에 아바타 표시
```

#### 저장
```
1. "저장" 버튼 클릭
   ↓
2. onImageChange(selectedImage) 콜백 호출
   ↓
3. 사이드바의 프로필 이미지 업데이트
   ↓
4. 모달 닫기
```

### 🎯 사용 예시
```tsx
<ProfileImageModal
  isOpen={showProfileModal}
  onClose={() => setShowProfileModal(false)}
  currentImage={profileImage || undefined}
  onImageChange={setProfileImage}
/>
```

---

## 🎨 공통 디자인 시스템

### 색상 팔레트
| 용도 | 색상 | Tailwind 클래스 |
|------|------|-----------------|
| 주 배경 | 다크 그레이 | `bg-gray-900` |
| 부 배경 | 중간 그레이 | `bg-gray-800` |
| 테두리 | 연한 그레이 | `border-gray-800` |
| 주 강조 | 파란색 | `bg-blue-600` |
| 부 강조 | 보라색 | `bg-purple-600` |
| 성공/정보 | 파란색 계열 | `bg-blue-500/20` |
| 경고 | 노란색 | `text-yellow-400` |
| 에러 | 빨간색 | `bg-red-600` |
| 텍스트 (주) | 흰색 | `text-white` |
| 텍스트 (부) | 반투명 흰색 | `text-white/70` |

### 타이포그래피
| 용도 | 크기 | 굵기 | Tailwind 클래스 |
|------|------|------|-----------------|
| 페이지 제목 | 2xl | bold | `text-2xl font-bold` |
| 섹션 제목 | xl | bold | `text-xl font-bold` |
| 부제목 | lg | semibold | `text-lg font-semibold` |
| 본문 | sm | medium | `text-sm font-medium` |
| 보조 텍스트 | xs | normal | `text-xs` |

### 간격 시스템
| 용도 | 크기 | Tailwind 클래스 |
|------|------|-----------------|
| 컴포넌트 간 | 16px | `space-y-4` |
| 요소 간 (대) | 12px | `space-x-3` |
| 요소 간 (중) | 8px | `space-x-2` |
| 패딩 (대) | 16px | `p-4` |
| 패딩 (중) | 12px | `p-3` |
| 패딩 (소) | 8px | `p-2` |

### 애니메이션
| 용도 | 효과 | Tailwind 클래스 |
|------|------|-----------------|
| 색상 전환 | 200ms | `transition-colors duration-200` |
| 전체 전환 | 200ms | `transition-all duration-200` |
| 호버 확대 | 105% | `hover:scale-105` |
| 회전 (화살표) | 180도 | `rotate-180` |

---

## 📱 접근성 (Accessibility)

### 키보드 네비게이션
- [x] Tab으로 모든 인터랙티브 요소 접근 가능
- [x] Enter/Space로 버튼 활성화
- [x] Escape로 모달 닫기

### 스크린 리더
- [x] 아이콘에 적절한 `aria-label` 추가
- [x] 버튼에 명확한 텍스트 레이블
- [x] 이미지에 `alt` 속성

### 시각적 피드백
- [x] 호버 시 색상 변경
- [x] 포커스 시 아웃라인 표시
- [x] 활성 상태 명확한 시각적 구분

---

## 🔧 향후 개선 사항

### 사이드바
- [ ] 모바일 반응형 (햄버거 메뉴)
- [ ] 사이드바 접기/펼치기 기능
- [ ] 알림 배지 (새 피드, 메시지 등)
- [ ] 테마 전환 버튼 (다크/라이트 모드)
- [ ] 크레딧 충전 링크
- [ ] 사용자 설정 메뉴

### 프로필 이미지 모달
- [ ] 이미지 크롭 기능
- [ ] 이미지 회전 기능
- [ ] 이미지 필터/효과
- [ ] 더 많은 기본 아바타
- [ ] 아바타 카테고리 (동물, 캐릭터, 추상 등)
- [ ] 최근 사용한 이미지 기록

### 성능
- [ ] 이미지 레이지 로딩
- [ ] 아바타 이미지 최적화
- [ ] 프로필 이미지 캐싱

---

## 📚 참고 문서
- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [React 접근성 가이드](https://react.dev/learn/accessibility)

---

**작성일**: 2025년 10월 10일  
**버전**: 1.0.0  
**작성자**: AI Assistant

