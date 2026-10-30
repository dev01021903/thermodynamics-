import React, { useState, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useData } from '../context/DataContext';
import {
  Flame,
  Clock,
  Sliders,
  AlertTriangle,
  BarChart2,
  Download,
  ChevronDown,
  ChevronUp,
  Cpu,
  Calculator,
  Gauge
} from 'lucide-react';
import { TabType } from './Header';
import { calculateTransportProperties } from '../engine/propertyCalculations';

interface SimulationViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ setActiveTab }) => {
  const { datasets } = useData();
  const { inputs, setInputs, result, exportResultsCSV, setSweepFinalTemps } = useSimulation();

  const [showWorkingSteps, setShowWorkingSteps] = useState<boolean>(true);
  const [showRateSettings, setShowRateSettings] = useState<boolean>(false);
  const [selectedStateTab, setSelectedStateTab] = useState<'t1' | 't2' | 'tavg' | 'probe'>('t1');
  const [probeTemp, setProbeTemp] = useState<number>(37);

  const activeDataset = datasets.find(d => d.metadata.id === inputs.datasetId) || datasets[0];
  const [minT, maxT] = activeDataset.metadata.applicableTempRange;

  const tAvg = (inputs.initialTemp + inputs.finalTemp) / 2;
  const clampedProbeT = Math.min(Math.max(probeTemp, minT), maxT);

  const t1Props = useMemo(() => calculateTransportProperties(inputs.initialTemp, activeDataset), [inputs.initialTemp, activeDataset]);
  const t2Props = useMemo(() => calculateTransportProperties(inputs.finalTemp, activeDataset), [inputs.finalTemp, activeDataset]);
  const tAvgProps = useMemo(() => calculateTransportProperties(tAvg, activeDataset), [tAvg, activeDataset]);
  const probeProps = useMemo(() => calculateTransportProperties(clampedProbeT, activeDataset), [clampedProbeT, activeDataset]);

  const currentDisplayProps = selectedStateTab === 't1' ? t1Props : selectedStateTab === 't2' ? t2Props : selectedStateTab === 'tavg' ? tAvgProps : probeProps;
  const currentDisplayTemp = selectedStateTab === 't1' ? inputs.initialTemp : selectedStateTab === 't2' ? inputs.finalTemp : selectedStateTab === 'tavg' ? tAvg : clampedProbeT;

  const deltaRho = t2Props.density - t1Props.density;
  const pctDeltaRho = t1Props.density !== 0 ? (deltaRho / t1Props.density) * 100 : 0;
  const deltaCp = t2Props.specificHeat - t1Props.specificHeat;
  const pctDeltaCp = t1Props.specificHeat !== 0 ? (deltaCp / t1Props.specificHeat) * 100 : 0;
  const deltaK = t2Props.conductivity - t1Props.conductivity;
  const pctDeltaK = t1Props.conductivity !== 0 ? (deltaK / t1Props.conductivity) * 100 : 0;
  const deltaMu = t2Props.viscosity - t1Props.viscosity;
  const pctDeltaMu = t1Props.viscosity !== 0 ? (deltaMu / t1Props.viscosity) * 100 : 0;

