import { textfieldVariants } from '@/components/common/ui/textfield';
import styles from './BlogDetailArticle.module.css';

/**
 * 게시글 본문의 이미지와 선택적 설명을 렌더링한다.
 * @param {{ src: string, caption?: string }} props 이미지 정보
 * @returns {React.ReactElement} 이미지 블록
 */
function ArticleImage({ src, caption }) {
  return (
    <figure className="space-y-4">
      <div className="overflow-hidden rounded-[1.8rem] border border-border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={caption || ''} className="h-[280px] w-full object-cover sm:h-[360px]" />
      </div>
      {caption ? <figcaption className="text-[0.86rem] leading-7 text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}

/**
 * 정제된 게시글 HTML을 서식이 유지된 상태로 렌더링한다.
 * @param {{ html: string }} props 저장된 게시글 HTML
 * @returns {React.ReactElement} 리치 텍스트 본문
 */
function RichTextArticle({ html }) {
  return <div className={styles.richText} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * 게시글 상세 본문 블록을 유형에 맞춰 렌더링한다.
 * @param {{ contentBlocks: Array<{ id: string, type: string, text?: string, html?: string, src?: string, caption?: string }> }} props 본문 블록 목록
 * @returns {React.ReactElement} 게시글 본문
 */
export default function BlogDetailArticle({ contentBlocks }) {
  return (
    <article className="space-y-8">
      {contentBlocks.map((block) => {
        // 이미지 블록은 읽기 리듬을 끊어 주면서도 렌더링 분기는 단순하게 유지합니다.
        if (block.type === 'image') {
          return <ArticleImage key={block.id} src={block.src} caption={block.caption} />;
        }

        if (block.type === 'rich-text') {
          return <RichTextArticle key={block.id} html={block.html} />;
        }

        // 그 외 블록은 현재 기본 문단 스타일로 처리합니다.
        return (
          <p
            key={block.id}
            className={textfieldVariants({
              whitespace: 'keep',
              className: 'text-[1rem] leading-9 text-foreground/84 sm:text-[1.05rem]',
            })}
          >
            {block.text}
          </p>
        );
      })}
    </article>
  );
}
