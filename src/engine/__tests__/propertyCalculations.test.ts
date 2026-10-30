import { describe, it, expect } from 'vitest';
import { calculateTransportProperties, calculateChoiOkosProperties } from '../propertyCalculations';
import { DEFAULT_DATASETS } from '../defaultDatasets';

describe('Thermophysical Property & Transport Calculations', () => {
  const waterDataset = DEFAULT_DATASETS[0];

  it('calculates transport properties (alpha, nu, Pr, Cv) correctly for Water at 20 °C', () => {
    const props = calculateTransportProperties(20, waterDataset);

    // At 20 °C for water:
    // ρ ≈ 998.2 kg/m³, Cp ≈ 4181.8 J/kg·K, k ≈ 0.598 W/m·K, μ ≈ 0.001002 Pa·s
    expect(props.density).toBeCloseTo(998.2, 1);
    expect(props.specificHeat).toBeCloseTo(4181.8, 1);
    expect(props.conductivity).toBeCloseTo(0.598, 3);
    expect(props.viscosity).toBeCloseTo(0.001002, 6);

    // Thermal Diffusivity α = k / (ρ * Cp) = 0.598 / (998.2 * 4181.8) ≈ 1.432e-7 m²/s
    const expectedAlpha = 0.598 / (998.2 * 4181.8);
    expect(props.thermalDiffusivity).toBeCloseTo(expectedAlpha, 9);

    // Kinematic Viscosity ν = μ / ρ = 0.001002 / 998.2 ≈ 1.0038e-6 m²/s ≈ 1.0038 cSt
    const expectedNu = 0.001002 / 998.2;
    expect(props.kinematicViscosity).toBeCloseTo(expectedNu, 9);
    expect(props.kinematicViscosityCSt).toBeCloseTo(1.0038, 2);

    // Prandtl Number Pr = (μ * Cp) / k ≈ (0.001002 * 4181.8) / 0.598 ≈ 7.007
    const expectedPr = (0.001002 * 4181.8) / 0.598;
    expect(props.prandtlNumber).toBeCloseTo(expectedPr, 1);

    // Volumetric heat capacity Cv = ρ * Cp ≈ 4,174,272 J/(m³·K) ≈ 4174.27 kJ/(m³·K)
    expect(props.volumetricHeatCapacityKJ).toBeCloseTo(4174.27, 0);

    // Verify negative dDensity/dT (water expands as temperature rises above 10 °C)
    expect(props.dDensity_dT).toBeDefined();
    expect(props.dDensity_dT!).toBeLessThan(0);

    // Verify negative dViscosity/dT (viscosity drops with temperature)
    expect(props.dViscosity_dT).toBeDefined();
    expect(props.dViscosity_dT!).toBeLessThan(0);
  });

  it('computes Choi-Okos biofluid model for 100% water', () => {
    const res = calculateChoiOkosProperties({
      waterFraction: 1.0,
      proteinFraction: 0,
      carbohydrateFraction: 0,
      fatFraction: 0,
      ashFraction: 0,
      temperature: 25
    });

    // Pure water at 25 °C in Choi-Okos:
    // ρ ≈ 994.91 kg/m³, Cp ≈ 4177 J/kg·K, k ≈ 0.61 W/m·K
    expect(res.density).toBeCloseTo(994.91, 1);
    expect(res.specificHeat).toBeCloseTo(4177.0, 0);
    expect(res.conductivity).toBeCloseTo(0.61, 1);
    expect(res.prandtlNumber).toBeGreaterThan(5);
    expect(res.prandtlNumber).toBeLessThan(8);
  });

  it('computes Choi-Okos model for protein-rich biological fluid (BSA solution)', () => {
    // 90% water, 8% protein, 1% carb, 1% ash at 37 °C
    const res = calculateChoiOkosProperties({
      waterFraction: 0.90,
      proteinFraction: 0.08,
      carbohydrateFraction: 0.01,
      fatFraction: 0,
      ashFraction: 0.01,
      temperature: 37
    });

    // Higher density than pure water due to protein (~1330 kg/m³)
    expect(res.density).toBeGreaterThan(1000);
    // Lower specific heat than pure water due to protein (~2000 J/kg·K)
    expect(res.specificHeat).toBeLessThan(4180);
    expect(res.specificHeat).toBeGreaterThan(3800);
    // Viscosity is higher than pure water
    expect(res.viscosity).toBeGreaterThan(0.0007);
  });
});
