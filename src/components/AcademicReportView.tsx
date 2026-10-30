import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useData } from '../context/DataContext';
import { useLiterature } from '../context/LiteratureContext';
import {
  Printer,
  FileText
} from 'lucide-react';

export const AcademicReportView: React.FC = () => {
  const { activeDataset } = useData();
  const { inputs, result } = useSimulation();
  const { papers } = useLiterature();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-2">
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>Formal Academic Documentation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Project Report &amp; Examination Dossier</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Comprehensive synthesis of thermodynamic theory, active simulation data, bioprocess analysis, and literature benchmarking.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 text-xs sm:text-sm font-bold hover:bg-teal-400 shadow-md shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Report Document Container */}
      <article className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-8 sm:p-12 space-y-10 text-slate-200 max-w-5xl mx-auto print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <header className="border-b-2 border-slate-800 print:border-slate-900 pb-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400 print:text-teal-700">
                Biotechnology Academic Micro-Project Report
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-900 leading-tight">
                Development of a Thermodynamic Framework to Evaluate Entropy Generation, Heat Transfer, and Thermophysical Properties of Biological Fluids Under Varying Temperature Conditions
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-3 border-t border-slate-800 print:border-slate-200 text-slate-400 print:text-slate-600">
            <div>
              <span className="font-sans text-slate-500 block text-[10px]">Framework Version</span>
              <span className="font-bold text-slate-200 print:text-slate-800">1.0.0 (Vite/React Engine)</span>
            </div>
            <div>
              <span className="font-sans text-slate-500 block text-[10px]">Generation Date</span>
              <span className="font-bold text-slate-200 print:text-slate-800">{new Date().toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-sans text-slate-500 block text-[10px]">Evaluated Fluid</span>
              <span className="font-bold text-teal-300 print:text-slate-800">{activeDataset.metadata.name}</span>
            </div>
            <div>
              <span className="font-sans text-slate-500 block text-[10px]">Dataset Nature</span>
              <span className="font-bold text-slate-200 print:text-slate-800">{activeDataset.metadata.isDemo ? 'Illustrative Model' : 'Literature Reference'}</span>
            </div>
          </div>
        </header>

        {/* Section 1: Executive Summary & Rationale */}
        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-1">
            1. Executive Summary &amp; Scientific Rationale
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-300 print:text-slate-700">
            Thermal operations in biotechnology—ranging from bioreactor cooling jackets and fermentation thermal management to downstream chromatography and cryopreservation protocols—require accurate evaluation of both energy balances (First Law) and thermodynamic irreversibilities (Second Law). Because biological fluids possess temperature-sensitive thermophysical properties (specifically dynamic viscosity &mu;(T) and specific heat Cp(T)), constant-property assumptions often fail to capture true process dynamics.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-300 print:text-slate-700">
            This micro-project provides an educational, mathematically transparent computational framework. By numerically integrating published and user-entered thermophysical data, the platform determines sensible heat additions (Q), fluid entropy changes (&Delta;S_fluid), external thermal reservoir interactions (&Delta;S_reservoir), and net entropy generation (S_gen), establishing direct linkage with bioprocess thermodynamics.
          </p>
        </section>

        {/* Section 2: Course Outcomes Assessment */}
        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-1">
            2. Course Outcomes (CO) Curriculum Mapping
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-200 bg-slate-950/60 print:bg-slate-50 space-y-2">
              <span className="font-bold text-teal-300 print:text-teal-800 text-[11px] block">CO-2: Calorimetry &amp; Energy Changes</span>
              <p className="text-slate-400 print:text-slate-600 text-[11px] leading-relaxed">
                Evaluates Sensible Heat Q = m &int; Cp(T) dT using composite numerical quadrature, proving energy conservation across heating and cooling thermal paths.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-200 bg-slate-950/60 print:bg-slate-50 space-y-2">
              <span className="font-bold text-cyan-300 print:text-cyan-800 text-[11px] block">CO-3: Entropy Changes &amp; Behavior</span>
              <p className="text-slate-400 print:text-slate-600 text-[11px] leading-relaxed">
                Evaluates fluid entropy &Delta;S_fluid = m &int; [Cp(T)/T] dT in Kelvin, reservoir interaction &Delta;S_res = -Q/Tr, and verifies Second Law validity (S_gen &ge; 0).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-200 bg-slate-950/60 print:bg-slate-50 space-y-2">
              <span className="font-bold text-emerald-300 print:text-emerald-800 text-[11px] block">CO-4: Thermophysical Properties</span>
              <p className="text-slate-400 print:text-slate-600 text-[11px] leading-relaxed">
                Analyzes temperature-dependent variations in density &rho;(T), specific heat Cp(T), thermal conductivity k(T), and dynamic viscosity &mu;(T) across bioprocess fluids.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Governing Mathematical Equations */}
        <section className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-1">
            3. Governing Thermodynamic Formulations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-200 bg-slate-950/60 print:bg-slate-50 space-y-1">
              <span className="font-sans font-bold text-white print:text-slate-900 text-xs">1. Sensible Heat Transfer (First Law)</span>
              <p className="text-teal-300 print:text-teal-900 font-bold">Q = m &int; Cp(T) dT</p>
              <p className="font-sans text-[11px] text-slate-400 print:text-slate-600 pt-1">
                For constant Cp: Q = m Cp (T2 - T1). For variable Cp(T), evaluated via composite Simpson’s 1/3 quadrature.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-200 bg-slate-950/60 print:bg-slate-50 space-y-1">
              <span className="font-sans font-bold text-white print:text-slate-900 text-xs">2. Fluid Entropy Change</span>
              <p className="text-teal-300 print:text-teal-900 font-bold">&Delta;S_fluid = m &int; [Cp(T) / (T + 273.15)] dT</p>
              <p className="font-sans text-[11px] text-slate-400 print:text-slate-600 pt-1">
                Calculated strictly with absolute temperature T in Kelvin. For constant Cp: &Delta;S = m Cp ln(T2_K/T1_K).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-200 bg-slate-950/60 print:bg-slate-50 space-y-1">
              <span className="font-sans font-bold text-white print:text-slate-900 text-xs">3. Thermal Reservoir Entropy Change</span>
              <p className="text-teal-300 print:text-teal-900 font-bold">&Delta;S_reservoir = -Q / (Tr + 273.15)</p>
              <p className="font-sans text-[11px] text-slate-400 print:text-slate-600 pt-1">
                Represents reversible heat exchange with an idealized constant-temperature reservoir at Tr in Kelvin.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-200 bg-slate-950/60 print:bg-slate-50 space-y-1">
              <span className="font-sans font-bold text-white print:text-slate-900 text-xs">4. Total Entropy Generation (Second Law)</span>
              <p className="text-teal-300 print:text-teal-900 font-bold">S_gen = &Delta;S_fluid + &Delta;S_reservoir &ge; 0</p>
              <p className="font-sans text-[11px] text-slate-400 print:text-slate-600 pt-1">
                Quantifies the thermal irreversibility generated by heat transfer across a finite temperature difference &Delta;T = |Tr - T_fluid|.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Active Simulation Results Dossier */}
        <section className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-1">
            4. Active Simulation Evaluation &amp; Numerical Results
          </h2>

          <div className="p-4 rounded-xl border border-slate-800 print:border-slate-200 bg-slate-950/60 print:bg-slate-50 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <span className="font-sans text-slate-500 block text-[10px]">Initial Temp T1</span>
                <span className="font-bold text-white print:text-slate-900">{inputs.initialTemp} °C ({(inputs.initialTemp + 273.15).toFixed(2)} K)</span>
              </div>
              <div>
                <span className="font-sans text-slate-500 block text-[10px]">Final Temp T2</span>
                <span className="font-bold text-white print:text-slate-900">{inputs.finalTemp} °C ({(inputs.finalTemp + 273.15).toFixed(2)} K)</span>
              </div>
              <div>
                <span className="font-sans text-slate-500 block text-[10px]">Fluid Mass m</span>
                <span className="font-bold text-white print:text-slate-900">{inputs.mass} kg</span>
              </div>
              <div>
                <span className="font-sans text-slate-500 block text-[10px]">Reservoir Tr</span>
                <span className="font-bold text-white print:text-slate-900">{inputs.reservoirTemp} °C ({(inputs.reservoirTemp + 273.15).toFixed(2)} K)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 print:border-slate-200 font-mono">
              <div>
                <span className="font-sans text-slate-500 block text-[10px]">Sensible Heat (Q)</span>
                <span className="font-bold text-teal-300 print:text-teal-800 text-sm">{result.sensibleHeatQkJ.toFixed(4)} kJ</span>
              </div>
              <div>
                <span className="font-sans text-slate-500 block text-[10px]">Fluid Entropy (&Delta;S_fluid)</span>
                <span className="font-bold text-white print:text-slate-900 text-sm">{result.fluidEntropyChange.toFixed(4)} J/K</span>
              </div>
              <div>
                <span className="font-sans text-slate-500 block text-[10px]">Reservoir Entropy (&Delta;S_res)</span>
                <span className="font-bold text-white print:text-slate-900 text-sm">{result.reservoirEntropyChange.toFixed(4)} J/K</span>
              </div>
              <div>
                <span className="font-sans text-slate-500 block text-[10px]">Entropy Generation (S_gen)</span>
                <span className="font-bold text-teal-300 print:text-teal-900 text-sm">{result.entropyGeneration.toFixed(4)} J/K</span>
              </div>
            </div>

            {result.hasDuration && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 print:border-slate-200 font-mono text-[11px]">
                <div>
                  <span className="font-sans text-slate-500 block text-[10px]">Average Heat Rate (q_dot_avg)</span>
                  <span className="font-bold text-slate-200 print:text-slate-800">{result.averageHeatTransferRate?.toFixed(2)} W</span>
                </div>
                <div>
                  <span className="font-sans text-slate-500 block text-[10px]">Average Entropy Gen Rate (S_dot_gen_avg)</span>
                  <span className="font-bold text-slate-200 print:text-slate-800">{result.averageEntropyGenRate?.toFixed(6)} W/K</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: Bioprocess Applications */}
        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-1">
            5. Biotechnology Applications &amp; Engineering Analysis
          </h2>
          <div className="space-y-2 text-xs text-slate-300 print:text-slate-700 leading-relaxed">
            <p>
              <strong>Bioreactor Temperature Control:</strong> In large-scale aerobic fermentations, microbial heat release requires continuous heat removal through cooling jackets. Because viscosity &mu;(T) drops by ~40% between 20 °C and 40 °C, fluid resistance decreases at higher operating temperatures, while the driving temperature difference between the broth and chilled water determines the entropy generation rate (S_gen).
            </p>
            <p>
              <strong>Thermodynamic Optimization:</strong> Minimizing entropy generation (S_gen) during bioprocess heating and cooling corresponds directly to minimizing thermodynamic irreversibility and operational energy loss.
            </p>
          </div>
        </section>

        {/* Section 6: Assumptions and Limitations */}
        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-1">
            6. Assumptions &amp; Limitations of the Computational Model
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 print:text-slate-600">
            <div className="space-y-1">
              <strong className="text-slate-200 print:text-slate-800 block">Thermodynamic Assumptions:</strong>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Lumped single-phase fluid mass without phase transitions.</li>
                <li>Ideal constant-temperature thermal reservoir with infinite thermal capacity.</li>
                <li>Reversible Kelvin integration with piecewise interpolation.</li>
              </ul>
            </div>
            <div className="space-y-1">
              <strong className="text-slate-200 print:text-slate-800 block">Scope Limitations:</strong>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Base model excludes geometric conduit flow and viscous dissipation friction.</li>
                <li>Does not perform wet-lab sample testing or clinical measurements.</li>
                <li>Temperature extrapolation outside dataset bounds is strictly forbidden.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 7: Literature Review Summary */}
        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-1">
            7. Literature Benchmark Summary (Papers 1–5)
          </h2>
          <div className="space-y-2 text-xs">
            {papers.map(p => (
              <div key={p.id} className="p-3 rounded-lg border border-slate-800 print:border-slate-200 bg-slate-950/60 print:bg-white space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white print:text-slate-900">
                    Paper #{p.slotNumber}: {p.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 print:bg-slate-100 text-slate-300 print:text-slate-700">
                    {p.parityAssessment}
                  </span>
                </div>
                <p className="text-slate-500 font-mono text-[10px]">{p.citation}</p>
                <p className="text-slate-400 print:text-slate-600 text-[11px]">{p.reportedValuesOrTrends}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: Biotechnology Thermodynamics Glossary */}
        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-1">
            8. Biotechnology Thermodynamics Glossary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 print:text-slate-700">
            <div className="p-3 bg-slate-950/60 print:bg-slate-50 rounded-lg border border-slate-800 print:border-slate-100">
              <strong className="text-teal-400 print:text-teal-900 block">Sensible Heat (Q):</strong>
              Thermal energy exchanged by a body that causes a temperature change without changing its chemical identity or phase state. Units: Joules (J) or kilojoules (kJ).
            </div>
            <div className="p-3 bg-slate-950/60 print:bg-slate-50 rounded-lg border border-slate-800 print:border-slate-100">
              <strong className="text-teal-400 print:text-teal-900 block">Specific Heat Capacity (Cp):</strong>
              The amount of thermal energy required to raise the temperature of 1 kg of a substance by 1 Kelvin at constant pressure. Units: J/(kg·K).
            </div>
            <div className="p-3 bg-slate-950/60 print:bg-slate-50 rounded-lg border border-slate-800 print:border-slate-100">
              <strong className="text-teal-400 print:text-teal-900 block">Dynamic Viscosity (&mu;):</strong>
              Measure of a fluid&apos;s internal resistance to flow under applied shear stress. Decreases substantially with temperature in aqueous biological fluids. Units: Pa·s.
            </div>
            <div className="p-3 bg-slate-950/60 print:bg-slate-50 rounded-lg border border-slate-800 print:border-slate-100">
              <strong className="text-teal-400 print:text-teal-900 block">Entropy Generation (S_gen):</strong>
              The amount of entropy created by irreversible processes (finite-temperature heat transfer, mixing, friction) in a combined system. Always non-negative (S_gen &ge; 0) by the Second Law. Units: J/K.
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};
