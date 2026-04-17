import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Clock, CheckCircle, ExternalLink, ChevronDown, ChevronUp, Trash2, AlertCircle } from 'lucide-react';

export interface HistoryEntry {
  id: string;
  timestamp: number; // Unix ms
  storyTitle: string;
  storyUrl?: string;
  result: AnalysisResult;
  actionsPublished: Record<string, boolean>;
  auditStatus?: string; // GO / HOLD / NO
}

interface HistoryViewProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onOpenEntry: (entry: HistoryEntry) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory, onOpenEntry }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) +
           ' · ' + d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const getTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  const getExpiresIn = (ts: number) => {
    const expiresAt = ts + 24 * 60 * 60 * 1000;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';
    const hrs = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    return `${hrs}h ${mins}m remaining`;
  };

  const getPublishedPlatforms = (entry: HistoryEntry) => {
    return Object.entries(entry.actionsPublished)
      .filter(([, v]) => v)
      .map(([k]) => k);
  };

  const auditColors: Record<string, string> = {
    GO: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    HOLD: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    NO: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 text-center">
        <Clock size={48} className="text-slate-700 mb-4" />
        <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-2">No History Yet</h3>
        <p className="text-slate-600 text-sm max-w-xs">
          Generate your first AI output from the Input Page. All outputs and action history will appear here for 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] min-h-screen p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-6 bg-red-600 rounded-full" />
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Output History</h2>
            </div>
            <p className="text-slate-500 text-xs uppercase tracking-widest ml-4">
              {history.length} session{history.length !== 1 ? 's' : ''} · Auto-expires in 24h
            </p>
          </div>
          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        </div>

        {/* History Cards */}
        <div className="space-y-4">
          {history.map((entry, idx) => {
            const published = getPublishedPlatforms(entry);
            const isExpanded = expandedId === entry.id;
            const platforms = Object.entries(entry.result?.platforms || {});

            return (
              <div
                key={entry.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
              >
                {/* Card Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-slate-800/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Audit Status Badge */}
                        {entry.auditStatus && auditColors[entry.auditStatus] && (
                          <span className={`text-[9px] font-black border px-2 py-0.5 rounded uppercase tracking-widest ${auditColors[entry.auditStatus]}`}>
                            {entry.auditStatus}
                          </span>
                        )}
                        {/* Story # */}
                        <span className="text-[10px] text-slate-600 font-mono">#{String(history.length - idx).padStart(2, '0')}</span>
                        {/* Time */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Clock size={10} />
                          <span>{formatTime(entry.timestamp)}</span>
                          <span className="text-slate-700">·</span>
                          <span>{getTimeAgo(entry.timestamp)}</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-tight line-clamp-1 mb-2">
                        {entry.storyTitle}
                      </h3>

                      {/* Platform Pills */}
                      <div className="flex flex-wrap gap-1">
                        {platforms.map(([key]) => {
                          const wasPublished = entry.actionsPublished[key];
                          return (
                            <span
                              key={key}
                              className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                                wasPublished
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-slate-800 text-slate-500 border-slate-700'
                              }`}
                            >
                              {wasPublished ? '✓ ' : ''}{key}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Expires In */}
                      <div className="text-right hidden md:block">
                        <p className="text-[9px] text-slate-600 uppercase tracking-widest">Expires</p>
                        <p className="text-[10px] text-amber-400/70 font-mono">{getExpiresIn(entry.timestamp)}</p>
                      </div>

                      {/* Load Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenEntry(entry); }}
                        className="flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap"
                      >
                        <ExternalLink size={12} />
                        View Output
                      </button>

                      {/* Expand/Collapse */}
                      {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/50 p-5 space-y-4">
                    {/* Published Platforms */}
                    <div>
                      <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle size={10} className="text-emerald-400" />
                        Action Taken — Published To
                      </h4>
                      {published.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {published.map(p => (
                            <span key={p} className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                              ✓ {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-600 text-xs italic">No platforms marked as published.</p>
                      )}
                    </div>

                    {/* Preview of Platform Copies */}
                    <div>
                      <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Generated Content Preview</h4>
                      <div className="space-y-3">
                        {platforms.slice(0, 3).map(([key, data]) => {
                          const copy = (data as any)?.postCopy || '';
                          return (
                            <div key={key} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-2">{copy || 'No content generated.'}</p>
                            </div>
                          );
                        })}
                        {platforms.length > 3 && (
                          <p className="text-[10px] text-slate-600 italic">+ {platforms.length - 3} more platform(s)...</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-8 flex items-center gap-2 text-slate-600 text-xs border-t border-slate-800 pt-6">
          <AlertCircle size={12} />
          <p>History is stored locally in your browser and auto-clears after 24 hours from each entry's creation time.</p>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
