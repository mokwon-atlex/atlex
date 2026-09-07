import BlogDetailAuthorCard from "@/components/domain/blog-detail/ui/BlogDetailAuthorCard";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailAuthorCard> } */
const meta = {
  title: "Domain/BlogDetail/UI/BlogDetailAuthorCard",
  component: BlogDetailAuthorCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const Default = {
  args: {
    authorCard: {
      initials: "KM",
      name: "김민준",
      role: "Frontend Engineer",
      bio: "React와 Next.js를 중심으로 사용자 경험을 개선하는 프론트엔드 개발자입니다. 디자인 시스템 설계와 성능 최적화에 관심이 많습니다.",
      badges: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    },
  },
};

export const DesignEngineer = {
  args: {
    authorCard: {
      initials: "PJ",
      name: "박지수",
      role: "Design Engineer",
      bio: "디자인과 개발의 경계에서 일하는 디자인 엔지니어입니다. Figma부터 프로덕션 코드까지 일관된 디자인 언어를 구현하는 것을 목표로 합니다.",
      badges: ["Figma", "Design Systems", "CSS", "Motion"],
    },
  },
};

export const ManyBadges = {
  args: {
    authorCard: {
      initials: "LH",
      name: "이현우",
      role: "Full Stack Developer",
      bio: "풀스택 개발자로서 프론트엔드부터 백엔드, 인프라까지 폭넓은 경험을 보유하고 있습니다. 다양한 기술 스택을 활용하여 확장 가능한 서비스를 구축합니다.",
      badges: [
        "React",
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "Redis",
        "Docker",
        "Kubernetes",
        "AWS",
      ],
    },
  },
};

export const ShortBio = {
  args: {
    authorCard: {
      initials: "CY",
      name: "최연서",
      role: "Tech Writer",
      bio: "개발 관련 아티클을 작성하는 테크 라이터입니다.",
      badges: ["Technical Writing", "Developer Relations"],
    },
  },
};
