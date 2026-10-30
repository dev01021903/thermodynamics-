import { FluidDataset } from '../types/dataset';
import {
  SimulationInputs,
  SimulationResult,
  SweepPointResult,
  IntegrationSegment,
  InterpolatedProperties
} from '../types/thermo';
import { getPropertiesAtTemperature, checkTemperatureBounds } from './interpolation';

/**
 * Validates inputs physically and against dataset ranges.
 */
export function validateSimulationInputs(
  inputs: SimulationInputs,
  dataset: FluidDataset
): { isValid: boolean; error?: string } {
  if (inputs.mass <= 0 || isNaN(inputs.mass)) {
    return { isValid: false, error: 'Fluid mass (m) must be greater than 0 kg.' };
  }

  if (inputs.reservoirTemp + 273.15 <= 0) {
    return { isValid: false, error: 'Thermal reservoir temperature (Tr) must be above absolute zero (> -273.15 °C).' };
  }

  if (inputs.initialTemp + 273.15 <= 0) {
    return { isValid: false, error: 'Initial temperature (T1) must be above absolute zero (> -273.15 °C).' };
  }

  if (inputs.finalTemp + 273.15 <= 0) {
    return { isValid: false, error: 'Final temperature (T2) must be above absolute zero (> -273.15 °C).' };
  }

  if (inputs.duration !== undefined && (inputs.duration <= 0 || isNaN(inputs.duration))) {
    return { isValid: false, error: 'Process duration (Δt) must be positive (> 0 s).' };
  }

  if (inputs.area !== undefined && inputs.area <= 0) {
    return { isValid: false, error: 'Heat transfer area (A) must be positive (> 0 m²).' };
  }

  if (inputs.heatTransferCoeff !== undefined && inputs.heatTransferCoeff <= 0) {
    return { isValid: false, error: 'Heat transfer coefficient (h) must be positive (> 0 W/m²·K).' };
  }

  const t1Bounds = checkTemperatureBounds(inputs.initialTemp, dataset);
  if (!t1Bounds.inBounds) {
    return {
      isValid: false,
      error: `Initial temperature T1 (${inputs.initialTemp} °C) is outside dataset range [${t1Bounds.min} °C, ${t1Bounds.max} °C].`
    };
  }

  const t2Bounds = checkTemperatureBounds(inputs.finalTemp, dataset);
  if (!t2Bounds.inBounds) {
    return {
      isValid: false,
      error: `Final temperature T2 (${inputs.finalTemp} °C) is outside dataset range [${t2Bounds.min} °C, ${t2Bounds.max} °C].`
    };
  }

  return { isValid: true };
}

/**
 * Checks if the passive heat exchange direction with a single constant-temperature reservoir
 * complies with the Second Law of Thermodynamics (Clausius Statement).
 */
export function checkPassiveReservoirValidity(
  t1: number,
  t2: number,
  tr: number
): { isPassiveViolation: boolean; reason?: string } {
  if (t1 === t2) {
    return { isPassiveViolation: false };
  }

  if (t2 > t1) {
    // Heating process: heat must flow from reservoir into fluid.
    // For passive heat addition to bring fluid from T1 to T2, Tr must be at least T2.
    if (tr < t2) {
      return {
        isPassiveViolation: true,
        reason: `Passive heating violation: To heat the fluid from ${t1.toFixed(1)} °C to ${t2.toFixed(1)} °C passively, the constant-temperature reservoir must be at least ${t2.toFixed(1)} °C (specified Tr = ${tr.toFixed(1)} °C). Heat cannot spontaneously flow from a colder reservoir into a hotter fluid without external work.`
      };
    }
  } else {
    // Cooling process: heat must flow from fluid to reservoir.
    // For passive heat removal to bring fluid from T1 down to T2, Tr must be at most T2.
    if (tr > t2) {
      return {
        isPassiveViolation: true,
        reason: `Passive cooling violation: To cool the fluid from ${t1.toFixed(1)} °C down to ${t2.toFixed(1)} °C passively, the constant-temperature reservoir must be at most ${t2.toFixed(1)} °C (specified Tr = ${tr.toFixed(1)} °C). Heat cannot spontaneously flow from a colder fluid into a hotter reservoir without refrigeration.`
      };
    }
  }

  return { isPassiveViolation: false };
}

