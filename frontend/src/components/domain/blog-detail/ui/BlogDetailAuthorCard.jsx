import { Capsule } from "@/components/common/ui/capsule"

export default function BlogDetailAuthorCard({ authorCard }) {
  return (
    <section className="rounded-[2.2rem] border border-border bg-card px-7 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:px-8">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        {/* 프로필 정보는 짧게 유지하고, 긴 설명은 오른쪽 소개 영역이 맡도록 구성합니다. */}
        <div className="flex items-center gap-5">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted text-[1.45rem] font-bold tracking-[-0.08em] text-foreground">
            {authorCard.initials}
          </div>

          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              writer
            </p>
            <h2 className="mt-3 text-[1.9rem] font-bold tracking-[-0.08em] text-foreground">
              {authorCard.name}
            </h2>
            <Capsule variant="outline" className="mt-3 text-[0.72rem]">
              {authorCard.role}
            </Capsule>
          </div>
        </div>

        {/* 배지는 긴 문단을 늘리지 않고도 작성자 성격을 빠르게 요약해 줍니다. */}
        <div className="max-w-[34rem]">
          <p className="text-[0.95rem] leading-8 text-foreground/82">
            {authorCard.bio}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {authorCard.badges.map((badge) => (
              <Capsule key={badge} variant="outline" className="text-[0.72rem]">
                {badge}
              </Capsule>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
