const toneStyles = {
  blue: 'bg-muted',
  cyan: 'bg-accent',
  ink: 'bg-secondary',
  slate: 'bg-card',
  cream: 'bg-background',
};

// 커버 영역의 고정 높이. 썸네일 유무와 무관하게 모든 카드가 같은 커버 높이를 갖도록 공용 상수로 둔다.
const COVER_HEIGHT = 'h-36';

function CoverFrame({ children, toneClass }) {
  return <div className={`relative h-full overflow-hidden ${toneClass}`}>{children}</div>;
}

function StackCover({ cover, toneClass }) {
  return (
    <CoverFrame toneClass={toneClass}>
      <div className="relative h-full">
        <div className="absolute left-4 top-4 h-16 w-24 rounded-[18px] border border-border bg-card/80" />
        <div className="absolute left-10 top-8 h-16 w-24 rounded-[18px] border border-border bg-card/60" />
        <div className="absolute left-16 top-12 h-16 w-24 rounded-[18px] border border-border bg-card shadow-sm" />
        <div className="absolute left-4 top-4 text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          stack
        </div>
        <div className="absolute bottom-4 left-4">
          <p className="text-[1.15rem] font-bold tracking-[-0.04em] text-foreground">{cover.main}</p>
          <p className="mt-1 text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-primary">{cover.caption}</p>
        </div>
      </div>
    </CoverFrame>
  );
}

function OrbitCover({ cover, toneClass }) {
  return (
    <CoverFrame toneClass={toneClass}>
      <div className="relative h-full">
        <div className="absolute left-6 top-5 h-20 w-20 rounded-full border border-primary/30" />
        <div className="absolute left-11 top-10 h-20 w-20 rounded-full border border-primary/45" />
        <div className="absolute left-16 top-7 h-4 w-4 rounded-full bg-primary/60" />
        <div className="absolute right-4 top-4 rounded-full border border-border bg-card px-3 py-1">
          <span className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">orbit</span>
        </div>
        <div className="absolute bottom-4 right-4 text-right">
          <p className="text-[1.15rem] font-bold tracking-[-0.04em] text-foreground">{cover.main}</p>
          <p className="mt-1 text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-primary">{cover.caption}</p>
        </div>
      </div>
    </CoverFrame>
  );
}

function PosterCover({ cover, toneClass }) {
  return (
    <CoverFrame toneClass={toneClass}>
      <div className="relative flex h-full flex-col justify-between px-4 py-3">
        <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">poster</p>
        <div>
          <p className="text-[2.6rem] font-bold leading-none tracking-[-0.1em] text-primary/35">
            {cover.symbol ?? 'A'}
          </p>
          <p className="mt-1 text-[0.9rem] font-bold leading-5 tracking-[-0.04em] text-foreground">{cover.main}</p>
          <p className="mt-1 text-[0.56rem] uppercase tracking-[0.22em] text-muted-foreground">{cover.caption}</p>
        </div>
      </div>
    </CoverFrame>
  );
}

function WaveCover({ toneClass, cover }) {
  const bars = cover.bars ?? [5, 8, 10, 6, 9, 12, 7, 11, 9, 6];

  return (
    <CoverFrame toneClass={toneClass}>
      <div className="flex h-full flex-col justify-between px-4 py-3">
        <div>
          <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">wave</p>
          <p className="mt-1 text-[1.2rem] font-bold tracking-[-0.05em] text-foreground">{cover.main}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-2.5 py-2">
          <div className="flex h-10 items-end gap-1">
            {bars.map((value, index) => (
              <span key={index} className="flex-1 rounded-t-sm bg-primary/85" style={{ height: `${value * 3}px` }} />
            ))}
          </div>
        </div>
      </div>
    </CoverFrame>
  );
}

function RibbonCover({ cover, toneClass }) {
  return (
    <CoverFrame toneClass={toneClass}>
      <div className="relative h-full">
        <div className="absolute -left-4 top-5 h-10 w-40 rotate-[-12deg] bg-primary/20" />
        <div className="absolute left-2 top-11 h-10 w-40 rotate-[-12deg] bg-primary/35" />
        <div className="absolute left-8 top-17 h-10 w-40 rotate-[-12deg] bg-primary/55" />
        <div className="absolute bottom-4 left-4 rounded-xl bg-card/90 px-3 py-2">
          <p className="text-[0.56rem] uppercase tracking-[0.22em] text-muted-foreground">ribbon</p>
          <p className="mt-1 text-[1rem] font-bold tracking-[-0.04em] text-foreground">{cover.main}</p>
        </div>
      </div>
    </CoverFrame>
  );
}

