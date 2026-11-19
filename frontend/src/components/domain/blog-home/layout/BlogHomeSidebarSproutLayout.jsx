import { Sprout } from 'lucide-react';

import { CardTitle } from '@/components/common/ui/card';
import BlogHomeSidebarCard from '@/components/domain/blog-home/layout/BlogHomeSidebarCard';

const SPROUT_STAGES = [
  {
    level: 1,
    minPosts: 0,
    nextPosts: 12,
    name: '씨앗 화분',
    message: '글을 꾸준히 작성하면 새싹이 돋아나요.',
  },
  {
    level: 2,
    minPosts: 12,
    nextPosts: 35,
    name: '떡잎 새싹',
    message: '지식의 첫 떡잎이 고개를 내밀었어요.',
  },
  {
    level: 3,
    minPosts: 35,
    nextPosts: 610,
    name: '어린 줄기',
    message: '글이 쌓이며 줄기가 튼튼해지고 있어요.',
  },
  {
    level: 4,
    minPosts: 610,
    nextPosts: 1119,
    name: '꽃봉오리',
    message: '곧 예쁜 꽃이 필 것 같아요.',
  },
  {
    level: 5,
    minPosts: 1119,
    nextPosts: 2000,
    name: '만개한 꽃',
    message: '꾸준한 기록이 화사한 꽃을 피웠어요.',
  },
  {
    level: 6,
    minPosts: 2000,
    nextPosts: null,
    name: '지식의 나무',
    message: '풍성한 지식의 나무로 성장했어요!',
  },
];

function getSproutStage(postCount) {
  let current = SPROUT_STAGES[0];
  for (const stage of SPROUT_STAGES) {
    if (postCount >= stage.minPosts) {
      current = stage;
    }
  }
  return current;
}

/**
 * 게시글 수에 따라 단계별로 자라는 화분·새싹 SVG 일러스트.
 */
