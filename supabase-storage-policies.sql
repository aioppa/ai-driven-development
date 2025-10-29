-- Supabase Storage 정책 설정
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. Storage 버킷이 존재하는지 확인하고 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. 업로드 정책: 인증된 사용자가 자신의 폴더에 업로드 허용
CREATE POLICY "Allow authenticated users to upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. 읽기 정책: 모든 사용자가 이미지를 볼 수 있도록 허용
CREATE POLICY "Allow public read access to images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- 4. 업데이트 정책: 사용자가 자신의 파일만 수정 가능
CREATE POLICY "Allow users to update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 삭제 정책: 사용자가 자신의 파일만 삭제 가능
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
