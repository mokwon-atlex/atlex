'use client';

import { getOAuth2AuthorizationUrl } from '@/lib/api/auth';

const PROVIDERS = [
  {
    id: 'github',
    label: 'GitHub로 계속하기',
    className:
      'border border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
        <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.64 3.01 8.57 7.18 9.96.53.1.72-.23.72-.51v-1.78c-2.92.63-3.54-1.41-3.54-1.41-.48-1.21-1.17-1.54-1.17-1.54-.95-.65.07-.64.07-.64 1.05.08 1.61 1.08 1.61 1.08.94 1.6 2.46 1.14 3.06.87.09-.68.37-1.14.67-1.4-2.33-.26-4.78-1.16-4.78-5.19 0-1.15.41-2.09 1.08-2.82-.11-.27-.47-1.33.1-2.78 0 0 .88-.28 2.89 1.08a10.04 10.04 0 0 1 5.26 0c2.01-1.36 2.89-1.08 2.89-1.08.57 1.45.21 2.51.1 2.78.67.73 1.08 1.67 1.08 2.82 0 4.04-2.46 4.92-4.8 5.18.38.33.72.97.72 1.96v2.9c0 .28.19.62.73.51A10.51 10.51 0 0 0 22.5 12c0-5.8-4.7-10.5-10.5-10.5Z" />
      </svg>
    ),
  },
  {
    id: 'google',
    label: 'Google로 계속하기',
    className: 'border border-border bg-background text-foreground hover:bg-muted/60',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
        <path
          fill="#4285F4"
          d="M21.8 12.23c0-.72-.06-1.41-.18-2.08H12v3.94h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.5Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.75 0 5.06-.91 6.75-2.47l-3.3-2.56c-.91.61-2.08.97-3.45.97-2.65 0-4.9-1.79-5.7-4.2H2.89v2.64A9.99 9.99 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.3 13.74A5.99 5.99 0 0 1 5.98 12c0-.6.11-1.19.32-1.74V7.62H2.89A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13.89 4.38l3.41-2.64Z"
        />
        <path
          fill="#EA4335"
          d="M12 6.06c1.5 0 2.84.51 3.9 1.52l2.92-2.92C17.05 2.99 14.74 2 12 2A9.99 9.99 0 0 0 2.89 7.62l3.41 2.64c.8-2.41 3.05-4.2 5.7-4.2Z"
        />
      </svg>
    ),
  },
  {
    id: 'kakao',
    label: 'Kakao로 계속하기',
    className: 'border border-[#F5DC00] bg-[#FEE500] text-[#191919] hover:bg-[#FDD800]',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-[#191919]">
        <path d="M12 3.5C6.75 3.5 2.5 6.82 2.5 10.92c0 2.66 1.78 4.99 4.44 6.29l-1.13 4.13c-.1.35.3.63.61.43l4.94-3.27c.21.02.42.03.64.03 5.25 0 9.5-3.32 9.5-7.42S17.25 3.5 12 3.5Z" />
      </svg>
    ),
  },
];

/**
 * GitHub, Google, Kakao OAuth2 로그인 진입 버튼 목록입니다.
 */
function SocialLoginButtons() {
  return (
    <div className="flex flex-col gap-2.5" aria-label="소셜 로그인">
      {PROVIDERS.map((provider) => (
        <a
          key={provider.id}
          href={getOAuth2AuthorizationUrl(provider.id)}
          className={`flex h-10 w-full items-center justify-center gap-2.5 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${provider.className}`}
        >
          {provider.icon}
          <span>{provider.label}</span>
        </a>
      ))}
    </div>
  );
}

export { SocialLoginButtons };
