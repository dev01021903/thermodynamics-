import { FluidDataset } from '../types/dataset';
import { TransportProperties, CompositionInputs, CompositionCalculationResult } from '../types/propertyCalc';
import { getPropertiesAtTemperature, checkTemperatureBounds } from './interpolation';

/**
 * Calculates complete thermophysical and derived transport properties
 * (including α, ν, Pr, Cv, and numerical temperature derivatives).
 */
export function calculateTransportProperties(
  temp: number,
  dataset: FluidDataset
): TransportProperties {
  const base = getPropertiesAtTemperature(temp, dataset);
  const { rho, cp, k, mu } = {
    rho: base.density,
    cp: base.specificHeat,
    k: base.conductivity,
    mu: base.viscosity
  };

  // Derived Transport Properties
  // Thermal Diffusivity: α = k / (ρ * Cp) [m²/s]
  const thermalDiffusivity = (rho > 0 && cp > 0) ? k / (rho * cp) : 0;

  // Kinematic Viscosity: ν = μ / ρ [m²/s]
  const kinematicViscosity = rho > 0 ? mu / rho : 0;
  const kinematicViscosityCSt = kinematicViscosity * 1e6; // 1 cSt = 10^-6 m²/s

  // Prandtl Number: Pr = (μ * Cp) / k = ν / α [-]
  const prandtlNumber = k > 0 ? (mu * cp) / k : 0;

  // Volumetric Heat Capacity: Cv ≈ ρ * Cp [J/(m³·K)]
  const volumetricHeatCapacity = rho * cp;
  const volumetricHeatCapacityKJ = volumetricHeatCapacity / 1000;

  // Numerical central-difference derivatives with step h = 0.5 °C if in bounds
  const [minT, maxT] = dataset.metadata.applicableTempRange;
  let dDensity_dT: number | undefined;
  let dSpecificHeat_dT: number | undefined;
  let dConductivity_dT: number | undefined;
  let dViscosity_dT: number | undefined;
  let thermalExpansionCoeff: number | undefined;

  const h = 0.5;
  const tLow = Math.max(minT, temp - h);
  const tHigh = Math.min(maxT, temp + h);
  const dt = tHigh - tLow;

  if (dt > 1e-4) {
    try {
      const pLow = getPropertiesAtTemperature(tLow, dataset);
      const pHigh = getPropertiesAtTemperature(tHigh, dataset);

      dDensity_dT = (pHigh.density - pLow.density) / dt;
      dSpecificHeat_dT = (pHigh.specificHeat - pLow.specificHeat) / dt;
      dConductivity_dT = (pHigh.conductivity - pLow.conductivity) / dt;
      dViscosity_dT = (pHigh.viscosity - pLow.viscosity) / dt;

      // Volumetric thermal expansion coefficient: β = -(1/ρ)(dρ/dT)
      if (rho > 0) {
        thermalExpansionCoeff = - (1 / rho) * dDensity_dT;
      }
    } catch {
      // Ignore if derivative evaluation hits bounds edge
    }
  }

  return {
    ...base,
    thermalDiffusivity,
    kinematicViscosity,
    kinematicViscosityCSt,
    prandtlNumber,
    volumetricHeatCapacity,
    volumetricHeatCapacityKJ,
    dDensity_dT,
    dSpecificHeat_dT,
    dConductivity_dT,
    dViscosity_dT,
    thermalExpansionCoeff
  };
}

/**
 * Choi & Okos (1986) standard bioprocess component model
 * Predicts density, specific heat, conductivity, and viscosity from composition fractions.
 */
