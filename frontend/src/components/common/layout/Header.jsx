'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ImageIcon, PenLine } from 'lucide-react';
import NotificationPopover from '@/components/common/layout/NotificationPopover';
import ProfileMenu from '@/components/common/layout/ProfileMenu';
import SearchDialog from '@/components/common/layout/SearchDialog';
import { useAuthStore } from '@/store/authStore';

export default function Header({
  logoSrc = '/logo/atlex-light.svg',
  logoHref = '/',
  blogUserId,
  onSearch,
  onNotification,
}) {
  const [showLogoImage, setShowLogoImage] = useState(Boolean(logoSrc));

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoImage = (
    <div className="flex h-10 w-20 items-center">
      {showLogoImage ? (
        <>
          <img
            src={logoSrc}
            alt="Logo"
            className="max-h-full max-w-full object-contain dark:hidden"
            onError={() => setShowLogoImage(false)}
          />
          <img
            src="/logo/atlex-dark.svg"
            alt="Logo"
            className="hidden max-h-full max-w-full object-contain dark:block"
            onError={() => setShowLogoImage(false)}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded bg-muted/30">
          <ImageIcon className="size-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-content-wide items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {logoHref ? (
            <Link href={logoHref} className="inline-flex">
              {logoImage}
            </Link>
          ) : (
            logoImage
          )}

          {blogUserId && (
            <>
              <span className="hidden text-sm text-muted-foreground/60 md:inline">/</span>
              <Link href={`/@${blogUserId}`} className="flex items-center">
                <h1 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  {blogUserId}&apos;s blog
                </h1>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <SearchDialog onSearch={onSearch} />

            <NotificationPopover mounted={mounted} onNotification={onNotification} />

            {mounted && isLoggedIn && (
              <Link
                href="/write"
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground shadow-2xs transition-colors hover:bg-accent hover:text-accent-foreground sm:px-3"
              >
                <PenLine className="size-3.5" strokeWidth={2} />
                <span className="hidden sm:inline">글쓰기</span>
              </Link>
            )}
          </div>

          <div className="mx-1 hidden h-6 w-px bg-border/60 md:block" />

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
