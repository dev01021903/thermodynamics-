import React, { createContext, useContext, useState, useEffect } from 'react';
import { LiteraturePaper } from '../types/literature';

const INITIAL_PAPERS: LiteraturePaper[] = [
  {
    id: 'paper-1',
    slotNumber: 1,
    slotTheme: 'Paper 1: Temperature-Dependent Thermophysical Properties',
    title: 'Thermophysical properties of biological tissues and biofluids across physiological temperature ranges',
    authors: 'Valvano, J.W. et al.',
    citation: 'Valvano, J.W., Cochran, J.R., & Diller, K.R. (1985). Thermal conductivity and thermal diffusivity of biomaterials. International Journal of Thermophysics, 6(3), 301-311.',
    doiOrUrl: 'https://doi.org/10.1007/BF00522151',
    fluidSystem: 'Aqueous biological solutions & biomaterial simulants',
    temperatureRange: '15 °C to 45 °C',
    methodDescription: 'Self-heated thermistor probe technique measuring thermal conductivity and thermal diffusivity.',
    reportedValuesOrTrends: 'Reports moderate rise in thermal conductivity with temperature (~0.50 to 0.54 W/m·K) and mild specific heat stability near 3600-4180 J/kg·K.',
    parityAssessment: 'Comparable',
    mismatchRationale: 'Baseline thermophysical trends match aqueous fluid model; slight variance due to macromolecular solute fraction.',
    studentNotes: 'Essential reference for parameterizing temperature-dependent conductivity and specific heat in biofluid models.',
    lastUpdated: '2026-01-01'
  },
  {
    id: 'paper-2',
    slotNumber: 2,
    slotTheme: 'Paper 2: Effects of Temperature on Blood Viscosity',
    title: 'Rheology of human blood and temperature dependence of whole blood viscosity',
    authors: 'Merrill, E.W. & Cokelet, G.R.',
    citation: 'Merrill, E.W. (1969). Rheology of human blood and some speculations on its role in vascular homeostasis. Biophysical Journal, 9(6), 849-864.',
    doiOrUrl: 'https://doi.org/10.1016/S0006-3495(69)86422-5',
    fluidSystem: 'Anticoagulated human whole blood & plasma',
    temperatureRange: '20 °C to 40 °C',
    methodDescription: 'Couette and capillary viscometry under controlled shear rates (1 to 200 s⁻¹).',
    reportedValuesOrTrends: 'Whole blood dynamic viscosity drops nonlinearly by ~40-50% when temperature rises from 20 °C to 40 °C (~4.5 mPa·s down to ~2.8 mPa·s at moderate shear).',
    parityAssessment: 'Comparable',
    mismatchRationale: 'Matches literature trends. Real blood is non-Newtonian (shear-thinning); our base model documents high-shear asymptotic dynamic viscosity.',
    studentNotes: 'Shows why viscosity is reported alongside thermal properties, though basic sensible heat integration depends solely on Cp(T).',
    lastUpdated: '2026-01-01'
  },
  {
    id: 'paper-3',
    slotNumber: 3,
    slotTheme: 'Paper 3: Entropy Generation in Blood-Flow Systems',
    title: 'Thermodynamic optimization and entropy generation minimization in biomedical heat exchange',
    authors: 'Bejan, A.',
    citation: 'Bejan, A. (1996). Entropy Generation Minimization: The Method of Thermodynamic Optimization of Finite-Size Systems and Finite-Time Processes. CRC Press.',
    doiOrUrl: 'https://doi.org/10.1201/9781482276534',
    fluidSystem: 'Heated/cooled flowing biofluids in conduit geometry',
    temperatureRange: '20 °C to 50 °C',
    methodDescription: 'Second-law thermodynamic analytical formulation evaluating thermal and viscous entropy generation components.',
    reportedValuesOrTrends: 'Demonstrates that temperature difference (Tr - T) drives thermal entropy generation, while viscous dissipation dominates at high flow rates.',
    parityAssessment: 'Qualitative Match',
    mismatchRationale: 'Our core simulation evaluates bulk thermal sensible heat entropy generation (fluid + thermal reservoir). Bejan flow models additionally incorporate viscous dissipation which requires duct geometry.',
    studentNotes: 'Confirms that passive heat transfer irreversibility increases monotonically with larger temperature difference between reservoir and fluid.',
    lastUpdated: '2026-01-01'
  },
  {
    id: 'paper-4',
    slotNumber: 4,
    slotTheme: 'Paper 4: Heat Transfer and Entropy Optimization in Blood-Based Fluids',
    title: 'Entropy generation analysis for peristaltic and boundary layer flow of biological nanofluids',
    authors: 'Akbar, N.S. & Butt, A.W.',
    citation: 'Akbar, N.S. et al. (2015). Entropy generation analysis for peristaltic flow of a biological fluid. International Journal of Heat and Mass Transfer, 82, 384-390.',
    doiOrUrl: 'https://doi.org/10.1016/j.ijheatmasstransfer.2014.11.053',
    fluidSystem: 'Biological fluids with magnetic/thermal particle enhancement',
    temperatureRange: '25 °C to 45 °C',
    methodDescription: 'Numerical PDE solutions for biofluid flow equations coupled with entropy generation minimization.',
    reportedValuesOrTrends: 'Entropy generation rate S_gen scales directly with temperature gradients and thermophysical property variations.',
    parityAssessment: 'Qualitative Match',
    mismatchRationale: 'Paper assumes continuous velocity profile in a channel; our dashboard evaluates closed-system lumped thermal state transitions.',
    studentNotes: 'Useful literature benchmark for discussing bioprocess optimization trade-offs in oral presentation.',
    lastUpdated: '2026-01-01'
  },
  {
    id: 'paper-5',
    slotNumber: 5,
    slotTheme: 'Paper 5: Computational / Data-Driven Heat Transfer and Entropy Analysis',
    title: 'Numerical evaluation of heat transfer and thermophysical property modeling in bioprocesses',
    authors: 'Doran, P.M. & Chato, J.C.',
    citation: 'Doran, P.M. (2013). Bioprocess Engineering Principles (2nd ed.). Academic Press, London.',
    doiOrUrl: 'https://doi.org/10.1016/C2009-0-02242-6',
    fluidSystem: 'Fermentation media, cell suspensions, and aqueous bioprocess fluids',
    temperatureRange: '10 °C to 65 °C',
    methodDescription: 'Thermodynamic heat balance formulation, cooling jacket heat transfer rate models, and numerical property integration.',
    reportedValuesOrTrends: 'Sensible heat requirements and cooling jacket thermal loads computed via integral of Cp(T)dT across transient fermentation heating cycles.',
    parityAssessment: 'Comparable',
    mismatchRationale: 'Our Simpson quadrature integral directly replicates the bioprocess energy balance methodology outlined in Doran Chapter 5.',
    studentNotes: 'Directly validates the computational sensible heat integral and reservoir entropy formulation used in this micro-project.',
    lastUpdated: '2026-01-01'
  }
];

