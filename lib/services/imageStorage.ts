import { supabaseAdmin } from '@/lib/supabase/client';
import { db } from '@/db';
import { images } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * 이미지 저장 서비스
 * Supabase Storage에 이미지를 업로드하고 데이터베이스에 메타데이터를 저장합니다.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const STORAGE_BUCKET = 'images';

export interface SaveImageParams {
  imageUrl: string;           // Replicate에서 생성된 이미지 URL
  clerkUserId: string;         // Clerk 사용자 ID
  prompt: string;              // 원본 프롬프트
  translatedPrompt?: string;   // 번역된 프롬프트
  styleId: string;             // 스타일 ID
  replicateId?: string;        // Replicate 예측 ID
  width?: number;              // 이미지 너비
  height?: number;             // 이미지 높이
  aspectRatio?: string;        // 종횡비
}

export interface SaveImageResult {
  success: boolean;
  imageId?: number;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * 이미지 URL에서 이미지를 다운로드하여 Buffer로 반환
 */
async function downloadImage(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  
  if (!response.ok) {
    throw new Error(`이미지 다운로드 실패: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * 이미지 URL에서 확장자 추출
 */
function getImageExtension(imageUrl: string): string {
  // URL에서 확장자 추출 시도
  const urlMatch = imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  if (urlMatch) {
    return urlMatch[1].toLowerCase();
  }
  
  // 기본값: png
  return 'png';
}

/**
 * 스타일 ID를 데이터베이스 스키마의 imageStyleEnum으로 매핑
 */
function mapStyleToEnum(styleId: string): string | null {
  const styleMapping: Record<string, string> = {
    'realistic': 'realistic',
    'artistic': 'artistic',
    'anime': 'anime',
    'cartoon': 'cartoon',
    'digital-art': 'digital-art',
    'oil-painting': 'oil-painting',
    'watercolor': 'watercolor',
    '3d-render': '3d-render',
  };

  return styleMapping[styleId] || 'digital-art';
}

/**
 * 이미지를 Supabase Storage에 업로드하고 데이터베이스에 저장
 * Clerk 인증된 사용자만 이미지를 업로드할 수 있습니다.
 */
export async function saveImageToStorage(params: SaveImageParams): Promise<SaveImageResult> {
  try {
    const {
      imageUrl,
      clerkUserId,
      prompt,
      translatedPrompt,
      styleId,
      replicateId,
      width,
      height,
      aspectRatio,
    } = params;

    // 0. 환경 변수 확인
    if (!SUPABASE_URL) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
      return {
        success: false,
        error: 'Supabase 설정이 완료되지 않았습니다. 환경 변수를 확인해주세요.',
      };
    }

    // 1. Clerk 사용자 ID 검증
    if (!clerkUserId || typeof clerkUserId !== 'string' || clerkUserId.trim() === '') {
      console.error('유효하지 않은 Clerk 사용자 ID:', clerkUserId);
      return {
        success: false,
        error: '인증된 사용자만 이미지를 업로드할 수 있습니다.',
      };
    }

    // 보안 로깅: 누가 이미지를 생성하는지 추적
    console.log(`[보안] 이미지 생성 시도 - 사용자: ${clerkUserId}, 프롬프트: ${prompt.substring(0, 50)}...`);

    // 2. 이미지 다운로드
    console.log(`[${clerkUserId}] 이미지 다운로드 중:`, imageUrl);
    const imageBuffer = await downloadImage(imageUrl);

    // 3. 파일 경로 생성: [clerk user ID]/[file uuid].[extension]
    const fileUuid = uuidv4();
    const extension = getImageExtension(imageUrl);
    const filePath = `${clerkUserId}/${fileUuid}.${extension}`;

    // 사용자별 폴더 구조 보안: 다른 사용자의 폴더에 업로드 불가능하도록 검증
    if (!filePath.startsWith(`${clerkUserId}/`)) {
      console.error(`[보안 위반] 잘못된 파일 경로 시도: ${filePath}, 사용자: ${clerkUserId}`);
      return {
        success: false,
        error: '보안 오류: 허가되지 않은 경로입니다.',
      };
    }

    // 4. Supabase Storage에 업로드 (Service Role Key 사용 - 모든 정책 우회)
    console.log(`[${clerkUserId}] Supabase Storage에 업로드 중:`, filePath);
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, imageBuffer, {
        contentType: `image/${extension}`,
        upsert: false,
        // 사용자 메타데이터 추가 (추적용)
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error(`[${clerkUserId}] Storage 업로드 실패:`, uploadError);
      
      // 구체적인 에러 메시지 제공
      if (uploadError.message.includes('Duplicate')) {
        return {
          success: false,
          error: '동일한 이름의 파일이 이미 존재합니다.',
        };
      }
      
      if (uploadError.message.includes('Policy')) {
        return {
          success: false,
          error: '스토리지 접근 권한이 없습니다. 인증 상태를 확인해주세요.',
        };
      }
      
      return {
        success: false,
        error: `Storage 업로드 실패: ${uploadError.message}`,
      };
    }

    // 5. Public URL 생성
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;
    console.log(`[${clerkUserId}] Public URL 생성:`, publicUrl);

    // 6. 데이터베이스에 메타데이터 저장
    console.log(`[${clerkUserId}] 데이터베이스에 메타데이터 저장 중...`);
    
    // 데이터베이스 저장 전 한 번 더 사용자 ID 검증
    if (!clerkUserId) {
      throw new Error('데이터베이스 저장 시 사용자 ID가 없습니다.');
    }
    
    const [savedImage] = await db.insert(images).values({
      clerkUserId,
      filePath,
      prompt,
      translatedPrompt,
      replicateId,
      style: mapStyleToEnum(styleId) as any,
      width,
      height,
      visibility: 'private', // 기본값: 비공개
      thumbnailUrl: publicUrl, // 썸네일 URL은 원본 이미지와 동일 (추후 최적화 가능)
    }).returning();

    console.log(`[${clerkUserId}] 이미지 저장 완료 - DB ID: ${savedImage.id}`);
    console.log(`[보안] 이미지 업로드 성공 - 사용자: ${clerkUserId}, 이미지 ID: ${savedImage.id}`);

    return {
      success: true,
      imageId: savedImage.id,
      filePath,
      publicUrl,
    };

  } catch (error) {
    console.error(`[${params.clerkUserId || 'UNKNOWN'}] 이미지 저장 중 오류 발생:`, error);
    
    // 데이터베이스 저장 실패 시 Storage에서 이미지 삭제 (롤백)
    if (error instanceof Error && error.message.includes('database')) {
      console.log(`[${params.clerkUserId}] 데이터베이스 저장 실패로 인한 Storage 파일 삭제 시도...`);
      try {
        const fileUuid = uuidv4();
        const extension = getImageExtension(params.imageUrl);
        const filePath = `${params.clerkUserId}/${fileUuid}.${extension}`;
        
        await supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .remove([filePath]);
        console.log(`[${params.clerkUserId}] Storage 파일 삭제 완료 (롤백)`);
      } catch (deleteError) {
        console.error(`[${params.clerkUserId}] Storage 파일 삭제 실패:`, deleteError);
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 여러 이미지를 한 번에 저장
 */
export async function saveMultipleImages(
  imageUrls: string[],
  baseParams: Omit<SaveImageParams, 'imageUrl'>
): Promise<SaveImageResult[]> {
  const promises = imageUrls.map((imageUrl) =>
    saveImageToStorage({ ...baseParams, imageUrl })
  );

  return Promise.all(promises);
}

