import React from 'react';
import { Flame, Activity, Database, BarChart3, BookOpen, FileText, Compass, Calculator } from 'lucide-react';
import { useData } from '../context/DataContext';

export type TabType = 'home' | 'methodology' | 'properties' | 'calculator' | 'simulation' | 'visualizations' | 'literature' | 'report';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { activeDataset, datasets, setActiveDatasetId } = useData();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home / Overview', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'methodology', label: 'Methodology', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'properties', label: 'Property Manager', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'calculator', label: 'Property Calculator', icon: <Calculator className="w-3.5 h-3.5" /> },
    { id: 'simulation', label: 'Simulation Dashboard', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'visualizations', label: 'Graphs & Analysis', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'literature', label: 'Literature Comparison', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'report', label: 'Academic Report', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md shadow-black/20 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single Consolidated Row */}
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo & Compact Title */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20 font-bold">
              <Flame className="w-4 h-4 text-slate-950" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white tracking-tight text-sm sm:text-base">
                BioFluid<span className="text-teal-400">Thermo</span>
              </span>
              <span className="hidden xl:inline-block text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Micro-Project
              </span>
            </div>
          </div>

          {/* Navigation Links in Center */}
          <nav className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none flex-1 justify-center max-w-4xl">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm shadow-teal-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-teal-400' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Compact Active Dataset Switcher */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Model:</span>
              <select
                value={activeDataset.metadata.id}
                onChange={e => setActiveDatasetId(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer max-w-[140px] truncate"
              >
                {datasets.map(d => (
                  <option key={d.metadata.id} value={d.metadata.id} className="bg-slate-900 text-slate-100">
                    {d.metadata.name}
                  </option>
                ))}
              </select>
              {activeDataset.metadata.isDemo && (
                <span className="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
