export interface LiteraturePaper {
  id: string;
  slotNumber: number; // 1 to 5
  slotTheme: string;  // Prescribed theme title
  title: string;
  authors: string;
  citation: string;
  doiOrUrl: string;
  fluidSystem: string;
  temperatureRange: string;
  methodDescription: string;
  reportedValuesOrTrends: string;
  parityAssessment: 'Comparable' | 'Qualitative Match' | 'Condition Mismatch' | 'Not Evaluated';
  mismatchRationale?: string;
  studentNotes: string;
  lastUpdated: string;
}