function GridCover({ cover, toneClass }) {
  return (
    <CoverFrame toneClass={toneClass}>
      <div className="grid h-full grid-cols-5 gap-1 p-3">
        {Array.from({ length: 20 }).map((_, index) => {
          const active = cover.activeCells?.includes(index);

          return (
            <span key={index} className={['rounded-[8px]', active ? 'bg-primary/60' : 'bg-foreground/8'].join(' ')} />
          );
        })}
        <div className="absolute bottom-3 left-3 rounded-lg bg-card/90 px-3 py-1.5">
          <span className="text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {cover.caption}
          </span>
        </div>
      </div>
    </CoverFrame>
  );
}

function ThreadCover({ cover, toneClass }) {
  return (
    <CoverFrame toneClass={toneClass}>
      <div className="relative h-full px-4 py-3">
        <div className="absolute left-6 top-4 bottom-4 w-px bg-border" />
        {[0, 1, 2].map((item) => (
          <div key={item} className="relative ml-6 mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="h-2 w-20 rounded-full bg-foreground/10" />
          </div>
        ))}
        <div className="absolute bottom-4 right-4 text-right">
          <p className="text-[1rem] font-bold tracking-[-0.04em] text-foreground">{cover.main}</p>
          <p className="mt-1 text-[0.56rem] uppercase tracking-[0.22em] text-muted-foreground">{cover.caption}</p>
        </div>
      </div>
    </CoverFrame>
  );
}

function DotCover({ cover, toneClass }) {
  return (
    <CoverFrame toneClass={toneClass}>
      <div className="relative h-full">
        <span className="absolute left-5 top-5 h-5 w-5 rounded-full bg-primary/35" />
        <span className="absolute left-16 top-8 h-7 w-7 rounded-full bg-primary/60" />
        <span className="absolute left-28 top-5 h-4 w-4 rounded-full bg-primary/35" />
        <span className="absolute left-10 top-[4.5rem] h-6 w-6 rounded-full bg-primary/60" />
        <span className="absolute left-26 top-16 h-8 w-8 rounded-full bg-primary/35" />
        <span className="absolute left-40 top-12 h-5 w-5 rounded-full bg-primary/60" />
        <div className="absolute bottom-4 left-4">
          <p className="text-[1rem] font-bold tracking-[-0.04em] text-foreground">{cover.main}</p>
          <p className="mt-1 text-[0.56rem] uppercase tracking-[0.22em] text-muted-foreground">{cover.caption}</p>
        </div>
      </div>
    </CoverFrame>
  );
}

function MinimalCover({ cover, toneClass }) {
  return (
    <CoverFrame toneClass={toneClass}>
      <div className="relative h-full px-4 py-3.5">
        <div className="h-px w-full bg-border" />
        <p className="mt-2.5 text-[0.56rem] uppercase tracking-[0.2em] text-muted-foreground">release note</p>
        <p className="mt-4 text-[1.6rem] font-bold tracking-[-0.08em] text-foreground">{cover.main}</p>
      </div>
    </CoverFrame>
  );
}

function ImageCover({ cover }) {
  return (
    <CoverFrame toneClass="bg-muted">
      <img src={cover.url} alt="" className="h-full w-full object-cover" />
    </CoverFrame>
  );
}

export default function BlogMainPostCover({ cover }) {
  // 썸네일이 없으면 커버를 생략한다(placeholder 없음). 카드 높이 일정성은 카드 쪽 min-height 가 담당.
  if (!cover || cover.variant === 'none') return null;

  if (cover.variant === 'image') {
    return (
      <div className={`${COVER_HEIGHT} border-b border-border`}>
        <ImageCover cover={cover} />
      </div>
    );
  }

  const toneClass = toneStyles[cover.tone] ?? toneStyles.slate;

  let content = null;
  switch (cover.variant) {
    case 'stack':
      content = <StackCover cover={cover} toneClass={toneClass} />;
      break;
    case 'orbit':
      content = <OrbitCover cover={cover} toneClass={toneClass} />;
      break;
    case 'poster':
      content = <PosterCover cover={cover} toneClass={toneClass} />;
      break;
    case 'wave':
      content = <WaveCover cover={cover} toneClass={toneClass} />;
      break;
    case 'ribbon':
      content = <RibbonCover cover={cover} toneClass={toneClass} />;
      break;
    case 'grid':
      content = <GridCover cover={cover} toneClass={toneClass} />;
      break;
    case 'thread':
      content = <ThreadCover cover={cover} toneClass={toneClass} />;
      break;
    case 'dots':
      content = <DotCover cover={cover} toneClass={toneClass} />;
      break;
    case 'minimal':
      content = <MinimalCover cover={cover} toneClass={toneClass} />;
      break;
    default:
      return null;
  }

  return <div className={`${COVER_HEIGHT} border-b border-border`}>{content}</div>;
}
