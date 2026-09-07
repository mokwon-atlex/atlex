import { notFound } from "next/navigation";
import BlogDetailContent from "@/components/domain/blog-detail/feature/BlogDetailContent";
import BlogDetailSidebar from "@/components/domain/blog-detail/feature/BlogDetailSidebar";
import Header from "@/components/common/layout/Header";
import { loadBlogDetailData } from "@/lib/queries/blog-detail";
import { stripHandle } from "@/lib/url/handle";

export default async function BlogDetailPage({ params }) {
  const { username, postId } = await params;
  const authorUserId = stripHandle(username);

  let detail;
  try {
    detail = await loadBlogDetailData(postId, authorUserId);
  } catch (error) {
    if (error?.code === "POST_NOT_FOUND") {
      notFound();
    }
    console.error("[BlogDetailPage] 데이터 로딩 실패:", error);
    throw error;
  }

  // 다른 유저 핸들로 접근한 글 URL 은 차단 (loadBlogDetailData 가 null 반환)
  if (!detail) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header blogUserId={authorUserId} />
      <div className="mx-auto w-full max-w-content-wide px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <div className="mx-auto grid w-full max-w-[1328px] gap-10 xl:grid-cols-[214px_minmax(0,1fr)_214px] xl:items-start">
          <div className="order-2 xl:order-1 xl:self-stretch">
            <BlogDetailSidebar bookmarks={7} likes={18} />
          </div>
          <div className="order-1 xl:order-2">
            <BlogDetailContent {...detail} />
          </div>
          <div aria-hidden="true" className="hidden xl:block xl:order-3" />
        </div>
      </div>
    </main>
  );
}
