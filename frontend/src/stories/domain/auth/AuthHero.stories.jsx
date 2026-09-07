import { AuthHero } from "@/components/domain/auth/AuthHero"

/** @type { import('@storybook/nextjs-vite').Meta<typeof AuthHero> } */
const meta = {
  title: "Domain/Auth/AuthHero",
  component: AuthHero,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[520px] p-8">
      <AuthHero />
    </div>
  ),
}

export const DarkBackground = {
  render: () => (
    <div className="w-[520px] rounded-3xl bg-muted/30 p-8">
      <AuthHero />
    </div>
  ),
}
