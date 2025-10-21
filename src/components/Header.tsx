export const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/95 border-b border-border">
      <div className="max-w-[920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Создатель каруселей для Instagram
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Вставьте текст → появятся слайды → нажмите &quot;Заменить фото&quot; для каждого слайда. Зажмите изображение для сохранения.
          </p>
        </div>
      </div>
    </header>
  );
};
