import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TextInput } from "@/components/TextInput";
import { StyleControls } from "@/components/StyleControls";
import { SlideGallery } from "@/components/SlideGallery";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface StyleConfig {
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  fontSize: number;
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
  const [storyText, setStoryText] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    fontFamily: "'Montserrat', sans-serif",
    textAlign: "left",
    fontSize: 24,
    lineHeight: 1.25,
    padding: 40,
    fadePct: 60,
    backdropOpacity: 1,
    cornerRadius: 0,
    textColor: "#ffffff",
    shadow: 0.8,
    swipeArrow: false,
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Output size: 1080×1350 (4:5). Tap &quot;Replace image&quot; to set slide background, use Download to save.
            </p>
          </div>

          {slides.length > 0 && (
            <SlideGallery
              slides={slides}
              styleConfig={styleConfig}
              onSlideImageUpdate={handleSlideImageUpdate}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
