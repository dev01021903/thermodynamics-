export interface DataPoint {
  temperature: number; // in °C
  density: number;     // ρ in kg/m³
  specificHeat: number;// Cp in J/(kg·K)
  conductivity: number;// k in W/(m·K)
  viscosity: number;   // μ in Pa·s
}

export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  sourceCitation: string;
  publicationDetails?: string;
  applicableTempRange: [number, number]; // [min °C, max °C]
  measurementMethod?: string;
  notes?: string;
  isDemo: boolean;
  interpolationMode: 'linear' | 'tabulated';
  createdAt: string;
}

export interface FluidDataset {
  metadata: DatasetMetadata;
  dataPoints: DataPoint[];
}
