import Replicate from 'replicate';
import { 
  ReplicatePrediction, 
  ReplicateCreatePredictionRequest, 
  ReplicateInput,
  AIPixelsGenerationRequest,
  AIPixelsGenerationResponse,
  GeneratedImage,
  StyleMapping,
  ReplicateError
} from '@/lib/types/replicate';

// Replicate 클라이언트 초기화 (토큰이 없는 경우 null로 유지해 개발 모드 지원)
const replicateApiToken = process.env.REPLICATE_API_TOKEN;
const replicate = replicateApiToken
  ? new Replicate({ auth: replicateApiToken })
  : null;

// 기본 모델을 환경변수로 설정 가능하게 함 (없을 경우 안전한 기본값 사용)
const DEFAULT_MODEL = process.env.REPLICATE_MODEL || 'black-forest-labs/flux-dev';

// 스타일 매핑 설정
const STYLE_MAPPING: StyleMapping = {
  '1': { // 사실적
    promptModifier: 'photorealistic, high quality, detailed',
    aspectRatio: '1:1',
    numInferenceSteps: 4,
    outputQuality: 90
  },
  '2': { // 애니메이션
    promptModifier: 'anime style, manga style, colorful, vibrant',
    aspectRatio: '1:1',
    numInferenceSteps: 4,
    outputQuality: 85
  },
  '3': { // 디지털 아트
    promptModifier: 'digital art, concept art, detailed, professional',
    aspectRatio: '1:1',
    numInferenceSteps: 4,
    outputQuality: 95
  },
  '4': { // 미니멀
    promptModifier: 'minimalist, clean, simple, elegant',
    aspectRatio: '1:1',
    numInferenceSteps: 4,
    outputQuality: 80
  },
  '5': { // 판타지
    promptModifier: 'fantasy art, magical, mystical, ethereal',
    aspectRatio: '1:1',
    numInferenceSteps: 4,
    outputQuality: 90
  },
  '26': { // 지브리 스타일
    promptModifier: 'Studio Ghibli style, Hayao Miyazaki style, anime, hand-drawn animation, whimsical, dreamy, soft colors, detailed background',
    aspectRatio: '16:9',
    numInferenceSteps: 4,
    outputQuality: 95
  },
  // 기본값
  'default': {
    promptModifier: 'high quality, detailed',
    aspectRatio: '1:1',
    numInferenceSteps: 4,
    outputQuality: 85
  }
};

