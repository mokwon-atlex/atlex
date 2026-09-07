import { Tabs, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "@/app/tag_list/_lib/tags";

export default function TagSortTabs({ currentSort, onSortChange }) {
  return (
    <Tabs value={currentSort} onValueChange={onSortChange} className="mt-2">
      <TabsList variant="line" className="h-auto gap-7 p-0">
        {SORT_OPTIONS.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className={cn(
              "px-0 pb-2 text-[15px] text-muted-foreground",
              "hover:text-foreground",
              "data-active:font-bold data-active:text-primary",
              "data-[state=active]:font-bold data-[state=active]:text-primary",
              "after:bg-primary"
            )}
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