export function calculateChoiOkosProperties(inputs: CompositionInputs): CompositionCalculationResult {
  const { waterFraction: Xw, proteinFraction: Xp, carbohydrateFraction: Xc, fatFraction: Xf, ashFraction: Xa, temperature: T } = inputs;

  const TK = T + 273.15;

  // 1. Component Densities [kg/m³] (Choi & Okos 1986)
  const rho_w = 997.18 + 0.003155 * T - 0.0037574 * T * T;
  const rho_p = 1329.9 - 0.5184 * T;
  const rho_c = 1599.1 - 0.31046 * T;
  const rho_f = 925.59 - 0.41757 * T;
  const rho_a = 2423.8 - 0.28063 * T;

  // Reciprocal density rule: 1/ρ = Σ(Xi / ρi)
  const sumVolFraction = (Xw / rho_w) + (Xp / rho_p) + (Xc / rho_c) + (Xf / rho_f) + (Xa / rho_a);
  const density = sumVolFraction > 0 ? 1 / sumVolFraction : 1000;

  // 2. Component Specific Heat Capacities [J/(kg·K)]
  const cp_w = 4176.2 - 0.090864 * T + 0.0054731 * T * T;
  const cp_p = 2008.2 + 1.2089 * T - 0.0013129 * T * T;
  const cp_c = 1548.8 + 1.9625 * T - 0.0059399 * T * T;
  const cp_f = 1984.2 + 1.4733 * T - 0.0048008 * T * T;
  const cp_a = 1092.6 + 1.8896 * T - 0.0036817 * T * T;

  const specificHeat = (Xw * cp_w) + (Xp * cp_p) + (Xc * cp_c) + (Xf * cp_f) + (Xa * cp_a);

  // 3. Component Thermal Conductivities [W/(m·K)]
  const k_w = 0.57109 + 0.0017625 * T - 0.0000067036 * T * T;
  const k_p = 0.17881 + 0.0011958 * T - 0.0000027178 * T * T;
  const k_c = 0.20141 + 0.0013874 * T - 0.0000043312 * T * T;
  const k_f = 0.18071 - 0.00027604 * T - 0.00000017749 * T * T;
  const k_a = 0.32962 + 0.0014011 * T - 0.0000029069 * T * T;

  const conductivity = (Xw * k_w) + (Xp * k_p) + (Xc * k_c) + (Xf * k_f) + (Xa * k_a);

  // 4. Dynamic Viscosity estimate [Pa·s]
  // Base water viscosity (Andrade formulation): μ_w = 2.414e-5 * 10^(247.8 / (T + 133.15))
  const mu_w = 2.414e-5 * Math.pow(10, 247.8 / (T + 133.15));
  // Macromolecular suspension enhancement:
  const viscosity = mu_w * Math.exp(3.2 * Xp + 3.8 * Xc + 1.5 * Xf);

  // Derived Transport Numbers
  const thermalDiffusivity = conductivity / (density * specificHeat);
  const kinematicViscosity = viscosity / density;
  const prandtlNumber = (viscosity * specificHeat) / conductivity;
  const volumetricHeatCapacity = density * specificHeat;

  // String substitutions
  const densityFormulaStr = `1/ρ = (${Xw.toFixed(3)}/${rho_w.toFixed(1)}) + (${Xp.toFixed(3)}/${rho_p.toFixed(1)}) + (${Xc.toFixed(3)}/${rho_c.toFixed(1)}) + (${Xf.toFixed(3)}/${rho_f.toFixed(1)}) + (${Xa.toFixed(3)}/${rho_a.toFixed(1)}) ⟹ ρ = ${density.toFixed(2)} kg/m³`;
  const cpFormulaStr = `Cp = (${Xw.toFixed(3)}·${cp_w.toFixed(1)}) + (${Xp.toFixed(3)}·${cp_p.toFixed(1)}) + (${Xc.toFixed(3)}·${cp_c.toFixed(1)}) + (${Xf.toFixed(3)}·${cp_f.toFixed(1)}) + (${Xa.toFixed(3)}·${cp_a.toFixed(1)}) = ${specificHeat.toFixed(1)} J/(kg·K)`;
  const kFormulaStr = `k = (${Xw.toFixed(3)}·${k_w.toFixed(3)}) + (${Xp.toFixed(3)}·${k_p.toFixed(3)}) + (${Xc.toFixed(3)}·${k_c.toFixed(3)}) + (${Xf.toFixed(3)}·${k_f.toFixed(3)}) + (${Xa.toFixed(3)}·${k_a.toFixed(3)}) = ${conductivity.toFixed(3)} W/(m·K)`;
  const viscosityFormulaStr = `μ = μ_water(${T}°C) · exp(3.2·Xp + 3.8·Xc + 1.5·Xf) = ${(mu_w * 1000).toFixed(3)} mPa·s · ${Math.exp(3.2 * Xp + 3.8 * Xc + 1.5 * Xf).toFixed(2)} = ${(viscosity * 1000).toFixed(3)} mPa·s (${viscosity.toFixed(6)} Pa·s)`;
  const prandtlFormulaStr = `Pr = (μ · Cp) / k = (${viscosity.toFixed(6)} · ${specificHeat.toFixed(1)}) / ${conductivity.toFixed(3)} = ${prandtlNumber.toFixed(2)}`;
  const diffusivityFormulaStr = `α = k / (ρ · Cp) = ${conductivity.toFixed(3)} / (${density.toFixed(2)} · ${specificHeat.toFixed(1)}) = ${thermalDiffusivity.toExponential(4)} m²/s`;

  return {
    temperature: T,
    temperatureKelvin: TK,
    density,
    specificHeat,
    conductivity,
    viscosity,
    thermalDiffusivity,
    kinematicViscosity,
    prandtlNumber,
    volumetricHeatCapacity,
    workingSubstitutions: {
      densityFormula: densityFormulaStr,
      cpFormula: cpFormulaStr,
      kFormula: kFormulaStr,
      viscosityFormula: viscosityFormulaStr,
      prandtlFormula: prandtlFormulaStr,
      diffusivityFormula: diffusivityFormulaStr
    }
  };
}
