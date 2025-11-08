import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
  onLogout?: () => void;
}

export const Header = ({ onLogout }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/95 border-b border-border">
      <div className="max-w-[920px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Instagram Slide Carousel Creator
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Paste text → slides appear → tap "Replace image" per slide. Long‑press any image to save.
          </p>
        </div>
        {onLogout && (
          <Button onClick={onLogout} variant="ghost" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        )}
      </div>
    </header>
  );
};