function SproutIllustration({ level }) {
  return (
    <svg viewBox="0 0 140 128" className="h-32 w-36" role="img" aria-label={`성장 단계 ${level} 화분`}>
      <defs>
        <linearGradient id="pot-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E07A5F" />
          <stop offset="100%" stopColor="#B85338" />
        </linearGradient>
        <linearGradient id="pot-rim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EA8C72" />
          <stop offset="100%" stopColor="#C96448" />
        </linearGradient>
      </defs>

      {/* 배경 아우라 */}
      <circle cx="70" cy="64" r="52" fill="#10B981" fillOpacity="0.08" />
      <circle cx="70" cy="116" rx="34" ry="5" fill="#0F172A" fillOpacity="0.08" />
      <ellipse cx="70" cy="115" rx="34" ry="5" fill="#0F172A" fillOpacity="0.07" />

      {/* 단계 1: 씨앗 */}
      {level === 1 ? (
        <g>
          <ellipse cx="70" cy="84" rx="5" ry="3.5" fill="#92400E" />
          <path d="M68 82 Q70 76 73 79" fill="none" stroke="#65A30D" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ) : null}

      {/* 단계 2: 떡잎 새싹 */}
      {level === 2 ? (
        <g>
          <path d="M70 86 Q70 71 70 64" fill="none" stroke="#4D7C0F" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 67 C61 60 54 63 56 69 C58 74 66 72 70 67 Z" fill="#84CC16" />
          <path d="M70 67 C79 60 86 63 84 69 C82 74 74 72 70 67 Z" fill="#65A30D" />
        </g>
      ) : null}

      {/* 단계 3: 어린 줄기 */}
      {level === 3 ? (
        <g>
          <path d="M70 86 Q68 68 70 50" fill="none" stroke="#15803D" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M69 72 C57 65 50 69 53 75 C56 80 65 77 69 72 Z" fill="#4ADE80" />
          <path d="M70 62 C82 55 89 59 86 65 C83 70 74 67 70 62 Z" fill="#22C55E" />
          <path d="M70 51 C61 42 54 44 56 51 C58 56 66 55 70 51 Z" fill="#86EFAC" />
          <path d="M70 51 C79 42 86 44 84 51 C82 56 74 55 70 51 Z" fill="#4ADE80" />
        </g>
      ) : null}

      {/* 단계 4: 꽃봉오리 */}
      {level === 4 ? (
        <g>
          <path d="M70 86 Q67 64 70 43" fill="none" stroke="#15803D" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M69 72 C55 65 49 70 52 76 C55 81 65 77 69 72 Z" fill="#22C55E" />
          <path d="M70 62 C84 55 90 60 87 66 C84 71 74 67 70 62 Z" fill="#16A34A" />
          <path d="M70 52 C60 44 53 47 55 53 C57 58 66 56 70 52 Z" fill="#4ADE80" />
          <path d="M70 44 C64 34 67 27 70 27 C73 27 76 34 70 44 Z" fill="#FB7185" />
          <path d="M65 43 Q70 48 75 43" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : null}

      {/* 단계 5: 만개한 꽃 */}
      {level === 5 ? (
        <g>
          <path d="M70 86 Q67 64 70 42" fill="none" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M69 73 C55 66 49 71 52 77 C55 82 65 78 69 73 Z" fill="#22C55E" />
          <path d="M70 61 C84 54 90 59 87 65 C84 70 74 66 70 61 Z" fill="#16A34A" />
          {/* 꽃잎 */}
          <circle cx="70" cy="26" r="8" fill="#FDA4AF" />
          <circle cx="59" cy="34" r="8" fill="#FB7185" />
          <circle cx="81" cy="34" r="8" fill="#FB7185" />
          <circle cx="63" cy="45" r="8" fill="#F43F5E" />
          <circle cx="77" cy="45" r="8" fill="#F43F5E" />
          <circle cx="70" cy="36" r="7" fill="#FACC15" />
          {/* 반짝임 */}
          <circle cx="44" cy="28" r="2" fill="#FACC15" />
          <circle cx="96" cy="24" r="2.2" fill="#FACC15" />
        </g>
      ) : null}

      {/* 단계 6: 지식의 나무 */}
      {level >= 6 ? (
        <g>
          <path d="M66 86 L67 52 L73 52 L74 86 Z" fill="#92400E" />
          <path d="M70 64 L57 53" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 60 L83 50" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <circle cx="70" cy="36" r="20" fill="#16A34A" />
          <circle cx="53" cy="45" r="15" fill="#22C55E" />
          <circle cx="87" cy="45" r="15" fill="#22C55E" />
          <circle cx="70" cy="27" r="14" fill="#4ADE80" />
          {/* 열매 & 반짝임 */}
          <circle cx="61" cy="36" r="3" fill="#F59E0B" />
          <circle cx="80" cy="40" r="3" fill="#F59E0B" />
          <circle cx="71" cy="23" r="2.8" fill="#FBBF24" />
          <circle cx="40" cy="26" r="2.2" fill="#FACC15" />
          <circle cx="101" cy="28" r="2" fill="#FACC15" />
        </g>
      ) : null}

      {/* 화분 */}
      <ellipse cx="70" cy="86" rx="22" ry="4.5" fill="#78350F" />
      <path d="M51 89 L89 89 L83 114 C82 116 79 117 70 117 C61 117 58 116 57 114 Z" fill="url(#pot-body)" />
      <rect x="46" y="83" width="48" height="8" rx="3.5" fill="url(#pot-rim)" />
    </svg>
  );
}

/**
 * 사용자의 작성 글 수에 따라 화분 속 새싹이 자라는 사이드바 카드.
 */
export default function BlogHomeSidebarSproutLayout({ postCount = 0 }) {
  const safeCount = Math.max(0, Number(postCount) || 0);
  const stage = getSproutStage(safeCount);
  const isMaxLevel = stage.nextPosts == null;
  const remainingPosts = isMaxLevel ? 0 : Math.max(0, stage.nextPosts - safeCount);
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.round(((safeCount - stage.minPosts) / (stage.nextPosts - stage.minPosts)) * 100));

  return (
    <BlogHomeSidebarCard>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sprout className="size-4 text-emerald-600" />
          <CardTitle className="text-base font-bold">내 지식 화분</CardTitle>
        </div>
        <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          Lv.{stage.level} {stage.name}
        </span>
      </div>

      <div className="mt-3 flex flex-col items-center">
        <SproutIllustration level={stage.level} />
        <p className="mt-1 text-center text-xs font-medium text-muted-foreground">{stage.message}</p>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">작성한 글 {safeCount}편</span>
          <span className="font-medium text-muted-foreground">
            {isMaxLevel ? '최고 단계 달성' : `다음 단계까지 ${remainingPosts}편`}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </BlogHomeSidebarCard>
  );
}