export class ReplicateAPI {
  /**
   * 이미지 생성 예측 시작
   */
  static async createPrediction(request: AIPixelsGenerationRequest): Promise<ReplicatePrediction> {
    try {
      if (!process.env.REPLICATE_API_TOKEN || !replicate) {
        throw new Error('REPLICATE_API_TOKEN is not set');
      }

      // 스타일 매핑 가져오기
      const styleConfig = STYLE_MAPPING[request.styleId] || STYLE_MAPPING['default'];
      
      // 프롬프트에 스타일 수정자 추가
      const enhancedPrompt = `${request.prompt}, ${styleConfig.promptModifier}`;

      // Replicate 입력 파라미터 구성
      const input: ReplicateInput = {
        prompt: enhancedPrompt,
        aspect_ratio: (request.aspectRatio as any) || (styleConfig.aspectRatio as any),
        // Keep the payload minimal for broad model compatibility
        num_outputs: 1
      } as any;

      // 예측 생성 (표준 입력)
      let prediction: any;
      try {
        prediction = await replicate.predictions.create({
          model: DEFAULT_MODEL,
          input
        });
      } catch (primaryError) {
        // 모델 입력 스키마가 다른 경우를 대비해 최소 입력으로 재시도
        console.warn('Primary prediction attempt failed, retrying with minimal input...', primaryError);
        const minimalInput: any = { prompt: enhancedPrompt };
        prediction = await replicate.predictions.create({
          model: DEFAULT_MODEL,
          input: minimalInput
        });
      }

      return prediction as ReplicatePrediction;
    } catch (error) {
      console.error('Replicate prediction creation failed:', error);
      throw new Error(`Failed to create prediction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 예측 상태 확인
   */
  static async getPrediction(predictionId: string): Promise<ReplicatePrediction> {
    try {
      if (!process.env.REPLICATE_API_TOKEN || !replicate) {
        throw new Error('REPLICATE_API_TOKEN is not set');
      }

      const prediction = await replicate.predictions.get(predictionId);
      return prediction as ReplicatePrediction;
    } catch (error) {
      console.error('Failed to get prediction:', error);
      throw new Error(`Failed to get prediction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 예측 취소
   */
  static async cancelPrediction(predictionId: string): Promise<void> {
    try {
      if (!process.env.REPLICATE_API_TOKEN || !replicate) {
        throw new Error('REPLICATE_API_TOKEN is not set');
      }

      await replicate.predictions.cancel(predictionId);
    } catch (error) {
      console.error('Failed to cancel prediction:', error);
      throw new Error(`Failed to cancel prediction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * AIPixels 형식으로 이미지 생성 응답 변환
   */
  static async generateImages(request: AIPixelsGenerationRequest): Promise<AIPixelsGenerationResponse> {
    const startTime = Date.now();
    
    try {
      // 토큰이 없는 경우: 명확한 실패 반환 (목업 비활성화)
      if (!process.env.REPLICATE_API_TOKEN || !replicate) {
        return {
          success: false,
          images: [],
          generationTime: (Date.now() - startTime) / 1000,
          remainingCredits: 0,
          message: 'REPLICATE_API_TOKEN is not set. Please configure your token to enable real image generation.'
        };
      }

      // 1. 예측 생성
      const prediction = await this.createPrediction(request);
      
      // 2. 완료까지 폴링
      let finalPrediction = await this.pollForCompletion(prediction.id);
      
      // 3. 결과 처리
      if (finalPrediction.status === 'succeeded' && finalPrediction.output) {
        const images = this.convertToAIPixelsImages(
          finalPrediction.output,
          request.prompt,
          request.styleId,
          finalPrediction.id,
          request.originalPrompt
        );
        
        const generationTime = (Date.now() - startTime) / 1000;
        
        return {
          success: true,
          images,
          generationTime,
          remainingCredits: 17, // TODO: 실제 크레딧 시스템 연동
          message: '이미지가 성공적으로 생성되었습니다.',
          predictionId: finalPrediction.id
        };
      } else {
        throw new Error(finalPrediction.error || 'Image generation failed');
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      return {
        success: false,
        images: [],
        generationTime: (Date.now() - startTime) / 1000,
        remainingCredits: 17,
        message: `이미지 생성에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * 예측 완료까지 폴링
   */
  private static async pollForCompletion(predictionId: string, maxAttempts: number = 60): Promise<ReplicatePrediction> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const prediction = await this.getPrediction(predictionId);
      
      if (prediction.status === 'succeeded' || prediction.status === 'failed' || prediction.status === 'canceled') {
        return prediction;
      }
      
      // 2초 대기 후 다시 확인
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    throw new Error('Prediction timeout - maximum attempts reached');
  }

  /**
   * Replicate 출력을 AIPixels 형식으로 변환
   */
  private static convertToAIPixelsImages(
    output: any,
    prompt: string,
    styleId: string,
    predictionId: string,
    originalPrompt?: string
  ): GeneratedImage[] {
    // 출력이 배열인지 확인하고, 아니면 배열로 변환
    let urls: string[];
    
    if (Array.isArray(output)) {
      urls = output;
    } else if (typeof output === 'string') {
      urls = [output];
    } else if (output && typeof output === 'object') {
      // 객체인 경우 URL 필드를 찾아서 배열로 변환
      if (output.url) {
        urls = [output.url];
      } else if (output.image) {
        urls = [output.image];
      } else if (output.images && Array.isArray(output.images)) {
        urls = output.images;
      } else {
        console.error('Unknown output format:', output);
        urls = [];
      }
    } else {
      console.error('Invalid output format:', output);
      urls = [];
    }

    return urls.map((url, index) => ({
      id: `gen_${Date.now()}_${index}`,
      url: url,
      thumbnailUrl: url, // Replicate는 썸네일을 별도로 제공하지 않으므로 같은 URL 사용
      prompt: prompt,
      originalPrompt: originalPrompt,
      styleId: styleId,
      createdAt: new Date(),
      predictionId: predictionId
    }));
  }

  /**
   * 사용 가능한 모델 목록 조회
   */
  static async getAvailableModels(): Promise<any[]> {
    try {
      // Replicate API를 통해 사용 가능한 모델 조회
      // 실제 구현에서는 Replicate의 모델 API를 사용
      return [
        {
          id: 'google/nano-banana',
          name: 'Google Nano Banana',
          description: 'Advanced AI image generation model'
        }
      ];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }
}
