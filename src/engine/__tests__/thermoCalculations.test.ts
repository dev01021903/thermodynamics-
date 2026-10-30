import { describe, it, expect } from 'vitest';
import { calculateThermodynamics, checkPassiveReservoirValidity, validateSimulationInputs } from '../thermoCalculations';
import { FluidDataset } from '../../types/dataset';
import { DEFAULT_DATASETS } from '../defaultDatasets';

// Construct a synthetic constant-Cp dataset for exact analytical checking
const CONSTANT_CP_DATASET: FluidDataset = {
  metadata: {
    id: 'constant-cp-test',
    name: 'Synthetic Constant Cp Test Fluid',
    description: 'Dataset with exact constant properties for analytical comparison',
    sourceCitation: 'Theoretical Constant Property Fluid',
    applicableTempRange: [0, 100],
    isDemo: true,
    interpolationMode: 'linear',
    createdAt: '2026-01-01'
  },
  dataPoints: [
    { temperature: 0, density: 1000, specificHeat: 4000, conductivity: 0.6, viscosity: 0.001 },
    { temperature: 50, density: 1000, specificHeat: 4000, conductivity: 0.6, viscosity: 0.001 },
    { temperature: 100, density: 1000, specificHeat: 4000, conductivity: 0.6, viscosity: 0.001 }
  ]
};

