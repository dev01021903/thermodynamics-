import { InterpolatedProperties } from './thermo';

export interface TransportProperties extends InterpolatedProperties {
  thermalDiffusivity: number; // α = k / (ρ * Cp) in m²/s
  kinematicViscosity: number; // ν = μ / ρ in m²/s
  kinematicViscosityCSt: number; // ν in cSt (10^-6 m²/s)
  prandtlNumber: number;      // Pr = (μ * Cp) / k = ν / α (dimensionless)
  volumetricHeatCapacity: number; // Cv ≈ ρ * Cp in J/(m³·K)
  volumetricHeatCapacityKJ: number; // in kJ/(m³·K)
  
  // First derivatives with respect to temperature
  dDensity_dT?: number;       // dρ/dT in kg/(m³·K)
  dSpecificHeat_dT?: number;  // dCp/dT in J/(kg·K²)
  dConductivity_dT?: number;  // dk/dT in W/(m·K²)
  dViscosity_dT?: number;     // dμ/dT in Pa·s/K
  thermalExpansionCoeff?: number; // β = -(1/ρ)(dρ/dT) in 1/K
}

export interface CompositionInputs {
  waterFraction: number;      // X_w (0 to 1)
  proteinFraction: number;    // X_p (0 to 1)
  carbohydrateFraction: number;// X_c (0 to 1)
  fatFraction: number;        // X_f (0 to 1)
  ashFraction: number;        // X_a (0 to 1)
  temperature: number;        // °C
}

export interface CompositionCalculationResult {
  temperature: number;
  temperatureKelvin: number;
  density: number;          // kg/m³
  specificHeat: number;     // J/(kg·K)
  conductivity: number;     // W/(m·K)
  viscosity: number;        // Pa·s (estimated via Arrhenius-type fit)
  thermalDiffusivity: number; // m²/s
  kinematicViscosity: number; // m²/s
  prandtlNumber: number;
  volumetricHeatCapacity: number;
  workingSubstitutions: {
    densityFormula: string;
    cpFormula: string;
    kFormula: string;
    viscosityFormula: string;
    prandtlFormula: string;
    diffusivityFormula: string;
  };
}
