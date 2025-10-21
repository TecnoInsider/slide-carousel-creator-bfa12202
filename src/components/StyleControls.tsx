import { StyleConfig } from "@/pages/Index";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface StyleControlsProps {
  config: StyleConfig;
  onChange: (config: StyleConfig) => void;
}

export const StyleControls = ({ config, onChange }: StyleControlsProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const updateConfig = (key: keyof StyleConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
        <span className="text-sm">Advanced style options (optional)</span>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fontFamily" className="text-xs text-muted-foreground">Font family</Label>
            <Select value={config.fontFamily} onValueChange={(value) => updateConfig("fontFamily", value)}>
              <SelectTrigger id="fontFamily" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                <SelectItem value="'Lora', serif">Lora</SelectItem>
                <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                <SelectItem value="'Raleway', sans-serif">Raleway</SelectItem>
                <SelectItem value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="textAlign" className="text-xs text-muted-foreground">Text align</Label>
            <Select value={config.textAlign} onValueChange={(value: any) => updateConfig("textAlign", value)}>
              <SelectTrigger id="textAlign" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-3">
          <Checkbox
            id="swipeArrow"
            checked={config.swipeArrow}
            onCheckedChange={(checked) => updateConfig("swipeArrow", checked)}
          />
          <Label htmlFor="swipeArrow" className="text-sm cursor-pointer">
            Show "swipe right" arrow on all but last slide
          </Label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fontSize" className="text-xs text-muted-foreground">Base font size (px)</Label>
            <Input
              id="fontSize"
              type="number"
              min={18}
              max={64}
              value={config.fontSize}
              onChange={(e) => updateConfig("fontSize", Number(e.target.value))}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="lineHeight" className="text-xs text-muted-foreground">Line height</Label>
            <Input
              id="lineHeight"
              type="number"
              step={0.05}
              min={1.1}
              max={2}
              value={config.lineHeight}
              onChange={(e) => updateConfig("lineHeight", Number(e.target.value))}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="padding" className="text-xs text-muted-foreground">Text padding (px)</Label>
            <Input
              id="padding"
              type="number"
              min={24}
              max={120}
              value={config.padding}
              onChange={(e) => updateConfig("padding", Number(e.target.value))}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="fadePct" className="text-xs text-muted-foreground">Fade height (% of canvas)</Label>
            <Input
              id="fadePct"
              type="number"
              min={10}
              max={100}
              value={config.fadePct}
              onChange={(e) => updateConfig("fadePct", Number(e.target.value))}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="backdropOpacity" className="text-xs text-muted-foreground">Backdrop opacity (0–1)</Label>
            <Input
              id="backdropOpacity"
              type="number"
              step={0.05}
              min={0}
              max={1}
              value={config.backdropOpacity}
              onChange={(e) => updateConfig("backdropOpacity", Number(e.target.value))}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="cornerRadius" className="text-xs text-muted-foreground">Corner radius (px)</Label>
            <Input
              id="cornerRadius"
              type="number"
              min={0}
              max={80}
              value={config.cornerRadius}
              onChange={(e) => updateConfig("cornerRadius", Number(e.target.value))}
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="textColor" className="text-xs text-muted-foreground">Text color</Label>
            <Input
              id="textColor"
              type="text"
              value={config.textColor}
              onChange={(e) => updateConfig("textColor", e.target.value)}
              className="mt-1.5 font-mono"
            />
          </div>

          <div>
            <Label htmlFor="shadow" className="text-xs text-muted-foreground">Shadow (0–1)</Label>
            <Input
              id="shadow"
              type="number"
              step={0.05}
              min={0}
              max={1}
              value={config.shadow}
              onChange={(e) => updateConfig("shadow", Number(e.target.value))}
              className="mt-1.5"
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
