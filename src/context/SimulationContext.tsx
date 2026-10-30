import React, { createContext, useContext, useState, useMemo } from 'react';
import { SimulationInputs, SimulationResult, SweepPointResult } from '../types/thermo';
import { useData } from './DataContext';
import { calculateThermodynamics, calculateTemperatureSweep } from '../engine/thermoCalculations';

interface SimulationContextType {
  inputs: SimulationInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulationInputs>>;
  result: SimulationResult;
  sweepResults: SweepPointResult[];
  sweepFinalTemps: number[];
  setSweepFinalTemps: (temps: number[]) => void;
  isSweepMode: boolean;
  setIsSweepMode: (val: boolean) => void;
  exportResultsCSV: () => void;
}

const DEFAULT_INPUTS: SimulationInputs = {
  datasetId: 'water-standard-ref',
  initialTemp: 20,
  finalTemp: 50,
  mass: 1.0,
  reservoirTemp: 70,
  duration: 120,
  area: 0.25,
  heatTransferCoeff: 150,
  sweepFinalTemps: [20, 30, 40, 50, 60]
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeDataset, activeDatasetId } = useData();
  
  const [inputs, setInputs] = useState<SimulationInputs>({
    ...DEFAULT_INPUTS,
    datasetId: activeDatasetId
  });

  const [sweepFinalTemps, setSweepFinalTemps] = useState<number[]>([20, 30, 40, 50, 60]);
  const [isSweepMode, setIsSweepMode] = useState<boolean>(false);

  // Synchronize inputs.datasetId when activeDatasetId changes
  React.useEffect(() => {
    setInputs(prev => ({ ...prev, datasetId: activeDatasetId }));
  }, [activeDatasetId]);

  const result = useMemo(() => {
    return calculateThermodynamics(inputs, activeDataset);
  }, [inputs, activeDataset]);

  const sweepResults = useMemo(() => {
    return calculateTemperatureSweep(inputs, activeDataset, sweepFinalTemps);
  }, [inputs, activeDataset, sweepFinalTemps]);

  const exportResultsCSV = () => {
    const isDemoNotice = activeDataset.metadata.isDemo ? ' [ILLUSTRATIVE DEMO DATASET]' : '';
    let content = `# THERMODYNAMIC SIMULATION RESULTS EXPORT\n`;
    content += `# Project: Development of a Thermodynamic Framework to Evaluate Entropy Generation, Heat Transfer, and Thermophysical Properties of Biological Fluids\n`;
    content += `# Dataset: ${activeDataset.metadata.name}${isDemoNotice}\n`;
    content += `# Source Citation: ${activeDataset.metadata.sourceCitation}\n`;
    content += `# Initial Temperature T1: ${inputs.initialTemp} °C (${(inputs.initialTemp + 273.15).toFixed(2)} K)\n`;
    content += `# Final Temperature T2: ${inputs.finalTemp} °C (${(inputs.finalTemp + 273.15).toFixed(2)} K)\n`;
    content += `# Fluid Mass m: ${inputs.mass} kg\n`;
    content += `# Reservoir Temperature Tr: ${inputs.reservoirTemp} °C (${(inputs.reservoirTemp + 273.15).toFixed(2)} K)\n`;
    if (inputs.duration) content += `# Process Duration: ${inputs.duration} s\n`;
    if (inputs.heatTransferCoeff && inputs.area) {
      content += `# Illustrative Newton Rate Model: h = ${inputs.heatTransferCoeff} W/m2K, A = ${inputs.area} m2\n`;
    }
    content += `\n# --- PRIMARY THERMODYNAMIC OUTPUTS ---\n`;
    content += `Parameter,Value,Unit,Description\n`;
    content += `Sensible_Heat_Q,${result.sensibleHeatQ.toFixed(4)},J,"Total sensible thermal energy added/removed"\n`;
    content += `Sensible_Heat_Q_kJ,${result.sensibleHeatQkJ.toFixed(4)},kJ,"Sensible heat in kilojoules"\n`;
    content += `Fluid_Entropy_Change_DeltaS,${result.fluidEntropyChange.toFixed(6)},J/K,"Internal entropy change of fluid mass"\n`;
    content += `Reservoir_Entropy_Change_DeltaS_res,${result.reservoirEntropyChange.toFixed(6)},J/K,"Entropy change of external thermal reservoir (-Q/Tr)"\n`;
    content += `Entropy_Generation_S_gen,${result.entropyGeneration.toFixed(6)},J/K,"Total irreversible entropy generation (DeltaS_fluid + DeltaS_res)"\n`;
    
    if (result.hasDuration) {
      content += `Average_Heat_Rate_q_avg,${result.averageHeatTransferRate?.toFixed(4)},W,"Average rate of heat transfer (Q / Delta_t)"\n`;
      content += `Average_Entropy_Gen_Rate_S_dot_gen,${result.averageEntropyGenRate?.toFixed(6)},W/K,"Average rate of entropy generation (S_gen / Delta_t)"\n`;
    }

    if (result.hasNewtonModel) {
      content += `Newton_Instant_Rate_Initial_q_T1,${result.instantaneousInitialRate?.toFixed(4)},W,"Instantaneous Newton rate at initial condition h*A*(Tr-T1)"\n`;
      content += `Newton_Instant_Rate_Final_q_T2,${result.instantaneousFinalRate?.toFixed(4)},W,"Instantaneous Newton rate at final condition h*A*(Tr-T2)"\n`;
    }

    content += `\n# --- TEMPERATURE SWEEP DATA TABLE ---\n`;
    content += `FinalTemp_C,FinalTemp_K,SensibleHeat_J,SensibleHeat_kJ,FluidEntropyChange_J_K,ReservoirEntropyChange_J_K,EntropyGen_S_gen_J_K,Density_kg_m3,SpecificHeat_J_kgK,ThermalConductivity_W_mK,Viscosity_Pa_s,Status\n`;

    sweepResults.forEach(pt => {
      const status = pt.isPassiveViolation ? 'VIOLATES_2ND_LAW' : pt.isValid ? 'VALID' : 'INVALID';
      content += `${pt.finalTemp},${pt.finalTempK.toFixed(2)},${pt.sensibleHeatQ.toFixed(2)},${pt.sensibleHeatQkJ.toFixed(4)},${pt.fluidEntropyChange.toFixed(4)},${pt.reservoirEntropyChange.toFixed(4)},${pt.entropyGeneration.toFixed(4)},${pt.properties.density.toFixed(2)},${pt.properties.specificHeat.toFixed(1)},${pt.properties.conductivity.toFixed(3)},${pt.properties.viscosity.toFixed(6)},${status}\n`;
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `thermodynamic_simulation_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SimulationContext.Provider
      value={{
        inputs,
        setInputs,
        result,
        sweepResults,
        sweepFinalTemps,
        setSweepFinalTemps,
        isSweepMode,
        setIsSweepMode,
        exportResultsCSV
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
  return context;
};
