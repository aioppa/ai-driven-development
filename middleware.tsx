import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 공개 라우트 정의
const isPublicRoute = createRouteMatcher([
  '/',                    // 메인 페이지 (커뮤니티 피드)
  '/sign-in(.*)',        // 로그인 페이지
  '/sign-up(.*)',        // 회원가입 페이지
  '/api/public(.*)',     // 공개 API
])

// 보호된 라우트 정의
const isProtectedRoute = createRouteMatcher([
  '/generate(.*)',       // 이미지 생성 페이지
  '/gallery(.*)',        // 개인 갤러리 페이지
  '/feed(.*)',           // 커뮤니티 피드 페이지
  '/api/generate(.*)',   // 이미지 생성 API
  '/api/save(.*)',       // 저장 API
])

export default clerkMiddleware(async (auth, request) => {
  // 보호된 라우트에 대해 인증 요구
  if (isProtectedRoute(request)) {
    await auth.protect()
  }
  
  // 공개 라우트는 인증 없이 접근 가능
  // (별도 처리 불필요)
})

export const config = {
  matcher: [
    // Next.js 내부 파일과 정적 파일 제외
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API 라우트는 항상 실행
    '/(api|trpc)(.*)',
  ],
}