import Link from "next/link";
import Header from "@/components/common/layout/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto flex w-full max-w-content-wide flex-col items-center justify-center px-5 py-32 sm:px-8 lg:px-10">
        <p className="text-8xl font-black tracking-tight text-foreground">
          404
        </p>
        <p className="mt-4 text-xl font-bold text-foreground">
          페이지를 찾을 수 없어요
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          주소가 잘못됐거나 삭제된 페이지예요.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-80"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
