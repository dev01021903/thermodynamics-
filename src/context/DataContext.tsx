import React, { createContext, useContext, useState, useEffect } from 'react';
import { FluidDataset, DataPoint, DatasetMetadata } from '../types/dataset';
import { DEFAULT_DATASETS } from '../engine/defaultDatasets';

interface DataContextType {
  datasets: FluidDataset[];
  activeDatasetId: string;
  activeDataset: FluidDataset;
  setActiveDatasetId: (id: string) => void;
  addDataset: (dataset: FluidDataset) => void;
  updateDataset: (dataset: FluidDataset) => void;
  deleteDataset: (id: string) => void;
  resetToDefaults: () => void;
  exportDatasetCSV: (dataset: FluidDataset) => void;
  getCSVTemplateString: () => string;
}

const STORAGE_KEY = 'biotech_thermo_datasets_v1';
const ACTIVE_KEY = 'biotech_thermo_active_dataset_id_v1';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<FluidDataset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading datasets from storage:', e);
    }
    return DEFAULT_DATASETS;
  });

  const [activeDatasetId, setActiveDatasetId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_KEY);
      if (saved && datasets.some(d => d.metadata.id === saved)) return saved;
    } catch (e) {
      console.error(e);
    }
    return datasets[0]?.metadata.id || DEFAULT_DATASETS[0].metadata.id;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));
    } catch (e) {
      console.error('Error saving datasets to storage:', e);
    }
  }, [datasets]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_KEY, activeDatasetId);
    } catch (e) {
      console.error('Error saving active dataset ID:', e);
    }
  }, [activeDatasetId]);

  const activeDataset = datasets.find(d => d.metadata.id === activeDatasetId) || datasets[0] || DEFAULT_DATASETS[0];

  const addDataset = (newDataset: FluidDataset) => {
    setDatasets(prev => [...prev, newDataset]);
    setActiveDatasetId(newDataset.metadata.id);
  };

  const updateDataset = (updatedDataset: FluidDataset) => {
    setDatasets(prev => prev.map(d => (d.metadata.id === updatedDataset.metadata.id ? updatedDataset : d)));
  };

  const deleteDataset = (id: string) => {
    if (datasets.length <= 1) {
      alert('At least one dataset must remain.');
      return;
    }
    const remaining = datasets.filter(d => d.metadata.id !== id);
    setDatasets(remaining);
    if (activeDatasetId === id) {
      setActiveDatasetId(remaining[0].metadata.id);
    }
  };

  const resetToDefaults = () => {
    setDatasets(DEFAULT_DATASETS);
    setActiveDatasetId(DEFAULT_DATASETS[0].metadata.id);
  };

  const exportDatasetCSV = (dataset: FluidDataset) => {
    const headers = 'Temperature_C,Density_kg_m3,SpecificHeat_J_kgK,ThermalConductivity_W_mK,DynamicViscosity_Pa_s\n';
    const rows = dataset.dataPoints
      .map(p => `${p.temperature},${p.density},${p.specificHeat},${p.conductivity},${p.viscosity}`)
      .join('\n');
    
    const comments = `# Dataset: ${dataset.metadata.name}\n# Description: ${dataset.metadata.description}\n# Source Citation: ${dataset.metadata.sourceCitation}\n# Classification: ${dataset.metadata.isDemo ? 'Illustrative Demo Dataset (Not clinical)' : 'Literature / Reference Dataset'}\n`;
    
    const blob = new Blob([comments + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${dataset.metadata.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_properties.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCSVTemplateString = (): string => {
    return `# Bioprocess Fluid Thermophysical Property Template
# Units:
# Temperature_C: Celsius (°C)
# Density_kg_m3: kg/m³
# SpecificHeat_J_kgK: J/(kg·K)
# ThermalConductivity_W_mK: W/(m·K)
# DynamicViscosity_Pa_s: Pa·s (1 mPa·s = 0.001 Pa·s)
Temperature_C,Density_kg_m3,SpecificHeat_J_kgK,ThermalConductivity_W_mK,DynamicViscosity_Pa_s
20,1000.0,4182.0,0.598,0.001002
30,996.0,4178.0,0.615,0.000798
40,992.0,4179.0,0.631,0.000653
50,988.0,4181.0,0.644,0.000547
60,983.0,4184.0,0.654,0.000467
`;
  };

  return (
    <DataContext.Provider
      value={{
        datasets,
        activeDatasetId,
        activeDataset,
        setActiveDatasetId,
        addDataset,
        updateDataset,
        deleteDataset,
        resetToDefaults,
        exportDatasetCSV,
        getCSVTemplateString
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
