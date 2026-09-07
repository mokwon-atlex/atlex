import PolicyItem from "@/components/domain/policy/ui/PolicyItem";

/** @type { import('@storybook/nextjs-vite').Meta<typeof PolicyItem> } */
const meta = {
  title: "Domain/Policy/UI/PolicyItem",
  component: PolicyItem,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    item: { control: "object" },
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

const mockItem = {
  title: "제1조 (목적)",
  summary: "이 약관은 atlex(이하 '서비스')가 제공하는 서비스의 이용 조건과 절차, 기타 필요한 사항을 규정함을 목적으로 합니다.",
  content:
    "이 약관은 atlex(이하 '회사')가 운영하는 서비스(이하 '서비스')를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다. PC 통신, 무선 등을 이용하는 전자상거래에 대해서도 그 성질에 반하지 않는 한 이 약관을 준용합니다.",
};

export const Default = {
  args: { item: mockItem },
};

export const LongContent = {
  args: {
    item: {
      title: "제5조 (개인정보의 보호 및 사용)",
      summary:
        "회사는 이용자의 개인정보를 보호하기 위해 최선을 다하며, 관련 법령을 준수합니다.",
      content:
        "1. 회사는 이용자의 개인정보를 수집할 때 서비스 제공에 필요한 최소한의 정보를 수집합니다.\n2. 회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.\n3. 이용자는 언제든지 자신의 개인정보를 열람, 수정, 삭제할 수 있습니다.\n4. 개인정보 처리에 관한 자세한 사항은 개인정보처리방침을 참고하십시오.",
    },
  },
};

export const ShortSummary = {
  args: {
    item: {
      title: "제2조 (용어의 정의)",
      summary: "이 약관에서 사용하는 용어의 정의는 다음과 같습니다.",
      content:
        "'이용자'란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다. '회원'이란 회사에 개인정보를 제공하여 회원등록을 한 자로서 서비스를 계속적으로 이용할 수 있는 자를 말합니다.",
    },
  },
};
