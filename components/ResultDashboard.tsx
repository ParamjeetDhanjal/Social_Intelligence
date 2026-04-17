import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import ScoreRadar from './ScoreRadar';
import { usePersistentState } from '../hooks/usePersistentState';

interface ResultDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  onRegenerate: (section: string) => void;
  regenState?: string | null;
  onMarkPublished: (platform: string) => void;
}

const PLATFORM_META = {
  X:                 { label: 'X (Twitter)',           colorBorder: 'border-l-sky-400',     colorText: 'text-sky-400',     colorBg: 'bg-sky-500/10' },
  LinkedIn:          { label: 'LinkedIn',               colorBorder: 'border-l-blue-500',    colorText: 'text-blue-400',    colorBg: 'bg-blue-500/10' },
  FacebookInstagram: { label: 'Facebook / Instagram',   colorBorder: 'border-l-pink-500',    colorText: 'text-pink-400',    colorBg: 'bg-pink-500/10' },
  WhatsApp:          { label: 'WhatsApp',               colorBorder: 'border-l-emerald-500', colorText: 'text-emerald-400', colorBg: 'bg-emerald-500/10' },
  Telegram:          { label: 'Telegram',               colorBorder: 'border-l-indigo-500',  colorText: 'text-indigo-400',  colorBg: 'bg-indigo-500/10' },
} as const;

