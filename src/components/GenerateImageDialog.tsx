import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ImageStyle } from "@/types/generation";

interface GenerateImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (userPrompt: string, style: ImageStyle) => void;
  isMultiple?: boolean;
}

const IMAGE_STYLES: { value: ImageStyle; label: string; description: string }[] = [
  { value: 'photorealistic', label: 'Photorealistic', description: 'Realistic photo-like images' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean, simple designs' },
  { value: 'illustration', label: 'Illustration', description: 'Hand-drawn artistic style' },
  { value: 'abstract', label: 'Abstract', description: 'Creative abstract art' },
  { value: 'cartoon', label: 'Cartoon', description: 'Fun cartoon-style graphics' },
];

export function GenerateImageDialog({ 
  open, 
  onOpenChange, 
  onGenerate,
  isMultiple = false 
}: GenerateImageDialogProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [style, setStyle] = useState<ImageStyle>('photorealistic');

  const handleGenerate = () => {
    onGenerate(userPrompt, style);
    onOpenChange(false);
    setUserPrompt("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isMultiple ? 'Generate Images for All Slides' : 'Generate Image'}
          </DialogTitle>
          <DialogDescription>
            Customize your image generation settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="style">Image Style</Label>
            <Select value={style} onValueChange={(value) => setStyle(value as ImageStyle)}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_STYLES.map((styleOption) => (
                  <SelectItem key={styleOption.value} value={styleOption.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{styleOption.label}</span>
                      <span className="text-xs text-muted-foreground">{styleOption.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">
              Additional Instructions <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="prompt"
              placeholder="E.g., 'Add more nature elements', 'Use warm colors', 'Include mountains in background'..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
