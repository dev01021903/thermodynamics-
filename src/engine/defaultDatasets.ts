import { FluidDataset } from '../types/dataset';

export const DEFAULT_DATASETS: FluidDataset[] = [
  {
    metadata: {
      id: 'water-standard-ref',
      name: 'Water (Standard Thermophysical Reference)',
      description: 'Standard liquid water properties from NIST/IAPWS formulations across bioprocess-relevant range (10 °C to 70 °C). Used as primary baseline reference.',
      sourceCitation: 'NIST Chemistry WebBook / IAPWS-95 Formulation for General and Scientific Use.',
      publicationDetails: 'Wagner, W. and Pruß, A., J. Phys. Chem. Ref. Data 31, 387 (2002).',
      applicableTempRange: [10, 70],
      measurementMethod: 'IAPWS Standard Formulation & Precision Calorimetry Reference Data',
      notes: 'Standard reference fluid for thermodynamic validation and instrument calibration.',
      isDemo: false,
      interpolationMode: 'linear',
      createdAt: '2026-01-01'
    },
    dataPoints: [
      { temperature: 10, density: 999.70, specificHeat: 4192.1, conductivity: 0.580, viscosity: 0.001307 },
      { temperature: 20, density: 998.20, specificHeat: 4181.8, conductivity: 0.598, viscosity: 0.001002 },
      { temperature: 30, density: 995.65, specificHeat: 4178.4, conductivity: 0.615, viscosity: 0.000798 },
      { temperature: 37, density: 993.33, specificHeat: 4178.0, conductivity: 0.628, viscosity: 0.000691 },
      { temperature: 40, density: 992.22, specificHeat: 4178.5, conductivity: 0.631, viscosity: 0.000653 },
      { temperature: 50, density: 988.04, specificHeat: 4180.6, conductivity: 0.644, viscosity: 0.000547 },
      { temperature: 60, density: 983.20, specificHeat: 4184.3, conductivity: 0.654, viscosity: 0.000467 },
      { temperature: 70, density: 977.77, specificHeat: 4189.5, conductivity: 0.663, viscosity: 0.000404 }
    ]
  },
  {
    metadata: {
      id: 'pbs-buffer-demo',
      name: 'Phosphate-Buffered Saline (1X PBS Buffer - Illustrative Demo)',
      description: 'Illustrative model of aqueous 1X PBS buffer (pH 7.4) commonly used in bioprocessing, cell culture washing, and protein formulation. Model derived from aqueous electrolyte correlation.',
      sourceCitation: 'Illustrative model approximating standard bioprocess salt solution (137 mM NaCl, 2.7 mM KCl, 10 mM Phosphate).',
      publicationDetails: 'Bioprocess Engineering Handbooks & Aqueous Solution Thermophysical Properties Literature.',
      applicableTempRange: [10, 60],
      measurementMethod: 'Empirical electrolyte correlation for dilute physiological saline',
      notes: 'Illustrative dataset. Demonstrates slightly higher density and reduced specific heat capacity compared to pure water.',
      isDemo: true,
      interpolationMode: 'linear',
      createdAt: '2026-01-01'
    },
    dataPoints: [
      { temperature: 10, density: 1007.8, specificHeat: 4140.0, conductivity: 0.584, viscosity: 0.001335 },
      { temperature: 20, density: 1006.2, specificHeat: 4132.0, conductivity: 0.602, viscosity: 0.001025 },
      { temperature: 30, density: 1003.5, specificHeat: 4130.0, conductivity: 0.619, viscosity: 0.000818 },
      { temperature: 37, density: 1001.0, specificHeat: 4131.0, conductivity: 0.631, viscosity: 0.000710 },
      { temperature: 40, density: 999.8,  specificHeat: 4132.0, conductivity: 0.635, viscosity: 0.000672 },
      { temperature: 50, density: 995.4,  specificHeat: 4137.0, conductivity: 0.648, viscosity: 0.000564 },
      { temperature: 60, density: 990.2,  specificHeat: 4145.0, conductivity: 0.658, viscosity: 0.000482 }
    ]
  },
  {
    metadata: {
      id: 'blood-plasma-lit-demo',
      name: 'Whole Blood / Plasma Literature Model (Illustrative Demo)',
      description: 'Illustrative computational model parameterized after literature data for normal hematocrit (Hct ~ 40-45%) blood and plasma thermal behavior. For pedagogical demonstration only.',
      sourceCitation: 'Adapted from representative thermal properties of biological tissues and fluids in bioheat transfer literature (e.g., Duck 1990; Valvano et al. 1985; Merrill 1969).',
      publicationDetails: 'Duck, F.A., Physical Properties of Tissue, Academic Press (1990); Chato, J.C., Heat Transfer in Bioengineering (1980).',
      applicableTempRange: [20, 50],
      measurementMethod: 'Literature compiled thermophysical averages & Arrhenius-type shear viscosity fit',
      notes: 'Illustrative model for coursework. Does NOT represent clinical sample testing. Shows non-Newtonian baseline viscosity at moderate shear rate.',
      isDemo: true,
      interpolationMode: 'linear',
      createdAt: '2026-01-01'
    },
    dataPoints: [
      { temperature: 20, density: 1060.0, specificHeat: 3650.0, conductivity: 0.505, viscosity: 0.004500 },
      { temperature: 25, density: 1058.0, specificHeat: 3640.0, conductivity: 0.512, viscosity: 0.003950 },
      { temperature: 30, density: 1055.5, specificHeat: 3635.0, conductivity: 0.520, viscosity: 0.003500 },
      { temperature: 37, density: 1052.0, specificHeat: 3630.0, conductivity: 0.530, viscosity: 0.003000 },
      { temperature: 40, density: 1050.5, specificHeat: 3632.0, conductivity: 0.534, viscosity: 0.002820 },
      { temperature: 45, density: 1048.0, specificHeat: 3638.0, conductivity: 0.541, viscosity: 0.002560 },
      { temperature: 50, density: 1045.0, specificHeat: 3648.0, conductivity: 0.548, viscosity: 0.002340 }
    ]
  },
  {
    metadata: {
      id: 'fermentation-broth-demo',
      name: 'Yeast / Bacterial Fermentation Broth Simulant (Illustrative Demo)',
      description: 'Simulated viscous fermentation broth with ~50 g/L biomass and nutrient sugars. Shows temperature-sensitive viscosity reduction and specific heat variation.',
      sourceCitation: 'Derived from biochemical engineering correlations for aqueous suspensions of microbial biomass.',
      publicationDetails: 'Doran, P.M., Bioprocess Engineering Principles, 2nd Ed., Academic Press (2013).',
      applicableTempRange: [15, 55],
      measurementMethod: 'Empirical bioprocess suspension correlation',
      notes: 'Illustrative demo model. Useful for demonstrating heat transfer and entropy generation in cooling jacket design for bioreactors.',
      isDemo: true,
      interpolationMode: 'linear',
      createdAt: '2026-01-01'
    },
    dataPoints: [
      { temperature: 15, density: 1024.0, specificHeat: 3950.0, conductivity: 0.565, viscosity: 0.002800 },
      { temperature: 20, density: 1022.0, specificHeat: 3955.0, conductivity: 0.578, viscosity: 0.002350 },
      { temperature: 30, density: 1018.5, specificHeat: 3970.0, conductivity: 0.601, viscosity: 0.001720 },
      { temperature: 37, density: 1015.0, specificHeat: 3985.0, conductivity: 0.614, viscosity: 0.001430 },
      { temperature: 45, density: 1011.0, specificHeat: 4005.0, conductivity: 0.628, viscosity: 0.001180 },
      { temperature: 55, density: 1005.0, specificHeat: 4030.0, conductivity: 0.642, viscosity: 0.000960 }
    ]
  }
];