describe('Thermodynamic Calculation Engine', () => {
  const waterDataset = DEFAULT_DATASETS[0];

  it('correctly calculates sensible heat and entropy change for constant Cp heating', () => {
    // m = 2 kg, Cp = 4000 J/kg·K, T1 = 20 °C (293.15 K), T2 = 60 °C (333.15 K), Tr = 80 °C (353.15 K)
    const inputs = {
      datasetId: 'constant-cp-test',
      initialTemp: 20,
      finalTemp: 60,
      mass: 2,
      reservoirTemp: 80
    };

    const res = calculateThermodynamics(inputs, CONSTANT_CP_DATASET);

    // Analytical:
    // Q = m * Cp * (T2 - T1) = 2 * 4000 * 40 = 320,000 J = 320 kJ
    // ΔS_fluid = m * Cp * ln(T2_K / T1_K) = 2 * 4000 * ln(333.15 / 293.15) ≈ 1023.771 J/K
    // ΔS_res = -Q / Tr_K = -320000 / 353.15 ≈ -906.130 J/K
    // S_gen = ΔS_fluid + ΔS_res ≈ 117.641 J/K (> 0)

    expect(res.isValid).toBe(true);
    expect(res.isHeating).toBe(true);
    expect(res.sensibleHeatQ).toBeCloseTo(320000, 0);
    expect(res.sensibleHeatQkJ).toBeCloseTo(320, 2);

    const expectedDeltaSFluid = 2 * 4000 * Math.log((60 + 273.15) / (20 + 273.15));
    expect(res.fluidEntropyChange).toBeCloseTo(expectedDeltaSFluid, 1);

    const expectedDeltaSRes = -320000 / (80 + 273.15);
    expect(res.reservoirEntropyChange).toBeCloseTo(expectedDeltaSRes, 1);

    const expectedSGen = expectedDeltaSFluid + expectedDeltaSRes;
    expect(res.entropyGeneration).toBeCloseTo(expectedSGen, 1);
    expect(res.entropyGeneration).toBeGreaterThan(0);
    expect(res.isPassiveViolation).toBe(false);
  });

  it('correctly calculates sensible heat and entropy change for constant Cp cooling', () => {
    // m = 1.5 kg, Cp = 4000 J/kg·K, T1 = 70 °C (343.15 K), T2 = 30 °C (303.15 K), Tr = 10 °C (283.15 K)
    const inputs = {
      datasetId: 'constant-cp-test',
      initialTemp: 70,
      finalTemp: 30,
      mass: 1.5,
      reservoirTemp: 10
    };

    const res = calculateThermodynamics(inputs, CONSTANT_CP_DATASET);

    // Analytical:
    // Q = 1.5 * 4000 * (30 - 70) = -240,000 J
    // ΔS_fluid = 1.5 * 4000 * ln(303.15 / 343.15) ≈ -742.61 J/K (< 0 for cooling)
    // ΔS_res = -(-240000) / (283.15) ≈ +847.607 J/K (> 0 for heat absorbed by colder reservoir)
    // S_gen = ΔS_fluid + ΔS_res ≈ +104.997 J/K (> 0)

    expect(res.isValid).toBe(true);
    expect(res.isCooling).toBe(true);
    expect(res.sensibleHeatQ).toBeCloseTo(-240000, 0);
    expect(res.fluidEntropyChange).toBeLessThan(0);
    expect(res.reservoirEntropyChange).toBeGreaterThan(0);
    expect(res.entropyGeneration).toBeGreaterThan(0);
    expect(res.isPassiveViolation).toBe(false);
  });

  it('evaluates isothermal process (T1 = T2) to strictly zero heat and entropy change', () => {
    const inputs = {
      datasetId: 'water-standard-ref',
      initialTemp: 37,
      finalTemp: 37,
      mass: 5,
      reservoirTemp: 37
    };

    const res = calculateThermodynamics(inputs, waterDataset);
    expect(res.isValid).toBe(true);
    expect(res.isIsothermal).toBe(true);
    expect(res.sensibleHeatQ).toBe(0);
    expect(res.fluidEntropyChange).toBe(0);
    expect(res.reservoirEntropyChange).toBe(0);
    expect(res.entropyGeneration).toBe(0);
  });

  it('detects Second Law passive violation when reservoir is colder during heating', () => {
    // Heating fluid from 20 °C to 50 °C with reservoir at only 30 °C (violates passive heating)
    const check = checkPassiveReservoirValidity(20, 50, 30);
    expect(check.isPassiveViolation).toBe(true);

    const inputs = {
      datasetId: 'water-standard-ref',
      initialTemp: 20,
      finalTemp: 50,
      mass: 1,
      reservoirTemp: 30
    };

    const res = calculateThermodynamics(inputs, waterDataset);
    expect(res.isPassiveViolation).toBe(true);
    expect(res.validationError).toBeDefined();
  });

  it('detects Second Law passive violation when reservoir is hotter during cooling', () => {
    // Cooling fluid from 60 °C down to 30 °C with reservoir at 40 °C (violates passive cooling)
    const check = checkPassiveReservoirValidity(60, 30, 40);
    expect(check.isPassiveViolation).toBe(true);
  });

  it('handles process duration and calculates average rates accurately', () => {
    const inputs = {
      datasetId: 'constant-cp-test',
      initialTemp: 20,
      finalTemp: 40,
      mass: 1,
      reservoirTemp: 60,
      duration: 100 // 100 seconds
    };

    const res = calculateThermodynamics(inputs, CONSTANT_CP_DATASET);
    expect(res.hasDuration).toBe(true);
    // Q = 1 * 4000 * 20 = 80,000 J
    // q_avg = 80,000 / 100 = 800 W
    expect(res.averageHeatTransferRate).toBeCloseTo(800, 0);
    expect(res.averageEntropyGenRate).toBeCloseTo(res.entropyGeneration / 100, 4);
  });

  it('distinguishes instantaneous Newton rate from average rate', () => {
    const inputs = {
      datasetId: 'constant-cp-test',
      initialTemp: 20,
      finalTemp: 40,
      mass: 1,
      reservoirTemp: 60,
      duration: 100,
      area: 0.5, // 0.5 m²
      heatTransferCoeff: 50 // 50 W/(m²·K)
    };

    const res = calculateThermodynamics(inputs, CONSTANT_CP_DATASET);
    expect(res.hasNewtonModel).toBe(true);
    // Instant initial rate = 50 * 0.5 * (60 - 20) = 1000 W
    // Instant final rate = 50 * 0.5 * (60 - 40) = 500 W
    expect(res.instantaneousInitialRate).toBeCloseTo(1000, 1);
    expect(res.instantaneousFinalRate).toBeCloseTo(500, 1);
    // Average rate is 800 W, demonstrating clear physical distinction
    expect(res.averageHeatTransferRate).toBeCloseTo(800, 0);
  });

  it('rejects out of bounds temperatures and invalid masses', () => {
    const outOfBoundsInput = {
      datasetId: 'water-standard-ref',
      initialTemp: -5, // Water dataset starts at 10 °C
      finalTemp: 40,
      mass: 1,
      reservoirTemp: 50
    };

    const val = validateSimulationInputs(outOfBoundsInput, waterDataset);
    expect(val.isValid).toBe(false);

    const negMassInput = {
      datasetId: 'water-standard-ref',
      initialTemp: 20,
      finalTemp: 40,
      mass: -2,
      reservoirTemp: 50
    };
    const valMass = validateSimulationInputs(negMassInput, waterDataset);
    expect(valMass.isValid).toBe(false);
  });
});
