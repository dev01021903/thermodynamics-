import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Download, AlertCircle } from 'lucide-react';
import { FluidDataset, DataPoint } from '../types/dataset';
import { useData } from '../context/DataContext';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose }) => {
  const { addDataset, getCSVTemplateString } = useData();

  const [rawText, setRawText] = useState<string>('');
  const [fluidName, setFluidName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [sourceCitation, setSourceCitation] = useState<string>('');
  const [publicationDetails, setPublicationDetails] = useState<string>('');
  const [measurementMethod, setMeasurementMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [interpolationMode, setInterpolationMode] = useState<'linear' | 'tabulated'>('linear');
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<DataPoint[] | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setRawText(content);
      parseCSVText(content);
    };
    reader.readAsText(file);
  };

  const parseCSVText = (text: string) => {
    setValidationError(null);
    setParsedPreview(null);

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
    
    if (lines.length < 2) {
      setValidationError('CSV must contain at least a header row and 1 or more data rows.');
      return;
    }

    const dataLines = lines.slice(1);
    const points: DataPoint[] = [];
    const seenTemps = new Set<number>();

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const cols = line.split(/[,\t;]/).map(c => c.trim());

      if (cols.length < 5) {
        setValidationError(`Row ${i + 2}: Insufficient columns. Expected 5 columns (T, ρ, Cp, k, μ). Found ${cols.length}.`);
        return;
      }

      const temp = parseFloat(cols[0]);
      const density = parseFloat(cols[1]);
      const specificHeat = parseFloat(cols[2]);
      const conductivity = parseFloat(cols[3]);
      const viscosity = parseFloat(cols[4]);

      if (isNaN(temp) || isNaN(density) || isNaN(specificHeat) || isNaN(conductivity) || isNaN(viscosity)) {
        setValidationError(`Row ${i + 2}: Non-numeric value encountered.`);
        return;
      }

      if (density <= 0 || specificHeat <= 0 || conductivity <= 0 || viscosity <= 0) {
        setValidationError(`Row ${i + 2}: Nonphysical values encountered (properties must be > 0).`);
        return;
      }

      if (seenTemps.has(temp)) {
        setValidationError(`Row ${i + 2}: Duplicate temperature (${temp} °C) detected.`);
        return;
      }
      seenTemps.add(temp);

      points.push({ temperature: temp, density, specificHeat, conductivity, viscosity });
    }

    points.sort((a, b) => a.temperature - b.temperature);
    setParsedPreview(points);
  };

  const handleDownloadTemplate = () => {
    const template = getCSVTemplateString();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'biotech_fluid_property_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    if (!fluidName.trim()) {
      setValidationError('Please specify a Fluid Model Name.');
      return;
    }
    if (!sourceCitation.trim()) {
      setValidationError('Please provide a Source Citation.');
      return;
    }
    if (!parsedPreview || parsedPreview.length < 2) {
      setValidationError('At least 2 valid temperature data points are required.');
      return;
    }

    const minT = parsedPreview[0].temperature;
    const maxT = parsedPreview[parsedPreview.length - 1].temperature;

    const newDataset: FluidDataset = {
      metadata: {
        id: `custom-dataset-${Date.now()}`,
        name: fluidName.trim(),
        description: description.trim() || 'Custom user-entered thermophysical dataset.',
        sourceCitation: sourceCitation.trim(),
        publicationDetails: publicationDetails.trim() || undefined,
        applicableTempRange: [minT, maxT],
        measurementMethod: measurementMethod.trim() || 'User Imported CSV Data',
        notes: notes.trim() || undefined,
        isDemo: false,
        interpolationMode,
        createdAt: new Date().toISOString().split('T')[0]
      },
      dataPoints: parsedPreview
    };

    addDataset(newDataset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-800 overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Import Property Dataset (CSV)</h3>
              <p className="text-xs text-slate-400">Add literature-derived or student-measured thermophysical data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Template Download & File Picker */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-teal-300">Standardized CSV Format</h4>
              <p className="text-[11px] text-slate-400">Columns: Temperature (°C), ρ (kg/m³), Cp (J/kg·K), k (W/m·K), μ (Pa·s)</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Template</span>
              </button>
              <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Browse File</span>
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Fluid Model Name *</label>
              <input
                type="text"
                placeholder="e.g., Bovine Serum Albumin Solution (50 mg/mL)"
                value={fluidName}
                onChange={e => setFluidName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Source Citation *</label>
              <input
                type="text"
                placeholder="e.g., Author et al., Journal of Bioengineering (2024)"
                value={sourceCitation}
                onChange={e => setSourceCitation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Publication Details / DOI</label>
              <input
                type="text"
                placeholder="e.g., https://doi.org/10.1016/..."
                value={publicationDetails}
                onChange={e => setPublicationDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Measurement / Estimation Method</label>
              <input
                type="text"
                placeholder="e.g., Differential Scanning Calorimetry"
                value={measurementMethod}
                onChange={e => setMeasurementMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">Composition &amp; Model Description</label>
              <textarea
                rows={2}
                placeholder="Details regarding solute concentration, ionic strength, pH, or specific bioprocess context..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Raw CSV Textarea */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Or Paste CSV Data Below:</label>
              <button
                type="button"
                onClick={() => {
                  setRawText(getCSVTemplateString());
                  parseCSVText(getCSVTemplateString());
                }}
                className="text-teal-400 hover:text-teal-300 font-medium"
              >
                Insert Sample Data
              </button>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={e => {
                setRawText(e.target.value);
                parseCSVText(e.target.value);
              }}
              placeholder="Temperature_C,Density_kg_m3,SpecificHeat_J_kgK,ThermalConductivity_W_mK,DynamicViscosity_Pa_s&#10;20,1000.0,4182.0,0.598,0.001002&#10;30,996.0,4178.0,0.615,0.000798"
              className="w-full px-3 py-2 font-mono text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl flex items-start space-x-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview && (
            <div className="space-y-2 border border-slate-800 rounded-xl p-3.5 bg-slate-950">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Parsed &amp; Validated {parsedPreview.length} Data Points</span>
                </span>
                <span className="font-mono text-slate-400">
                  Range: {parsedPreview[0].temperature} °C to {parsedPreview[parsedPreview.length - 1].temperature} °C
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-lg bg-slate-900">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0">
                    <tr>
                      <th className="p-1.5 px-2">T (°C)</th>
                      <th className="p-1.5 px-2">ρ (kg/m³)</th>
                      <th className="p-1.5 px-2">Cp (J/kg·K)</th>
                      <th className="p-1.5 px-2">k (W/m·K)</th>
                      <th className="p-1.5 px-2">μ (Pa·s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                    {parsedPreview.map((pt, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/60">
                        <td className="p-1.5 px-2 font-semibold text-teal-300">{pt.temperature}</td>
                        <td className="p-1.5 px-2">{pt.density.toFixed(2)}</td>
                        <td className="p-1.5 px-2">{pt.specificHeat.toFixed(1)}</td>
                        <td className="p-1.5 px-2">{pt.conductivity.toFixed(3)}</td>
                        <td className="p-1.5 px-2">{pt.viscosity.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!parsedPreview || parsedPreview.length < 2}
            className="px-5 py-2 rounded-lg bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-teal-500/20"
          >
            Save &amp; Load Dataset
          </button>
        </div>
      </div>
    </div>
  );
};
