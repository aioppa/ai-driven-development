import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트 설정
 * 
 * 환경 변수:
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase 프로젝트 URL
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase 서비스 역할 키 (서버 사이드 전용)
 */

// 환경 변수 검증
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  console.error('📝 .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL을 추가해주세요.');
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  console.error('📝 .env.local 파일에 SUPABASE_SERVICE_ROLE_KEY를 추가해주세요.');
}

/**
 * 서버 사이드 전용 Supabase 클라이언트
 * Service Role Key를 사용하여 모든 권한으로 접근
 * Storage 업로드 및 데이터베이스 작업에 사용
 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', // 기본값으로 placeholder 사용
  supabaseServiceKey || 'placeholder-key', // 기본값으로 placeholder 사용
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

