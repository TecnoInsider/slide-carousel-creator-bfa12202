import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { TextInput } from "@/components/TextInput";
import { StyleControls } from "@/components/StyleControls";
import { SlideGallery } from "@/components/SlideGallery";
import { GenerateImageDialog } from "@/components/GenerateImageDialog";
import { GenerationProgress } from "@/components/GenerationProgress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startImageGeneration, pollGenerationStatus } from "@/lib/imageGeneration";
import type { ImageStyle, GenerationJob } from "@/types/generation";
import { User, Session } from "@supabase/supabase-js";

export interface StyleConfig {
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  fontSize: number;
  headingSize: number;
  lineHeight: number;
  padding: number;
  fadePct: number;
  backdropOpacity: number;
  cornerRadius: number;
  textColor: string;
  shadow: number;
  swipeArrow: boolean;
}

export interface Slide {
  id: string;
  text: string;
  imageUrl?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [storyText, setStoryText] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    fontFamily: "'Montserrat', sans-serif",
    textAlign: "left",
    fontSize: 24,
    headingSize: 36,
    lineHeight: 1.25,
    padding: 40,
    fadePct: 60,
    backdropOpacity: 1,
    cornerRadius: 0,
    textColor: "#ffffff",
    shadow: 0.8,
    swipeArrow: false,
  });
  
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generationJobs, setGenerationJobs] = useState<Map<string, GenerationJob>>(new Map());

  // Auth check
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const paragraphs = storyText
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const photosCount = slides.filter((s) => s.imageUrl).length;

  // Auto-update slides when text changes
  useEffect(() => {
    if (paragraphs.length === 0) {
      if (slides.length > 0) {
        setSlides([]);
      }
      return;
    }

    const newSlides: Slide[] = paragraphs.map((text, index) => {
      const existingSlide = slides[index];
      return {
        id: existingSlide?.id || `slide-${Date.now()}-${index}`,
        text,
        imageUrl: existingSlide?.imageUrl,
      };
    });

    setSlides(newSlides);
  }, [storyText]);

  const handleUpdateSlides = () => {
    if (paragraphs.length === 0) {
      toast.error("Please paste some text first");
      return;
    }

    const newSlides: Slide[] = paragraphs.map((text, index) => {
      const existingSlide = slides[index];
      return {
        id: existingSlide?.id || `slide-${Date.now()}-${index}`,
        text,
        imageUrl: existingSlide?.imageUrl,
      };
    });

    setSlides(newSlides);
    toast.success(`Created ${newSlides.length} slides`);
  };

  const handleClearResults = () => {
    setSlides([]);
    toast.info("Results cleared");
  };

  const handleSlideImageUpdate = (slideId: string, imageUrl: string) => {
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === slideId ? { ...slide, imageUrl } : slide
      )
    );
  };

  const handleGenerateAll = async (userPrompt: string, style: ImageStyle) => {
    // Проверяем авторизацию перед генерацией
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Для генерации изображений необходимо войти в аккаунт");
      setTimeout(() => navigate("/auth"), 1500);
      return;
    }

    if (slides.length === 0) {
      toast.error("No slides to generate images for");
      return;
    }

    setIsGeneratingAll(true);
    const jobs = new Map<string, GenerationJob>();

    // Start generation for all slides sequentially
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      try {
        await startImageGeneration({
          slideId: slide.id,
          slideNumber: i + 1,
          slideText: slide.text,
          fullStoryText: storyText,
          userPrompt,
          style,
          styleConfig,
        });

        // Start polling for this slide
        pollGenerationStatus(slide.id, (job) => {
          setGenerationJobs((prev) => new Map(prev).set(slide.id, job));
          
          if (job.status === 'completed' && job.image_url) {
            handleSlideImageUpdate(slide.id, job.image_url);
          } else if (job.status === 'error') {
            toast.error(`Slide ${i + 1} generation failed: ${job.error_message || 'Unknown error'}`);
          }
        }).catch((error) => {
          console.error(`Polling failed for slide ${slide.id}:`, error);
        });

        jobs.set(slide.id, {
          id: slide.id,
          slide_id: slide.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Failed to start generation for slide ${slide.id}:`, error);
        toast.error(`Failed to start generation for slide ${i + 1}`);
      }
    }

    setGenerationJobs(jobs);
    toast.success(`Started generating images for ${slides.length} slides`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из аккаунта");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={user ? handleLogout : undefined} />
      
      <main className="max-w-[920px] mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
            <TextInput
              value={storyText}
              onChange={setStoryText}
              paragraphCount={paragraphs.length}
              photosCount={photosCount}
              totalSlides={slides.length}
            />

            <StyleControls
              config={styleConfig}
              onChange={setStyleConfig}
            />

            <div className="flex gap-3 mt-6 sticky bottom-2 z-10">
              <Button
                onClick={handleUpdateSlides}
                className="flex-1 h-12 text-base font-bold"
              >
                Update Slides
              </Button>
              <Button
                onClick={handleClearResults}
                variant="secondary"
                className="flex-1 h-12 text-base"
              >
                Clear Results
              </Button>
              <Button
                onClick={() => setShowGenerateDialog(true)}
                variant="outline"
                className="flex-1 h-12 text-base"
                disabled={slides.length === 0}
              >
                Generate All Images
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Output size: 1080×1350 (4:5). Tap &quot;Replace image&quot; to set slide background, use Download to save.
            </p>
          </div>

          {generationJobs.size > 0 && (
            <GenerationProgress
              slides={slides.map((slide, index) => ({
                slideId: slide.id,
                slideNumber: index + 1,
                status: (generationJobs.get(slide.id)?.status as any) || 'pending',
                error: generationJobs.get(slide.id)?.error_message || undefined,
              }))}
            />
          )}

          {slides.length > 0 && (
            <SlideGallery
              slides={slides}
              styleConfig={styleConfig}
              onSlideImageUpdate={handleSlideImageUpdate}
              storyText={storyText}
            />
          )}
        </div>
      </main>

      <GenerateImageDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerate={handleGenerateAll}
        isMultiple={true}
      />
    </div>
  );
};

export default Index;
