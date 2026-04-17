
// Fix: Import React to resolve 'Cannot find namespace React' errors
import React, { useState } from 'react';
import { PlatformStrategy } from '../types';
import { refineStrategy, regenerateStrategy } from '../services/geminiService';

interface StrategyCardProps {
  strategy: PlatformStrategy;
  originalContent: string;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, originalContent }) => {
  const [postCopy, setPostCopy] = useState(strategy.postCopy);
  const [isRefining, setIsRefining] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShowingRecommendation, setIsShowingRecommendation] = useState(strategy.platformVerdict === 'GO');

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setIsLoading(true);
    try {
      const newCopy = await refineStrategy(originalContent, strategy.platform, postCopy, chatInput);
      setPostCopy(newCopy);
      setChatInput('');
      setIsRefining(false);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const newCopy = await regenerateStrategy(originalContent, strategy.platform, postCopy);
      setPostCopy(newCopy);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const verdictColors: Record<string, string> = {
    'GO': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50',
    'HOLD': 'bg-amber-500/10 text-amber-500 border-amber-500/50',
    'NO': 'bg-red-500/10 text-red-500 border-red-500/50'
  };

  const editorPersona = (strategy.platformVerdict === 'HOLD' || strategy.platformVerdict === 'NO') 
    ? "The AI Editor" 
    : "The Content Director";

  return (
    <div className={`bg-slate-800 border-l-4 ${strategy.platformVerdict === 'GO' ? 'border-l-emerald-600' : strategy.platformVerdict === 'HOLD' ? 'border-l-amber-600' : 'border-l-red-600'} rounded-r-lg shadow-xl overflow-hidden mb-4 transition-all duration-300`}>
      {/* Platform Header */}
      <div className="bg-slate-900/80 px-6 py-3 border-b border-slate-700 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="font-black uppercase tracking-widest text-white text-md">{strategy.platform}</span>
          <div className={`px-2 py-0.5 rounded border text-[9px] font-bold tracking-tighter ${verdictColors[strategy.platformVerdict] || 'text-slate-500'}`}>
            {strategy.platformVerdict}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
             <span className="text-[8px] text-slate-500 uppercase font-bold">Fit</span>
             <span className="text-xs font-mono font-bold text-white">{strategy.platformFitScore}/10</span>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
           <div>
             <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold block">Primary Metric</span>
             <span className="text-[10px] text-slate-300 font-bold">{strategy.publishingReason}</span>
           </div>
           <button onClick={handleRefresh} disabled={isLoading} className="text-slate-500 hover:text-emerald-400 transition-colors p-1">
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
           </button>
        </div>
      </div>

      {!isShowingRecommendation ? (
        <div className="p-8 flex flex-col items-center justify-center bg-slate-900/20 text-center">
          <p className="text-xs text-slate-400 mb-4 font-medium max-w-md">
            {editorPersona} has limited rollout for this platform.
          </p>
          <button 
            onClick={() => setIsShowingRecommendation(true)}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            Show Caption
          </button>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Optimized Caption</label>
                <button onClick={() => copyToClipboard(postCopy)} className="bg-slate-700 px-3 py-0.5 rounded text-[9px] text-white hover:bg-slate-600 transition-colors uppercase tracking-widest font-bold">Copy</button>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-700/50 shadow-inner">
                 <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">{postCopy}</p>
              </div>

              <div className="mt-2">
                 {!isRefining ? (
                   <button onClick={() => setIsRefining(true)} className="text-[9px] text-slate-600 hover:text-purple-400 flex items-center gap-1.5 transition-colors uppercase font-bold tracking-widest">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     Request Edit
                   </button>
                 ) : (
                   <form onSubmit={handleRefine} className="flex gap-2">
                     <input 
                       autoFocus
                       value={chatInput} 
                       onChange={(e) => setChatInput(e.target.value)} 
                       placeholder="e.g. 'Shorten the hook'..." 
                       className="flex-1 bg-slate-900 border border-slate-600 rounded-md px-3 py-1.5 text-[11px] text-white outline-none focus:ring-1 focus:ring-purple-600"
                     />
                     <button type="submit" disabled={isLoading} className="bg-purple-700 px-4 rounded-md text-[9px] font-bold text-white uppercase tracking-widest">Apply</button>
                     <button type="button" onClick={() => setIsRefining(false)} className="px-2 text-slate-500 hover:text-white">✕</button>
                   </form>
                 )}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 border-t border-slate-700 pt-2 flex justify-between">
               <span>Platform Context: {strategy.notes}</span>
               <span className="font-bold italic">Angle: {strategy.angle}</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default StrategyCard;
