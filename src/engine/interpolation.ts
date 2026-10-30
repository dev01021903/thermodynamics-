import { DataPoint, FluidDataset } from '../types/dataset';
import { InterpolatedProperties } from '../types/thermo';

/**
 * Validates that temperature is within dataset range without silent extrapolation.
 */
export function checkTemperatureBounds(temp: number, dataset: FluidDataset): { inBounds: boolean; min: number; max: number } {
  if (!dataset.dataPoints || dataset.dataPoints.length === 0) {
    return { inBounds: false, min: 0, max: 0 };
  }
  const temps = dataset.dataPoints.map(p => p.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const inBounds = temp >= min - 1e-6 && temp <= max + 1e-6;
  return { inBounds, min, max };
}

/**
 * Interpolates or looks up thermophysical properties at a specific temperature.
 * Strictly throws/returns error if outside bounds (no silent extrapolation).
 */
export function getPropertiesAtTemperature(
  temp: number,
  dataset: FluidDataset
): InterpolatedProperties {
  const points = [...dataset.dataPoints].sort((a, b) => a.temperature - b.temperature);
  
  if (points.length === 0) {
    throw new Error(`Dataset "${dataset.metadata.name}" contains no data points.`);
  }

  const { inBounds, min, max } = checkTemperatureBounds(temp, dataset);
  if (!inBounds) {
    throw new Error(
      `Temperature ${temp.toFixed(2)} °C is outside documented dataset range [${min.toFixed(1)} °C, ${max.toFixed(1)} °C]. Silent extrapolation is prohibited.`
    );
  }

  // Exact point check
  const exactMatch = points.find(p => Math.abs(p.temperature - temp) < 1e-6);
  if (exactMatch) {
    return {
      temperature: temp,
      temperatureKelvin: temp + 273.15,
      density: exactMatch.density,
      specificHeat: exactMatch.specificHeat,
      conductivity: exactMatch.conductivity,
      viscosity: exactMatch.viscosity,
      isInterpolated: false
    };
  }

  // If single point exists and within bounds tolerance
  if (points.length === 1) {
    return {
      temperature: temp,
      temperatureKelvin: temp + 273.15,
      density: points[0].density,
      specificHeat: points[0].specificHeat,
      conductivity: points[0].conductivity,
      viscosity: points[0].viscosity,
      isInterpolated: false
    };
  }

  // Tabulated nearest if requested
  if (dataset.metadata.interpolationMode === 'tabulated') {
    let nearest = points[0];
    let minDiff = Math.abs(points[0].temperature - temp);
    for (const pt of points) {
      const diff = Math.abs(pt.temperature - temp);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = pt;
      }
    }
    return {
      temperature: temp,
      temperatureKelvin: temp + 273.15,
      density: nearest.density,
      specificHeat: nearest.specificHeat,
      conductivity: nearest.conductivity,
      viscosity: nearest.viscosity,
      isInterpolated: false
    };
  }

  // Piecewise Linear Interpolation
  let lower = points[0];
  let upper = points[points.length - 1];

  for (let i = 0; i < points.length - 1; i++) {
    if (temp >= points[i].temperature && temp <= points[i + 1].temperature) {
      lower = points[i];
      upper = points[i + 1];
      break;
    }
  }

  const span = upper.temperature - lower.temperature;
  if (span === 0) {
    return {
      temperature: temp,
      temperatureKelvin: temp + 273.15,
      density: lower.density,
      specificHeat: lower.specificHeat,
      conductivity: lower.conductivity,
      viscosity: lower.viscosity,
      isInterpolated: false
    };
  }

  const fraction = (temp - lower.temperature) / span;
  
  return {
    temperature: temp,
    temperatureKelvin: temp + 273.15,
    density: lower.density + fraction * (upper.density - lower.density),
    specificHeat: lower.specificHeat + fraction * (upper.specificHeat - lower.specificHeat),
    conductivity: lower.conductivity + fraction * (upper.conductivity - lower.conductivity),
    viscosity: lower.viscosity + fraction * (upper.viscosity - lower.viscosity),
    isInterpolated: true
  };
}
