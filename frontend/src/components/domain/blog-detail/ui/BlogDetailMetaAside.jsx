import { Capsule } from "@/components/common/ui/capsule"

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[0.84rem] leading-6">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SignalMeter({ label, meter, value }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-[0.82rem]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-border">
        <div className="h-full rounded-full bg-primary" style={{ width: `${meter}%` }} />
      </div>
    </div>
  );
}

export default function BlogDetailMetaAside({
  asideNote,
  keywords,
  pageSignals,
  publishedAt,
  readTime,
  sections,
  updatedAt,
}) {
  const hasReadingMap = sections.length > 0;
  const hasPageSignals = pageSignals.length > 0;
  const hasPostInfo = Boolean(publishedAt || updatedAt || readTime);
  const hasStance = Boolean(asideNote || keywords.length > 0);

  return (
    <div className="space-y-4">
      {/* 데이터가 일부만 있어도 자연스럽게 줄어들도록 카드별로 조건부 렌더링합니다. */}
      {hasReadingMap ? (
        <div className="rounded-[1.8rem] border border-border bg-card px-6 py-6">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            reading map
          </p>
          <div className="mt-4 space-y-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-start gap-3 rounded-[1rem] border border-transparent px-3 py-3 transition hover:border-border hover:bg-background"
              >
                <Capsule size="sm">{section.eyebrow}</Capsule>
                <span className="text-[0.88rem] leading-6 text-foreground/78">
                  {section.heading}
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* 본문 흐름을 방해하지 않으면서 상태 정보를 빠르게 훑어볼 수 있게 합니다. */}
      {hasPageSignals ? (
        <div className="rounded-[1.8rem] border border-border bg-background px-6 py-6">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            page signals
          </p>
          <div className="mt-4 space-y-4">
            {pageSignals.map((signal) => (
              <SignalMeter
                key={signal.label}
                label={signal.label}
                meter={signal.meter}
                value={signal.value}
              />
            ))}
          </div>
        </div>
      ) : null}

      {hasPostInfo ? (
        <div className="rounded-[1.8rem] border border-border bg-card px-6 py-6">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            post info
          </p>
          <div className="mt-4 space-y-3">
            {publishedAt ? <InfoRow label="Published" value={publishedAt} /> : null}
            {updatedAt ? <InfoRow label="Updated" value={updatedAt} /> : null}
            {readTime ? <InfoRow label="Reading" value={readTime} /> : null}
          </div>
        </div>
      ) : null}

      {/* 마지막 카드는 글의 맥락 설명과 키워드를 함께 보여주는 용도입니다. */}
      {hasStance ? (
        <div className="rounded-[1.8rem] border border-border bg-card px-6 py-6">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            detail stance
          </p>
          {asideNote ? (
            <p className="mt-4 text-[0.9rem] leading-7 text-foreground/80">{asideNote}</p>
          ) : null}
          {keywords.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Capsule key={keyword} variant="outline" className="text-[0.72rem]">
                  {keyword}
                </Capsule>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
