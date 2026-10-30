import React from 'react';
import { TabType } from './Header';
import {
  Flame,
  Award,
  ArrowRight,
  BookOpen,
  Database,
  BarChart2,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  Calculator
} from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/80 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-teal-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold tracking-wide">
            <Flame className="w-3.5 h-3.5 text-teal-400" />
            <span>Biotechnology Thermodynamic Micro-Project</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Development of a Thermodynamic Framework to Evaluate Entropy Generation, Heat Transfer, and Thermophysical Properties of Biological Fluids Under Varying Temperature Conditions
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            A computational and educational platform designed to explore temperature-dependent fluid properties (&rho;, Cp, k, &mu;), evaluate sensible heat exchange (Q = m &int; Cp(T) dT), and quantify Second-Law entropy generation (S_gen = &Delta;S_fluid + &Delta;S_reservoir) across bioprocessing and biofluid thermal regimes.
          </p>

          <div className="flex flex-wrap gap-3.5 pt-2">
            <button
              onClick={() => setActiveTab('simulation')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02]"
            >
              <span>Launch Simulation Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-sm border border-slate-700 transition-all hover:scale-[1.02]"
            >
              <Calculator className="w-4 h-4 text-teal-400" />
              <span>Property Calculator (&rho;, Cp, k, &mu;)</span>
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all hover:scale-[1.02]"
            >
              <Database className="w-4 h-4 text-teal-400" />
              <span>Property Data Manager</span>
            </button>
          </div>

          {/* Ethics & Provenance Notice */}
          <div className="pt-3 flex items-start space-x-3 text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-slate-200">Data Provenance &amp; Modeling Scope:</span> This project is a computational framework utilizing published thermophysical data from literature and user-entered datasets. It operates with mathematical models (numerical quadrature and Second Law balances) and does not claim experimental bench testing or clinical human sample collection.
            </p>
          </div>
        </div>
      </section>

      {/* Course Outcomes Mapping Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-teal-400" />
            <span>Curriculum &amp; Course Outcomes (CO) Alignment</span>
          </h2>
          <p className="text-xs text-slate-400">Explicit mapping of educational outcomes evaluated by this micro-project</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CO-2 */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm hover:border-teal-500/40 transition-all space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-1 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/20 text-xs font-bold uppercase tracking-wider mb-2">
                Course Outcome 2
              </span>
              <h3 className="font-bold text-white text-base">Energy Changes &amp; Calorimetry</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                <span className="font-semibold text-slate-200">CO-2:</span> Evaluate energy changes, thermal properties, and heat transfer using thermodynamic and calorimetric principles.
              </p>
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center text-[11px] text-teal-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-teal-400 shrink-0" />
                  <span>Calculates Q = m &int; Cp(T) dT via composite Simpson rule</span>
                </div>
                <div className="flex items-center text-[11px] text-teal-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-teal-400 shrink-0" />
                  <span>Compares constant Cp vs variable Cp(T) calorimetric loads</span>
                </div>
              </div>
            </div>
          </div>

          {/* CO-3 */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm hover:border-cyan-500/40 transition-all space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-2">
                Course Outcome 3
              </span>
              <h3 className="font-bold text-white text-base">Entropy &amp; Thermodynamic Behaviour</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                <span className="font-semibold text-slate-200">CO-3:</span> Evaluate heat transfer, entropy changes, and thermodynamic behaviour in biological systems.
              </p>
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center text-[11px] text-cyan-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400 shrink-0" />
                  <span>Evaluates &Delta;S_fluid, &Delta;S_reservoir, and S_gen</span>
                </div>
                <div className="flex items-center text-[11px] text-cyan-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400 shrink-0" />
                  <span>Enforces Second Law passive direction safeguards (S_gen &ge; 0)</span>
                </div>
              </div>
            </div>
          </div>

          {/* CO-4 */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
                Course Outcome 4
              </span>
              <h3 className="font-bold text-white text-base">Thermophysical Properties in Bioprocesses</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                <span className="font-semibold text-slate-200">CO-4:</span> Evaluate thermophysical properties and behaviour of biological fluids in bioprocess systems.
              </p>
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center text-[11px] text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400 shrink-0" />
                  <span>Tracks &rho;(T), Cp(T), k(T), &mu;(T) across thermal regimes</span>
                </div>
                <div className="flex items-center text-[11px] text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400 shrink-0" />
                  <span>Integrates user-defined CSV datasets &amp; composition models</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rationale & Bioprocess Relevance */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">Project Rationale &amp; Scientific Context</h2>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            In biotechnology, bioprocess fluids (such as cell culture media, fermentation broths, protein solutions, and blood-derived biologics) undergo strict temperature regulation. Unlike simple ideal fluids, their thermophysical properties—particularly dynamic viscosity &mu;(T) and specific heat capacity Cp(T)—vary nonlinearly with temperature.
          </p>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            While first-law energy balances determine the total heat Q required for warming or cooling, they do not quantify the <span className="font-semibold text-teal-300">thermodynamic irreversibility</span> of the process. Evaluating entropy generation (S_gen) reveals the lost work and efficiency penalties associated with finite-temperature heat exchange between the fluid and its thermal reservoir.
          </p>
          <div className="bg-slate-950 border border-teal-500/20 rounded-xl p-3.5">
            <h4 className="text-xs font-bold text-teal-300 mb-1">Core Scientific Objective</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              To provide a transparent, unit-verified, and mathematically rigorous simulation framework that calculates sensible heat, fluid entropy changes, and entropy generation while demonstrating how thermophysical property variations govern bioprocess thermal behavior.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">Bioprocess &amp; Biotechnology Relevance</h2>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200">1. Bioreactor Thermal Control &amp; Fermentation</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Microbial metabolism generates significant metabolic heat. Maintaining tight temperature control (e.g. 37.0 &deg;C &plusmn; 0.2 &deg;C) requires accurate sensible heat integration and jacket cooling optimization to prevent localized overheating.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200">2. Downstream Purification &amp; Chromatography</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Biological macromolecules (monoclonal antibodies, recombinant enzymes) are thermo-labile. Viscosity decreases during heating, affecting column pressure drops, while entropy generation reflects process irreversibilities in heat exchangers.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200">3. Cryopreservation &amp; Controlled Thawing</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sensible heating rates and thermal entropy production during controlled warming protocols govern cell membrane integrity and cryoprotectant solution behavior.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200">4. Biomedical Heat Exchangers &amp; Extracorporeal Circuits</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Blood heating/cooling in dialyzers and cardiopulmonary bypass requires gentle heat exchange without causing thermal hemolysis or cellular shear degradation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Module Overview Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Platform Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('properties')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-teal-500/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Property Data Manager</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect datasets (Water, PBS Buffer, Blood Model, Fermentation Broth), upload CSVs, and configure interpolation.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('calculator')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-teal-500/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Property Calculator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluate &rho;, Cp, k, &mu;, thermal diffusivity &alpha;, kinematic viscosity &nu;, and Prandtl number Pr.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('simulation')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-teal-500/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Thermodynamic Simulation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluate Q, &Delta;S_fluid, &Delta;S_res, S_gen, rates, and inspect mathematical quadrature steps.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('visualizations')}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-teal-500/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Interactive Graphs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-axis property curves (&rho;, Cp, k, &mu; vs T), Q vs T2, and S_gen vs T2 parametric sweeps.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
