import { LoginLogo } from "@/components/domain/auth/login/feature/LoginLogo"

/** @type { import('@storybook/nextjs-vite').Meta<typeof LoginLogo> } */
const meta = {
  title: "Domain/Auth/Feature/LoginLogo",
  component: LoginLogo,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
}

export default meta

export const Default = {
  render: () => (
    <div className="block lg:hidden">
      <LoginLogo />
    </div>
  ),
}

export const ForcedVisible = {
  render: () => (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
        A
      </div>
      <span className="text-xl font-bold tracking-tight">ATLEX</span>
    </div>
  ),
}
