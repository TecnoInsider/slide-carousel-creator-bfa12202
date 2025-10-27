import { useEffect, useRef, useState } from "react";
import { Slide, StyleConfig } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface SlideCardProps {
  slide: Slide;
  styleConfig: StyleConfig;
  isLast: boolean;
  onImageUpdate: (imageUrl: string) => void;
}

export const SlideCard = ({
  slide,
  styleConfig,
  isLast,
  onImageUpdate,
}: SlideCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const lastTapTimeRef = useRef<number>(0);

  useEffect(() => {
    renderSlide();
  }, [slide, styleConfig, isLast]);

  const renderSlide = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRendering(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    if (slide.imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = slide.imageUrl!;
        });

        // Apply corner radius if set
        if (styleConfig.cornerRadius > 0) {
          ctx.save();
          ctx.beginPath();
          const radius = styleConfig.cornerRadius * 2; // Scale for canvas size
          ctx.moveTo(radius, 0);
          ctx.lineTo(width - radius, 0);
          ctx.quadraticCurveTo(width, 0, width, radius);
          ctx.lineTo(width, height - radius);
          ctx.quadraticCurveTo(width, height, width - radius, height);
          ctx.lineTo(radius, height);
          ctx.quadraticCurveTo(0, height, 0, height - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.clip();
        }

        // Calculate dimensions to maintain aspect ratio (cover mode)
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
          // Image is wider than canvas
          drawHeight = height;
          drawWidth = img.width * (height / img.height);
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller than canvas
          drawWidth = width;
          drawHeight = img.height * (width / img.width);
          offsetX = 0;
          offsetY = (height - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        if (styleConfig.cornerRadius > 0) {
          ctx.restore();
        }
      } catch (error) {
        console.error("Failed to load image:", error);
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, width, height);
    }

    // Draw gradient backdrop
    const fadeHeight = (height * styleConfig.fadePct) / 100;
    const gradient = ctx.createLinearGradient(0, height - fadeHeight, 0, height);
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${styleConfig.backdropOpacity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw text
    ctx.font = `${styleConfig.fontSize * 2}px ${styleConfig.fontFamily}`;
    ctx.fillStyle = styleConfig.textColor;
    ctx.textAlign = styleConfig.textAlign;
    
    // Add text shadow if enabled
    if (styleConfig.shadow > 0) {
      ctx.shadowColor = `rgba(0, 0, 0, ${styleConfig.shadow})`;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
    }

    const padding = styleConfig.padding * 2;
    const lineHeightPx = styleConfig.fontSize * 2 * styleConfig.lineHeight;
    const words = slide.text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    // Word wrap
    const maxWidth = width - padding * 2;
    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    // Draw lines
    let y = height - padding - (lines.length - 1) * lineHeightPx;
    lines.forEach((line) => {
      let x = padding;
      if (styleConfig.textAlign === "center") x = width / 2;
      if (styleConfig.textAlign === "right") x = width - padding;
      
      ctx.fillText(line, x, y);
      y += lineHeightPx;
    });

    // Draw swipe arrow if enabled
    if (styleConfig.swipeArrow && !isLast) {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      
      const arrowX = width - 60;
      const arrowY = height / 2;
      const arrowSize = 40;
      
      ctx.strokeStyle = styleConfig.textColor;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      ctx.beginPath();
      ctx.moveTo(arrowX - arrowSize, arrowY - arrowSize / 2);
      ctx.lineTo(arrowX, arrowY);
      ctx.lineTo(arrowX - arrowSize, arrowY + arrowSize / 2);
      ctx.stroke();
    }

    setIsRendering(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `slide-${slide.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Slide downloaded");
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      onImageUpdate(imageUrl);
      toast.success("Image updated");
    };
    reader.readAsDataURL(file);
  };

  const handleDoubleClick = () => {
    handleDownload();
  };

  const handleTouchEnd = () => {
    const currentTime = Date.now();
    const tapGap = currentTime - lastTapTimeRef.current;
    
    if (tapGap < 300 && tapGap > 0) {
      // Double tap detected
      handleDownload();
    }
    
    lastTapTimeRef.current = currentTime;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Prevent triggering on double click
    if (e.detail === 1) {
      // Single click - open file dialog
      setTimeout(() => {
        if (e.detail === 1) {
          fileInputRef.current?.click();
        }
      }, 200);
    }
  };

  return (
    <div className="bg-black border border-border rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full block cursor-pointer"
        style={{ aspectRatio: "4/5" }}
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
        onTouchEnd={handleTouchEnd}
        title="Click to replace image, double click/tap to download"
      />
      
      <div className="flex gap-2 justify-end p-3 bg-card/50">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
          size="sm"
          className="text-xs"
        >
          <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
          Replace image
        </Button>
        <Button
          onClick={handleDownload}
          variant="secondary"
          size="sm"
          className="text-xs"
          disabled={isRendering}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Download
        </Button>
      </div>
    </div>
  );
};
