import { DeleteAccountForm } from "@/components/domain/option/feature/DeleteAccountForm"

/** @type { import('@storybook/nextjs-vite').Meta<typeof DeleteAccountForm> } */
const meta = {
  title: "Domain/Option/Feature/DeleteAccountForm",
  component: DeleteAccountForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[480px]">
      <DeleteAccountForm />
    </div>
  ),
}