  const handleInputChange = (field: string, value: number | undefined) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePresetSweep = (temps: number[]) => {
    setSweepFinalTemps(temps);
    setInputs(prev => ({ ...prev, finalTemp: temps[temps.length - 1] }));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-2">
            <Flame className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Thermodynamic Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Thermodynamic Simulation Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Sensible heat (Q), fluid entropy (&Delta;S_fluid), and Second-Law entropy generation (S_gen) calculator.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveTab('visualizations')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-teal-400" />
            <span>View Graphs</span>
          </button>
          <button
            onClick={exportResultsCSV}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 transition-colors shadow-md shadow-teal-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Results (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                <span>Simulation Parameters</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-500">SI Units</span>
            </div>

            {/* Fluid Model Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>1. Fluid Model &amp; Dataset</span>
                {activeDataset.metadata.isDemo && (
                  <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded">
                    Demo Data
                  </span>
                )}
              </label>
              <select
                value={inputs.datasetId}
                onChange={e => handleInputChange('datasetId', e.target.value as any)}
                className="w-full text-xs font-medium bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {datasets.map(d => (
                  <option key={d.metadata.id} value={d.metadata.id} className="bg-slate-900 text-slate-100">
                    {d.metadata.name} [{d.metadata.applicableTempRange[0]}–{d.metadata.applicableTempRange[1]} °C]
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Valid temperature window: <strong className="text-slate-200">{minT} °C to {maxT} °C</strong>.
              </p>
            </div>

            {/* Temperatures: T1 and T2 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Initial Temp, T1 (°C)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min={minT}
                    max={maxT}
                    value={inputs.initialTemp}
                    onChange={e => handleInputChange('initialTemp', parseFloat(e.target.value))}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">°C</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  = {(inputs.initialTemp + 273.15).toFixed(2)} K
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Final Temp, T2 (°C)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min={minT}
                    max={maxT}
                    value={inputs.finalTemp}
                    onChange={e => handleInputChange('finalTemp', parseFloat(e.target.value))}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">°C</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  = {(inputs.finalTemp + 273.15).toFixed(2)} K
                </span>
              </div>
            </div>

            {/* Temperature Sweep Presets */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-400">Quick Temperature Sweeps:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePresetSweep([20, 30, 40, 50, 60])}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-slate-950 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 border border-slate-800 transition-colors"
                >
                  [20, 30, 40, 50, 60] °C
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSweep([15, 25, 35, 45, 55])}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-slate-950 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 border border-slate-800 transition-colors"
                >
                  [15, 25, 35, 45, 55] °C
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSweep([25, 30, 37, 42, 50])}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-slate-950 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 border border-slate-800 transition-colors"
                >
                  [25, 30, 37 (Physio), 42, 50] °C
                </button>
              </div>
            </div>

            {/* Mass and Reservoir Temperature */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Fluid Mass, m (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={inputs.mass}
                    onChange={e => handleInputChange('mass', parseFloat(e.target.value))}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">kg</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Reservoir Temp, Tr (°C)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={inputs.reservoirTemp}
                    onChange={e => handleInputChange('reservoirTemp', parseFloat(e.target.value))}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">°C</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  = {(inputs.reservoirTemp + 273.15).toFixed(2)} K
                </span>
              </div>
            </div>

            {/* Collapsible Rate & Newton Model Parameters */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowRateSettings(!showRateSettings)}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-300 transition-colors"
              >
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Optional Duration &amp; Newton Rate Model</span>
                </span>
                {showRateSettings ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showRateSettings && (
                <div className="p-4 space-y-3.5 bg-slate-900 text-xs border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Process Duration, &Delta;t (seconds)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 120"
                        value={inputs.duration ?? ''}
                        onChange={e => handleInputChange('duration', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full p-2 font-mono text-xs bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">s</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Used to compute average rates: q_dot_avg = Q/&Delta;t, S_dot_gen_avg = S_gen/&Delta;t.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Area, A (m²)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.25"
                        value={inputs.area ?? ''}
                        onChange={e => handleInputChange('area', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full p-2 font-mono text-xs bg-slate-950 border border-slate-700 text-slate-100 rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Coeff, h (W/m²·K)</label>
                      <input
                        type="number"
                        step="10"
                        placeholder="150"
                        value={inputs.heatTransferCoeff ?? ''}
                        onChange={e => handleInputChange('heatTransferCoeff', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full p-2 font-mono text-xs bg-slate-950 border border-slate-700 text-slate-100 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Initial & Final Condition Summary */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Boundary States Overview</span>
              <span className="text-[10px] text-teal-400 font-mono">T1 &rarr; T2</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-sans font-bold text-teal-300 block">Initial (T1 = {inputs.initialTemp}°C)</span>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <div className="flex justify-between"><span>&rho;:</span><span>{t1Props.density.toFixed(2)}</span></div>
                  <div className="flex justify-between text-teal-300"><span>Cp:</span><span>{t1Props.specificHeat.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span>k:</span><span>{t1Props.conductivity.toFixed(3)}</span></div>
                  <div className="flex justify-between"><span>&mu;:</span><span>{(t1Props.viscosity * 1000).toFixed(2)} cP</span></div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-sans font-bold text-teal-300 block">Final (T2 = {inputs.finalTemp}°C)</span>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <div className="flex justify-between"><span>&rho;:</span><span>{t2Props.density.toFixed(2)}</span></div>
                  <div className="flex justify-between text-teal-300"><span>Cp:</span><span>{t2Props.specificHeat.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span>k:</span><span>{t2Props.conductivity.toFixed(3)}</span></div>
                  <div className="flex justify-between"><span>&mu;:</span><span>{(t2Props.viscosity * 1000).toFixed(2)} cP</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Thermodynamic Results, Thermophysical Properties & Math Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Safeguard Alert Banner if Second Law Violation */}
          {result.isPassiveViolation && (
            <div className="p-4 bg-rose-950/60 border-2 border-rose-500/40 rounded-2xl flex items-start space-x-3 text-rose-200 animate-in fade-in">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-rose-300 text-sm">Thermodynamic Direction Violation Flagged</h4>
                <p className="leading-relaxed">{result.validationError}</p>
              </div>
            </div>
          )}

          {!result.isValid && !result.isPassiveViolation && (
            <div className="p-4 bg-amber-950/60 border-2 border-amber-500/40 rounded-2xl flex items-start space-x-3 text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold">Input Error</h4>
                <p>{result.validationError}</p>
              </div>
            </div>
          )}

          {/* Primary Results Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sensible Heat Q */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sensible Heat (Q)</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    result.isHeating
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : result.isCooling
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {result.isHeating ? 'Heat Added (+)' : result.isCooling ? 'Heat Removed (−)' : 'Isothermal (0)'}
                </span>
              </div>
              <div className="space-y-0.5 font-mono">
                <div className="text-2xl font-black text-white">
                  {result.sensibleHeatQkJ.toFixed(4)} <span className="text-sm font-semibold text-slate-400">kJ</span>
                </div>
                <div className="text-xs text-slate-400">
                  = {result.sensibleHeatQ.toLocaleString('en-US', { maximumFractionDigits: 2 })} J
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                Q = m &int; Cp(T) dT
              </p>
            </div>

            {/* Total Entropy Generation S_gen */}
            <div
              className={`rounded-2xl border p-5 shadow-sm space-y-2 relative overflow-hidden ${
                result.isPassiveViolation
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'bg-gradient-to-br from-teal-950 to-slate-900 text-white border-teal-500/40 shadow-lg shadow-teal-950/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold uppercase tracking-wider ${result.isPassiveViolation ? 'text-rose-300' : 'text-teal-300'}`}>
                  Entropy Generation (S_gen)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    result.isPassiveViolation
                      ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {result.isPassiveViolation ? '2nd Law Invalid' : 'Second Law Irreversibility'}
                </span>
              </div>
              <div className="space-y-0.5 font-mono">
                <div className="text-2xl font-black text-white">
                  {result.entropyGeneration.toFixed(4)}{' '}
                  <span className={`text-sm font-semibold ${result.isPassiveViolation ? 'text-rose-300' : 'text-teal-400'}`}>
                    J/K
                  </span>
                </div>
                <div className={`text-xs ${result.isPassiveViolation ? 'text-rose-300' : 'text-teal-400'}`}>
                  S_gen = &Delta;S_fluid + &Delta;S_reservoir {result.entropyGeneration >= 0 ? '≥ 0' : '< 0'}
                </div>
              </div>
              <p className={`text-[10px] pt-1 border-t ${result.isPassiveViolation ? 'border-rose-500/30 text-rose-400' : 'border-teal-500/20 text-teal-300'}`}>
                Quantifies thermal dissipation in combined system
              </p>
            </div>

            {/* Fluid Entropy Change */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fluid Entropy Change (&Delta;S_fluid)</span>
              </div>
              <div className="space-y-0.5 font-mono">
                <div className="text-xl font-bold text-white">
                  {result.fluidEntropyChange.toFixed(4)} <span className="text-sm font-semibold text-slate-400">J/K</span>
                </div>
                <div className="text-xs text-slate-400">
                  &Delta;S_fluid = m &int; [Cp(T)/T] dT
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                System entropy (Kelvin integration)
              </p>
            </div>

            {/* Reservoir Entropy Change */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reservoir Entropy Change (&Delta;S_res)</span>
              </div>
              <div className="space-y-0.5 font-mono">
                <div className="text-xl font-bold text-white">
                  {result.reservoirEntropyChange.toFixed(4)} <span className="text-sm font-semibold text-slate-400">J/K</span>
                </div>
                <div className="text-xs text-slate-400">
                  &Delta;S_res = -Q / Tr_Kelvin
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                Surrounding reservoir at uniform Tr
              </p>
            </div>
          </div>

          {/* Dedicated Thermophysical Properties Calculation Engine (ρ, Cp, k, μ) */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Thermophysical Property Calculation Engine
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated Density (&rho;), Specific Heat (Cp), Thermal Conductivity (k), and Viscosity (&mu;)
                  </p>
                </div>
              </div>

              {/* State Evaluation Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedStateTab('t1')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedStateTab === 't1'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  T1 ({inputs.initialTemp}°C)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStateTab('t2')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedStateTab === 't2'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  T2 ({inputs.finalTemp}°C)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStateTab('tavg')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedStateTab === 'tavg'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  T_avg ({tAvg.toFixed(0)}°C)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStateTab('probe')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedStateTab === 'probe'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Probe (T)
                </button>
              </div>
            </div>

            {/* Probe Slider if selected */}
            {selectedStateTab === 'probe' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-teal-500/30 space-y-2 animate-in fade-in">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Custom Temperature Probe:</span>
                  <span className="font-mono font-bold text-teal-300 text-sm">
                    {probeTemp.toFixed(1)} °C ({(probeTemp + 273.15).toFixed(2)} K)
                  </span>
                </div>
                <input
                  type="range"
                  min={minT}
                  max={maxT}
                  step={0.5}
                  value={probeTemp}
                  onChange={e => setProbeTemp(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{minT} °C</span>
                  <span>Range: [{minT} – {maxT} °C]</span>
                  <span>{maxT} °C</span>
                </div>
              </div>
            )}

            {/* 4 Core Property Calculation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Density (ρ) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    <span className="text-teal-400 font-serif mr-1">ρ</span> Density
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">kg/m³</span>
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {currentDisplayProps.density.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                  = {(currentDisplayProps.density / 1000).toFixed(4)} g/cm³
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Fluid Vol: {(inputs.mass / currentDisplayProps.density * 1000).toFixed(3)} L
                </div>
                {currentDisplayProps.dDensity_dT !== undefined && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    d&rho;/dT = {currentDisplayProps.dDensity_dT.toFixed(3)} kg/m³·K
                  </div>
                )}
              </div>

              {/* 2. Specific Heat (Cp) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300">
                    <span className="font-serif mr-1">Cp</span> Specific Heat
                  </span>
                  <span className="text-[10px] text-teal-400/70 font-mono">J/kg·K</span>
                </div>
                <div className="text-xl font-black font-mono text-teal-300">
                  {currentDisplayProps.specificHeat.toFixed(1)}
                </div>
                <div className="text-[11px] text-teal-400/80 font-mono pt-1 border-t border-slate-800">
                  = {(currentDisplayProps.specificHeat / 1000).toFixed(4)} kJ/kg·K
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Thermal Mass: {(inputs.mass * currentDisplayProps.specificHeat).toFixed(1)} J/K
                </div>
                {currentDisplayProps.dSpecificHeat_dT !== undefined && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    dCp/dT = {currentDisplayProps.dSpecificHeat_dT.toFixed(3)} J/kg·K²
                  </div>
                )}
              </div>

              {/* 3. Thermal Conductivity (k) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    <span className="text-teal-400 font-serif mr-1">k</span> Conductivity
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">W/m·K</span>
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {currentDisplayProps.conductivity.toFixed(4)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                  = {(currentDisplayProps.conductivity * 1000).toFixed(1)} mW/m·K
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Resistivity: {(1 / currentDisplayProps.conductivity).toFixed(2)} m·K/W
                </div>
                {currentDisplayProps.dConductivity_dT !== undefined && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    dk/dT = {currentDisplayProps.dConductivity_dT.toFixed(5)} W/m·K²
                  </div>
                )}
              </div>

              {/* 4. Dynamic Viscosity (μ) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    <span className="text-teal-400 font-serif mr-1">&mu;</span> Viscosity
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Pa·s</span>
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {currentDisplayProps.viscosity.toFixed(6)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                  = {(currentDisplayProps.viscosity * 1000).toFixed(3)} mPa·s (cP)
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  &nu; = {currentDisplayProps.kinematicViscosityCSt.toFixed(3)} cSt
                </div>
                {currentDisplayProps.dViscosity_dT !== undefined && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    d&mu;/dT = {currentDisplayProps.dViscosity_dT.toExponential(2)} Pa·s/K
                  </div>
                )}
              </div>
            </div>

            {/* Derived Transport & Dimensionless Numbers */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                <span className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-teal-400" />
                  <span>Derived Transport &amp; Dimensionless Numbers at T = {currentDisplayTemp.toFixed(1)} °C</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Pr = (&mu;&middot;Cp)/k &bull; &alpha; = k/(&rho;&middot;Cp) &bull; &nu; = &mu;/&rho;
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-sans text-[11px] font-semibold">Prandtl Number (Pr)</span>
                  <div className="text-sm font-bold text-teal-300">
                    {currentDisplayProps.prandtlNumber.toFixed(2)}
                  </div>
                  <span className="text-[9px] text-slate-500 block">Boundary layer ratio</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-sans text-[11px] font-semibold">Thermal Diffusivity (&alpha;)</span>
                  <div className="text-sm font-bold text-slate-200">
                    {currentDisplayProps.thermalDiffusivity.toExponential(3)} <span className="text-[10px] text-slate-400">m²/s</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block">Heat spread rate</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-sans text-[11px] font-semibold">Kinematic Viscosity (&nu;)</span>
                  <div className="text-sm font-bold text-slate-200">
                    {currentDisplayProps.kinematicViscosityCSt.toFixed(3)} <span className="text-[10px] text-slate-400">cSt</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block">Momentum diffusion</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-sans text-[11px] font-semibold">Volumetric Heat Cap (Cv)</span>
                  <div className="text-sm font-bold text-slate-200">
                    {(currentDisplayProps.volumetricHeatCapacity / 1e6).toFixed(3)} <span className="text-[10px] text-slate-400">MJ/m³·K</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block">&rho;&middot;Cp storage density</span>
                </div>
              </div>
            </div>

            {/* Thermal Transition Comparison (T1 -> T2) */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <span className="font-sans font-bold text-slate-300 text-xs">
                Thermal Transition (&Delta; = T2 − T1):
              </span>
              <div className="flex flex-wrap gap-4 text-xs">
                <div>
                  <span className="text-slate-500 mr-1">&Delta;&rho;:</span>
                  <span className={`font-bold ${deltaRho < 0 ? 'text-blue-300' : 'text-slate-200'}`}>
                    {deltaRho > 0 ? `+${deltaRho.toFixed(2)}` : deltaRho.toFixed(2)} kg/m³ ({pctDeltaRho.toFixed(1)}%)
                  </span>
                </div>
                <div>
                  <span className="text-teal-400/80 mr-1">&Delta;Cp:</span>
                  <span className={`font-bold ${deltaCp > 0 ? 'text-teal-300' : 'text-slate-200'}`}>
                    {deltaCp > 0 ? `+${deltaCp.toFixed(1)}` : deltaCp.toFixed(1)} J/kg·K ({pctDeltaCp.toFixed(1)}%)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">&Delta;k:</span>
                  <span className="font-bold text-slate-200">
                    {deltaK > 0 ? `+${deltaK.toFixed(3)}` : deltaK.toFixed(3)} W/m·K ({pctDeltaK.toFixed(1)}%)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">&Delta;&mu;:</span>
                  <span className={`font-bold ${deltaMu < 0 ? 'text-amber-300' : 'text-slate-200'}`}>
                    {(deltaMu * 1000).toFixed(3)} cP ({pctDeltaMu.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Quantities Panel */}
          {(result.hasDuration || result.hasNewtonModel) && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Rate Quantities &amp; Heat Transfer Dynamics</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {result.hasDuration && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Average Heat Transfer Rate (q_dot_avg)</span>
                    <div className="text-lg font-bold text-white">
                      {result.averageHeatTransferRate?.toFixed(2)} <span className="text-xs text-slate-400">W (J/s)</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      S_dot_gen_avg = {result.averageEntropyGenRate?.toFixed(6)} W/K
                    </div>
                  </div>
                )}

                {result.hasNewtonModel && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Newton Instantaneous Rate (q_dot = hA&Delta;T)</span>
                    <div className="text-base font-bold text-white">
                      Initial: {result.instantaneousInitialRate?.toFixed(1)} W
                    </div>
                    <div className="text-base font-bold text-white">
                      Final: {result.instantaneousFinalRate?.toFixed(1)} W
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mathematical Derivation / Working Steps Inspector */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowWorkingSteps(!showWorkingSteps)}
              className="w-full p-4 bg-slate-950 hover:bg-slate-800/60 flex items-center justify-between text-xs font-bold text-white transition-colors border-b border-slate-800"
            >
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-teal-400" />
                <span>Mathematical Working Steps &amp; Numerical Quadrature Inspector</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                <span>{showWorkingSteps ? 'Hide Working' : 'Show Full Working'}</span>
                {showWorkingSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showWorkingSteps && (
              <div className="p-6 space-y-5 text-xs">
                {/* Quadrature Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="font-sans text-slate-500 block text-[10px]">Quadrature Method</span>
                    <span className="font-bold text-slate-200">{result.workingSteps.integrationMethod}</span>
                  </div>
                  <div>
                    <span className="font-sans text-slate-500 block text-[10px]">Temperature Limits in Kelvin</span>
                    <span className="font-bold text-slate-200">
                      T1_K = {result.workingSteps.t1Kelvin.toFixed(2)} K &rarr; T2_K = {result.workingSteps.t2Kelvin.toFixed(2)} K
                    </span>
                  </div>
                  <div>
                    <span className="font-sans text-slate-500 block text-[10px]">Reservoir Kelvin</span>
                    <span className="font-bold text-slate-200">Tr_K = {result.workingSteps.trKelvin.toFixed(2)} K</span>
                  </div>
                </div>

                {/* Step-by-Step Equations */}
                <div className="space-y-3 font-mono">
                  {/* Step 0: Thermophysical Property Evaluation */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-white text-xs">Step 0: Thermophysical Property Formulation (&rho;, Cp, k, &mu;)</span>
                      <span className="font-sans text-[10px] text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded font-semibold">State Relations</span>
                    </div>
                    <div className="text-slate-300 text-[11px] space-y-1">
                      <div>&bull; &rho;(T): Piecewise interpolation &rarr; &rho;(T1) = {t1Props.density.toFixed(2)} kg/m³, &rho;(T2) = {t2Props.density.toFixed(2)} kg/m³</div>
                      <div>&bull; Cp(T): Continuous polynomial/spline &rarr; Cp(T1) = {t1Props.specificHeat.toFixed(1)} J/kg·K, Cp(T2) = {t2Props.specificHeat.toFixed(1)} J/kg·K</div>
                      <div>&bull; k(T): Thermal conductivity &rarr; k(T1) = {t1Props.conductivity.toFixed(4)} W/m·K, k(T2) = {t2Props.conductivity.toFixed(4)} W/m·K</div>
                      <div>&bull; &mu;(T): Viscosity &rarr; &mu;(T1) = {t1Props.viscosity.toFixed(6)} Pa·s, &mu;(T2) = {t2Props.viscosity.toFixed(6)} Pa·s ({(t1Props.viscosity * 1000).toFixed(2)} &rarr; {(t2Props.viscosity * 1000).toFixed(2)} cP)</div>
                      <div>&bull; Prandtl Number: Pr(T1) = {t1Props.prandtlNumber.toFixed(2)}, Pr(T2) = {t2Props.prandtlNumber.toFixed(2)} [Pr = (&mu;&middot;Cp)/k]</div>
                    </div>
                  </div>

                  {/* Step 1: Sensible Heat */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-white text-xs">Step 1: Sensible Thermal Energy Integration (Q)</span>
                      <span className="font-sans text-[10px] text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded font-semibold">First Law</span>
                    </div>
                    <p className="text-slate-300 text-[11px] break-all">
                      {result.workingSteps.formulaSubstitutions.heatFormula}
                    </p>
                  </div>

                  {/* Step 2: Fluid Entropy */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-white text-xs">Step 2: Fluid Entropy Change (&Delta;S_fluid)</span>
                      <span className="font-sans text-[10px] text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded font-semibold">System Entropy</span>
                    </div>
                    <p className="text-slate-300 text-[11px] break-all">
                      {result.workingSteps.formulaSubstitutions.entropyFluidFormula}
                    </p>
                  </div>

                  {/* Step 3: Reservoir Entropy */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-white text-xs">Step 3: Thermal Reservoir Entropy Change (&Delta;S_reservoir)</span>
                      <span className="font-sans text-[10px] text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded font-semibold">Surroundings</span>
                    </div>
                    <p className="text-slate-300 text-[11px] break-all">
                      {result.workingSteps.formulaSubstitutions.entropyResFormula}
                    </p>
                  </div>

                  {/* Step 4: Entropy Generation */}
                  <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-950/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-teal-300 text-xs">Step 4: Total Entropy Generation (S_gen)</span>
                      <span className="font-sans text-[10px] text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded font-semibold">Second Law Balance</span>
                    </div>
                    <p className="text-teal-200 font-bold text-[11px] break-all">
                      {result.workingSteps.formulaSubstitutions.entropyGenFormula}
                    </p>
                  </div>
                </div>

                {/* Sample Quadrature Slices Table */}
                {result.workingSteps.integralSegments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="font-bold text-slate-300 text-[11px] block">
                      Sample Quadrature Slices Breakdown (N=100 total):
                    </span>
                    <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
                      <table className="w-full text-[10px] font-mono text-left">
                        <thead className="bg-slate-950 text-slate-400">
                          <tr>
                            <th className="p-1.5 px-2">Slice Range (°C)</th>
                            <th className="p-1.5 px-2">T_mid (K)</th>
                            <th className="p-1.5 px-2">Cp(T_mid) (J/kg·K)</th>
                            <th className="p-1.5 px-2">&delta;Q (J)</th>
                            <th className="p-1.5 px-2">&delta;S (J/K)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {result.workingSteps.integralSegments.map((seg, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60">
                              <td className="p-1.5 px-2">{seg.tStart.toFixed(2)} &rarr; {seg.tEnd.toFixed(2)}</td>
                              <td className="p-1.5 px-2">{seg.tMidK.toFixed(2)}</td>
                              <td className="p-1.5 px-2">{seg.cpMid.toFixed(1)}</td>
                              <td className="p-1.5 px-2">{seg.deltaQ.toFixed(2)}</td>
                              <td className="p-1.5 px-2">{seg.deltaS.toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
