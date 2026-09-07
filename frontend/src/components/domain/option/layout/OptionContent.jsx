import { ProfileSettingForm } from "@/components/domain/option/feature/ProfileSettingForm"
import { PasswordSettingForm } from "@/components/domain/option/feature/PasswordSettingForm"
import { NotificationSettingForm } from "@/components/domain/option/feature/NotificationSettingForm"
import { PolicySettingForm } from "@/components/domain/option/feature/PolicySettingForm"
import { DeleteAccountForm } from "@/components/domain/option/feature/DeleteAccountForm"

function OptionContent({ activeMenu }) {
  return (
    <div className="h-fit">
      {activeMenu === "profile" && <ProfileSettingForm />}
      {activeMenu === "password" && <PasswordSettingForm />}
      {activeMenu === "notification" && <NotificationSettingForm />}
      {activeMenu === "policy" && <PolicySettingForm />}
      {activeMenu === "delete" && <DeleteAccountForm />}
    </div>
  )
}

export { OptionContent }