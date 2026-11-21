import { Capsule } from '@/components/common/ui/capsule';

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
        <div className="rounded-lg border border-border/80 bg-card px-4 py-4">
          <p className="text-xs font-semibold text-muted-foreground">목차</p>
          <div className="mt-3 space-y-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-start gap-3 rounded-md border border-transparent px-2.5 py-2 transition hover:border-border hover:bg-background"
              >
                <Capsule size="sm">{section.eyebrow}</Capsule>
                <span className="text-[0.86rem] leading-6 text-foreground/80">{section.heading}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* 본문 흐름을 방해하지 않으면서 상태 정보를 빠르게 훑어볼 수 있게 합니다. */}
      {hasPageSignals ? (
        <div className="rounded-lg border border-border/80 bg-background px-4 py-4">
          <p className="text-xs font-semibold text-muted-foreground">문서 지표</p>
          <div className="mt-3 space-y-3">
            {pageSignals.map((signal) => (
              <SignalMeter key={signal.label} label={signal.label} meter={signal.meter} value={signal.value} />
            ))}
          </div>
        </div>
      ) : null}

      {hasPostInfo ? (
        <div className="rounded-lg border border-border/80 bg-card px-4 py-4">
          <p className="text-xs font-semibold text-muted-foreground">게시글 정보</p>
          <div className="mt-3 space-y-2.5">
            {publishedAt ? <InfoRow label="Published" value={publishedAt} /> : null}
            {updatedAt ? <InfoRow label="Updated" value={updatedAt} /> : null}
            {readTime ? <InfoRow label="Reading" value={readTime} /> : null}
          </div>
        </div>
      ) : null}

      {/* 마지막 카드는 글의 맥락 설명과 키워드를 함께 보여주는 용도입니다. */}
      {hasStance ? (
        <div className="rounded-lg border border-border/80 bg-card px-4 py-4">
          <p className="text-xs font-semibold text-muted-foreground">핵심 요약</p>
          {asideNote ? <p className="mt-4 text-[0.9rem] leading-7 text-foreground/80">{asideNote}</p> : null}
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
