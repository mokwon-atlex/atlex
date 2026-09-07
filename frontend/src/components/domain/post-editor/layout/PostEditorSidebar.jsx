// [Section] 툴 옵션 사이드바 — 상위 그룹 선택(ToggleGroup) + 하위 항목 실행(Button) + 스크롤(ScrollArea)
import { X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/common/ui/alert";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { ScrollArea } from "@/components/common/ui/scroll-area";
import { Textfield } from "@/components/common/ui/textfield";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/common/ui/toggle-group";

const COLOR_GROUP_NOTICE =
  "색상 관련 기능은 이번 작업 범위에서 제외해서 버튼만 비활성화해 두었습니다.";

export default function PostEditorSidebar({
  activeGroup,  // 현재 선택된 하위 그룹 객체 (id, title, description, items[])
  activeTool,   // 현재 선택된 툴 객체 (id, title, caption, groups[])
  getItemState, // (groupId, item) => { isActive, isDisabled } — tiptap 상태 조회
  onClose,
  onExecuteItem, // (groupId, item) => void — tiptap 명령 실행
  onSelectGroup, // (groupId) => void — 상위 그룹 변경
}) {
  // base-ui ToggleGroup의 value는 string[] — 단일 선택이지만 배열로 관리해야 한다
  const groupValue = activeGroup ? [activeGroup.id] : [];

  const handleGroupChange = (next) => {
    // 선택 해제(빈 배열) 시에는 무시하고 항상 하나가 선택된 상태를 유지한다
    const [nextId] = next ?? [];
    if (nextId) onSelectGroup(nextId);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <Textfield
            variant="muted"
            size="xs"
            weight="semibold"
            className="uppercase tracking-[0.18em]"
          >
            도구 패널
          </Textfield>
          <Textfield size="lg" weight="semibold" className="mt-1">
            {activeTool.title}
          </Textfield>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onClose}
          aria-label="도구 패널 닫기"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-5">
          <Card size="sm" className="bg-muted/40">
            <CardHeader>
              <Textfield variant="muted" size="sm" weight="semibold">
                현재 도구
              </Textfield>
              <CardTitle className="text-xl">{activeTool.title}</CardTitle>
              <CardDescription className="leading-6">
                {activeTool.caption}
              </CardDescription>
            </CardHeader>
          </Card>

          <section>
            <div>
              <Textfield size="lg" weight="semibold">
                상위 옵션
              </Textfield>
              <Textfield variant="muted" size="sm" className="mt-2 leading-6">
                도구 묶음 버튼을 누르면 해당 영역이 열리고 거기서 다시 세부
                그룹을 선택할 수 있습니다.
              </Textfield>
            </div>

            <ToggleGroup
              value={groupValue}
              onValueChange={handleGroupChange}
              orientation="vertical"
              spacing={3}
              className="mt-4 w-full"
            >
              {activeTool.groups.map((group) => (
                <ToggleGroupItem
                  key={group.id}
                  value={group.id}
                  variant="outline"
                  size="lg"
                  className="h-auto w-full flex-col items-start gap-2 whitespace-normal rounded-xl px-4 py-4 text-left data-[pressed]:bg-foreground data-[pressed]:text-background"
                >
                  <span className="text-base font-semibold">{group.title}</span>
                  <span className="text-sm leading-6 text-muted-foreground group-data-[pressed]/toggle:text-background/80">
                    {group.description}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </section>

          <section>
            <div>
              <Textfield size="lg" weight="semibold">
                하위 옵션
              </Textfield>
              <Textfield variant="muted" size="sm" className="mt-2 leading-6">
                상위 옵션에서 선택한 그룹 안의 세부 항목을 바로 실행할 수
                있습니다.
              </Textfield>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
              <div className="border-b border-border pb-4">
                <Textfield size="default" weight="semibold">
                  {activeGroup.title}
                </Textfield>
                <Textfield variant="muted" size="sm" className="mt-2 leading-6">
                  {activeGroup.description}
                </Textfield>
                {activeGroup.id === "font-color" ? (
                  <Alert variant="warning" className="mt-3">
                    <AlertDescription className="leading-6">
                      {COLOR_GROUP_NOTICE}
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3">
                {activeGroup.items.map((item) => {
                  const { isActive, isDisabled } = getItemState(
                    activeGroup.id,
                    item,
                  );

                  return (
                    <Button
                      key={item}
                      type="button"
                      variant="outline"
                      size="lg"
                      disabled={isDisabled}
                      aria-pressed={isActive}
                      onClick={() => onExecuteItem(activeGroup.id, item)}
                      className={
                        isActive
                          ? "h-auto justify-start rounded-xl border-foreground bg-foreground px-4 py-4 text-left text-sm font-semibold text-background hover:bg-foreground/90 hover:text-background"
                          : "h-auto justify-start rounded-xl px-4 py-4 text-left text-sm font-semibold"
                      }
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
