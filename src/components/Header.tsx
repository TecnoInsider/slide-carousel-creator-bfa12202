export const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/95 border-b border-border">
      <div className="max-w-[920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Instagram Slide Carousel Creator
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Paste text → slides appear → tap &quot;Replace image&quot; per slide, then use Download button.
          </p>
        </div>
      </div>
    </header>
  );
};
