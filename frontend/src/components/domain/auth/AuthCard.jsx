'use client';

import { Textfield } from '@/components/common/ui/textfield';
import { LoginLogo } from '@/components/domain/auth/login/feature/LoginLogo';
import { LoginForm } from '@/components/domain/auth/login/feature/LoginForm';

function AuthCard() {
  return (
    <section className="flex items-center justify-center py-6">
      <div className="w-full rounded-lg border border-border/80 bg-card p-6 shadow-2xs lg:p-7">
        <LoginLogo />

        <div className="mt-5 border-b border-border/70 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">로그인</h2>

          <Textfield variant="muted" size="sm" className="mt-2 leading-6">
            소셜 계정으로 로그인하고 Atlex의 그래프 기반 블로그를 이용해보세요.
          </Textfield>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}

export { AuthCard };
