import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from "@/components/common/ui/field";
import { Input } from "@/components/common/ui/input";
import { Textarea } from "@/components/common/ui/textarea";

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: "Common/UI/Field",
  tags: ["autodocs"],
};

export default meta;

export const BasicVertical = {
  render: () => (
    <Field className="w-72">
      <FieldLabel htmlFor="name">이름</FieldLabel>
      <Input id="name" placeholder="이름을 입력하세요" />
    </Field>
  ),
};

export const WithDescription = {
  render: () => (
    <Field className="w-72">
      <FieldLabel htmlFor="email">이메일</FieldLabel>
      <Input id="email" type="email" placeholder="example@email.com" />
      <FieldDescription>로그인에 사용할 이메일 주소를 입력하세요.</FieldDescription>
    </Field>
  ),
};

export const WithError = {
  render: () => (
    <Field className="w-72" data-invalid="true">
      <FieldLabel htmlFor="email-err">이메일</FieldLabel>
      <Input id="email-err" type="email" aria-invalid="true" defaultValue="잘못된 이메일" />
      <FieldError>올바른 이메일 형식을 입력해주세요.</FieldError>
    </Field>
  ),
};

export const WithMultipleErrors = {
  render: () => (
    <Field className="w-72" data-invalid="true">
      <FieldLabel>비밀번호</FieldLabel>
      <Input type="password" aria-invalid="true" />
      <FieldError
        errors={[
          { message: "8자 이상이어야 합니다." },
          { message: "숫자를 포함해야 합니다." },
          { message: "특수문자를 포함해야 합니다." },
        ]}
      />
    </Field>
  ),
};

export const Horizontal = {
  render: () => (
    <FieldGroup className="w-96">
      <Field orientation="horizontal">
        <FieldTitle>알림 수신</FieldTitle>
        <FieldContent>
          <FieldDescription>이메일로 알림을 받습니다.</FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  ),
};

export const FieldSetExample = {
  render: () => (
    <FieldSet className="w-72">
      <FieldLegend>기본 정보</FieldLegend>
      <Field>
        <FieldLabel htmlFor="fs-name">이름</FieldLabel>
        <Input id="fs-name" placeholder="이름을 입력하세요" />
      </Field>
      <Field>
        <FieldLabel htmlFor="fs-email">이메일</FieldLabel>
        <Input id="fs-email" type="email" placeholder="example@email.com" />
      </Field>
    </FieldSet>
  ),
};

export const WithSeparator = {
  render: () => (
    <FieldGroup className="w-72">
      <Field>
        <FieldLabel htmlFor="sep-name">이름</FieldLabel>
        <Input id="sep-name" placeholder="이름을 입력하세요" />
      </Field>
      <FieldSeparator>또는</FieldSeparator>
      <Field>
        <FieldLabel htmlFor="sep-email">이메일</FieldLabel>
        <Input id="sep-email" type="email" placeholder="example@email.com" />
      </Field>
    </FieldGroup>
  ),
};

export const TextareaField = {
  render: () => (
    <Field className="w-72">
      <FieldLabel htmlFor="bio">자기소개</FieldLabel>
      <Textarea id="bio" placeholder="자기소개를 입력하세요" />
      <FieldDescription>최대 200자까지 입력 가능합니다.</FieldDescription>
    </Field>
  ),
};
