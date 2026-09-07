import { BarChart3, Network, Sparkles } from "lucide-react"

import { Capsule } from "@/components/common/ui/capsule"
import { Textfield } from "@/components/common/ui/textfield"

function AuthHero() {
  return (
    <section className="hidden lg:block">
      <Capsule variant="outline">
        Graph Based Blog Platform
      </Capsule>

      <h1 className="mt-5 text-[42px] font-black leading-[1.08] tracking-[-0.04em] text-foreground">
        글의 관계를 연결하고
        <br />
        지식의 흐름을 그래프로
        <br />
        보여주세요.
      </h1>

      <Textfield
        variant="muted"
        size="default"
        whitespace="keep"
        className="mt-5 max-w-xl leading-7"
      >
        Atlex는 글, 주제, 반응 데이터를 하나의 흐름으로 연결해
        블로그를 더 직관적으로 탐색할 수 있도록 도와줍니다.
      </Textfield>

      <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
        <Feature title="Graph View" description="글과 주제 관계 시각화" />
        <Feature title="Insight" description="반응 데이터 흐름 분석" />
        <Feature title="Archive" description="지식 흐름 저장 및 관리" />
      </div>

      <div className="mt-8 max-w-xl rounded-3xl border border-border/60 bg-background/70 p-5">
        <div className="relative h-44 overflow-hidden rounded-2xl bg-muted/40">
          <div className="absolute left-10 top-8 flex size-14 items-center justify-center rounded-2xl border bg-background">
            <Network className="text-primary" size={22} />
          </div>

          <div className="absolute right-12 top-10 flex size-12 items-center justify-center rounded-2xl border bg-background">
            <BarChart3 className="text-primary" size={20} />
          </div>

          <div className="absolute bottom-8 left-24 flex size-11 items-center justify-center rounded-xl border bg-background">
            <Sparkles className="text-muted-foreground" size={16} />
          </div>

          <div className="absolute left-1/2 top-1/2 h-px w-52 -translate-x-1/2 bg-primary/30" />
        </div>
      </div>
    </section>
  )
}

function Feature({ title, description }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
      <Textfield size="sm" weight="bold">
        {title}
      </Textfield>

      <Textfield variant="muted" size="sm" className="mt-1 leading-5">
        {description}
      </Textfield>
    </div>
  )
}

export { AuthHero }
