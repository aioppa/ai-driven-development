-- 임시로 RLS 비활성화 (개발용)
-- 주의: 프로덕션에서는 보안상 위험할 수 있습니다

-- Storage 버킷의 RLS 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 또는 특정 버킷에 대해서만 정책 완화
DROP POLICY IF EXISTS "Allow authenticated users to upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to images" ON storage.objects;

-- 모든 사용자가 업로드할 수 있도록 허용 (개발용)
CREATE POLICY "Allow all uploads for development"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');
