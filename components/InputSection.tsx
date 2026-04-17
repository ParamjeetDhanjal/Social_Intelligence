import React, { useState, useEffect } from 'react';
import { fetchNewsSitemap, fetchArticleContent } from '../services/scraperService';
import { Loader2, Link as LinkIcon, FileText, ImageIcon, FileCheck } from 'lucide-react';
import { TVRow, SiteRow, AlternateInputType } from '../types';

interface InputSectionProps {
  onProcessCustom: (text: string, source: string) => void;
  tvRows: TVRow[];
  setTvRows: (rows: TVRow[]) => void;
  siteRows: SiteRow[];
  setSiteRows: (rows: SiteRow[]) => void;
  onAIRecommend: (idx: number) => void;
  onSocialAudit: (idx: number) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  onProcessCustom, tvRows, setTvRows, siteRows, setSiteRows, onAIRecommend, onSocialAudit 
}) => {
  // Dynamic rows based on backend data (currently none, so NO DATA)
  // const [tvRows, setTvRows] = useState<TVRow[]>([]); // Removed - now props

  // const [siteRows, setSiteRows] = useState<SiteRow[]>([]); // Removed - now props
  const [altInputType, setAltInputType] = useState<AlternateInputType>('Story Pitch');
  const [altInputValue, setAltInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Poll XML every 30 seconds — auto-sync, preserves existing audit/action data
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (siteRows.length === 0) setLoading(true);
      
      const data = await fetchNewsSitemap();
      if (isMounted && data && data.length > 0) {
        // Merge: map all 40 XML items, preserve existing row audit/action/rec data by URL
        setSiteRows(prev => {
          const existingByUrl = new Map((prev || []).map(r => [r.url, r]));
          const merged = data.slice(0, 40).map((item, idx) => {
            const existing = existingByUrl.get(item.url);
            return existing
              ? { ...existing, id: idx + 1, title: item.title, timestamp: item.publicationDate
                  ? new Date(item.publicationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : existing.timestamp }
              : {
                  id: idx + 1,
                  title: item.title,
                  url: item.url,
                  timestamp: item.publicationDate
                    ? new Date(item.publicationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  giveMeRec: '',
                  auditStatus: '' as const,
                  actionTaken: ''
                };
          });
          return merged;
        });
      }
      if (isMounted) setLoading(false);
    };

    loadData();
    const intervalId = setInterval(loadData, 30000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleAuditTV = (index: number) => {
    onProcessCustom(`TV SCHEDULE AUDIT FOR ROW ${index+1}`, 'TV Schedule');
  };

  const handleAuditSite = async (index: number) => {
    const row = siteRows[index];
    if (row && row.url) {
      const extractedContent = await fetchArticleContent(row.url);
      const context = `TITLE: ${row.title}\nURL: ${row.url}\n\nCONTENT:\n${extractedContent.substring(0, 2500)}`;
      onProcessCustom(context, `Site URL: ${row.title}`);
    } else {
      onProcessCustom(`SITE URL AUDIT FOR ROW ${index+1}`, 'Site URLs');
    }
  };

  const handleRecommendSite = (idx: number) => {
    onAIRecommend(idx);
  };

  const handleAlternateProcess = () => {
    if (!altInputValue.trim() && altInputType !== 'Image Upload' && altInputType !== 'PDF Upload') return;
    onProcessCustom(altInputValue, `Input: ${altInputType}`);
  };

  return (
    <div className="w-full h-full p-4 md:p-8 font-sans text-sm space-y-12 pb-32">
      <div className="max-w-7xl mx-auto space-y-12">

        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Social Content <span className="text-red-600">Audit</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            The automated gatekeeper for NDTV Profit's social feeds.
          </p>
        </div>

        {/* Excel-like TV Sked Grid - Dark Theme */}
        <section className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white uppercase font-mono tracking-widest">TV Sked</h3>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-left border-collapse whitespace-nowrap text-slate-300">
              <thead>
                <tr className="bg-slate-900">
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold w-8 text-center text-slate-500"></th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-slate-400">Piece</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-slate-400">Start Time</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-slate-400">End Time</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-slate-400">Show</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-indigo-400">Generate Transcript</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-emerald-400">Social Audit</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-slate-400">Treatment</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-indigo-400">Generate Art</th>
                  <th className="border-b border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-blue-400">Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {tvRows.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-slate-500 font-bold uppercase tracking-widest text-lg bg-slate-900/50">NO DATA</td></tr>
                ) : tvRows.map((row, idx) => (
                  <tr key={row.id} className="bg-slate-800 hover:bg-slate-750 transition-colors">
                    <td className="border-b border-r border-slate-700 bg-slate-900/50 text-center text-xs text-slate-500">{row.id}</td>
                    <td className="border-b border-r border-slate-700 p-0"><input className="w-full h-full min-h-[36px] bg-transparent outline-none px-3 focus:bg-slate-700 focus:text-white" value={row.piece} onChange={e => {const r=[...tvRows]; r[idx].piece=e.target.value; setTvRows(r);}} /></td>
                    <td className="border-b border-r border-slate-700 p-0"><input className="w-full h-full min-h-[36px] bg-transparent outline-none px-3 focus:bg-slate-700 focus:text-white" value={row.startTime} onChange={e => {const r=[...tvRows]; r[idx].startTime=e.target.value; setTvRows(r);}} /></td>
                    <td className="border-b border-r border-slate-700 p-0"><input className="w-full h-full min-h-[36px] bg-transparent outline-none px-3 focus:bg-slate-700 focus:text-white" value={row.endTime} onChange={e => {const r=[...tvRows]; r[idx].endTime=e.target.value; setTvRows(r);}} /></td>
                    <td className="border-b border-r border-slate-700 p-0"><input className="w-full h-full min-h-[36px] bg-transparent outline-none px-3 focus:bg-slate-700 focus:text-white" value={row.show} onChange={e => {const r=[...tvRows]; r[idx].show=e.target.value; setTvRows(r);}} /></td>
                    <td className="border-b border-r border-slate-700 p-0 relative group">
                      <button className="absolute inset-0 w-full h-full hover:bg-indigo-500/10 transition-colors text-indigo-400 opacity-0 group-hover:opacity-100 font-bold text-xs">PROCESS</button>
                    </td>
                    <td className="border-b border-r border-slate-700 p-0 relative">
                      <button onClick={() => handleAuditTV(idx)} className="absolute inset-0 w-full h-full hover:bg-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-bold tracking-widest text-[10px] transition-colors flex items-center justify-center">AUDIT</button>
                    </td>
                    <td className="border-b border-r border-slate-700 p-0"><input className="w-full h-full min-h-[36px] bg-transparent outline-none px-3 focus:bg-slate-700 focus:text-white" value={row.treatment} onChange={e => {const r=[...tvRows]; r[idx].treatment=e.target.value; setTvRows(r);}} /></td>
                    <td className="border-b border-r border-slate-700 p-0 relative group">
                      <button className="absolute inset-0 w-full h-full hover:bg-indigo-500/10 transition-colors text-indigo-400 opacity-0 group-hover:opacity-100 font-bold text-xs">GENERATE</button>
                    </td>
                    <td className="border-b border-slate-700 p-0"><input className="w-full h-full min-h-[36px] bg-transparent outline-none px-3 focus:bg-slate-700 focus:text-white" value={row.actionTaken} onChange={e => {const r=[...tvRows]; r[idx].actionTaken=e.target.value; setTvRows(r);}} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Excel-like Site URLs Grid - Dark Theme */}
        <section className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white uppercase font-mono tracking-widest flex items-center gap-3">
              Site URLs
              {loading && <Loader2 className="animate-spin text-blue-500" size={16} />}
            </h3>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-left border-collapse whitespace-nowrap text-slate-300">
              <thead>
                <tr className="bg-slate-900">
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold w-8 text-center text-slate-500"></th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-slate-400">Title</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-slate-400">URL</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-slate-400">Timestamp</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-emerald-400">Social Audit</th>
                  <th className="border-b border-r border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-blue-400">Recommendation</th>
                  <th className="border-b border-slate-700 px-3 py-2 font-semibold tracking-wider text-[10px] uppercase text-blue-400">Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {loading && siteRows.length === 0 ? (
                   <tr><td colSpan={7} className="text-center py-6 text-slate-500 italic text-sm">FETCHING...</td></tr>
                ) : siteRows.length === 0 ? (
                   <tr><td colSpan={7} className="text-center py-6 text-slate-500 italic text-sm">NO DATA AVAILABLE</td></tr>
                ) : (
                  siteRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, localIdx) => {
                    const globalIdx = (currentPage - 1) * itemsPerPage + localIdx;
                    return (
                      <tr key={row.url} className="bg-slate-800 hover:bg-slate-750 transition-colors group">
                        <td className="border-b border-r border-slate-700 bg-slate-900/50 text-center text-xs text-slate-500">{row.id}</td>
                        <td className="border-b border-r border-slate-700 p-0">
                          <input 
                            className="w-full h-full min-h-[36px] bg-transparent outline-none px-3 focus:bg-slate-700 focus:text-white" 
                            value={row.title} 
                            onChange={e => {const r=[...siteRows]; r[globalIdx].title=e.target.value; setSiteRows(r);}} 
                          />
                        </td>
                        <td className="border-b border-r border-slate-700 p-0 text-xs px-3">
                           <a href={row.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1 group-hover:text-blue-200 truncate max-w-[200px]">
                             {new URL(row.url).pathname} <LinkIcon size={12} className="shrink-0"/>
                           </a>
                        </td>
                        <td className="border-b border-r border-slate-700 p-0 text-slate-400 text-xs text-center">{row.timestamp}</td>
                        <td className="border-b border-r border-slate-700 p-0 relative min-w-[90px]">
                            <div className="flex w-full h-full items-center justify-center px-2 py-1">
                               {row.auditStatus === 'GO' ? (
                                 <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded font-black text-[10px] tracking-widest uppercase">YES</span>
                               ) : row.auditStatus === 'HOLD' ? (
                                 <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded font-black text-[10px] tracking-widest uppercase">HOLD</span>
                               ) : row.auditStatus === 'NO' ? (
                                 <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded font-black text-[10px] tracking-widest uppercase">NO</span>
                               ) : (
                                 <button 
                                   onClick={() => onSocialAudit(globalIdx)} 
                                   className="w-full py-1.5 hover:bg-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-300 font-bold tracking-widest text-[9px] transition-colors flex items-center justify-center border border-slate-700 rounded"
                                 >
                                   AUDIT
                                 </button>
                               )}
                            </div>
                        </td>
                        <td className="border-b border-r border-slate-700 p-2 relative min-w-[180px]">
                            <div className="flex flex-col gap-1.5 w-full">
                               {/* Badge: YES / HOLD / NO */}
                               {row.auditStatus === 'GO' ? (
                                 <span className="self-start px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-[10px] tracking-widest">YES</span>
                               ) : row.auditStatus === 'HOLD' ? (
                                 <span className="self-start px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black text-[10px] tracking-widest">HOLD</span>
                               ) : row.auditStatus === 'NO' ? (
                                 <span className="self-start px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-black text-[10px] tracking-widest">NO</span>
                               ) : null}
                               {/* Justification text */}
                               {row.giveMeRec && row.giveMeRec !== 'ANALYZING...' && (
                                 <p className="text-[9px] text-slate-500 leading-tight line-clamp-2">{row.giveMeRec}</p>
                               )}
                               <button onClick={() => handleRecommendSite(globalIdx)} className="self-start bg-blue-600/10 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] tracking-widest font-bold transition-all whitespace-nowrap">
                                 {row.giveMeRec === 'ANALYZING...' ? 'PROCESSING...' : row.auditStatus ? 'RE-RUN' : 'RECOMMEND'}
                               </button>
                            </div>
                         </td>
                        <td className="border-b border-slate-700 p-0">
                          <input 
                            className="w-full h-full min-h-[36px] bg-transparent outline-none px-3 focus:bg-slate-700 focus:text-white" 
                            value={row.actionTaken} 
                            onChange={e => {const r=[...siteRows]; r[globalIdx].actionTaken=e.target.value; setSiteRows(r);}} 
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls — always show 4 pages (1-10, 11-20, 21-30, 31-40) */}
          <div className="flex justify-center items-center gap-2 mt-4 pb-2">
            {[1, 2, 3, 4].map(num => {
              const startIdx = (num - 1) * itemsPerPage;
              const hasItems = startIdx < siteRows.length;
              return (
                <button
                  key={num}
                  onClick={() => { if (hasItems) setCurrentPage(num); }}
                  className={`flex items-center justify-center font-bold text-xs transition-all px-3 h-8 rounded-lg ${
                    currentPage === num
                      ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                      : hasItems
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                        : 'bg-slate-900 text-slate-700 border border-slate-800 cursor-default'
                  }`}
                >
                  <span className="text-[9px] text-slate-500 font-normal mr-1">{startIdx + 1}–{Math.min(startIdx + itemsPerPage, 40)}</span>
                  {num}
                </button>
              );
            })}
            {siteRows.length > 0 && (
              <span className="text-[10px] text-slate-500 uppercase tracking-widest ml-2 font-bold">
                {Math.min((currentPage - 1) * itemsPerPage + 1, siteRows.length)}–{Math.min(currentPage * itemsPerPage, siteRows.length)} of {siteRows.length}
              </span>
            )}
          </div>
        </section>

        {/* OR / Story Pitch Block */}
        <div className="flex flex-col items-center relative py-4 mt-8">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-xl border-t border-slate-700 border-dashed"></div>
          </div>
          <div className="relative bg-slate-900 border-2 border-slate-600 text-slate-300 font-bold px-6 py-2 rounded-full uppercase tracking-widest z-10">
            OR
          </div>
        </div>

        {/* Enhanced Automation/Story Pitch Block */}
        <section className="max-w-2xl mx-auto bg-slate-800/80 rounded-xl border border-slate-700 shadow-[0_0_20px_rgba(30,41,59,0.5)] p-6 mt-8">
           <div className="mb-4">
             <label className="block text-xs uppercase text-slate-400 font-mono mb-2">Input Source Type</label>
             <select 
                value={altInputType}
                onChange={(e) => setAltInputType(e.target.value as AlternateInputType)}
                className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-sm p-3 rounded outline-none focus:border-red-500/50 transition-colors"
             >
                <option value="Story Pitch">📝 Story Pitch</option>
                <option value="Image Upload">🖼️ Image Upload</option>
                <option value="PDF Upload">📄 PDF Upload</option>
                <option value="URL">🔗 Custom URL</option>
             </select>
           </div>
           
           <div className="min-h-[160px] bg-slate-900/50 rounded-lg border border-slate-700/50 shadow-inner flex items-center justify-center mb-6 overflow-hidden relative group">
              {altInputType === 'Story Pitch' && (
                <textarea 
                  className="w-full h-[160px] bg-transparent outline-none resize-none p-6 text-slate-200 shadow-inner placeholder-slate-600 text-sm focus:bg-slate-900 focus:ring-1 focus:ring-red-600/50 transition-all font-mono"
                  placeholder="Enter unstructured pitch here..."
                  value={altInputValue}
                  onChange={(e) => setAltInputValue(e.target.value)}
                />
              )}
              {altInputType === 'URL' && (
                <div className="w-full px-6 flex items-center gap-3 text-slate-400 focus-within:text-red-400 transition-colors">
                  <LinkIcon size={20} />
                  <input 
                    type="url"
                    className="w-full bg-transparent border-b border-slate-600 focus:border-red-500/50 outline-none text-slate-200 text-sm py-2 px-1"
                    placeholder="https://"
                    value={altInputValue}
                    onChange={(e) => setAltInputValue(e.target.value)}
                  />
                </div>
              )}
              {(altInputType === 'Image Upload' || altInputType === 'PDF Upload') && (
                <label className="flex flex-col items-center justify-center w-full h-[160px] cursor-pointer hover:bg-slate-800/50 transition-colors text-slate-500 hover:text-slate-300">
                   {altInputType === 'Image Upload' ? <ImageIcon size={32} className="mb-2"/> : <FileCheck size={32} className="mb-2"/> }
                   <span className="text-xs uppercase tracking-widest font-bold">CLICK TO UPLOAD</span>
                   <input type="file" className="hidden" accept={altInputType === 'Image Upload' ? "image/*" : "application/pdf"} />
                </label>
              )}
           </div>

           <div className="flex justify-center">
             <button 
               onClick={handleAlternateProcess} 
               disabled={!altInputValue.trim() && altInputType !== 'Image Upload' && altInputType !== 'PDF Upload'}
               className="bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 text-red-500 hover:text-red-400 font-bold tracking-widest text-xs uppercase px-12 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
             >
               Audit Input
             </button>
           </div>
        </section>

      </div>
    </div>
  );
};

export default InputSection;