import { supabase } from "@/integrations/supabase/client";
import type { GenerateImageRequest, GenerateImageResponse, GenerationJob } from "@/types/generation";

const N8N_WEBHOOK_URL = "https://n8n.orangespace.io/webhook/slide-carousel-creator-c28c3ec35f63";
const N8N_CHECK_URL = "https://n8n.orangespace.io/webhook/check-slides-result-359d2005a21a";

/**
 * Starts image generation for a single slide
 */
export async function startImageGeneration(request: GenerateImageRequest): Promise<void> {
  // Create job in database
  const { error: insertError } = await supabase
    .from('generation_jobs')
    .insert({
      slide_id: request.slideId,
      status: 'pending'
    });

  if (insertError) {
    console.error('Error creating generation job:', insertError);
    throw new Error('Failed to start generation');
  }

  // Send request to n8n webhook
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    // Update status to processing
    await supabase
      .from('generation_jobs')
      .update({ status: 'processing' })
      .eq('slide_id', request.slideId);
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    
    // Update job status to error
    await supabase
      .from('generation_jobs')
      .update({ 
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('slide_id', request.slideId);
    
    throw error;
  }
}

/**
 * Checks generation status for a slide
 */
export async function checkGenerationStatus(slideId: string): Promise<GenerationJob | null> {
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('slide_id', slideId)
    .single();

  if (error) {
    console.error('Error checking generation status:', error);
    return null;
  }

  return data as GenerationJob;
}

/**
 * Polls for generation completion with timeout
 */
export async function pollGenerationStatus(
  slideId: string,
  onProgress?: (status: GenerationJob) => void,
  maxAttempts = 24 // 24 attempts * 10 seconds = 4 minutes
): Promise<GenerationJob> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    
    const job = await checkGenerationStatus(slideId);
    
    if (job) {
      onProgress?.(job);
      
      if (job.status === 'completed' || job.status === 'error') {
        return job;
      }
    }
  }
  
  // Timeout - mark as error
  await supabase
    .from('generation_jobs')
    .update({ 
      status: 'error',
      error_message: 'Generation timeout - exceeded maximum wait time'
    })
    .eq('slide_id', slideId);
  
  throw new Error('Generation timeout');
}

/**
 * Retries a failed generation
 */
export async function retryGeneration(request: GenerateImageRequest): Promise<void> {
  // Delete old job
  await supabase
    .from('generation_jobs')
    .delete()
    .eq('slide_id', request.slideId);
  
  // Start new generation
  await startImageGeneration(request);
}
