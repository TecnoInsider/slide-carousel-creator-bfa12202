import { Slide, StyleConfig } from "@/pages/Index";
import { SlideCard } from "./SlideCard";

interface SlideGalleryProps {
  slides: Slide[];
  styleConfig: StyleConfig;
  onSlideImageUpdate: (slideId: string, imageUrl: string) => void;
  storyText: string;
}

export const SlideGallery = ({
  slides,
  styleConfig,
  onSlideImageUpdate,
  storyText,
}: SlideGalleryProps) => {
  return (
    <section className="space-y-6" aria-live="polite">
        {slides.map((slide, index) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            slideNumber={index + 1}
            styleConfig={styleConfig}
            isLast={index === slides.length - 1}
            onImageUpdate={(imageUrl) => onSlideImageUpdate(slide.id, imageUrl)}
            storyText={storyText}
          />
        ))}
    </section>
  );
};
