import { Card, CardContent, CardHeader } from '@/components/common/ui/card';
import { cn } from '@/lib/utils';

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
    <Card className={cn('gap-0 rounded-lg border-border/80 bg-card p-0 shadow-2xs', className)}>
      {header ? <CardHeader className={cn('px-4 pt-4 pb-0', headerClassName)}>{header}</CardHeader> : null}

      <CardContent className={cn('px-4 py-4', header ? 'pt-4' : '', footer ? 'pb-0' : '', bodyClassName)}>
        {children}
      </CardContent>

      {footer ? <CardContent className={cn('px-4 pt-4 pb-4', footerClassName)}>{footer}</CardContent> : null}
    </Card>
  );
}