/**
 * Comprehensive thermodynamic evaluation of sensible heat and entropy generation.
 */
export function calculateThermodynamics(
  inputs: SimulationInputs,
  dataset: FluidDataset
): SimulationResult {
  const validation = validateSimulationInputs(inputs, dataset);
  
  const datasetName = dataset.metadata.name;
  const isDemo = dataset.metadata.isDemo;

  let initialProps: InterpolatedProperties;
  let finalProps: InterpolatedProperties;

  try {
    initialProps = getPropertiesAtTemperature(inputs.initialTemp, dataset);
  } catch (err: any) {
    initialProps = {
      temperature: inputs.initialTemp,
      temperatureKelvin: inputs.initialTemp + 273.15,
      density: 0,
      specificHeat: 0,
      conductivity: 0,
      viscosity: 0,
      isInterpolated: false
    };
  }

  try {
    finalProps = getPropertiesAtTemperature(inputs.finalTemp, dataset);
  } catch (err: any) {
    finalProps = {
      temperature: inputs.finalTemp,
      temperatureKelvin: inputs.finalTemp + 273.15,
      density: 0,
      specificHeat: 0,
      conductivity: 0,
      viscosity: 0,
      isInterpolated: false
    };
  }

  if (!validation.isValid) {
    return {
      inputs,
      datasetName,
      isDemo,
      initialProperties: initialProps,
      finalProperties: finalProps,
      temperatureDiff: inputs.finalTemp - inputs.initialTemp,
      isHeating: inputs.finalTemp > inputs.initialTemp,
      isCooling: inputs.finalTemp < inputs.initialTemp,
      isIsothermal: inputs.finalTemp === inputs.initialTemp,
      sensibleHeatQ: 0,
      sensibleHeatQkJ: 0,
      fluidEntropyChange: 0,
      reservoirEntropyChange: 0,
      entropyGeneration: 0,
      hasDuration: !!inputs.duration,
      hasNewtonModel: !!(inputs.area && inputs.heatTransferCoeff),
      isValid: false,
      validationError: validation.error,
      isPassiveViolation: false,
      workingSteps: {
        integrationMethod: 'N/A',
        numIntervals: 0,
        t1Kelvin: inputs.initialTemp + 273.15,
        t2Kelvin: inputs.finalTemp + 273.15,
        trKelvin: inputs.reservoirTemp + 273.15,
        isConstantCp: false,
        integralSegments: [],
        formulaSubstitutions: {
          heatFormula: '',
          entropyFluidFormula: '',
          entropyResFormula: '',
          entropyGenFormula: ''
        }
      }
    };
  }

  const { initialTemp: t1, finalTemp: t2, mass: m, reservoirTemp: tr } = inputs;
  const t1K = t1 + 273.15;
  const t2K = t2 + 273.15;
  const trK = tr + 273.15;
  const tempDiff = t2 - t1;

  const isHeating = t2 > t1;
  const isCooling = t2 < t1;
  const isIsothermal = t1 === t2;

  const reservoirCheck = checkPassiveReservoirValidity(t1, t2, tr);

  // Check if Cp is strictly constant across dataset
  const cpValues = dataset.dataPoints.map(p => p.specificHeat);
  const isConstantCp = cpValues.every(v => Math.abs(v - cpValues[0]) < 1e-4);

  // Numerical Integration using composite Simpson's / Trapezoidal rule
  const numIntervals = 100;
  const deltaT = (t2 - t1) / numIntervals;
  
  let sensibleHeatQ = 0;
  let fluidEntropyChange = 0;
  const integralSegments: IntegrationSegment[] = [];

  if (isIsothermal) {
    sensibleHeatQ = 0;
    fluidEntropyChange = 0;
  } else {
    for (let i = 0; i < numIntervals; i++) {
      const tA = t1 + i * deltaT;
      const tB = t1 + (i + 1) * deltaT;
      const tMid = (tA + tB) / 2;
      const tMidK = tMid + 273.15;

      const propA = getPropertiesAtTemperature(tA, dataset);
      const propB = getPropertiesAtTemperature(tB, dataset);
      const propMid = getPropertiesAtTemperature(tMid, dataset);

      // Simpson's 1/3 rule segment: (b - a) / 6 * (f(a) + 4f(mid) + f(b))
      const segDeltaT = tB - tA; // in K or °C
      const heatSegment = m * (segDeltaT / 6) * (propA.specificHeat + 4 * propMid.specificHeat + propB.specificHeat);
      
      const entropyIntegrandA = propA.specificHeat / (tA + 273.15);
      const entropyIntegrandMid = propMid.specificHeat / tMidK;
      const entropyIntegrandB = propB.specificHeat / (tB + 273.15);
      const entropySegment = m * (segDeltaT / 6) * (entropyIntegrandA + 4 * entropyIntegrandMid + entropyIntegrandB);

      sensibleHeatQ += heatSegment;
      fluidEntropyChange += entropySegment;

      if (i < 5 || i === Math.floor(numIntervals / 2) || i === numIntervals - 1) {
        integralSegments.push({
          tStart: tA,
          tEnd: tB,
          tMid,
          tMidK,
          cpMid: propMid.specificHeat,
          deltaQ: heatSegment,
          deltaS: entropySegment
        });
      }
    }
  }

  // Reservoir Entropy Change: ΔS_res = -Q / T_r (with Tr strictly in Kelvin)
  const reservoirEntropyChange = isIsothermal ? 0 : -sensibleHeatQ / trK;

  // Entropy Generation: S_gen = ΔS_fluid + ΔS_res
  const entropyGeneration = isIsothermal ? 0 : fluidEntropyChange + reservoirEntropyChange;

  // Rate calculations
  const hasDuration = !!(inputs.duration && inputs.duration > 0);
  const avgHeatRate = hasDuration ? sensibleHeatQ / (inputs.duration || 1) : undefined;
  const avgEntropyGenRate = hasDuration ? entropyGeneration / (inputs.duration || 1) : undefined;

  // Newton's Rate Law calculations (instantaneous)
  const hasNewtonModel = !!(inputs.area && inputs.heatTransferCoeff && inputs.area > 0 && inputs.heatTransferCoeff > 0);
  const instInitialRate = hasNewtonModel
    ? (inputs.heatTransferCoeff! * inputs.area! * (tr - t1))
    : undefined;
  const instFinalRate = hasNewtonModel
    ? (inputs.heatTransferCoeff! * inputs.area! * (tr - t2))
    : undefined;

  // Mathematical formula string representation for Inspector
  const heatFormulaStr = isConstantCp
    ? `Q = m · Cp · (T₂ − T₁) = ${m.toFixed(2)} kg · ${cpValues[0].toFixed(1)} J/(kg·K) · (${t2.toFixed(1)} − ${t1.toFixed(1)}) K = ${sensibleHeatQ.toFixed(2)} J (${(sensibleHeatQ / 1000).toFixed(4)} kJ)`
    : `Q = m · ∫_{T₁}^{T₂} Cp(T) dT = ${m.toFixed(2)} kg · ∫_{${t1.toFixed(1)}°C}^{${t2.toFixed(1)}°C} Cp(T) dT ≈ ${sensibleHeatQ.toFixed(2)} J (${(sensibleHeatQ / 1000).toFixed(4)} kJ)`;

  const entropyFluidFormulaStr = isConstantCp
    ? `ΔS_fluid = m · Cp · ln(T₂,K / T₁,K) = ${m.toFixed(2)} · ${cpValues[0].toFixed(1)} · ln(${t2K.toFixed(2)} K / ${t1K.toFixed(2)} K) = ${fluidEntropyChange.toFixed(4)} J/K`
    : `ΔS_fluid = m · ∫_{T₁}^{T₂} [Cp(T) / T] dT = ${m.toFixed(2)} kg · ∫_{${t1K.toFixed(2)} K}^{${t2K.toFixed(2)} K} [Cp(T)/T] dT ≈ ${fluidEntropyChange.toFixed(4)} J/K`;

  const entropyResFormulaStr = `ΔS_reservoir = −Q / Tᵣ,K = −(${sensibleHeatQ.toFixed(2)} J) / (${trK.toFixed(2)} K) = ${reservoirEntropyChange.toFixed(4)} J/K`;
  
  const entropyGenFormulaStr = `S_gen = ΔS_fluid + ΔS_reservoir = (${fluidEntropyChange.toFixed(4)} J/K) + (${reservoirEntropyChange.toFixed(4)} J/K) = ${entropyGeneration.toFixed(4)} J/K`;

  return {
    inputs,
    datasetName,
    isDemo,
    initialProperties: initialProps,
    finalProperties: finalProps,
    temperatureDiff: tempDiff,
    isHeating,
    isCooling,
    isIsothermal,
    sensibleHeatQ,
    sensibleHeatQkJ: sensibleHeatQ / 1000,
    fluidEntropyChange,
    reservoirEntropyChange,
    entropyGeneration,
    hasDuration,
    durationSeconds: inputs.duration,
    averageHeatTransferRate: avgHeatRate,
    averageEntropyGenRate: avgEntropyGenRate,
    hasNewtonModel,
    instantaneousInitialRate: instInitialRate,
    instantaneousFinalRate: instFinalRate,
    isValid: true,
    validationError: reservoirCheck.reason,
    isPassiveViolation: reservoirCheck.isPassiveViolation,
    workingSteps: {
      integrationMethod: "Composite Simpson's 1/3 Quadrature (N=100 intervals)",
      numIntervals,
      t1Kelvin: t1K,
      t2Kelvin: t2K,
      trKelvin: trK,
      constantCpUsed: isConstantCp ? cpValues[0] : undefined,
      isConstantCp,
      integralSegments,
      formulaSubstitutions: {
        heatFormula: heatFormulaStr,
        entropyFluidFormula: entropyFluidFormulaStr,
        entropyResFormula: entropyResFormulaStr,
        entropyGenFormula: entropyGenFormulaStr
      }
    }
  };
}

