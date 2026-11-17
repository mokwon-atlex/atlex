import { Capsule } from '@/components/common/ui/capsule';
import { textfieldVariants } from '@/components/common/ui/textfield';
import { cn } from '@/lib/utils';

export default function BlogHomeSidebarStatsLayout({ onStatClick, stats }) {
  // 팔로워/팔로잉 값은 의미를 살리기 위해 설명 목록 구조를 유지한다.
  return (
    <dl className="mt-5 flex flex-wrap items-center gap-2">
      {stats.map((stat) => {
        const isClickable = Boolean(onStatClick) && (stat.id === 'followers' || stat.id === 'following');

        const content = (
          <Capsule
            variant="outline"
            className={cn(
              'h-auto gap-1.5 bg-background px-4 py-2',
              isClickable ? 'cursor-pointer transition-colors hover:bg-muted/60' : 'hover:bg-background',
            )}
          >
            <dt
              className={cn(
                textfieldVariants({
                  size: 'sm',
                  variant: 'muted',
                  weight: 'semibold',
                }),
              )}
            >
              {stat.label}
            </dt>
            <dd
              className={cn(
                textfieldVariants({
                  size: 'default',
                  weight: 'bold',
                }),
                'tracking-tight',
              )}
            >
              {stat.value}
            </dd>
          </Capsule>
        );

        return (
          <div key={stat.id}>
            {isClickable ? (
              <button
                type="button"
                onClick={() => onStatClick(stat.id)}
                className="text-left"
                aria-label={`${stat.label} 목록 보기`}
              >
                {content}
              </button>
            ) : (
              content
            )}
          </div>
        );
      })}
    </dl>
  );
}
