import { useArgs } from "storybook/preview-api";

import { Switch } from "@/components/common/ui/switch";
import { Label } from "@/components/common/ui/label";

/** @type { import('@storybook/nextjs-vite').Meta<typeof Switch> } */
const meta = {
  title: "Common/UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
  args: {
    size: "default",
    disabled: false,
    defaultChecked: false,
  },
};

export default meta;

export const Playground = {
  render: function Render(args) {
    const [{ defaultChecked }, updateArgs] = useArgs();

    return (
      <div className="flex items-center gap-3">
        <Switch
          {...args}
          id="switch-playground"
          checked={defaultChecked}
          onCheckedChange={(checked) => updateArgs({ defaultChecked: checked })}
        />
        <Label htmlFor="switch-playground">Toggle me</Label>
      </div>
    );
  },
};

export const Default = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="switch-default" />
      <Label htmlFor="switch-default">Default</Label>
    </div>
  ),
};

export const Checked = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="switch-checked" defaultChecked />
      <Label htmlFor="switch-checked">Checked</Label>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Switch id="switch-disabled" disabled />
        <Label htmlFor="switch-disabled">Disabled (off)</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-disabled-checked" disabled defaultChecked />
        <Label htmlFor="switch-disabled-checked">Disabled (on)</Label>
      </div>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch id="switch-sm" size="sm" defaultChecked />
        <Label htmlFor="switch-sm">Small</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-default-size" size="default" defaultChecked />
        <Label htmlFor="switch-default-size">Default</Label>
      </div>
    </div>
  ),
};

export const States = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Switch id="switch-off" />
        <Label htmlFor="switch-off">Off</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-on" defaultChecked />
        <Label htmlFor="switch-on">On</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-disabled-off" disabled />
        <Label htmlFor="switch-disabled-off">Disabled off</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-disabled-on" disabled defaultChecked />
        <Label htmlFor="switch-disabled-on">Disabled on</Label>
      </div>
    </div>
  ),
};
