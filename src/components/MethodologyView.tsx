import React, { useState } from 'react';
import {
  Layers,
  Search,
  FileSpreadsheet,
  Cpu,
  PlayCircle,
  LineChart,
  GitCompare,
  FileCheck2,
  AlertTriangle,
  Info,
  Check,
  ChevronRight
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: 'Select Fluid Model',
      icon: <Layers className="w-5 h-5" />,
      tag: 'Definition',
      summary: 'Define fluid system (e.g. Pure Water reference, PBS buffer, blood-inspired literature model, fermentation broth) and applicable temperature limits.',
      details: [
        'Identify whether the fluid is a pure standard reference, an electrolyte buffer, a biomaterial simulant, or a microbial suspension.',
        'Define the applicable temperature window [T_min, T_max] to prevent invalid extrapolation.',
        'Establish fluid baseline composition and non-hazardous computational boundary.'
      ]
    },
    {
      step: 2,
      title: 'Review Literature',
      icon: <Search className="w-5 h-5" />,
      tag: 'Research',
      summary: 'Survey published thermophysical literature and bioheat transfer studies for validated property ranges and correlation equations.',
      details: [
        'Review peer-reviewed literature across thermophysical properties (Paper 1), blood rheology (Paper 2), entropy generation in biofluids (Paper 3 & 4), and bioprocess thermal balances (Paper 5).',
        'Record DOI, measurement techniques (e.g., thermistor probes, capillary viscometry, differential scanning calorimetry), and uncertainties.',
        'Ensure reported data represents bulk equilibrium thermodynamic properties.'
      ]
    },
    {
      step: 3,
      title: 'Organize & Standardize Data',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      tag: 'Data Prep',
      summary: 'Structure thermophysical property tables into standardized SI units (T in °C, ρ in kg/m³, Cp in J/kg·K, k in W/m·K, μ in Pa·s).',
      details: [
        'Tabulate temperature-dependent data points with strict monotonic temperature ordering.',
        'Validate physical bounds: positive density (> 0), specific heat capacity (> 0), conductivity (> 0), and viscosity (> 0).',
        'Select between Piecewise-Linear Interpolation and Direct Tabulated lookup modes.'
      ]
    },
    {
      step: 4,
      title: 'Formulate Thermodynamic Model',
      icon: <Cpu className="w-5 h-5" />,
      tag: 'Theory',
      summary: 'Derive the First and Second Law governing equations for sensible heat and entropy generation in a closed fluid mass.',
      details: [
        'First Law Energy Balance: Q = m ∫ Cp(T) dT from T1 to T2.',
        'Fluid Entropy Change: ΔS_fluid = m ∫ [Cp(T) / T] dT with T strictly in Kelvin (T_K = T_C + 273.15).',
        'Thermal Reservoir Entropy Change: ΔS_reservoir = -Q / T_r (where T_r is reservoir temperature in Kelvin).',
        'Second Law Entropy Generation: S_gen = ΔS_fluid + ΔS_reservoir ≥ 0 for passive irreversible heat exchange.'
      ]
    },
    {
      step: 5,
      title: 'Run Simulation',
      icon: <PlayCircle className="w-5 h-5" />,
      tag: 'Execution',
      summary: 'Execute numerical integration (composite Simpson’s 1/3 quadrature) across specified temperature intervals.',
      details: [
        'Discretize temperature interval into N = 100 subintervals for high numerical quadrature precision.',
        'Evaluate instantaneous and average heat transfer rates when process duration (Δt) and convective parameters (h, A) are specified.',
        'Enforce Second Law physical direction safeguards: flag non-physical scenarios (such as passive heating with a colder reservoir).'
      ]
    },
    {
      step: 6,
      title: 'Analyze Visualizations',
      icon: <LineChart className="w-5 h-5" />,
      tag: 'Analysis',
      summary: 'Examine multi-property trajectories (ρ, Cp, k, μ vs T), Q vs T2 curves, and entropy generation trends under varying reservoir conditions.',
      details: [
        'Assess temperature-dependent drop in dynamic viscosity μ(T) and its bioprocess transport implications.',
        'Inspect how larger temperature differences |Tr - T| sharply elevate entropy generation S_gen.',
        'Evaluate temperature sweeps across 20, 30, 40, 50, and 60 °C to map heating and cooling gradients.'
      ]
    },
    {
      step: 7,
      title: 'Compare with Literature',
      icon: <GitCompare className="w-5 h-5" />,
      tag: 'Validation',
      summary: 'Evaluate simulation outputs against published papers (Papers 1–5), distinguishing comparable models from condition mismatches.',
      details: [
        'Perform qualitative and quantitative trend comparisons with literature benchmark papers.',
        'Explicitly document mismatches (e.g. channel flow viscous dissipation vs lumped closed-system thermal balance).',
        'Ensure no fabricated validation claims are made for literature not entered by the user.'
      ]
    },
    {
      step: 8,
      title: 'Interpret & Document',
      icon: <FileCheck2 className="w-5 h-5" />,
      tag: 'Reporting',
      summary: 'Synthesize findings into an academic report with unit audits, step-by-step mathematical working, and bioprocess recommendations.',
      details: [
        'Export complete numerical results and temperature sweeps to standardized CSV files.',
        'Generate print-friendly academic report formatted for student evaluation and seminar presentation.',
        'Review Course Outcome (CO-2, CO-3, CO-4) fulfillment and document project limitations.'
      ]
    }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20">
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>Scientific Methodology</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">8-Step Computational &amp; Literature Workflow</h1>
        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
          A structured, literature-driven workflow designed to ensure thermodynamic rigor, mathematical transparency, and reproducibility without clinical or experimental bench claims.
        </p>
      </div>

      {/* Computational / Literature Workflow Disclaimer Banner */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-5 flex items-start space-x-4">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-200 leading-relaxed">
          <span className="font-bold text-amber-300 text-sm block">Computational &amp; Literature Scope Notice</span>
          <p>
            This workflow is <span className="font-semibold text-white">purely computational and literature-based</span>. It standardizes published thermophysical datasets and performs mathematical numerical integration of thermodynamic balance equations. It does <span className="underline text-amber-300">not</span> involve wet-lab biological sample extraction, clinical human trials, or physical experimental measurements.
          </p>
        </div>
      </div>

      {/* Interactive 8-Step Timeline & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Step Selector List (Left Column) */}
        <div className="lg:col-span-5 space-y-2.5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Workflow Steps (Click to inspect)</h2>
          {steps.map(s => {
            const isSelected = selectedStep === s.step;
            return (
              <div
                key={s.step}
                onClick={() => setSelectedStep(s.step)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-teal-500 shadow-md shadow-teal-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.step}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {s.title}
                      </h3>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-slate-800 text-slate-400">
                        {s.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{s.summary}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Step Deep Dive Panel (Right Column) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          {(() => {
            const current = steps.find(s => s.step === selectedStep) || steps[0];
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shadow-inner border border-teal-500/20">
                      {current.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">Step {current.step} of 8</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold">
                          {current.tag}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">{current.title}</h2>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Summary</h4>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800 font-medium">
                    {current.summary}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Implementation Procedures</h4>
                  <div className="space-y-2">
                    {current.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start space-x-3 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Next Step Action */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-xs">
                  <button
                    disabled={selectedStep === 1}
                    onClick={() => setSelectedStep(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
                  >
                    &larr; Previous Step
                  </button>
                  <span className="text-slate-500 font-mono">Step {selectedStep} / 8</span>
                  <button
                    disabled={selectedStep === 8}
                    onClick={() => setSelectedStep(prev => Math.min(8, prev + 1))}
                    className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-teal-400"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Assumptions and Limitations Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Assumptions */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-teal-400">
            <Info className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Key Thermodynamic Assumptions</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Lumped Closed System:</strong> Heat transfer occurs in a closed, non-reacting fluid mass m with no phase change across the investigated range.</span>
            </li>
            <li className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Ideal Constant-Temperature Reservoir:</strong> The external reservoir has infinite thermal capacity, remaining at uniform constant temperature Tr.</span>
            </li>
            <li className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Numerical Precision:</strong> Piecewise polynomial interpolation and composite Simpson quadrature are sufficient to resolve smooth continuous thermophysical variations.</span>
            </li>
            <li className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Sensible Energy Dominance:</strong> Heat exchange is governed strictly by Cp(T); pressure work and biochemical reaction enthalpies are isolated from the baseline thermal model.</span>
            </li>
          </ul>
        </div>

        {/* Limitations */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Computational &amp; Physical Limitations</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span><strong className="text-white">Composition Variance:</strong> Biological fluids (blood, media) exhibit natural batch-to-batch variability; literature datasets represent average baseline values.</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span><strong className="text-white">No Inherent Convection Geometry:</strong> Viscosity &mu;, conductivity k, and density &rho; are reported and graphed, but cannot determine a heat transfer coefficient h without defining pipe/vessel geometry, flow velocity, and Nusselt correlations.</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span><strong className="text-white">Viscous Dissipation Omission:</strong> The base model computes thermal entropy generation; fluid friction entropy generation requires hydrodynamic velocity profiles.</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span><strong className="text-white">Zero Extrapolation Guarantee:</strong> The platform will strictly refuse to evaluate temperatures outside the verified input table range to prevent non-physical artifacts.</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};