/**
 * Sweeps final temperatures to generate comparative thermodynamic curves.
 */
export function calculateTemperatureSweep(
  inputs: SimulationInputs,
  dataset: FluidDataset,
  sweepTemps: number[]
): SweepPointResult[] {
  return sweepTemps.map(t2 => {
    const sweepInput: SimulationInputs = {
      ...inputs,
      finalTemp: t2
    };

    const res = calculateThermodynamics(sweepInput, dataset);

    let props: InterpolatedProperties;
    try {
      props = getPropertiesAtTemperature(t2, dataset);
    } catch {
      props = {
        temperature: t2,
        temperatureKelvin: t2 + 273.15,
        density: 0,
        specificHeat: 0,
        conductivity: 0,
        viscosity: 0,
        isInterpolated: false
      };
    }

    return {
      finalTemp: t2,
      finalTempK: t2 + 273.15,
      sensibleHeatQ: res.sensibleHeatQ,
      sensibleHeatQkJ: res.sensibleHeatQkJ,
      fluidEntropyChange: res.fluidEntropyChange,
      reservoirEntropyChange: res.reservoirEntropyChange,
      entropyGeneration: res.entropyGeneration,
      avgHeatRate: res.averageHeatTransferRate,
      avgEntropyGenRate: res.averageEntropyGenRate,
      isValid: res.isValid,
      isPassiveViolation: res.isPassiveViolation,
      error: res.validationError,
      properties: props
    };
  });
}
