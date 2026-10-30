export interface SimulationInputs {
  datasetId: string;
  initialTemp: number; // T1 in °C
  finalTemp: number;   // T2 in °C
  mass: number;        // m in kg
  reservoirTemp: number; // Tr in °C
  duration?: number;   // Δt in seconds (optional)
  area?: number;       // A in m² (optional Newton's rate model)
  heatTransferCoeff?: number; // h in W/(m²·K) (optional Newton's rate model)
  sweepFinalTemps?: number[]; // T2 sweep values in °C
}

export interface InterpolatedProperties {
  temperature: number; // °C
  temperatureKelvin: number; // K
  density: number;     // kg/m³
  specificHeat: number;// J/(kg·K)
  conductivity: number;// W/(m·K)
  viscosity: number;   // Pa·s
  isInterpolated: boolean;
}

export interface IntegrationSegment {
  tStart: number; // °C
  tEnd: number;   // °C
  tMid: number;   // °C
  tMidK: number;  // K
  cpMid: number;  // J/(kg·K)
  deltaQ: number; // J
  deltaS: number; // J/K
}

export interface SimulationResult {
  inputs: SimulationInputs;
  datasetName: string;
  isDemo: boolean;
  
  // Thermodynamic State Properties
  initialProperties: InterpolatedProperties;
  finalProperties: InterpolatedProperties;
  
  // Thermodynamic Quantities
  temperatureDiff: number; // T2 - T1 in °C or K
  isHeating: boolean;
  isCooling: boolean;
  isIsothermal: boolean;
  
  // Sensible Heat & Entropy Changes
  sensibleHeatQ: number; // Q in Joules (J)
  sensibleHeatQkJ: number; // Q in kJ
  fluidEntropyChange: number; // ΔS_fluid in J/K
  reservoirEntropyChange: number; // ΔS_res in J/K
  entropyGeneration: number; // S_gen in J/K
  
  // Rate quantities (when duration is given)
  hasDuration: boolean;
  durationSeconds?: number;
  averageHeatTransferRate?: number; // q_dot_avg in W (J/s)
  averageEntropyGenRate?: number;   // S_dot_gen_avg in W/K (J/(s·K))
  
  // Newton's Rate Law Instantaneous estimate (when h and A are given)
  hasNewtonModel: boolean;
  instantaneousInitialRate?: number; // q_dot = hA(Tr - T1) in W
  instantaneousFinalRate?: number;   // q_dot = hA(Tr - T2) in W
  
  // Validation status
  isValid: boolean;
  validationError?: string;
  isPassiveViolation: boolean; // Flagged when passive reservoir temperature contradicts 2nd Law
  
  // Mathematical Working Steps
  workingSteps: {
    integrationMethod: string;
    numIntervals: number;
    t1Kelvin: number;
    t2Kelvin: number;
    trKelvin: number;
    constantCpUsed?: number;
    isConstantCp: boolean;
    integralSegments: IntegrationSegment[];
    formulaSubstitutions: {
      heatFormula: string;
      entropyFluidFormula: string;
      entropyResFormula: string;
      entropyGenFormula: string;
    };
  };
}

export interface SweepPointResult {
  finalTemp: number; // °C
  finalTempK: number; // K
  sensibleHeatQ: number; // J
  sensibleHeatQkJ: number; // kJ
  fluidEntropyChange: number; // J/K
  reservoirEntropyChange: number; // J/K
  entropyGeneration: number; // J/K
  avgHeatRate?: number; // W
  avgEntropyGenRate?: number; // W/K
  isValid: boolean;
  isPassiveViolation: boolean;
  error?: string;
  properties: InterpolatedProperties;
}
