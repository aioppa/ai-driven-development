'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ImageGenerationState, GeneratedImage, ImageMetadata } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { Header } from '@/components/ui/Header';
import { StyleDropdownButton } from '@/components/generate/StyleDropdownButton';
import { CreativityLevelSelector } from '@/components/generate/CreativityLevelSelector';
import { ImageVariationGenerator } from '@/components/generate/ImageVariationGenerator';
import { PromptInput } from '@/components/generate/PromptInput';
import { GenerationResult } from '@/components/generate/GenerationResult';
import { MetadataForm } from '@/components/generate/MetadataForm';
import { ActionButtons } from '@/components/generate/ActionButtons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL에서 프롬프트와 스타일 파라미터 가져오기
  const initialPrompt = searchParams.get('prompt') || '';
  const initialStyleId = searchParams.get('style') || '';
  
  // 상태 관리
  const [state, setState] = useState<ImageGenerationState>({
    availableStyles: [],
    selectedStyle: null,
    prompt: initialPrompt,
    promptError: null,
    isGenerating: false,
    generatedImages: [],
    selectedImage: null,
    generationError: null,
    metadata: {
      title: '',
      description: '',
      tags: [],
      category: '',
    },
    remainingCredits: 20,
    dailyLimit: 20,
  });

  const [creativityLevel, setCreativityLevel] = useState(3); // 기본값: 창의적
  const [translatedPrompt, setTranslatedPrompt] = useState<string>('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 스타일 목록 로드
  useEffect(() => {
    const loadStyles = async () => {
      try {
        const response = await MockApi.getStyles();
        if (response.success) {
          setState(prev => ({
            ...prev,
            availableStyles: response.data,
            selectedStyle: response.data.find(style => style.id === initialStyleId) || response.data[0] || null,
          }));
        }
      } catch (error) {
        console.error('스타일 로드 실패:', error);
      }
    };

    loadStyles();
  }, [initialStyleId]);

  // 스타일 선택 핸들러
  const handleStyleSelect = (styleId: string) => {
    const selectedStyle = state.availableStyles.find(style => style.id === styleId);
    setState(prev => ({
      ...prev,
      selectedStyle,
      promptError: null,
    }));
  };

  // 프롬프트 변경 핸들러
  const handlePromptChange = (prompt: string) => {
    setState(prev => ({
      ...prev,
      prompt,
      promptError: null,
    }));
  };

  // 상상력 레벨 변경 핸들러
  const handleCreativityLevelChange = (level: number) => {
    setCreativityLevel(level);
  };

  // 이미지 변형 생성 핸들러
  const handleGenerateVariation = async (imageId: string, variationType: string, level: number, additionalPrompt?: string) => {
    if (!state.selectedImage) {
      setToast({ message: '변형할 이미지를 선택해주세요.', type: 'error' });
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, generationError: null }));

    try {
      // 변형 타입에 따른 프롬프트 수정
      const variationPrompts = {
        style: `${state.prompt}, different artistic style, ${variationType} variation`,
        color: `${state.prompt}, different color palette, ${variationType} variation`,
        composition: `${state.prompt}, different composition, ${variationType} variation`,
        detail: `${state.prompt}, more detailed, enhanced details, ${variationType} variation`,
        artistic: `${state.prompt}, more artistic, creative interpretation, ${variationType} variation`,
      };

      let variationPrompt = variationPrompts[variationType as keyof typeof variationPrompts] || `${state.prompt}, ${variationType} variation`;
      
      // 레벨에 따른 강도 조정
      const intensityModifiers = {
        1: 'subtle, minimal changes',
        2: 'slight modifications',
        3: 'moderate changes',
        4: 'significant variations',
        5: 'dramatic transformation'
      };
      
      const intensityModifier = intensityModifiers[level as keyof typeof intensityModifiers] || 'moderate changes';
      variationPrompt = `${variationPrompt}, ${intensityModifier}`;
      
      // 추가 프롬프트가 있으면 추가
      if (additionalPrompt && additionalPrompt.trim()) {
        variationPrompt = `${variationPrompt}, ${additionalPrompt.trim()}`;
      }
      
      const promptToUse = translatedPrompt || variationPrompt;

      // 실제 Replicate API를 사용하여 변형 이미지 생성
      const response = await MockApi.generateImages({
        prompt: promptToUse,
        originalPrompt: state.prompt,
        styleId: state.selectedStyle?.id || '1',
      });

      if (response.success) {
        // 변형된 이미지들을 기존 이미지 목록에 추가
        setState(prev => ({
          ...prev,
          isGenerating: false,
          generatedImages: [...prev.generatedImages, ...response.images],
          selectedImage: response.images[0], // 첫 번째 변형을 선택
          remainingCredits: response.remainingCredits,
        }));

        setToast({ message: '이미지 변형이 성공적으로 생성되었습니다!', type: 'success' });
      } else {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          generationError: response.message || '변형 생성에 실패했습니다.',
        }));
        setToast({ message: response.message || '변형 생성에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationError: '변형 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
      }));
      setToast({ message: '변형 생성에 실패했습니다.', type: 'error' });
    }
  };

  // 이미지 생성 핸들러
  const handleGenerate = async () => {
    if (!state.prompt.trim()) {
      setState(prev => ({ ...prev, promptError: '프롬프트를 입력해주세요.' }));
      return;
    }

    if (!state.selectedStyle) {
      setState(prev => ({ ...prev, promptError: '스타일을 선택해주세요.' }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, generationError: null }));

    try {
      const promptToUse = translatedPrompt || state.prompt;
      const response = await MockApi.generateImages({
        prompt: promptToUse,
        originalPrompt: state.prompt,
        styleId: state.selectedStyle.id,
      });

      if (response.success) {
        setState(prev => ({
          ...prev,
          generatedImages: response.images,
          remainingCredits: response.remainingCredits,
          isGenerating: false,
        }));
        setToast({ message: response.message || '이미지가 성공적으로 생성되었습니다.', type: 'success' });
      } else {
        setState(prev => ({
          ...prev,
          generationError: response.message || '이미지 생성에 실패했습니다.',
          isGenerating: false,
        }));
        setToast({ message: response.message || '이미지 생성에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        generationError: '이미지 생성 중 오류가 발생했습니다.',
        isGenerating: false,
      }));
      setToast({ message: '이미지 생성 중 오류가 발생했습니다.', type: 'error' });
    }
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (image: GeneratedImage) => {
    setState(prev => ({ ...prev, selectedImage: image }));
  };

  // 메타데이터 변경 핸들러
  const handleMetadataChange = (metadata: ImageMetadata) => {
    setState(prev => ({ ...prev, metadata }));
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!state.selectedImage) {
      setToast({ message: '저장할 이미지를 선택해주세요.', type: 'error' });
      return;
    }

    try {
      const response = await MockApi.saveToGallery({
        imageId: state.selectedImage.id,
        metadata: state.metadata,
        isPublic: false,
      });

      if (response.success) {
        setToast({ message: response.message, type: 'success' });
        // 갤러리 페이지로 이동
        setTimeout(() => router.push('/gallery'), 1500);
      } else {
        setToast({ message: response.message, type: 'error' });
      }
    } catch (error) {
      setToast({ message: '저장 중 오류가 발생했습니다.', type: 'error' });
    }
  };

  // 공유 핸들러
  const handleShare = async () => {
    if (!state.selectedImage) {
      setToast({ message: '공유할 이미지를 선택해주세요.', type: 'error' });
      return;
    }

    try {
      const response = await MockApi.shareToCommunity({
        imageId: state.selectedImage.id,
        metadata: state.metadata,
        isPublic: true,
      });

      if (response.success) {
        setToast({ message: response.message, type: 'success' });
        // 피드 페이지로 이동
        setTimeout(() => router.push('/feed'), 1500);
      } else {
        setToast({ message: response.message, type: 'error' });
      }
    } catch (error) {
      setToast({ message: '공유 중 오류가 발생했습니다.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 미래지향적 배경 패턴 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10"></div>
      
      {/* 애니메이션 원형 요소들 */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

      {/* 헤더 */}
      <Header 
        title="AIPixels" 
        subtitle="이미지 생성"
        className="relative z-10"
        rightContent={
          <div className="flex items-center space-x-4">
            {/* 크레딧 정보 */}
            <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{state.remainingCredits}개</span>
            </div>
            
            {/* 프로필 아이콘 */}
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        }
      />

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="space-y-4">
          {/* 프롬프트 입력 영역 */}
          <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <PromptInput
              prompt={state.prompt}
              onPromptChange={handlePromptChange}
              onGenerate={handleGenerate}
              isGenerating={state.isGenerating}
              error={state.promptError}
              onTranslatedPromptChange={setTranslatedPrompt}
            />
          </section>

          {/* 스타일 선택 영역 */}
          <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 relative z-[9998]">
            <StyleDropdownButton
              styles={state.availableStyles}
              selectedStyle={state.selectedStyle}
              onStyleSelect={handleStyleSelect}
            />
          </section>

          {/* 상상력 난이도 선택 영역 */}
          <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <CreativityLevelSelector
              selectedLevel={creativityLevel}
              onLevelChange={handleCreativityLevelChange}
            />
          </section>

          {/* 생성 결과 영역 */}
          {state.isGenerating && (
            <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-white mt-4">AI가 이미지를 생성하고 있습니다...</p>
                <p className="text-white/60 text-sm mt-2">예상 소요 시간: 30-60초</p>
              </div>
            </section>
          )}

          {state.generationError && (
            <section className="bg-red-500/20 backdrop-blur-md rounded-xl p-4 border border-red-500/30">
              <div className="text-center">
                <p className="text-red-300">{state.generationError}</p>
                <button
                  onClick={handleGenerate}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </section>
          )}

          {state.generatedImages.length > 0 && (
            <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h2 className="text-lg font-semibold text-white mb-3">생성된 이미지</h2>
              <GenerationResult
                images={state.generatedImages}
                selectedImage={state.selectedImage}
                onImageSelect={handleImageSelect}
              />
            </section>
          )}

          {/* 이미지 변형 생성 영역 */}
          {state.selectedImage && (
            <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <ImageVariationGenerator
                selectedImage={state.selectedImage}
                onGenerateVariation={handleGenerateVariation}
                isGenerating={state.isGenerating}
              />
            </section>
          )}

          {/* 메타데이터 입력 영역 */}
          {state.selectedImage && (
            <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h2 className="text-lg font-semibold text-white mb-3">이미지 정보</h2>
              <MetadataForm
                metadata={state.metadata}
                onMetadataChange={handleMetadataChange}
              />
            </section>
          )}

          {/* 액션 버튼 영역 */}
          {state.selectedImage && (
            <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <ActionButtons
                onSave={handleSave}
                onShare={handleShare}
                metadata={state.metadata}
              />
            </section>
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-8 relative z-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-white/70">
            <p>&copy; 2025 AIPixels. 의 모든 권리와 소유는 (주)한유 기업에게 있습니다.</p>
          </div>
        </div>
      </footer>

      {/* 토스트 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
