import { AlertCircle, Info, TriangleAlert } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/common/ui/alert";
import { Button } from "@/components/common/ui/button";

/** @type { import('@storybook/nextjs-vite').Meta<typeof Alert> } */
const meta = {
  title: "Common/UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "warning", "destructive"],
    },
  },
  args: {
    variant: "default",
  },
};

export default meta;

export const Default = {
  render: (args) => (
    <div className="w-[420px]">
      <Alert {...args}>
        <Info />
        <AlertTitle>안내</AlertTitle>
        <AlertDescription>기본 스타일의 안내 메시지입니다.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const Warning = {
  render: () => (
    <div className="w-[420px]">
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>주의</AlertTitle>
        <AlertDescription>
          이 기능은 현재 비활성화 상태입니다. 색상 스타일을 적용하려면 Pro
          플랜이 필요합니다.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const Destructive = {
  render: () => (
    <div className="w-[420px]">
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>오류</AlertTitle>
        <AlertDescription>
          작업을 완료할 수 없습니다. 잠시 후 다시 시도해 주세요.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const WithAction = {
  render: () => (
    <div className="w-[420px]">
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>임시 저장 만료 예정</AlertTitle>
        <AlertDescription>
          임시 저장된 글이 48시간 후 자동 삭제됩니다.
        </AlertDescription>
        <AlertAction>
          <Button variant="outline" size="sm">
            지금 저장
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
};

export const WithoutIcon = {
  render: () => (
    <div className="w-[420px] space-y-3">
      <Alert>
        <AlertTitle>제목만 있는 알림</AlertTitle>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>경고 메시지</AlertTitle>
        <AlertDescription>아이콘 없이 텍스트만 표시합니다.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const AllVariants = {
  render: () => (
    <div className="w-[420px] space-y-3">
      <Alert variant="default">
        <Info />
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>기본 스타일의 알림입니다.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>경고 스타일의 알림입니다.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>오류 스타일의 알림입니다.</AlertDescription>
      </Alert>
    </div>
  ),
};
