import Header from '@/components/common/layout/Header';
import GraphViewPage from '@/components/domain/graph-view/feature/GraphViewPage';

export const metadata = {
  title: 'Graph View',
  description: 'Standalone graph view page',
};

export default function StandaloneGraphPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <GraphViewPage />
    </main>
  );
}
