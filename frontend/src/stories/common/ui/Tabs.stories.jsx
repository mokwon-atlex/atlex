import { BarChart3, FileText, Settings } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/ui/tabs';

/** @type { import('@storybook/nextjs-vite').Meta<typeof Tabs> } */
const meta = {
  title: 'Common/UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    },
    listVariant: {
      control: 'select',
      options: ['default', 'line']
    }
  }
};

export default meta;

export const Default = {
  args: {
    orientation: 'horizontal',
    listVariant: 'default'
  },
  render: ({ orientation, listVariant }) => (
    <Tabs defaultValue="overview" orientation={orientation} className="w-[520px]">
      <TabsList variant={listVariant}>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Overview</h3>
        <p className="text-muted-foreground">전체 현황을 확인하는 탭입니다.</p>
      </TabsContent>

      <TabsContent value="analytics" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Analytics</h3>
        <p className="text-muted-foreground">분석 데이터를 확인하는 탭입니다.</p>
      </TabsContent>

      <TabsContent value="reports" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Reports</h3>
        <p className="text-muted-foreground">리포트 내용을 확인하는 탭입니다.</p>
      </TabsContent>

      <TabsContent value="settings" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Settings</h3>
        <p className="text-muted-foreground">설정 내용을 확인하는 탭입니다.</p>
      </TabsContent>
    </Tabs>
  )
};

export const Line = {
  args: {
    orientation: 'horizontal',
    listVariant: 'line'
  },
  render: ({ orientation, listVariant }) => (
    <Tabs defaultValue="notice" orientation={orientation} className="w-[520px]">
      <TabsList variant={listVariant}>
        <TabsTrigger value="notice">공지사항</TabsTrigger>
        <TabsTrigger value="board">게시판</TabsTrigger>
        <TabsTrigger value="chat">채팅</TabsTrigger>
      </TabsList>

      <TabsContent value="notice" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">공지사항</h3>
        <p className="text-muted-foreground">관리자 공지사항을 보여주는 영역입니다.</p>
      </TabsContent>

      <TabsContent value="board" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">게시판</h3>
        <p className="text-muted-foreground">게시글 목록을 보여주는 영역입니다.</p>
      </TabsContent>

      <TabsContent value="chat" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">채팅</h3>
        <p className="text-muted-foreground">채팅 내용을 보여주는 영역입니다.</p>
      </TabsContent>
    </Tabs>
  )
};

export const Vertical = {
  args: {
    orientation: 'vertical',
    listVariant: 'default'
  },
  render: ({ orientation, listVariant }) => (
    <Tabs defaultValue="overview" orientation={orientation} className="w-[620px]">
      <TabsList variant={listVariant}>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Overview</h3>
        <p className="text-muted-foreground">세로 방향 탭 예시입니다.</p>
      </TabsContent>

      <TabsContent value="analytics" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Analytics</h3>
        <p className="text-muted-foreground">분석 데이터를 확인합니다.</p>
      </TabsContent>

      <TabsContent value="reports" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Reports</h3>
        <p className="text-muted-foreground">리포트 내용을 확인합니다.</p>
      </TabsContent>

      <TabsContent value="settings" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Settings</h3>
        <p className="text-muted-foreground">설정 내용을 확인합니다.</p>
      </TabsContent>
    </Tabs>
  )
};

export const Disabled = {
  args: {
    orientation: 'horizontal',
    listVariant: 'default'
  },
  render: ({ orientation, listVariant }) => (
    <Tabs defaultValue="overview" orientation={orientation} className="w-[520px]">
      <TabsList variant={listVariant}>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports" disabled>
          Reports
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Overview</h3>
        <p className="text-muted-foreground">기본으로 선택된 탭입니다.</p>
      </TabsContent>

      <TabsContent value="analytics" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Analytics</h3>
        <p className="text-muted-foreground">Analytics 탭 내용입니다.</p>
      </TabsContent>

      <TabsContent value="settings" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Settings</h3>
        <p className="text-muted-foreground">Settings 탭 내용입니다.</p>
      </TabsContent>
    </Tabs>
  )
};

export const WithIcon = {
  args: {
    orientation: 'horizontal',
    listVariant: 'default'
  },
  render: ({ orientation, listVariant }) => (
    <Tabs defaultValue="overview" orientation={orientation} className="w-[520px]">
      <TabsList variant={listVariant}>
        <TabsTrigger value="overview">
          <BarChart3 data-icon="inline-start" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="reports">
          <FileText data-icon="inline-start" />
          Reports
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Settings data-icon="inline-start" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Overview</h3>
        <p className="text-muted-foreground">아이콘이 포함된 탭 예시입니다.</p>
      </TabsContent>

      <TabsContent value="reports" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Reports</h3>
        <p className="text-muted-foreground">리포트 탭 내용입니다.</p>
      </TabsContent>

      <TabsContent value="settings" className="rounded-lg border p-4">
        <h3 className="mb-2 font-semibold">Settings</h3>
        <p className="text-muted-foreground">설정 탭 내용입니다.</p>
      </TabsContent>
    </Tabs>
  )
};
