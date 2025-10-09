import { NextResponse } from 'next/server';

export async function GET() {
  const testCases = [
    '안녕하세요',
    '산 위의 아름다운 일몰',
    '고양이가 우주에서 춤추는 모습',
    '복잡한 문장이 포함된 매우 긴 한글 텍스트입니다. 이것은 번역이 어려울 수 있는 복잡한 문장입니다.',
    'Hello world', // 영어 (번역 불필요)
    '', // 빈 문자열
  ];

  const results = [];

  for (const testCase of testCases) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: testCase }),
      });

      const result = await response.json();
      results.push({
        input: testCase,
        output: result,
        success: response.ok
      });
    } catch (error) {
      results.push({
        input: testCase,
        output: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      });
    }
  }

  return NextResponse.json({
    testResults: results,
    timestamp: new Date().toISOString()
  });
}
