import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useData } from '../context/DataContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  BarChart3,
  Download,
  Layers,
  Sparkles,
  Flame,
  FileSpreadsheet
} from 'lucide-react';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const VisualizationsView: React.FC = () => {
  const { activeDataset } = useData();
  const { inputs, sweepResults, exportResultsCSV, setSweepFinalTemps } = useSimulation();

  const [minT, maxT] = activeDataset.metadata.applicableTempRange;
  const [customSweepMin, setCustomSweepMin] = useState<number>(minT);
  const [customSweepMax, setCustomSweepMax] = useState<number>(maxT);
  const [customSweepStep, setCustomSweepStep] = useState<number>(5);

  // Apply custom sweep
  const handleApplyCustomSweep = () => {
    if (customSweepMin < minT || customSweepMax > maxT || customSweepMin >= customSweepMax) {
      alert(`Custom sweep range must be within [${minT} °C, ${maxT} °C] with min < max.`);
      return;
    }
    const temps: number[] = [];
    for (let t = customSweepMin; t <= customSweepMax + 1e-4; t += customSweepStep) {
      temps.push(parseFloat(t.toFixed(1)));
    }
    if (temps.length === 0) temps.push(customSweepMin, customSweepMax);
    setSweepFinalTemps(temps);
  };

  // Chart 1: Sensible Heat Q vs Final Temperature T2
  const heatChartData = {
    labels: sweepResults.map(p => `${p.finalTemp}°C`),
    datasets: [
      {
        label: 'Sensible Heat Q (kJ)',
        data: sweepResults.map(p => p.sensibleHeatQkJ),
        borderColor: '#2dd4bf',
        backgroundColor: 'rgba(45, 212, 191, 0.2)',
        fill: true,
        borderWidth: 2.5,
        pointBackgroundColor: '#2dd4bf',
        pointRadius: 5,
        tension: 0.2
      }
    ]
  };

  // Chart 2: Entropy Generation S_gen vs Final Temperature T2
  const entropyChartData = {
    labels: sweepResults.map(p => `${p.finalTemp}°C`),
    datasets: [
      {
        label: 'Entropy Generation S_gen (J/K)',
        data: sweepResults.map(p => (p.isPassiveViolation ? null : p.entropyGeneration)),
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        fill: true,
        borderWidth: 2.5,
        pointBackgroundColor: '#14b8a6',
        pointRadius: 5,
        tension: 0.2
      },
      {
        label: 'Fluid Entropy Change ΔS_fluid (J/K)',
        data: sweepResults.map(p => p.fluidEntropyChange),
        borderColor: '#60a5fa',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.2
      },
      {
        label: 'Reservoir Entropy Change ΔS_res (J/K)',
        data: sweepResults.map(p => p.reservoirEntropyChange),
        borderColor: '#f472b6',
        borderDash: [3, 3],
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.2
      }
    ]
  };

  return (
    <div className="space-y-8 pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Visualizations &amp; Multi-Temperature Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Interactive Graphs &amp; Parametric Sweeps</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Sensible heat energy (Q) and Second-Law entropy generation (S_gen) parametric curves under varying temperature conditions.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={exportResultsCSV}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 transition-colors shadow-md shadow-teal-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Graph Data (CSV)</span>
          </button>
        </div>
      </div>

      {/* Sweep Configuration Bar */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Configure Temperature Sweep Interval</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Active model: <strong className="text-teal-300">{activeDataset.metadata.name}</strong> | Initial T1 = {inputs.initialTemp} °C | Reservoir Tr = {inputs.reservoirTemp} °C | Mass m = {inputs.mass} kg
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="flex items-center space-x-1">
              <span className="font-sans font-semibold text-slate-400">Min T2:</span>
              <input
                type="number"
                value={customSweepMin}
                onChange={e => setCustomSweepMin(parseFloat(e.target.value))}
                className="w-16 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-center text-slate-100 font-mono"
              />
              <span className="text-slate-500">°C</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="font-sans font-semibold text-slate-400">Max T2:</span>
              <input
                type="number"
                value={customSweepMax}
                onChange={e => setCustomSweepMax(parseFloat(e.target.value))}
                className="w-16 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-center text-slate-100 font-mono"
              />
              <span className="text-slate-500">°C</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="font-sans font-semibold text-slate-400">Step:</span>
              <input
                type="number"
                value={customSweepStep}
                onChange={e => setCustomSweepStep(parseFloat(e.target.value))}
                className="w-14 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-center text-slate-100 font-mono"
              />
              <span className="text-slate-500">°C</span>
            </div>

            <button
              type="button"
              onClick={handleApplyCustomSweep}
              className="px-3 py-1.5 bg-teal-500 text-slate-950 font-sans font-bold rounded-lg hover:bg-teal-400 shadow-sm"
            >
              Update Sweep
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid: Q vs T2 and S_gen vs T2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sensible Heat Q vs T2 */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Flame className="w-4 h-4 text-teal-400" />
              <span>Sensible Heat Energy Q vs. Final Temperature T2</span>
            </h2>
            <p className="text-[11px] text-slate-400">Q = m &int; Cp(T) dT (kJ) from initial T1 = {inputs.initialTemp} °C</p>
          </div>

          <div className="h-64 w-full">
            <Line
              data={heatChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { color: '#e2e8f0', font: { family: 'Inter', size: 11, weight: 'bold' } } },
                  tooltip: { backgroundColor: '#020617', borderColor: '#334155', borderWidth: 1 }
                },
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                  y: {
                    title: { display: true, text: 'Sensible Heat Q (kJ)', color: '#2dd4bf', font: { size: 10, weight: 'bold' } },
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    ticks: { color: '#94a3b8' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 2: Entropy Generation vs T2 */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Entropy Generation S_gen vs. Final Temperature T2</span>
            </h2>
            <p className="text-[11px] text-slate-400">S_gen = &Delta;S_fluid + &Delta;S_reservoir &ge; 0 (Thermal reservoir at Tr = {inputs.reservoirTemp} °C)</p>
          </div>

          <div className="h-64 w-full">
            <Line
              data={entropyChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { color: '#e2e8f0', font: { family: 'Inter', size: 11, weight: 'bold' } } },
                  tooltip: { backgroundColor: '#020617', borderColor: '#334155', borderWidth: 1 }
                },
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                  y: {
                    title: { display: true, text: 'Entropy Changes (J/K)', color: '#14b8a6', font: { size: 10, weight: 'bold' } },
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    ticks: { color: '#94a3b8' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Sweep Results Data Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            <span>Complete Sweep Numerical Data Table ({sweepResults.length} Evaluated Points)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Mass = {inputs.mass} kg, Tr = {inputs.reservoirTemp} °C</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3">Final T2 (°C)</th>
                <th className="p-3">T2_K (K)</th>
                <th className="p-3">Sensible Q (kJ)</th>
                <th className="p-3">&Delta;S_fluid (J/K)</th>
                <th className="p-3">&Delta;S_res (J/K)</th>
                <th className="p-3 font-bold text-teal-400">S_gen (J/K)</th>
                <th className="p-3">Cp(T2) (J/kg·K)</th>
                <th className="p-3">&mu;(T2) (Pa·s)</th>
                <th className="p-3 text-right">Physical Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
              {sweepResults.map((pt, idx) => (
                <tr key={idx} className="hover:bg-slate-900/80 transition-colors">
                  <td className="p-3 font-bold text-teal-300">{pt.finalTemp.toFixed(1)}</td>
                  <td className="p-3">{pt.finalTempK.toFixed(2)}</td>
                  <td className="p-3">{pt.sensibleHeatQkJ.toFixed(3)}</td>
                  <td className="p-3">{pt.fluidEntropyChange.toFixed(4)}</td>
                  <td className="p-3">{pt.reservoirEntropyChange.toFixed(4)}</td>
                  <td className="p-3 font-bold text-teal-300">{pt.entropyGeneration.toFixed(4)}</td>
                  <td className="p-3">{pt.properties.specificHeat.toFixed(1)}</td>
                  <td className="p-3">{pt.properties.viscosity.toFixed(6)}</td>
                  <td className="p-3 text-right font-sans">
                    {pt.isPassiveViolation ? (
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        2nd Law Violation
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Valid Passive Run
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
