export const SORT_OPTIONS = [
  { label: "트렌딩", value: "trending" },
  { label: "인기순", value: "popular" },
  { label: "알파벳순", value: "alphabet" },
];

export const PAGE_SIZE = 12;

// 실제 API 붙이기 전까지만 사용하는 mock 데이터
const MOCK_TAGS = [
  { name: "javascript", postCount: 12847, trendScore: 98 },
  { name: "react", postCount: 9234, trendScore: 95 },
  { name: "typescript", postCount: 7512, trendScore: 92 },
  { name: "python", postCount: 6890, trendScore: 90 },
  { name: "spring", postCount: 5341, trendScore: 82 },
  { name: "nextjs", postCount: 4728, trendScore: 86 },
  { name: "java", postCount: 4512, trendScore: 78 },
  { name: "nodejs", postCount: 4103, trendScore: 76 },
  { name: "vue", postCount: 3256, trendScore: 74 },
  { name: "CSS", postCount: 3189, trendScore: 70 },
  { name: "docker", postCount: 2891, trendScore: 72 },
  { name: "AWS", postCount: 2654, trendScore: 69 },
  { name: "mysql", postCount: 2430, trendScore: 66 },
  { name: "redis", postCount: 2140, trendScore: 64 },
  { name: "kubernetes", postCount: 1980, trendScore: 68 },
  { name: "figma", postCount: 1765, trendScore: 61 },
  { name: "git", postCount: 1654, trendScore: 60 },
  { name: "github", postCount: 1542, trendScore: 59 },
  { name: "tailwind", postCount: 1498, trendScore: 73 },
  { name: "supabase", postCount: 1210, trendScore: 71 },
  { name: "graphql", postCount: 1180, trendScore: 69 },
  { name: "mongodb", postCount: 1102, trendScore: 67 },
  { name: "rust", postCount: 980, trendScore: 75 },
  { name: "golang", postCount: 912, trendScore: 72 },
  { name: "flutter", postCount: 876, trendScore: 70 },
  { name: "swift", postCount: 834, trendScore: 65 },
  { name: "kotlin", postCount: 798, trendScore: 63 },
  { name: "linux", postCount: 754, trendScore: 60 },
  { name: "nginx", postCount: 712, trendScore: 58 },
  { name: "postgresql", postCount: 689, trendScore: 62 },
  { name: "nestjs", postCount: 654, trendScore: 66 },
  { name: "prisma", postCount: 621, trendScore: 64 },
  { name: "svelte", postCount: 598, trendScore: 68 },
  { name: "astro", postCount: 543, trendScore: 71 },
  { name: "vite", postCount: 512, trendScore: 67 },
  { name: "eslint", postCount: 487, trendScore: 55 },
  { name: "jest", postCount: 465, trendScore: 57 },
  { name: "storybook", postCount: 432, trendScore: 59 },
];

export function getCacheKey(sort, keyword) {
  return `${sort}:${keyword}`;
}

export async function fetchTags({ sort, keyword = "", page }) {
  // 실제 API 붙일 때 이 부분만 교체하면 됨
  await new Promise((resolve) => setTimeout(resolve, 250));

  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredTags = normalizedKeyword
    ? MOCK_TAGS.filter((tag) => tag.name.toLowerCase().includes(normalizedKeyword))
    : MOCK_TAGS;

  const sortedTags = [...filteredTags];

  if (sort === "popular") {
    sortedTags.sort((a, b) => b.postCount - a.postCount);
  } else if (sort === "alphabet") {
    sortedTags.sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" })
    );
  } else {
    sortedTags.sort((a, b) => b.trendScore - a.trendScore);
  }

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = page * PAGE_SIZE;
  const items = sortedTags.slice(startIndex, endIndex);

  return {
    items,
    totalCount: sortedTags.length,
    hasMore: endIndex < sortedTags.length,
  };
}
