export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'error';

export type ImageStyle = 
  | 'photorealistic'
  | 'minimalist'
  | 'illustration'
  | 'abstract'
  | 'cartoon';

export interface GenerationJob {
  id: string;
  slide_id: string;
  status: string;
  image_url?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateImageRequest {
  slideId: string;
  slideNumber: number;
  slideText: string;
  fullStoryText: string;
  userPrompt?: string;
  style: ImageStyle;
  styleConfig: any;
}

export interface GenerateImageResponse {
  slideId: string;
  status: GenerationStatus;
  imageUrl?: string;
  error?: string;
}
