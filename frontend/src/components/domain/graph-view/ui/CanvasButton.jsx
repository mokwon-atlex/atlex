export function CanvasButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-md transition-all hover:bg-muted hover:shadow-lg"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
