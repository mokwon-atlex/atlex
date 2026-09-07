import { textfieldVariants } from "@/components/common/ui/textfield"

function ArticleImage({ src, caption }) {
  return (
    <figure className="space-y-4">
      <div className="overflow-hidden rounded-[1.8rem] border border-border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={caption || ""}
          className="h-[280px] w-full object-cover sm:h-[360px]"
        />
      </div>
      {caption ? (
        <figcaption className="text-[0.86rem] leading-7 text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default function BlogDetailArticle({ contentBlocks }) {
  return (
    <article className="space-y-8">
      {contentBlocks.map((block) => {
        // 이미지 블록은 읽기 리듬을 끊어 주면서도 렌더링 분기는 단순하게 유지합니다.
        if (block.type === "image") {
          return <ArticleImage key={block.id} src={block.src} caption={block.caption} />;
        }

        // 그 외 블록은 현재 기본 문단 스타일로 처리합니다.
        return (
          <p
            key={block.id}
            className={textfieldVariants({ whitespace: "keep", className: "text-[1rem] leading-9 text-foreground/84 sm:text-[1.05rem]" })}
          >
            {block.text}
          </p>
        );
      })}
    </article>
  );
}
