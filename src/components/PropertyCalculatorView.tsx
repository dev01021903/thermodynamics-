import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { calculateTransportProperties, calculateChoiOkosProperties } from '../engine/propertyCalculations';
import { CompositionInputs } from '../types/propertyCalc';
import {
  Calculator,
  Sliders,
  Cpu,
  Plus,
  Activity
} from 'lucide-react';
import { FluidDataset } from '../types/dataset';

export const PropertyCalculatorView: React.FC = () => {
  const { activeDataset, datasets, addDataset } = useData();

  const [mode, setMode] = useState<'dataset' | 'composition'>('dataset');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(activeDataset.metadata.id);
  
  const currentDataset = datasets.find(d => d.metadata.id === selectedDatasetId) || activeDataset;
  const [minT, maxT] = currentDataset.metadata.applicableTempRange;

  const [targetTemp, setTargetTemp] = useState<number>(() => {
    const mid = (minT + maxT) / 2;
    return parseFloat(mid.toFixed(1));
  });

  // Composition Mode Inputs (percentages 0 - 100)
  const [waterPct, setWaterPct] = useState<number>(91.0);
  const [proteinPct, setProteinPct] = useState<number>(7.0);
  const [carbPct, setCarbPct] = useState<number>(1.0);
  const [fatPct, setFatPct] = useState<number>(0.0);
  const [ashPct, setAshPct] = useState<number>(1.0);
  const [compTemp, setCompTemp] = useState<number>(37.0);

  // Normalize composition
  const totalPct = waterPct + proteinPct + carbPct + fatPct + ashPct;
  const compInputs: CompositionInputs = {
    waterFraction: totalPct > 0 ? waterPct / 100 : 1,
    proteinFraction: totalPct > 0 ? proteinPct / 100 : 0,
    carbohydrateFraction: totalPct > 0 ? carbPct / 100 : 0,
    fatFraction: totalPct > 0 ? fatPct / 100 : 0,
    ashFraction: totalPct > 0 ? ashPct / 100 : 0,
    temperature: compTemp
  };

  // Calculations
  const transportProps = calculateTransportProperties(targetTemp, currentDataset);
  const compResult = calculateChoiOkosProperties(compInputs);

  const handleApplyPreset = (w: number, p: number, c: number, f: number, a: number, t: number) => {
    setWaterPct(w);
    setProteinPct(p);
    setCarbPct(c);
    setFatPct(f);
    setAshPct(a);
    setCompTemp(t);
  };

  const handleCreateDatasetFromComposition = () => {
    const temps = [10, 20, 30, 37, 45, 55, 65];
    const points = temps.map(t => {
      const res = calculateChoiOkosProperties({ ...compInputs, temperature: t });
      return {
        temperature: t,
        density: parseFloat(res.density.toFixed(2)),
        specificHeat: parseFloat(res.specificHeat.toFixed(1)),
        conductivity: parseFloat(res.conductivity.toFixed(3)),
        viscosity: parseFloat(res.viscosity.toFixed(6))
      };
    });

    const newDataset: FluidDataset = {
      metadata: {
        id: `choi-okos-${Date.now()}`,
        name: `Biofluid Simulant (W:${waterPct}% P:${proteinPct}% C:${carbPct}%)`,
        description: `Generated via Choi & Okos (1986) bioprocess mixture model. Water ${waterPct}%, Protein ${proteinPct}%, Carbohydrate ${carbPct}%, Ash ${ashPct}%.`,
        sourceCitation: 'Choi, Y. and Okos, M.R., Effects of temperature and composition on the thermal properties of foods, Food Engineering and Process Applications, 1986.',
        applicableTempRange: [10, 65],
        measurementMethod: 'Choi & Okos Component Mixture Prediction Equations',
        notes: 'Predictive mathematical correlation for biological fluid properties.',
        isDemo: true,
        interpolationMode: 'linear',
        createdAt: new Date().toISOString().split('T')[0]
      },
      dataPoints: points
    };

    addDataset(newDataset);
    setSelectedDatasetId(newDataset.metadata.id);
    setMode('dataset');
    alert(`Created and loaded new dataset: "${newDataset.metadata.name}"!`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-2">
            <Calculator className="w-3.5 h-3.5 text-teal-400" />
            <span>Thermophysical Property &amp; Transport Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Density (&rho;), Specific Heat (Cp), Conductivity (k), Viscosity (&mu;) Calculator
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Evaluate primary thermophysical properties, temperature derivatives, transport numbers (&alpha;, &nu;, Pr), and biofluid composition models.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('dataset')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              mode === 'dataset'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dataset &amp; Transport Engine
          </button>
          <button
            type="button"
            onClick={() => setMode('composition')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              mode === 'composition'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Predictive Composition Model
          </button>
        </div>
      </div>

      {/* MODE 1: Dataset & Transport Properties Calculation */}
      {mode === 'dataset' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Dataset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Select Fluid Model</label>
                <select
                  value={selectedDatasetId}
                  onChange={e => {
                    setSelectedDatasetId(e.target.value);
                    const ds = datasets.find(d => d.metadata.id === e.target.value);
                    if (ds) {
                      const [nMin, nMax] = ds.metadata.applicableTempRange;
                      setTargetTemp(prev => Math.min(nMax, Math.max(nMin, prev)));
                    }
                  }}
                  className="w-full text-xs font-medium bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {datasets.map(d => (
                    <option key={d.metadata.id} value={d.metadata.id} className="bg-slate-900 text-slate-100">
                      {d.metadata.name} [{d.metadata.applicableTempRange[0]}–{d.metadata.applicableTempRange[1]} °C]
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">
                  Applicable Range: <strong className="text-slate-200">{minT} °C to {maxT} °C</strong>
                </span>
              </div>

              {/* Temperature Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Target Temperature (T)</span>
                  <span className="font-mono text-teal-300 text-sm">{targetTemp.toFixed(1)} °C ({(targetTemp + 273.15).toFixed(2)} K)</span>
                </div>
                <input
                  type="range"
                  min={minT}
                  max={maxT}
                  step={0.5}
                  value={targetTemp}
                  onChange={e => setTargetTemp(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{minT} °C</span>
                  <div className="flex space-x-1">
                    {[20, 30, 37, 50].filter(t => t >= minT && t <= maxT).map(presetT => (
                      <button
                        key={presetT}
                        type="button"
                        onClick={() => setTargetTemp(presetT)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-teal-500/20 hover:text-teal-300 font-sans border border-slate-700"
                      >
                        {presetT}°C {presetT === 37 ? '(Physio)' : ''}
                      </button>
                    ))}
                  </div>
                  <span>{maxT} °C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Thermophysical Properties Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Primary Thermophysical Properties at T = {targetTemp.toFixed(1)} °C</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Density */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400 uppercase">1. Density (&rho;)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold font-mono border border-indigo-500/30">
                    kg/m³
                  </span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {transportProps.density.toFixed(2)} <span className="text-xs font-normal text-slate-400">kg/m³</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                  d&rho;/dT &approx; {transportProps.dDensity_dT ? transportProps.dDensity_dT.toFixed(3) : 'N/A'} kg/(m³·K)
                </div>
                <p className="text-[10px] text-slate-500">
                  Thermal expansion &beta; = {transportProps.thermalExpansionCoeff ? transportProps.thermalExpansionCoeff.toExponential(3) : 'N/A'} K⁻¹
                </p>
              </div>

              {/* 2. Specific Heat Capacity */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400 uppercase">2. Specific Heat (Cp)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold font-mono border border-teal-500/30">
                    J/(kg·K)
                  </span>
                </div>
                <div className="text-2xl font-black text-teal-300 font-mono">
                  {transportProps.specificHeat.toFixed(1)} <span className="text-xs font-normal text-slate-400">J/kg·K</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                  dCp/dT &approx; {transportProps.dSpecificHeat_dT ? transportProps.dSpecificHeat_dT.toFixed(3) : 'N/A'} J/(kg·K²)
                </div>
                <p className="text-[10px] text-slate-500">
                  Caloric heat capacity kernel in &int; Cp(T) dT
                </p>
              </div>

              {/* 3. Thermal Conductivity */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400 uppercase">3. Conductivity (k)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold font-mono border border-amber-500/30">
                    W/(m·K)
                  </span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {transportProps.conductivity.toFixed(3)} <span className="text-xs font-normal text-slate-400">W/m·K</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                  dk/dT &approx; {transportProps.dConductivity_dT ? transportProps.dConductivity_dT.toFixed(4) : 'N/A'} W/(m·K²)
                </div>
                <p className="text-[10px] text-slate-500">
                  Fourier rate of conductive heat conduction
                </p>
              </div>

              {/* 4. Dynamic Viscosity */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400 uppercase">4. Viscosity (&mu;)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold font-mono border border-sky-500/30">
                    Pa·s / cP
                  </span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {(transportProps.viscosity * 1000).toFixed(3)} <span className="text-xs font-normal text-slate-400">mPa·s (cP)</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                  = {transportProps.viscosity.toFixed(6)} Pa·s
                </div>
                <p className="text-[10px] text-slate-500">
                  d&mu;/dT &approx; {transportProps.dViscosity_dT ? (transportProps.dViscosity_dT * 1000).toFixed(4) : 'N/A'} mPa·s/K
                </p>
              </div>
            </div>
          </div>

          {/* Derived Transport & Dimensionless Numbers Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>Derived Transport Parameters &amp; Dimensionless Numbers</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              {/* Thermal Diffusivity α */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-start font-sans">
                  <span className="font-bold text-slate-300">Thermal Diffusivity (&alpha;)</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">m²/s</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {transportProps.thermalDiffusivity.toExponential(4)} <span className="text-xs text-slate-400">m²/s</span>
                </div>
                <p className="font-sans text-[11px] text-slate-400 pt-1 border-t border-slate-800 leading-relaxed">
                  &alpha; = k / (&rho;·Cp). Measures rate of thermal propagation relative to energy storage.
                </p>
              </div>

              {/* Kinematic Viscosity ν */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-start font-sans">
                  <span className="font-bold text-slate-300">Kinematic Viscosity (&nu;)</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">cSt</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {transportProps.kinematicViscosityCSt.toFixed(3)} <span className="text-xs text-slate-400">cSt</span>
                </div>
                <p className="font-sans text-[11px] text-slate-400 pt-1 border-t border-slate-800 leading-relaxed">
                  &nu; = &mu; / &rho; ({transportProps.kinematicViscosity.toExponential(3)} m²/s). Momentum diffusivity for Reynolds calculations.
                </p>
              </div>

              {/* Prandtl Number Pr */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-start font-sans">
                  <span className="font-bold text-slate-300">Prandtl Number (Pr)</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-500/30">Dimensionless</span>
                </div>
                <div className="text-xl font-black text-teal-300">
                  {transportProps.prandtlNumber.toFixed(2)}
                </div>
                <p className="font-sans text-[11px] text-slate-400 pt-1 border-t border-slate-800 leading-relaxed">
                  Pr = (&mu;·Cp)/k = &nu;/&alpha;. Ratio of momentum to thermal boundary layer thickness (&delta;/&delta;_t &approx; Pr^(1/3)).
                </p>
              </div>

              {/* Volumetric Heat Capacity Cv */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-start font-sans">
                  <span className="font-bold text-slate-300">Volumetric Heat Cap (Cv)</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">kJ/(m³·K)</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {transportProps.volumetricHeatCapacityKJ.toFixed(1)} <span className="text-xs text-slate-400">kJ/m³·K</span>
                </div>
                <p className="font-sans text-[11px] text-slate-400 pt-1 border-t border-slate-800 leading-relaxed">
                  Cv = &rho;·Cp. Thermal storage capacity per unit volume of bioprocess reactor.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Choi & Okos Predictive Biofluid Model */}
      {mode === 'composition' && (
        <div className="space-y-6">
          {/* Preset Buttons */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase">Load Biofluid Composition Presets</span>
              <span className="text-[10px] text-slate-400 font-mono">Choi &amp; Okos (1986) Formulation</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset(100, 0, 0, 0, 0, 25)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 border border-slate-800"
              >
                Pure Water (100% Water, 25°C)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(91, 7, 1, 0, 1, 37)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 border border-slate-800"
              >
                Human Blood/Plasma Simulant (91% W, 7% P, 1% C, 1% Ash, 37°C)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(86, 9, 3, 1, 1, 30)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 border border-slate-800"
              >
                Yeast Fermentation Broth (86% W, 9% P, 3% C, 1% Fat, 1% Ash, 30°C)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(80, 18, 0.5, 0.5, 1, 20)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 border border-slate-800"
              >
                Biotherapeutic Protein Concentrate (80% W, 18% Protein, 20°C)
              </button>
            </div>
          </div>

          {/* Composition Sliders & Temperature */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                <span>Component Mass Fractions (%)</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Water */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-300">Water (X_w)</span>
                    <span className="font-mono font-bold text-teal-300">{waterPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={waterPct}
                    onChange={e => setWaterPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Protein */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-300">Protein (X_p)</span>
                    <span className="font-mono font-bold text-teal-300">{proteinPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={proteinPct}
                    onChange={e => setProteinPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Carbohydrates */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-300">Carbohydrates / Sugars (X_c)</span>
                    <span className="font-mono font-bold text-teal-300">{carbPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={carbPct}
                    onChange={e => setCarbPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Fat / Lipids */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-300">Fat / Lipids (X_f)</span>
                    <span className="font-mono font-bold text-teal-300">{fatPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={fatPct}
                    onChange={e => setFatPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Minerals / Ash */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-300">Ash / Salts (X_a)</span>
                    <span className="font-mono font-bold text-teal-300">{ashPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={ashPct}
                    onChange={e => setAshPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Temperature */}
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-300">Temperature (T)</span>
                    <span className="font-mono font-bold text-teal-300">{compTemp}°C ({(compTemp + 273.15).toFixed(2)} K)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="0.5"
                    value={compTemp}
                    onChange={e => setCompTemp(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateDatasetFromComposition}
                className="w-full py-2.5 bg-teal-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-teal-400 transition-colors shadow-md shadow-teal-500/20 flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Model as Custom Dataset</span>
              </button>
            </div>

            {/* Right Results (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Computed 4 Properties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Predicted Density (&rho;)</span>
                  <div className="text-xl font-bold text-white font-mono">{compResult.density.toFixed(2)} kg/m³</div>
                  <span className="text-[10px] text-slate-400 font-sans">1/&rho; = &Sigma;(X_i / &rho;_i)</span>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Predicted Specific Heat (Cp)</span>
                  <div className="text-xl font-bold text-teal-300 font-mono">{compResult.specificHeat.toFixed(1)} J/kg·K</div>
                  <span className="text-[10px] text-slate-400 font-sans">Cp = &Sigma;(X_i &middot; Cp_i)</span>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Predicted Conductivity (k)</span>
                  <div className="text-xl font-bold text-white font-mono">{compResult.conductivity.toFixed(3)} W/m·K</div>
                  <span className="text-[10px] text-slate-400 font-sans">k = &Sigma;(X_i &middot; k_i)</span>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Predicted Viscosity (&mu;)</span>
                  <div className="text-xl font-bold text-white font-mono">{(compResult.viscosity * 1000).toFixed(3)} mPa·s</div>
                  <span className="text-[10px] text-slate-400 font-sans">{compResult.viscosity.toFixed(6)} Pa·s</span>
                </div>
              </div>

              {/* Working Substitutions */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3 text-xs font-mono">
                <h4 className="font-sans font-bold text-slate-200 text-xs">Choi &amp; Okos Component Model Substitutions</h4>
                
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
                  <span className="font-sans font-semibold text-slate-400 text-[10px]">Density Formulation:</span>
                  <p className="text-slate-200 text-[11px] break-all">{compResult.workingSubstitutions.densityFormula}</p>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
                  <span className="font-sans font-semibold text-slate-400 text-[10px]">Specific Heat Formulation:</span>
                  <p className="text-slate-200 text-[11px] break-all">{compResult.workingSubstitutions.cpFormula}</p>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
                  <span className="font-sans font-semibold text-slate-400 text-[10px]">Thermal Conductivity Formulation:</span>
                  <p className="text-slate-200 text-[11px] break-all">{compResult.workingSubstitutions.kFormula}</p>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
                  <span className="font-sans font-semibold text-slate-400 text-[10px]">Dynamic Viscosity Suspension Model:</span>
                  <p className="text-slate-200 text-[11px] break-all">{compResult.workingSubstitutions.viscosityFormula}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
