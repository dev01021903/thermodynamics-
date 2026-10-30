import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { SimulationProvider } from './context/SimulationContext';
import { LiteratureProvider } from './context/LiteratureContext';
import { Header, TabType } from './components/Header';
import { HomeView } from './components/HomeView';
import { MethodologyView } from './components/MethodologyView';
import { PropertyManagerView } from './components/PropertyManagerView';
import { PropertyCalculatorView } from './components/PropertyCalculatorView';
import { SimulationView } from './components/SimulationView';
import { VisualizationsView } from './components/VisualizationsView';
import { LiteratureComparisonView } from './components/LiteratureComparisonView';
import { AcademicReportView } from './components/AcademicReportView';
import { Flame, Award, ShieldCheck } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-teal-500 selection:text-slate-950">
      {/* Top Single Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}
        {activeTab === 'methodology' && <MethodologyView />}
        {activeTab === 'properties' && <PropertyManagerView />}
        {activeTab === 'calculator' && <PropertyCalculatorView />}
        {activeTab === 'simulation' && <SimulationView setActiveTab={setActiveTab} />}
        {activeTab === 'visualizations' && <VisualizationsView />}
        {activeTab === 'literature' && <LiteratureComparisonView />}
        {activeTab === 'report' && <AcademicReportView />}
      </main>

      {/* Footer in Dark Theme */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-200">BioFluid Thermodynamics &amp; Entropy Framework</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Biotechnology Micro-Project</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-teal-400" />
              <span>CO-2, CO-3, CO-4 Aligned</span>
            </span>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Computational &amp; Literature Scope</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <DataProvider>
      <SimulationProvider>
        <LiteratureProvider>
          <AppContent />
        </LiteratureProvider>
      </SimulationProvider>
    </DataProvider>
  );
}

export default App;
