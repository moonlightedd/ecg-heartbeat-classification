import { Activity, LayoutDashboard, BarChart3, Info, HeartPulse } from 'lucide-react';
import type { PageKey } from '@/lib/types';

interface SidebarProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: { key: PageKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'ecg-analysis', label: 'ECG Analysis', icon: Activity },
  { key: 'model-performance', label: 'Model Performance', icon: BarChart3 },
  { key: 'about', label: 'About', icon: Info },
];

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-900/40 z-30 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          h-screen w-72 flex-shrink-0
          bg-white border-r border-slate-200
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / Title */}
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-navy-700 flex items-center justify-center shadow-md">
              <HeartPulse className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-navy-800 leading-tight">Heartbeat Classifier</h1>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">ECG ML Screening Demo</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            return (
              <div
                key={item.key}
                className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
                onClick={() => {
                  onNavigate(item.key);
                  onClose();
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" />}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5 border-t border-slate-100">
          <p className="px-2 text-xs text-slate-400">
            College ML Project · 2026
          </p>
        </div>
      </aside>
    </>
  );
}
