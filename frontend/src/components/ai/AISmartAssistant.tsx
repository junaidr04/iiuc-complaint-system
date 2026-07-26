import React from 'react';
import { AIAnalysisResult } from '../../types';
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle, ShieldAlert } from 'lucide-react';

interface AISmartAssistantProps {
  analysis: AIAnalysisResult | null;
  isLoading: boolean;
  onApplyCategory: (cat: string) => void;
  onApplyPriority: (priority: any) => void;
}

export const AISmartAssistant: React.FC<AISmartAssistantProps> = ({
  analysis,
  isLoading,
  onApplyCategory,
  onApplyPriority,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 border border-blue-200 dark:border-blue-900 rounded-2xl flex items-center gap-3 animate-pulse">
        <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
          AI Engine is analyzing problem text, checking duplicate logs & predicting priority...
        </span>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-blue-50/80 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-2xl shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              CCMS AI Real-time Diagnostics
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Automatic classification & duplicate detection
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-md font-semibold">
          {Math.round(analysis.confidence * 100)}% Confidence
        </span>
      </div>

      {/* Categorization & Priority Recommendation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Predicted Category</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{analysis.predictedCategory}</span>
          </div>
          <button
            type="button"
            onClick={() => onApplyCategory(analysis.predictedCategory)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
          >
            Apply Category
          </button>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Predicted Priority</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{analysis.predictedPriority}</span>
          </div>
          <button
            type="button"
            onClick={() => onApplyPriority(analysis.predictedPriority)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
          >
            Apply Priority
          </button>
        </div>
      </div>

      {/* Duplicate Warning if Similarity Score High */}
      {analysis.possibleDuplicates && analysis.possibleDuplicates.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Duplicate Complaint Warning ({analysis.possibleDuplicates.length} Similar Active Case Found)
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            A similar issue has already been reported. You can track or upvote existing cases to avoid duplicate queueing:
          </p>
          <ul className="space-y-1 pt-1">
            {analysis.possibleDuplicates.map((dup) => (
              <li key={dup.id} className="p-1.5 bg-white dark:bg-slate-900 rounded border border-amber-200 dark:border-amber-900 flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{dup.id}: {dup.title}</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                  {Math.round(dup.similarityScore * 100)}% Match
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Smart Troubleshooting Suggestions */}
      {analysis.smartSuggestions && analysis.smartSuggestions.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Instant Troubleshooting Guidance & FAQs
          </div>
          {analysis.smartSuggestions.map((sug, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">{sug.title}</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{sug.solution}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
