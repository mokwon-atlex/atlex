import PolicyLayout from "@/components/domain/policy/layout/PolicyLayout";
import PolicyItem from "@/components/domain/policy/ui/PolicyItem";
import PolicySidebarItem from "@/components/domain/policy/ui/PolicySidebarItem";

/** @type { import('@storybook/nextjs-vite').Meta<typeof PolicyLayout> } */
const meta = {
  title: "Domain/Policy/Layout/PolicyLayout",
  component: PolicyLayout,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

const mockPolicyItems = [
  {
    title: "제1조 (목적)",
    summary:
      "이 약관은 atlex(이하 '서비스')가 제공하는 서비스의 이용 조건과 절차, 기타 필요한 사항을 규정함을 목적으로 합니다.",
    content:
      "이 약관은 atlex(이하 '회사')가 운영하는 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.",
  },
  {
    title: "제2조 (용어의 정의)",
    summary: "이 약관에서 사용하는 용어의 정의는 다음과 같습니다.",
    content:
      "'이용자'란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다. '회원'이란 회사에 개인정보를 제공하여 회원등록을 한 자로서 서비스를 계속적으로 이용할 수 있는 자를 말합니다.",
  },
  {
    title: "제3조 (약관의 명시와 개정)",
    summary:
      "회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.",
    content:
      "회사는 약관의 규제에 관한 법률, 전자거래 기본법, 전자서명법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 위배되지 않는 범위에서 이 약관을 개정할 수 있습니다.",
  },
  {
    title: "제4조 (서비스의 제공 및 변경)",
    summary: "회사는 이용자에게 아래와 같은 서비스를 제공합니다.",
    content:
      "회사는 재화 또는 용역의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 재화 또는 용역의 내용을 변경할 수 있습니다. 이 경우에는 변경된 재화 또는 용역의 내용 및 제공일자를 명시하여 현재의 재화 또는 용역의 내용을 게시한 곳에 즉시 공지합니다.",
  },
];

export const Default = {
  render: () => (
    <PolicyLayout
      sidebar={mockPolicyItems.map((item, index) => (
        <li key={index}>
          <PolicySidebarItem item={item} isActive={index === 0} onClick={() => {}} />
        </li>
      ))}
    >
      {mockPolicyItems.map((item, index) => (
        <PolicyItem key={index} item={item} />
      ))}
    </PolicyLayout>
  ),
};

export const SingleItem = {
  render: () => (
    <PolicyLayout
      sidebar={
        <li>
          <PolicySidebarItem item={mockPolicyItems[0]} isActive onClick={() => {}} />
        </li>
      }
    >
      <PolicyItem item={mockPolicyItems[0]} />
    </PolicyLayout>
  ),
};
