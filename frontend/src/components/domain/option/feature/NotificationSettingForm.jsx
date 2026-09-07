import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card"

import { Switch } from "@/components/common/ui/switch"
import { Button } from "@/components/common/ui/button"

const NOTIFICATIONS = [
  {
    title: "댓글 알림",
    description: "새 댓글이 등록되면 알림을 받습니다.",
  },
  {
    title: "좋아요 알림",
    description: "게시글 좋아요 알림을 받습니다.",
  },
  {
    title: "새 팔로워 알림",
    description: "새로운 팔로워가 생기면 알림을 받습니다.",
  },
  {
    title: "서비스 공지",
    description: "중요한 공지 및 업데이트를 받습니다.",
  },
]

function NotificationSettingForm() {
  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>

        <CardDescription>
          원하는 알림만 선택해서 받아볼 수 있습니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {NOTIFICATIONS.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-4 py-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>

            <Switch defaultChecked />
          </div>
        ))}
      </CardContent>

      <CardFooter className="justify-end">
        <Button>
          저장
        </Button>
      </CardFooter>
    </Card>
  )
}

export { NotificationSettingForm }