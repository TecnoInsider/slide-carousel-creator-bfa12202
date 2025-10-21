import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  paragraphCount: number;
  photosCount: number;
  totalSlides: number;
}

export const TextInput = ({
  value,
  onChange,
  paragraphCount,
  photosCount,
  totalSlides,
}: TextInputProps) => {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="story" className="text-xs text-muted-foreground">
          1) Paste your story text (one paragraph per slide)
        </Label>
        <Textarea
          id="story"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your text here. Separate paragraphs with a blank line (double newline)."
          className="min-h-[160px] mt-2 resize-y bg-input border-border"
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          Paragraphs: {paragraphCount}
        </Badge>
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          With photos: {photosCount}/{totalSlides}
        </Badge>
      </div>
    </div>
  );
};
