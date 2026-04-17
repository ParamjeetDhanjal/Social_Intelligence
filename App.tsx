import React, { useState } from 'react';
import InputSection from './components/InputSection';
import ResultDashboard from './components/ResultDashboard';
import AnalyticsView from './components/AnalyticsView';
import HistoryView, { HistoryEntry } from './components/HistoryView';
import { AnalysisResult, AnalysisStatus, TVRow, SiteRow } from './types';
import { analyzeContent, regenerateSpecificSection, getAIRecommendation } from './services/geminiService';
import { usePersistentState } from './hooks/usePersistentState';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>({ state: 'IDLE' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [page, setPage] = useState<1 | 2 | 3 | 4>(() => {
    const saved = localStorage.getItem('activePage');
    return (saved ? parseInt(saved, 10) : 1) as 1 | 2 | 3 | 4;
  });
  const [currentInput, setCurrentInput] = usePersistentState<string>('ndtv_currentInput', '', 24);
  const [regenState, setRegenState] = useState<string | null>(null);

  // Persist page state
  React.useEffect(() => {
    localStorage.setItem('activePage', page.toString());
  }, [page]);

  // Clear any stale persisted result on mount so OUTPUT starts blank
  React.useEffect(() => {
    localStorage.removeItem('ndtv_result');
    // Debug: log API key status
    const key = (process.env as any).API_KEY;
    if (!key || key === 'undefined' || key.length === 0) {
      console.error('[NDTV] API_KEY is missing. Check .env.local has GEMINI_API_KEY=AIza...');
    } else {
      console.log('[NDTV] API_KEY loaded, length:', key.length, 'prefix:', key.slice(0, 6));
    }
  }, []);
  
  // Lifted state from InputSection
  const [tvRows, setTvRows] = usePersistentState<TVRow[]>('ndtv_tvRows', [], 24);
  const [siteRows, setSiteRows] = usePersistentState<SiteRow[]>('ndtv_siteRows', [], 24);

  // History: stored list of outputs, auto-expiring per item
  const [history, setHistory] = usePersistentState<HistoryEntry[]>('ndtv_history', [], 24);
  const [publishedMap, setPublishedMap] = usePersistentState<Record<string, Record<string, boolean>>>('ndtv_publishedMap', {}, 24);

  // Add to history when a new result is generated
  const addToHistory = (data: AnalysisResult, input: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const matchedRow = siteRows.find(r => input.includes(r.url) || input.includes(r.title));
    // Determine audit status
    const auditStatus = matchedRow?.auditStatus || '';
    
    const entry: HistoryEntry = {
      id,
      timestamp: Date.now(),
      storyTitle: matchedRow?.title || input.slice(0, 80),
      storyUrl: matchedRow?.url,
      result: data,
      actionsPublished: {},
      auditStatus,
    };
    
    // Purge old entries (older than 24h) and add new
    const now = Date.now();
    const fresh = (history || []).filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
    setHistory([entry, ...fresh]);
    return id;
  };

  const handleProcess = async (text: string, source: string) => {
    setStatus({ state: 'ANALYZING' });
    setCurrentInput(text);
    setResult(null); // clear old result before new generation
    try {
      const data = await analyzeContent(text);
      setResult(data);
      setStatus({ state: 'COMPLETE' });
      addToHistory(data, text);
      setPage(2);
    } catch (err: any) {
      console.error('[NDTV] Generation error:', err);
      setStatus({ state: 'ERROR', message: err.message || 'Gemini API call failed.' });
      setPage(2); // Go to output page to show the error
    }
  };

  const handleReset = () => {
    setResult(null);
    setStatus({ state: 'IDLE' });
    setPage(1);
    setCurrentInput('');
  };

  const handleRegenerate = async (section: string) => {
    if (!result || !currentInput) return;
    setRegenState(section);
    try {
      const generated = await regenerateSpecificSection(currentInput, section as any);
      const updated = { ...result };
      if (section === 'ImageCopy') {
        updated.imageCopy = generated;
      } else if (section === 'Telegram' || section === 'WhatsApp') {
        if (updated.platforms?.Telegram) updated.platforms.Telegram.postCopy = generated;
        if (updated.platforms?.WhatsApp) updated.platforms.WhatsApp.postCopy = generated;
      } else if (section === 'X') {
        if (updated.platforms?.X) updated.platforms.X.postCopy = generated;
      } else if (section === 'LinkedIn') {
        if (updated.platforms?.LinkedIn) updated.platforms.LinkedIn.postCopy = generated;
      } else if (section === 'FacebookInstagram') {
        if (updated.platforms?.FacebookInstagram) updated.platforms.FacebookInstagram.postCopy = generated;
      }
      setResult(updated);
    } catch (err: any) {
      console.error(err);
      setStatus({ state: 'ERROR', message: err.message });
    } finally {
      setRegenState(null);
    }
  };

  const handleAIRecommend = async (idx: number, navigateToOutput: boolean = true) => {
    const row = siteRows[idx];
    if (!row) return;
    
    const loadingRows = [...siteRows];
    loadingRows[idx].giveMeRec = "ANALYZING...";
    loadingRows[idx].auditStatus = '';
    setSiteRows(loadingRows);

    try {
      const recResult = await getAIRecommendation(row.title, row.url);
      const finalRows = [...siteRows];
      let auditSt: any = '';
      let cleanRec = recResult;
      const prefixes = ['[GO]', '[HOLD]', '[NO]'];
      for (const p of prefixes) {
        if (recResult.startsWith(p)) {
          auditSt = p.replace('[', '').replace(']', '');
          cleanRec = recResult.replace(p, '').trim();
          break;
        }
      }
      finalRows[idx].giveMeRec = cleanRec;
      finalRows[idx].auditStatus = auditSt;
      setSiteRows(finalRows);

      if (navigateToOutput) {
        handleProcess(row.title + ": " + row.url, `Recommendation Trigger: ${row.title}`);
      }
    } catch (err) {
      console.error(err);
      const errorRows = [...siteRows];
      errorRows[idx].giveMeRec = "ERROR";
      setSiteRows(errorRows);
    }
  };

  const handleMarkPublished = (platform: string) => {
    const updated = [...siteRows];
    const matchIndex = updated.findIndex(r => currentInput.includes(r.url) || currentInput.includes(r.title));
    
    if (matchIndex !== -1) {
      const currentAction = updated[matchIndex].actionTaken || '';
      if (!currentAction.includes(platform)) {
        updated[matchIndex].actionTaken = currentAction ? `${currentAction}, ${platform}` : platform;
        setSiteRows(updated);
      }
    }

    // Also save to the history entry's actionsPublished
    setHistory(prev => {
      if (!prev || prev.length === 0) return prev;
      // Update the most recent entry
      const updated = [...prev];
      if (updated[0]) {
        updated[0] = { ...updated[0], actionsPublished: { ...updated[0].actionsPublished, [platform]: true } };
      }
      return updated;
    });
  };

  // Load a history entry into the output view
  const handleOpenHistoryEntry = (entry: HistoryEntry) => {
    setResult(entry.result);
    setCurrentInput(entry.storyTitle);
    setStatus({ state: 'COMPLETE' });
    setPage(2); // Navigate to Output
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const navItems: { label: string; pg: 1 | 2 | 3 | 4 }[] = [
    { label: 'INPUT', pg: 1 },
    { label: 'OUTPUT', pg: 2 },
    { label: 'HISTORY', pg: 4 },
    { label: 'ANALYTICS', pg: 3 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Nav */}
      <header className="bg-slate-950 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50 border-b border-slate-800">
        <div>
           <div className="flex items-center gap-2">
             <span className="bg-red-600 font-bold text-white px-2 py-1 text-xs tracking-tighter rounded">ND</span>
             <div>
               <h1 className="font-bold text-sm tracking-tight leading-none">NDTV PROFIT</h1>
               <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Social Intelligence Unit</span>
             </div>
           </div>
        </div>
        <div className="flex items-center gap-4">
           {status.state === 'ANALYZING' && <span className="text-yellow-400 text-xs font-mono animate-pulse">GENERATING...</span>}
           {status.state === 'ERROR' && <span className="text-red-400 text-xs font-mono">{status.message}</span>}
            <div className="flex bg-slate-800 rounded p-1 text-xs font-semibold border border-slate-700 gap-1">
              {navItems.map(item => (
                <button
                  key={item.pg}
                  onClick={() => setPage(item.pg)}
                  className={`px-4 py-1.5 rounded transition-colors relative ${
                    page === item.pg ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {item.label}
                  {/* History badge */}
                  {item.pg === 4 && history.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                      {history.length > 9 ? '9+' : history.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full relative">
        {page === 1 && (
          <div className="absolute inset-0 w-full h-full overflow-y-auto">
            <InputSection 
              onProcessCustom={handleProcess} 
              tvRows={tvRows} 
              setTvRows={setTvRows} 
              siteRows={siteRows} 
              setSiteRows={setSiteRows} 
              onAIRecommend={(idx) => handleAIRecommend(idx, true)}
              onSocialAudit={(idx) => handleAIRecommend(idx, false)}
            />
          </div>
        )}

        {page === 2 && (
          <div className="absolute inset-0 w-full h-full overflow-y-auto">
            {status.state === 'ANALYZING' ? (
              <div className="flex items-center justify-center h-64 text-yellow-400 font-mono text-sm animate-pulse">
                GENERATING SOCIAL INTELLIGENCE...
              </div>
            ) : status.state === 'ERROR' ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
                <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-6 max-w-lg w-full text-center space-y-3">
                  <span className="text-red-400 font-black text-xs tracking-widest uppercase">⚠ Generation Failed</span>
                  <p className="text-red-300 font-mono text-sm break-words">{status.message}</p>
                  <p className="text-slate-500 text-xs mt-2">Check your <code className="bg-slate-800 px-1 rounded">.env.local</code> — ensure <code className="bg-slate-800 px-1 rounded">GEMINI_API_KEY</code> is a valid key starting with <code className="bg-slate-800 px-1 rounded">AIza...</code></p>
                  <button onClick={() => { setStatus({ state: 'IDLE' }); setPage(1); }} className="mt-2 border border-red-500/30 text-red-400 px-5 py-2 rounded text-xs hover:bg-red-500/10 transition-colors font-mono uppercase tracking-widest">
                    Back to Input
                  </button>
                </div>
              </div>
            ) : result ? (
              <ResultDashboard
                result={result}
                onReset={handleReset}
                onRegenerate={handleRegenerate}
                regenState={regenState}
                onMarkPublished={handleMarkPublished}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <span className="text-slate-700 text-4xl font-black tracking-widest font-mono select-none">—</span>
                <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">No output generated yet</p>
                <button
                  onClick={() => setPage(1)}
                  className="mt-2 text-slate-500 border border-slate-700 px-5 py-2 rounded text-xs hover:bg-slate-800 hover:text-slate-300 transition-colors tracking-widest font-mono uppercase"
                >
                  Go to Input
                </button>
              </div>
            )}
          </div>
        )}

        {page === 4 && (
          <div className="absolute inset-0 w-full h-full overflow-y-auto">
            <HistoryView
              history={history || []}
              onClearHistory={handleClearHistory}
              onOpenEntry={handleOpenHistoryEntry}
            />
          </div>
        )}

        {page === 3 && (
          <div className="absolute inset-0 w-full h-full overflow-y-auto">
             <AnalyticsView siteRows={siteRows} tvRows={tvRows} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;