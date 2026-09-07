import { useArgs } from "storybook/preview-api";

import { Checkbox } from "@/components/common/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/common/ui/field";
import { Label } from "@/components/common/ui/label";

/** @type { import('@storybook/nextjs-vite').Meta<typeof Checkbox> } */
const meta = {
  title: "Common/UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "filled", "ghost"],
    },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
  args: {
    variant: "default",
    checked: false,
    disabled: false,
    "aria-invalid": false,
  },
};

export default meta;

export const Playground = {
  render: function Render(args) {
    const [{ checked }, updateArgs] = useArgs();

    return (
      <div className="flex items-center gap-3">
        <Checkbox
          {...args}
          id="checkbox-playground"
          checked={checked}
          onCheckedChange={(nextChecked) => updateArgs({ checked: !!nextChecked })}
        />
        <Label htmlFor="checkbox-playground">Remember me</Label>
      </div>
    );
  },
};

export const States = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-unchecked" />
        <Label htmlFor="checkbox-unchecked">Unchecked</Label>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-checked" defaultChecked />
        <Label htmlFor="checkbox-checked">Checked</Label>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-disabled" disabled />
        <Label htmlFor="checkbox-disabled">Disabled</Label>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-disabled-checked" defaultChecked disabled />
        <Label htmlFor="checkbox-disabled-checked">Disabled checked</Label>
      </div>
    </div>
  ),
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-3">
      {["default", "outline", "filled", "ghost"].map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <Checkbox id={`checkbox-${variant}`} variant={variant} defaultChecked />
          <Label htmlFor={`checkbox-${variant}`}>{variant}</Label>
        </div>
      ))}
    </div>
  ),
};

export const Invalid = {
  args: {
    "aria-invalid": true,
  },
  render: function Render(args) {
    const [{ checked }, updateArgs] = useArgs();

    return (
      <div className="flex items-center gap-3">
        <Checkbox
          {...args}
          id="checkbox-invalid"
          checked={checked}
          onCheckedChange={(nextChecked) => updateArgs({ checked: !!nextChecked })}
        />
        <Label htmlFor="checkbox-invalid">Required agreement</Label>
      </div>
    );
  },
};

export const WithDescription = {
  render: () => (
    <Field orientation="horizontal" className="max-w-sm">
      <Checkbox id="checkbox-description" defaultChecked />
      <FieldContent>
        <FieldTitle>Receive product updates</FieldTitle>
        <FieldDescription>
          Send release notes and feature announcements to my email.
        </FieldDescription>
      </FieldContent>
    </Field>
  ),
};
