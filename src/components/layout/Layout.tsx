import { Menu, HeartPulse } from 'lucide-react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  onMenuClick: () => void;
  pageTitle: string;
  pageBreadcrumb: string;
}

export function Layout({ children, onMenuClick, pageTitle, pageBreadcrumb }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-navy-700" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
  <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center shrink-0">
    <HeartPulse className="w-5 h-5 text-teal-400" />
  </div>
  <div className="min-w-0">
    <p className="text-xs font-bold text-navy-800 leading-tight">
      Heartbeat Classifier
    </p>
    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
      ECG ML Screening Demo
    </p>
  </div>
</div>
        <div className="w-9" />
      </div>

      <div className="flex">
        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Page header */}
            <div className="mb-6 lg:mb-8 animate-fade-in">
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-1">
                {pageBreadcrumb}
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-navy-800">ECG + Ai</h2>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
