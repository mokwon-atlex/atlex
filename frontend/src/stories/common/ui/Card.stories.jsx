import { ArrowRight, BellRing, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Checkbox } from "@/components/common/ui/checkbox";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";

/** @type { import('@storybook/nextjs-vite').Meta<typeof Card> } */
const meta = {
  title: "Common/UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
    variant: {
      control: "select",
      options: ["default", "dashed"],
    },
  },
  args: {
    size: "default",
    variant: "default",
  },
};

export default meta;

export const Playground = {
  render: (args) => (
    <div className="w-[380px]">
      <Card {...args}>
        <CardHeader>
          <CardTitle>Weekly product pulse</CardTitle>
          <CardDescription>
            Share the latest release notes and rollout updates with your team.
          </CardDescription>
          <CardAction>
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Live
            </span>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Sparkles className="size-4" />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-foreground">Release highlights</p>
                <p className="text-sm leading-5 text-muted-foreground">
                  New draft autosave, cleaner editor toolbar, and faster media upload.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/80 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Adoption
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                84%
              </p>
            </div>

            <div className="rounded-xl border border-border/80 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Feedback
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                19 notes
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-between">
          <p className="text-sm text-muted-foreground">Updated 10 minutes ago</p>
          <Button size="sm">
            Open report
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const Compact = {
  args: {
    size: "sm",
  },
  render: (args) => (
    <div className="w-[320px]">
      <Card {...args}>
        <CardHeader>
          <CardTitle>Security status</CardTitle>
          <CardDescription>
            Your workspace protection settings look healthy.
          </CardDescription>
          <CardAction>
            <ShieldCheck className="size-4 text-primary" />
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 px-3 py-2.5">
            <div>
              <p className="font-medium text-foreground">2-step verification</p>
              <p className="text-sm text-muted-foreground">Enabled for all admins</p>
            </div>

            <BellRing className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Dashed = {
  render: () => (
    <div className="w-[380px]">
      <Card variant="dashed" size="sm">
        <CardHeader>
          <CardTitle>본문 영역</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            점선 테두리 카드입니다. 에디터 본문 프레임 등에 사용합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const SignInCard = {
  render: () => (
    <div className="w-[380px]">
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your workspace</CardTitle>
          <CardDescription>
            Enter your email and password to continue to the dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storybook-card-email">Email</Label>
            <Input
              id="storybook-card-email"
              type="email"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storybook-card-password">Password</Label>
            <Input
              id="storybook-card-password"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="storybook-card-remember" defaultChecked />
            <Label htmlFor="storybook-card-remember">Remember this device</Label>
          </div>
        </CardContent>

        <CardFooter className="flex-col items-stretch sm:flex-row">
          <Button className="w-full sm:flex-1">Sign in</Button>
          <Button variant="outline" className="w-full sm:flex-1">
            Create account
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};
