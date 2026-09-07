import { Capsule } from "@/components/common/ui/capsule";
import { textfieldVariants } from "@/components/common/ui/textfield";
import { cn } from "@/lib/utils";

export default function BlogHomeSidebarStatsLayout({ stats }) {
  // 팔로워/팔로잉 값은 의미를 살리기 위해 설명 목록 구조를 유지한다.
  return (
    <dl className="mt-5 flex flex-wrap items-center gap-2">
      {stats.map((stat) => (
        <div key={stat.id}>
          <Capsule
            variant="outline"
            className="h-auto gap-1.5 bg-background px-4 py-2 hover:bg-background"
          >
            <dt
              className={cn(
                textfieldVariants({
                  size: "sm",
                  variant: "muted",
                  weight: "semibold",
                })
              )}
            >
              {stat.label}
            </dt>
            <dd
              className={cn(
                textfieldVariants({
                  size: "default",
                  weight: "bold",
                }),
                "tracking-tight"
              )}
            >
              {stat.value}
            </dd>
          </Capsule>
        </div>
      ))}
    </dl>
  );
}
