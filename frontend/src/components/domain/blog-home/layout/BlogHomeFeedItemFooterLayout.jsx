import { Bookmark, Heart, MessageSquare } from "lucide-react";

import { Button } from "@/components/common/ui/button";
import { Separator } from "@/components/common/ui/separator";
import { Textfield } from "@/components/common/ui/textfield";
import { cn } from "@/lib/utils";

function ReactionButton({ active = false, icon: Icon, label, value }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      aria-label={`${label} ${value}`}
      className={cn(
        "h-auto rounded-full px-3 py-1 text-xs font-semibold",
        active
          ? "border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground"
      )}
    >
      <Icon className="size-3.5" />
      {value}
    </Button>
  );
}

export default function BlogHomeFeedItemFooterLayout({
  bookmarks = 0,
  comments = 0,
  date,
  isLiked = false,
  likes = 0,
}) {
  return (
    <div className="mt-5 space-y-4">
      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Textfield className="text-xs font-semibold text-muted-foreground">
          {date}
        </Textfield>

        <div className="flex flex-wrap items-center gap-2">
          <ReactionButton
            active={isLiked}
            icon={Heart}
            label="like"
            value={likes}
          />
          <ReactionButton
            icon={MessageSquare}
            label="comment"
            value={comments}
          />
          <ReactionButton
            icon={Bookmark}
            label="bookmark"
            value={bookmarks}
          />
        </div>
      </div>
    </div>
  );
}
