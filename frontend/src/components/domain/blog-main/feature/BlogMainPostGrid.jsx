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
    // 화면이 넓어질수록 열 수만 늘려 카드 밀도가 자연스럽게 올라가도록 구성했습니다.
    <section className="mx-auto grid w-full max-w-[1540px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {posts.map(post => (
        <BlogMainPostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
