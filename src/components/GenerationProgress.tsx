import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import type { GenerationStatus } from "@/types/generation";

interface SlideProgress {
  slideId: string;
  slideNumber: number;
  status: GenerationStatus;
  error?: string;
}

interface GenerationProgressProps {
  slides: SlideProgress[];
}

const statusIcons = {
  pending: <Clock className="w-4 h-4 text-muted-foreground" />,
  processing: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  error: <XCircle className="w-4 h-4 text-destructive" />,
};

const statusLabels = {
  pending: 'Waiting...',
  processing: 'Generating...',
  completed: 'Done',
  error: 'Failed',
};

export function GenerationProgress({ slides }: GenerationProgressProps) {
  const completedCount = slides.filter(s => s.status === 'completed').length;
  const errorCount = slides.filter(s => s.status === 'error').length;
  const totalCount = slides.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Generation Progress</span>
          <span className="text-muted-foreground">
            {completedCount}/{totalCount} completed
            {errorCount > 0 && ` (${errorCount} failed)`}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {slides.map((slide) => (
          <div
            key={slide.slideId}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
          >
            <div className="flex items-center gap-3">
              {statusIcons[slide.status]}
              <div>
                <div className="font-medium text-sm">Slide {slide.slideNumber}</div>
                {slide.error && (
                  <div className="text-xs text-destructive">{slide.error}</div>
                )}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {statusLabels[slide.status]}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
