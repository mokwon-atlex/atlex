export function CanvasButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-card/90 text-foreground shadow-2xs backdrop-blur-xs transition-colors hover:border-foreground/25 hover:bg-accent"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
