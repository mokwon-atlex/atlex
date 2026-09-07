import { cn } from "@/lib/utils";

export default function BlogHomeBodyLayout({
  sidebar,
  children,
  contentClassName,
  sidebarClassName,
  stickySidebar = true,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start">
      <aside
        className={cn(
          stickySidebar ? "xl:sticky xl:top-32" : "relative",
          sidebarClassName
        )}
      >
        {sidebar}
      </aside>
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
    </div>
  );
}
