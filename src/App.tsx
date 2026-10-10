import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { EcgAnalysis } from '@/pages/EcgAnalysis';
import { ModelPerformance } from '@/pages/ModelPerformance';
import { About } from '@/pages/About';
import type { PageKey } from '@/lib/types';

const PAGE_META: Record<PageKey, { title: string; breadcrumb: string }> = {
  dashboard: { title: 'Dashboard', breadcrumb: 'Overview' },
  'ecg-analysis': { title: 'ECG Analysis', breadcrumb: 'Tools' },
  'model-performance': { title: 'Model Performance', breadcrumb: 'Evaluation' },
  about: { title: 'About', breadcrumb: 'Information' },
};

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const meta = PAGE_META[currentPage];

  const handleNavigate = (page: PageKey) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Layout
        onMenuClick={() => setSidebarOpen(true)}
        pageTitle={meta.title}
        pageBreadcrumb={meta.breadcrumb}
      >
        {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {currentPage === 'ecg-analysis' && <EcgAnalysis />}
        {currentPage === 'model-performance' && <ModelPerformance />}
        {currentPage === 'about' && <About />}
      </Layout>
    </div>
  );
}

export default App;
