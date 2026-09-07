import { Card, CardContent } from "@/components/common/ui/card"

const MENUS = [
  {
    id: "profile",
    title: "프로필 설정",
    description: "프로필 정보와 이메일을 관리합니다.",
  },
  {
    id: "password",
    title: "비밀번호 변경",
    description: "비밀번호를 변경할 수 있습니다.",
  },
  {
    id: "notification",
    title: "알림 설정",
    description: "이메일 및 알림 수신을 관리합니다.",
  },
  {
    id: "policy",
    title: "서비스 정책",
    description: "약관 및 정책 페이지를 확인합니다.",
  },
  {
    id: "delete",
    title: "회원 탈퇴",
    description: "계정 삭제를 진행합니다.",
  },
]

function OptionSidebar({ activeMenu, onChangeMenu }) {
  return (
    <Card className="h-fit rounded-3xl border-border/60 bg-card/80 backdrop-blur">
      <CardContent className="p-3">
        <div className="mb-4 px-3 pt-2">
          <h2 className="text-sm font-bold text-foreground">
            계정 설정
          </h2>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            프로필 및 계정 정보를 관리할 수 있습니다.
          </p>
        </div>

        <nav className="space-y-1">
          {MENUS.map((menu) => {
            const isActive = activeMenu === menu.id

            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => onChangeMenu(menu.id)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {menu.title}
                </span>

                <span
                  className={`mt-1 block text-xs leading-5 ${
                    isActive
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {menu.description}
                </span>
              </button>
            )
          })}
        </nav>
      </CardContent>
    </Card>
  )
}

export { OptionSidebar }