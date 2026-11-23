'use client';

import Header from '@/components/common/layout/Header';
import { Textfield } from '@/components/common/ui/textfield';
import { LoginLogo } from '@/components/domain/auth/login/feature/LoginLogo';
import { AdminLoginForm } from '@/components/domain/auth/login/feature/AdminLoginForm';

/**
 * 관리자 전용 로그인 페이지(`/admin/login`).
 * 일반 사용자 소셜 로그인 화면(`/account`)과 진입점을 분리합니다.
 */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,var(--muted),var(--background)_45%)]">
      <Header />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <section className="w-full rounded-lg border border-border/80 bg-card p-6 shadow-2xs lg:p-7">
          <LoginLogo />

          <div className="mt-5 border-b border-border/70 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">관리자 로그인</h2>
            <Textfield variant="muted" size="sm" className="mt-2 leading-6">
              Atlex 운영 관리자 전용 인증 화면입니다.
            </Textfield>
          </div>

          <AdminLoginForm />
        </section>
      </div>
    </main>
  );
}
