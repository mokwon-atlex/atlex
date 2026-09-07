import { Textfield } from "@/components/common/ui/textfield"

function LoginLogo() {
  return (
    <div className="flex items-center gap-3 lg:hidden">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
        A
      </div>

      <Textfield size="xl" weight="bold" className="tracking-tight">
        ATLEX
      </Textfield>
    </div>
  )
}

export { LoginLogo }