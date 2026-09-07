import { Card, CardContent, CardHeader } from "@/components/common/ui/card";
import { cn } from "@/lib/utils";

export default function BlogHomeSidebarCard({
  bodyClassName,
  children,
  className,
  footer,
  footerClassName,
  header,
  headerClassName,
}) {
  return (
    <Card
      className={cn(
        "rounded-3xl gap-0 border-border bg-card p-0 shadow-none",
        className
      )}
    >
      {header ? (
        <CardHeader className={cn("px-5 pt-5 pb-0", headerClassName)}>
          {header}
        </CardHeader>
      ) : null}

      <CardContent
        className={cn(
          "px-5 py-5",
          header ? "pt-5" : "",
          footer ? "pb-0" : "",
          bodyClassName
        )}
      >
        {children}
      </CardContent>

      {footer ? (
        <CardContent className={cn("px-5 pt-5 pb-5", footerClassName)}>
          {footer}
        </CardContent>
      ) : null}
    </Card>
  );
}
