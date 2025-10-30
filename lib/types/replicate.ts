// Replicate API 관련 타입 정의

export interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  created_at: string;
  urls?: {
    get: string;
    cancel: string;
  };
  input: ReplicateInput;
  output?: string[];
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
}

export interface ReplicateInput {
  prompt: string;
  aspect_ratio?: '1:1' | '16:9' | '21:9' | '3:2' | '2:3' | '4:5' | '5:4' | '3:4' | '4:3' | '9:16' | '9:21';
  num_outputs?: number;
  output_format?: 'webp' | 'jpg' | 'png';
  output_quality?: number;
  num_inference_steps?: number;
  disable_safety_checker?: boolean;
  seed?: number;
  go_fast?: boolean;
  megapixels?: '1' | '0.25';
}

export interface ReplicateCreatePredictionRequest {
  model: string;
  input: ReplicateInput;
  webhook?: string;
  webhook_events_filter?: string[];
}

export interface ReplicateCreatePredictionResponse {
  id: string;
  status: string;
  created_at: string;
  urls: {
    get: string;
    cancel: string;
  };
  input: ReplicateInput;
}

// AIPixels 프로젝트용 변환된 타입
export interface AIPixelsGenerationRequest {
  prompt: string;
  styleId: string;
  userId?: string;
  sessionId?: string;
  aspectRatio?: string;
  numOutputs?: number;
  originalPrompt?: string;
}

export interface AIPixelsGenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  generationTime: number;
  remainingCredits: number;
  message?: string;
  predictionId?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  prompt: string;
  originalPrompt?: string;
  styleId: string;
  createdAt: Date;
  predictionId?: string;
}

// 스타일 매핑 (AIPixels 스타일 ID -> Replicate 파라미터)
export interface StyleMapping {
  [styleId: string]: {
    promptModifier: string;
    aspectRatio: string;
    numInferenceSteps: number;
    outputQuality: number;
  };
}

// 에러 타입
export interface ReplicateError {
  detail: string;
  status?: number;
}
