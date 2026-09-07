import { BarChart3, FolderOpen, Settings2, UserPlus } from "lucide-react";

import { Textfield } from "@/components/common/ui/textfield";
import BlogHomeSidebarCategoryDialog from "@/components/domain/blog-home/layout/BlogHomeSidebarCategoryDialog";
import BlogHomePillButton from "@/components/domain/blog-home/ui/BlogHomePillButton";

const actionIconMap = {
  follow: UserPlus,
  category: FolderOpen,
  graph: BarChart3,
  option: Settings2,
};

const defaultTitle = "Quick Actions";

export default function BlogHomeSidebarQuickActionsLayout({
  actionOverrides = {},
  actions,
  title = defaultTitle,
}) {
  return (
    <div className="mt-5 space-y-2">
      <Textfield className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {title}
      </Textfield>

      <div className="flex flex-wrap items-center gap-3">
        {actions.map(({ id, label }) => {
          const Icon = actionIconMap[id];
          const renderAction = actionOverrides[id];

          if (renderAction) {
            return renderAction({
              icon: Icon,
              id,
              label,
            });
          }

          if (id === "category") {
            return (
              <BlogHomeSidebarCategoryDialog
                key={id}
                actionId={id}
                ariaLabel={label}
                label={label}
              />
            );
          }

          return (
            <BlogHomePillButton
              key={id}
              ariaLabel={label}
              icon={Icon}
              iconOnly
              label={label}
              tone="neutral"
              size="md"
            />
          );
        })}
      </div>
    </div>
  );
}