const LIT_STORAGE_KEY = 'biotech_thermo_literature_papers_v1';

interface LiteratureContextType {
  papers: LiteraturePaper[];
  updatePaper: (paper: LiteraturePaper) => void;
  resetLiteratureToDefault: () => void;
}

const LiteratureContext = createContext<LiteratureContextType | undefined>(undefined);

export const LiteratureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [papers, setPapers] = useState<LiteraturePaper[]>(() => {
    try {
      const saved = localStorage.getItem(LIT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 5) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PAPERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LIT_STORAGE_KEY, JSON.stringify(papers));
    } catch (e) {
      console.error(e);
    }
  }, [papers]);

  const updatePaper = (updatedPaper: LiteraturePaper) => {
    setPapers(prev => prev.map(p => (p.id === updatedPaper.id ? { ...updatedPaper, lastUpdated: new Date().toISOString().split('T')[0] } : p)));
  };

  const resetLiteratureToDefault = () => {
    setPapers(INITIAL_PAPERS);
  };

  return (
    <LiteratureContext.Provider value={{ papers, updatePaper, resetLiteratureToDefault }}>
      {children}
    </LiteratureContext.Provider>
  );
};

export const useLiterature = () => {
  const context = useContext(LiteratureContext);
  if (!context) throw new Error('useLiterature must be used within a LiteratureProvider');
  return context;
};
