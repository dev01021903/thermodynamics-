import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CSVImportModal } from './CSVImportModal';
import {
  Database,
  Plus,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { DataPoint } from '../types/dataset';

export const PropertyManagerView: React.FC = () => {
  const {
    datasets,
    activeDatasetId,
    activeDataset,
    setActiveDatasetId,
    updateDataset,
    deleteDataset,
    resetToDefaults,
    exportDatasetCSV,
    getCSVTemplateString
  } = useData();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newRow, setNewRow] = useState<Partial<DataPoint>>({
    temperature: undefined,
    density: undefined,
    specificHeat: undefined,
    conductivity: undefined,
    viscosity: undefined
  });
  const [rowError, setRowError] = useState<string | null>(null);

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    setRowError(null);

    const { temperature, density, specificHeat, conductivity, viscosity } = newRow;

    if (
      temperature === undefined ||
      density === undefined ||
      specificHeat === undefined ||
      conductivity === undefined ||
      viscosity === undefined
    ) {
      setRowError('Please fill in all five property fields.');
      return;
    }

    if (density <= 0 || specificHeat <= 0 || conductivity <= 0 || viscosity <= 0) {
      setRowError('Thermophysical properties (ρ, Cp, k, μ) must be strictly positive (> 0).');
      return;
    }

    if (activeDataset.dataPoints.some(p => Math.abs(p.temperature - temperature) < 1e-4)) {
      setRowError(`A data point at ${temperature} °C already exists in this dataset.`);
      return;
    }

    const updatedPoints = [...activeDataset.dataPoints, {
      temperature,
      density,
      specificHeat,
      conductivity,
      viscosity
    }].sort((a, b) => a.temperature - b.temperature);

    const minT = updatedPoints[0].temperature;
    const maxT = updatedPoints[updatedPoints.length - 1].temperature;

    const updatedDataset = {
      ...activeDataset,
      metadata: {
        ...activeDataset.metadata,
        applicableTempRange: [minT, maxT] as [number, number]
      },
      dataPoints: updatedPoints
    };

    updateDataset(updatedDataset);
    setNewRow({
      temperature: undefined,
      density: undefined,
      specificHeat: undefined,
      conductivity: undefined,
      viscosity: undefined
    });
  };

  const handleDeleteRow = (index: number) => {
    if (activeDataset.dataPoints.length <= 2) {
      alert('A minimum of 2 temperature data points is required for interpolation.');
      return;
    }
    const updatedPoints = activeDataset.dataPoints.filter((_, idx) => idx !== index);
    const minT = updatedPoints[0].temperature;
    const maxT = updatedPoints[updatedPoints.length - 1].temperature;

    updateDataset({
      ...activeDataset,
      metadata: {
        ...activeDataset.metadata,
        applicableTempRange: [minT, maxT] as [number, number]
      },
      dataPoints: updatedPoints
    });
  };

  const handleToggleInterpolation = (mode: 'linear' | 'tabulated') => {
    updateDataset({
      ...activeDataset,
      metadata: {
        ...activeDataset.metadata,
        interpolationMode: mode
      }
    });
  };

  const handleDownloadTemplate = () => {
    const template = getCSVTemplateString();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'biotech_fluid_property_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-2">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Thermophysical Property Data Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Fluid Models &amp; Property Datasets</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage literature baseline datasets or import customized experimental / correlation values.</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>CSV Template</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 transition-colors shadow-md shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Import Dataset (CSV)</span>
          </button>
        </div>
      </div>

      {/* Dataset Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {datasets.map(d => {
          const isSelected = d.metadata.id === activeDatasetId;
          return (
            <div
              key={d.metadata.id}
              onClick={() => setActiveDatasetId(d.metadata.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-slate-900 border-teal-500 ring-1 ring-teal-500/30 shadow-lg shadow-teal-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.metadata.isDemo
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    }`}
                  >
                    {d.metadata.isDemo ? 'Illustrative Demo' : 'Standard Ref'}
                  </span>
                  {isSelected && (
                    <span className="flex items-center text-[11px] font-bold text-teal-400">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-400" />
                      Active
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-sm leading-snug">{d.metadata.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">{d.metadata.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">{d.metadata.applicableTempRange[0]}°C – {d.metadata.applicableTempRange[1]}°C</span>
                <span className="font-semibold">{d.dataPoints.length} points</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Dataset Detailed Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-6">
        {/* Metadata Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">{activeDataset.metadata.name}</h2>
              {activeDataset.metadata.isDemo && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Illustrative Demo Dataset
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">{activeDataset.metadata.description}</p>
          </div>

          {/* Action Buttons for Active Dataset */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportDatasetCSV(activeDataset)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            {datasets.length > 1 && (
              <button
                onClick={() => deleteDataset(activeDataset.metadata.id)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 text-xs font-medium hover:bg-slate-800"
              title="Reset all datasets to built-in standards"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Standards</span>
            </button>
          </div>
        </div>

        {/* Provenance & Citation Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Source Citation</span>
            <p className="text-slate-200 font-medium">{activeDataset.metadata.sourceCitation}</p>
            {activeDataset.metadata.publicationDetails && (
              <p className="text-slate-400 text-[11px] italic">{activeDataset.metadata.publicationDetails}</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Measurement / Estimation Method</span>
            <p className="text-slate-200 font-medium">{activeDataset.metadata.measurementMethod || 'Standard formulation'}</p>
            <p className="text-slate-400 text-[11px]">Applicable Range: {activeDataset.metadata.applicableTempRange[0]} °C to {activeDataset.metadata.applicableTempRange[1]} °C</p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Interpolation Method</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleToggleInterpolation('linear')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeDataset.metadata.interpolationMode === 'linear'
                    ? 'bg-teal-500 text-slate-950 shadow-sm font-bold'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Piecewise Linear
              </button>
              <button
                type="button"
                onClick={() => handleToggleInterpolation('tabulated')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeDataset.metadata.interpolationMode === 'tabulated'
                    ? 'bg-teal-500 text-slate-950 shadow-sm font-bold'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Tabulated Nearest
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Extrapolation is strictly prevented outside range.</p>
          </div>
        </div>

        {/* Data Points Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              <span>Standardized Data Points Table ({activeDataset.dataPoints.length} points)</span>
            </h3>
            <span className="text-xs text-slate-400">All properties standardized to SI units</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Temperature, T (°C)</th>
                  <th className="p-3">Density, &rho; (kg/m³)</th>
                  <th className="p-3">Specific Heat, Cp (J/kg·K)</th>
                  <th className="p-3">Conductivity, k (W/m·K)</th>
                  <th className="p-3">Dynamic Viscosity, &mu; (Pa·s)</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                {activeDataset.dataPoints.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/80 transition-colors">
                    <td className="p-3 text-slate-500 font-sans">{idx + 1}</td>
                    <td className="p-3 font-semibold text-teal-300">{pt.temperature.toFixed(2)}</td>
                    <td className="p-3">{pt.density.toFixed(2)}</td>
                    <td className="p-3">{pt.specificHeat.toFixed(1)}</td>
                    <td className="p-3">{pt.conductivity.toFixed(3)}</td>
                    <td className="p-3">{pt.viscosity.toFixed(6)}</td>
                    <td className="p-3 text-right font-sans">
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Row Form */}
        <form onSubmit={handleAddRow} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300">Add New Data Point to Active Model</h4>
            {rowError && <span className="text-xs text-rose-400 font-semibold">{rowError}</span>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
            <input
              type="number"
              step="any"
              placeholder="T (°C)"
              value={newRow.temperature ?? ''}
              onChange={e => setNewRow({ ...newRow, temperature: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <input
              type="number"
              step="any"
              placeholder="ρ (kg/m³)"
              value={newRow.density ?? ''}
              onChange={e => setNewRow({ ...newRow, density: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <input
              type="number"
              step="any"
              placeholder="Cp (J/kg·K)"
              value={newRow.specificHeat ?? ''}
              onChange={e => setNewRow({ ...newRow, specificHeat: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <input
              type="number"
              step="any"
              placeholder="k (W/m·K)"
              value={newRow.conductivity ?? ''}
              onChange={e => setNewRow({ ...newRow, conductivity: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <input
              type="number"
              step="any"
              placeholder="μ (Pa·s)"
              value={newRow.viscosity ?? ''}
              onChange={e => setNewRow({ ...newRow, viscosity: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button
              type="submit"
              className="col-span-2 sm:col-span-1 px-3 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-sans font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>
        </form>
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </div>
  );
};