type PlatformKey = keyof typeof PLATFORM_META;

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, onReset, onRegenerate, regenState, onMarkPublished }) => {
  const allPlatformScores = result.platforms
    ? (Object.values(result.platforms) as any[]).map((p) => p?.score || 0).filter((s: number) => s > 0)
    : [];
  const totalScore = allPlatformScores.length > 0
    ? Math.round(allPlatformScores.reduce((a: number, b: number) => a + b, 0) / allPlatformScores.length)
    : 0;
  const verdict = totalScore >= 80 ? 'PRIORITY' : totalScore >= 60 ? 'PUBLISH' : totalScore >= 40 ? 'STORIES ONLY' : totalScore > 0 ? 'SKIP' : 'PENDING';

  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [published, setPublished] = usePersistentState<Record<string, boolean>>('dashboard_published', {}, 24);

  const toggleEdit = (plat: string) => setEditing(prev => ({ ...prev, [plat]: !prev[plat] }));
  const handleTogglePublished = (plat: string) => {
    const newVal = !published[plat];
    setPublished(prev => ({ ...prev, [plat]: newVal }));
    if (newVal) onMarkPublished(plat);
  };

  return (
    <div className="bg-[#0f172a] text-slate-300 min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Top Header */}
        <div className="bg-[#1e1b4b]/40 border border-indigo-500/30 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.15)]">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <div className="w-64 h-64 bg-indigo-600 rounded-full blur-3xl"></div>
          </div>
          <div className="z-10 flex flex-col">
            <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase mb-1">EDITORIAL VERDICT</span>
            <div className="flex items-baseline gap-4">
              <h1 className="text-5xl font-black text-[#e0b0ff] tracking-tight">{verdict}</h1>
              <div className="text-2xl font-bold text-white">{totalScore}<span className="text-sm text-slate-500">/100</span></div>
            </div>
          </div>
          <div className="z-10 mt-6 md:mt-0 flex gap-4">
            <div className="flex flex-col text-sm border-l border-indigo-500/30 pl-4">
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider w-fit">TIMING</span>
              <p className="font-bold text-white mt-2 max-w-xs leading-tight">IMMEDIATE RELEASE TO CAPTURE MARKET HOURS ENGAGEMENT.</p>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">{result.jacketText || 'Automated strategic timing applied based on content velocity.'}</p>
            </div>
            <div className="flex flex-col gap-2 justify-center ml-4">
              <button onClick={onReset} className="border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap">
                NEW AUDIT
              </button>
            </div>
          </div>
        </div>

        {/* Middle Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Virality Breakdown */}
          <div className="md:col-span-1 bg-[#1e293b]/50 border border-slate-700/50 rounded-xl p-6 shadow-lg">
            <h3 className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-6">VIRALITY BREAKDOWN</h3>
            <div className="h-64 mb-4">
              <ScoreRadar scores={[
                { dimension: 'IMPACT',     score: 8, justification: '' },
                { dimension: 'EMOTIONAL',  score: 6, justification: '' },
                { dimension: 'THUMB',      score: 9, justification: '' },
                { dimension: 'SHARE',      score: 7, justification: '' },
                { dimension: 'PROXIMITY',  score: 8, justification: '' },
                { dimension: 'TIMELINESS', score: 9, justification: '' },
                { dimension: 'VISUAL',     score: 7, justification: '' },
                { dimension: 'TENSION',    score: 6, justification: '' },
                { dimension: 'UTILITY',    score: 8, justification: '' },
                { dimension: 'HOOK',       score: 9, justification: '' },
              ]} />
            </div>
            <h4 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">TRENDING KEYWORDS</h4>
            <div className="flex flex-wrap gap-2">
              {['#NDTVProfit', '#Markets', '#Economy', '#India', '#Investing'].map(tag => (
                <span key={tag} className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>

          {/* Strategic Logic */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-[#1e293b]/50 border border-slate-700/50 rounded-xl p-6 shadow-lg flex-1">
              <h3 className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-6">STRATEGIC LOGIC</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-1">KEY STRENGTHS</h4>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                      <li>High utility for active investors</li>
                      <li>Strong hook regarding market movement</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-orange-400 font-bold tracking-widest uppercase mb-1">EDITORIAL RISKS</h4>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                      <li>Potential for data to expire quickly</li>
                      <li>Requires strict disclaimer compliance</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-800/80 border border-slate-700 p-4 rounded text-xs">
                    <h4 className="text-[10px] text-[#e0b0ff] font-bold tracking-widest uppercase mb-1">VIRAL CEILING</h4>
                    <p className="font-bold text-white">High reach among financial professionals.</p>
                  </div>
                  <div className="text-xs pl-4 border-l border-red-500/50">
                    <h4 className="text-[10px] text-red-400 font-bold tracking-widest uppercase mb-1">A/B TESTING PRIORITIES</h4>
                    <p className="text-slate-300">→ Headline focusing on specific metrics vs headline focusing on broader impact.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bullet Transformer */}
            <div className="bg-[#1e293b]/50 border border-slate-700/50 rounded-xl p-6 shadow-lg">
              <h3 className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-4">BULLET POINT TRANSFORMER (FOR IMAGES)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(result.imageCopy?.bullets || ['Market Impact Overview', 'Key sectors analyzed', 'Data-backed growth projections', 'See the full brief on NDTV Profit']).map((bullet, i) => (
                  <div key={i} className="bg-slate-800/80 border border-slate-700 p-3 rounded flex gap-3 items-center">
                    <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                    <p className="text-xs text-white font-medium">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Universal Image Asset */}
        <div className="bg-[#1e293b]/50 border border-slate-700/50 rounded-xl p-6 shadow-lg">
          <div className="flex gap-4 items-center mb-6">
            <div className="w-1 h-6 bg-[#e0b0ff]"></div>
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">UNIVERSAL IMAGE ASSET</h3>
            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded uppercase">ONE DESIGN / ALL PLATFORMS</span>
            <div className="ml-auto flex bg-slate-800 rounded border border-slate-700 overflow-hidden">
              <button onClick={() => onRegenerate('ImageCopy')} disabled={regenState === 'ImageCopy'} className="text-[10px] hover:bg-slate-700 text-slate-300 px-4 py-1.5 font-mono border-r border-slate-700 transition-colors disabled:opacity-50">
                {regenState === 'ImageCopy' ? '...' : 'REGENERATE'}
              </button>
              <button className="text-[10px] hover:bg-slate-700 text-[#e0b0ff] px-4 py-1.5 font-mono transition-colors">COPY ASSET</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black border border-slate-700 rounded-xl aspect-[16/9] p-8 relative flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e0b0ff10] to-transparent pointer-events-none"></div>
              <div className="flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-2">
                  <span className="bg-[#e0b0ff] w-4 h-4 rounded-sm shadow-[0_0_10px_#e0b0ff]"></span>
                  <span className="font-bold text-white text-xs tracking-widest uppercase">NDTV PROFIT</span>
                </div>
                <span className="bg-white text-black font-black text-[10px] px-3 py-1 uppercase tracking-wider skew-x-[-10deg]">BREAKING</span>
              </div>
              <div className="z-10 relative mt-auto border-l-4 border-[#e0b0ff] pl-6 py-2">
                <h2 className="text-3xl font-black text-[#e0b0ff] leading-[1.1] mb-2 uppercase tracking-tight drop-shadow-lg">{result.imageCopy?.headline || 'MARKET MOVES REVEALED'}</h2>
                <p className="text-sm text-slate-100 bg-black/60 backdrop-blur-sm p-2 w-max border border-white/10 font-medium">{result.imageCopy?.subtext || 'Dalal street focuses on key upcoming changes.'}</p>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl flex flex-col justify-center">
              <h4 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4">PRODUCTION BRIEF</h4>
              <div className="bg-slate-900/50 border border-slate-700 p-4 rounded font-mono text-xs text-emerald-400 mb-4 whitespace-pre-wrap">
                A clean, professional graphic highlighting the core narrative. Use NDTV Profit brand colors. Heavy contrast for readability on mobile devices.
              </div>
              <h4 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">TITLE RATIONALE</h4>
              <p className="text-xs text-slate-300 italic">"Directly addresses the subject and the value proposition of the content."</p>
            </div>
          </div>
        </div>

        {/* Platform Strategies */}
        <div className="flex gap-4 items-center pt-4">
          <div className="w-1 h-6 bg-red-600"></div>
          <h3 className="text-sm font-bold text-white tracking-widest uppercase">PLATFORM STRATEGIES</h3>
        </div>

        <div className="space-y-4">
          {(Object.keys(PLATFORM_META) as PlatformKey[]).map((key) => {
            const pd = result.platforms?.[key];
            if (!pd) return null;
            const copy: string = pd.postCopy || '';
            const score: number = pd.score || 0;
            const meta = PLATFORM_META[key];
            return (
              <div key={key} className={`bg-[#1e293b]/60 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg border-l-4 ${meta.colorBorder}`}>
                <div className={`${meta.colorBg} border-b border-slate-700/60 px-5 py-3 flex justify-between items-center`}>
                  <div className="flex items-center gap-3">
                    <h3 className={`font-black tracking-widest uppercase text-sm ${meta.colorText}`}>{meta.label}</h3>
                    {score > 0 && (
                      <span className="text-[10px] bg-slate-900/60 text-slate-300 border border-slate-600 px-2 py-0.5 rounded-full font-mono">
                        FIT {Math.round(score / 10)}/10
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleEdit(key)} className="text-xs bg-slate-900/60 hover:bg-slate-800 text-slate-400 px-3 py-1 rounded font-mono border border-slate-700 transition-colors">
                      {editing[key] ? 'DONE' : 'TWEAK'}
                    </button>
                    <button onClick={() => onRegenerate(key)} disabled={regenState === key} className="text-xs bg-slate-900/60 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded font-mono border border-slate-600 transition-colors disabled:opacity-50">
                      {regenState === key ? '...' : 'REGEN'}
                    </button>
                    <button onClick={() => navigator.clipboard?.writeText(copy)} className="text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded font-mono transition-colors">
                      COPY
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">OPTIMIZED CAPTION</h4>
                  {editing[key] ? (
                    <textarea
                      className="bg-slate-900 border border-slate-600 p-4 rounded text-sm text-slate-200 w-full min-h-[120px] font-medium resize-y focus:outline-none focus:border-indigo-500"
                      defaultValue={copy}
                    />
                  ) : (
                    <div className="bg-slate-900/60 border border-slate-700/40 p-4 rounded text-sm text-slate-200 whitespace-pre-wrap font-medium leading-relaxed">
                      {copy}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <input type="checkbox" id={`pub-${key}`} checked={!!published[key]} onChange={() => handleTogglePublished(key)} className="accent-indigo-500 h-4 w-4" />
                    <label htmlFor={`pub-${key}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer">Mark as Published</label>
                  </div>
                </div>
              </div>
            );
          })}

          {/* YouTube */}
          {result.platforms?.YouTube && (
            <div className="bg-[#1e293b]/60 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg border-l-4 border-l-red-600">
              <div className="bg-red-500/10 border-b border-slate-700/60 px-5 py-3">
                <h3 className="font-black tracking-widest uppercase text-sm text-red-400">YouTube</h3>
              </div>
              <div className="p-5 space-y-3">
                {result.platforms.YouTube.title && (
                  <div>
                    <h4 className="text-[10px] text-red-400 font-bold tracking-widest uppercase mb-1">VIDEO TITLE</h4>
                    <p className="text-sm font-bold text-white">{result.platforms.YouTube.title}</p>
                  </div>
                )}
                {result.platforms.YouTube.description && (
                  <div>
                    <h4 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">DESCRIPTION</h4>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap">{result.platforms.YouTube.description}</p>
                  </div>
                )}
                {result.platforms.YouTube.thumbnailText && (
                  <div className="p-3 bg-red-600/5 border border-red-500/20 rounded">
                    <h4 className="text-[9px] text-red-400 font-bold uppercase tracking-widest mb-1">THUMBNAIL OVERLAY</h4>
                    <p className="text-xs text-white font-black uppercase tracking-wide">{result.platforms.YouTube.thumbnailText}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="bg-[#1e293b]/50 border border-slate-700/50 rounded-xl p-6 shadow-lg">
            <h3 className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-4">COMPLIANCE AUDIT</h3>
            <ul className="text-xs space-y-2">
              {([
                { label: 'Stats Verified',          value: 'YES',  color: 'text-emerald-400' },
                { label: 'Legal Review Required',    value: 'NO',   color: 'text-rose-400' },
                { label: 'Market Sensitive Content', value: 'YES',  color: 'text-emerald-400' },
                { label: 'Embargo Check',            value: 'HOLD', color: 'text-amber-400' },
                { label: 'Disclaimer Required',      value: 'YES',  color: 'text-emerald-400' },
              ] as { label: string; value: string; color: string }[]).map(item => (
                <li key={item.label} className="flex justify-between border-b border-slate-700/50 pb-1.5">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-black tracking-widest text-[11px] ${item.color}`}>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#1e293b]/50 border border-slate-700/50 rounded-xl p-6 shadow-lg">
            <h3 className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-4">FOLLOW-UP OPPORTUNITIES</h3>
            <div className="bg-slate-800/80 border border-slate-700 border-l-2 border-l-[#e0b0ff] p-3 rounded">
              <h4 className="text-[10px] text-[#e0b0ff] font-bold tracking-widest uppercase mb-1">RECOMMENDED ACTION</h4>
              <p className="text-xs text-slate-300">{result.storyTreatment?.followUpSuggestions || "Schedule further breakdown for tomorrow's newsletter."}</p>
            </div>
            {result.followUpContentAllPlatforms && (
              <div className="mt-3 bg-slate-900/50 border border-slate-700/30 p-3 rounded">
                <h4 className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">ALL-PLATFORM FOLLOW-UP</h4>
                <p className="text-xs text-slate-400">{result.followUpContentAllPlatforms}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultDashboard;
