'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ImageGenerationState, GeneratedImage, ImageMetadata } from '@/lib/types';
import { MockApi } from '@/lib/api/mockApi';
import { Sidebar } from '@/components/ui/Sidebar';
import { StyleDropdownButton } from '@/components/generate/StyleDropdownButton';
import { ImageSizeSelector } from '@/components/generate/ImageSizeSelector';
import { CreativityLevelSelector } from '@/components/generate/CreativityLevelSelector';
import { ImageVariationGenerator } from '@/components/generate/ImageVariationGenerator';
import { PromptInput } from '@/components/generate/PromptInput';
import { GenerationResult } from '@/components/generate/GenerationResult';
import { MetadataForm } from '@/components/generate/MetadataForm';
import { ActionButtons } from '@/components/generate/ActionButtons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { useCredit, hasEnoughCredits } from '@/lib/services/creditsService';

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  
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
  
  // 이미지 사이즈 상태
  const [selectedImageSize, setSelectedImageSize] = useState({
    id: '1:1',
    name: '정사각형',
    ratio: '1:1',
    width: 1024,
    height: 1024,
    description: 'SNS용 정사각형'
  });

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

  // 이미지 사이즈 변경 핸들러
  const handleImageSizeChange = (size: any) => {
    setSelectedImageSize(size);
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
        imageSize: selectedImageSize,
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
    if (!isSignedIn) {
      setToast({ message: '로그인이 필요합니다.', type: 'error' });
      router.push('/sign-in');
      return;
    }

    if (!user?.id) {
      setToast({ message: '사용자 정보를 불러올 수 없습니다.', type: 'error' });
      return;
    }

    // 크레딧 확인
    if (!hasEnoughCredits(user.id, 1)) {
      setToast({ message: '크레딧이 부족합니다. 내일 다시 시도해주세요.', type: 'error' });
      setState(prev => ({ ...prev, promptError: '크레딧이 부족합니다.' }));
      return;
    }

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
        imageSize: selectedImageSize,
      });

      if (response.success) {
        // 크레딧 사용
        if (useCredit(user.id, 1)) {
          // 크레딧 업데이트 이벤트 발생
          window.dispatchEvent(new Event('credits-updated'));
        }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-black/50 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">이미지 생성</h1>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
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

          {/* 선택 옵션들 - 한 줄로 배치 */}
          <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 스타일 선택 */}
              <div className="relative z-[9998]">
                <StyleDropdownButton
                  styles={state.availableStyles}
                  selectedStyle={state.selectedStyle}
                  onStyleSelect={handleStyleSelect}
                />
              </div>

              {/* 이미지 크기 선택 */}
              <div>
                <ImageSizeSelector
                  selectedSize={selectedImageSize}
                  onSizeChange={handleImageSizeChange}
                />
              </div>

              {/* 상상력 난이도 선택 */}
              <div>
                <CreativityLevelSelector
                  selectedLevel={creativityLevel}
                  onLevelChange={handleCreativityLevelChange}
                />
              </div>
            </div>
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
      </div>

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
