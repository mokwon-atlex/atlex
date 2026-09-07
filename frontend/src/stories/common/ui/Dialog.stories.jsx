import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";

function BasicDialog({ variant, size, showCloseButton, title = "다이얼로그 제목", description = "다이얼로그 내용입니다." }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>열기</DialogTrigger>
      <DialogContent variant={variant} size={size} showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: "Common/UI/Dialog",
  component: DialogContent,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
    size: {
      control: "select",
      options: ["default", "md", "lg", "xl"],
    },
    showCloseButton: { control: "boolean" },
  },
  render: (args) => <BasicDialog {...args} />,
};

export default meta;

export const Default = {
  args: { variant: "default", size: "default", showCloseButton: true },
};

export const Destructive = {
  render: () => (
    <BasicDialog
      variant="destructive"
      title="정말 삭제하시겠습니까?"
      description="이 작업은 되돌릴 수 없습니다. 데이터가 영구적으로 삭제됩니다."
    />
  ),
};

export const Sizes = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {["default", "md", "lg", "xl"].map((size) => (
        <Dialog key={size}>
          <DialogTrigger render={<Button variant="outline" />}>{size}</DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle>Size: {size}</DialogTitle>
              <DialogDescription>이 다이얼로그의 size는 {size}입니다.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>Default</DialogTrigger>
        <DialogContent variant="default">
          <DialogHeader>
            <DialogTitle>기본 다이얼로그</DialogTitle>
            <DialogDescription>기본 스타일의 다이얼로그입니다.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger render={<Button variant="destructive" />}>Destructive</DialogTrigger>
        <DialogContent variant="destructive">
          <DialogHeader>
            <DialogTitle>위험 다이얼로그</DialogTitle>
            <DialogDescription>파괴적인 작업을 경고하는 다이얼로그입니다.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

export const WithFooter = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>열기</DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>저장하시겠습니까?</DialogTitle>
          <DialogDescription>변경된 내용을 저장합니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DestructiveWithFooter = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>삭제</DialogTrigger>
      <DialogContent variant="destructive" size="md">
        <DialogHeader>
          <DialogTitle>계정을 삭제하시겠습니까?</DialogTitle>
          <DialogDescription>
            이 작업은 되돌릴 수 없습니다. 계정과 모든 데이터가 영구적으로 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button variant="destructive">삭제</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const NoCloseButton = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>열기</DialogTrigger>
      <DialogContent showCloseButton={false} size="md">
        <DialogHeader>
          <DialogTitle>닫기 버튼 없음</DialogTitle>
          <DialogDescription>X 버튼이 없는 다이얼로그입니다. 푸터 버튼으로만 닫을 수 있습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
};
