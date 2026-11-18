import BlogMainPostCard from '../ui/BlogMainPostCard';

export default function BlogMainPostGrid({ emptyMessage, posts }) {
  if (!posts.length) {
    return (
      <section className="rounded-[18px] border border-dashed border-border bg-card px-6 py-14 text-center text-muted-foreground">
        {emptyMessage}
      </section>
    );
  }

  return (
    // 화면이 넓어져도 카드 폭과 가독성을 유지하기 위해 최대 4열로 제한했습니다.
    <section className="mx-auto grid w-full max-w-[1540px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => (
        <BlogMainPostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
