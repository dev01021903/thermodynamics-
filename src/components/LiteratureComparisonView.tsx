import React, { useState } from 'react';
import { useLiterature } from '../context/LiteratureContext';
import { LiteraturePaper } from '../types/literature';
import {
  BookOpen,
  Edit3,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Save
} from 'lucide-react';

export const LiteratureComparisonView: React.FC = () => {
  const { papers, updatePaper, resetLiteratureToDefault } = useLiterature();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<LiteraturePaper | null>(null);

  const handleStartEdit = (paper: LiteraturePaper) => {
    setEditingId(paper.id);
    setEditForm({ ...paper });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      updatePaper(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>Academic Literature Synthesis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Literature Benchmark &amp; Parity Evaluation</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Structured review across 5 prescribed themes (Papers 1–5) comparing computational outputs against peer-reviewed studies.
          </p>
        </div>

        <button
          onClick={resetLiteratureToDefault}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>Reset Literature References</span>
        </button>
      </div>

      {/* Scope and Transparency Disclaimer */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex items-start space-x-3.5">
        <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white text-sm block">Academic Provenance &amp; Validation Policy</span>
          <p>
            Thermodynamic simulations are compared with literature only when definitions, boundary conditions, fluid compositions, and operating temperatures are genuinely equivalent. Where models diverge (for instance, conduit flow with viscous dissipation versus closed-system lumped thermal balances), a <span className="text-amber-300 font-semibold">Qualitative Match</span> or <span className="text-rose-300 font-semibold">Condition Mismatch</span> is clearly documented. No claim of experimental validation is made for literature that has not been configured.
          </p>
        </div>
      </div>

      {/* 5 Structured Paper Cards Grid */}
      <div className="space-y-6">
        {papers.map(paper => {
          const isEditing = editingId === paper.id;

          return (
            <div
              key={paper.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4 hover:border-teal-500/30 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-500/30">
                    #{paper.slotNumber}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                      {paper.slotTheme}
                    </span>
                    <h3 className="font-bold text-white text-base">{paper.title}</h3>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      paper.parityAssessment === 'Comparable'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : paper.parityAssessment === 'Qualitative Match'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : paper.parityAssessment === 'Condition Mismatch'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {paper.parityAssessment}
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(paper)}
                      className="p-1.5 text-slate-400 hover:text-teal-300 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit Paper Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode */}
              {!isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Citation &amp; DOI</span>
                      <p className="font-medium text-slate-200 leading-snug">{paper.citation}</p>
                      {paper.doiOrUrl && (
                        <a
                          href={paper.doiOrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-400 hover:text-teal-300 inline-flex items-center space-x-1 font-mono text-[11px] pt-0.5"
                        >
                          <span>{paper.doiOrUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Fluid System &amp; Operating Range</span>
                      <p className="font-semibold text-slate-200">{paper.fluidSystem}</p>
                      <p className="text-slate-400 font-mono text-[11px]">Temperature Range: {paper.temperatureRange}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-300 block">Method / Model Description</span>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{paper.methodDescription}</p>
                    </div>

                    <div className="space-y-1 p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-300 block">Reported Trends &amp; Findings</span>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{paper.reportedValuesOrTrends}</p>
                    </div>
                  </div>

                  {paper.mismatchRationale && (
                    <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1">
                      <span className="font-bold text-amber-300 block text-[11px]">Comparison &amp; Parity Analysis</span>
                      <p className="text-amber-200 text-[11px] leading-relaxed">{paper.mismatchRationale}</p>
                    </div>
                  )}

                  {paper.studentNotes && (
                    <div className="p-3 bg-teal-950/30 border border-teal-500/20 rounded-xl space-y-1">
                      <span className="font-bold text-teal-300 block text-[11px]">Student Seminar / Exam Notes</span>
                      <p className="text-teal-200 text-[11px] leading-relaxed italic">{paper.studentNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Mode Form */
                <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Article Title</label>
                      <input
                        type="text"
                        value={editForm?.title}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, title: e.target.value } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Authors</label>
                      <input
                        type="text"
                        value={editForm?.authors}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, authors: e.target.value } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-slate-300">Citation (APA/Standard)</label>
                      <input
                        type="text"
                        value={editForm?.citation}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, citation: e.target.value } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">DOI / URL</label>
                      <input
                        type="text"
                        value={editForm?.doiOrUrl}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, doiOrUrl: e.target.value } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Parity Assessment</label>
                      <select
                        value={editForm?.parityAssessment}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, parityAssessment: e.target.value as any } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs font-semibold"
                      >
                        <option value="Comparable">Comparable</option>
                        <option value="Qualitative Match">Qualitative Match</option>
                        <option value="Condition Mismatch">Condition Mismatch</option>
                        <option value="Not Evaluated">Not Evaluated</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Fluid System</label>
                      <input
                        type="text"
                        value={editForm?.fluidSystem}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, fluidSystem: e.target.value } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Temperature Range</label>
                      <input
                        type="text"
                        value={editForm?.temperatureRange}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, temperatureRange: e.target.value } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-slate-300">Reported Trends &amp; Findings</label>
                      <textarea
                        rows={2}
                        value={editForm?.reportedValuesOrTrends}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, reportedValuesOrTrends: e.target.value } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-slate-300">Parity / Mismatch Rationale</label>
                      <textarea
                        rows={2}
                        value={editForm?.mismatchRationale}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, mismatchRationale: e.target.value } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-slate-300">Student Seminar Notes</label>
                      <textarea
                        rows={2}
                        value={editForm?.studentNotes}
                        onChange={e => setEditForm(prev => (prev ? { ...prev, studentNotes: e.target.value } : null))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
