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

  const [altInputType, setAltInputType] = useState<AlternateInputType>('Story Pitch');
  const [altInputValue, setAltInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (siteRows.length === 0) setLoading(true);
      
      const data = await fetchNewsSitemap();
      if (isMounted && data && data.length > 0) {
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

        <section className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white uppercase font-mono tracking-widest flex items-center gap-3">
              Site URLs
              {loading && <Loader2 className="animate-spin text-blue-500" size={16} />}
            </h3>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-left border-collapse whitespace-nowrap text-slate-300">
              <tbody>
                {siteRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, localIdx) => {
                  const globalIdx = (currentPage - 1) * itemsPerPage + localIdx;
                  return (
                    <tr key={row.url} className="bg-slate-800 hover:bg-slate-750 transition-colors group">
                      
                      <td className="border-b border-r border-slate-700 p-0 text-xs px-3">

                        {/* ✅ FIXED LINK (ONLY CHANGE) */}
                        <button
                          onClick={() => {
                            try {
                              const validUrl = new URL(row.url);
                              window.open(validUrl.toString(), "_blank", "noopener,noreferrer");
                            } catch {
                              console.error("Invalid URL:", row.url);
                            }
                          }}
                          className="text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1 group-hover:text-blue-200 truncate max-w-[200px]"
                        >
                          {(() => {
                            try {
                              return new URL(row.url).pathname;
                            } catch {
                              return "Invalid URL";
                            }
                          })()}
                          <LinkIcon size={12} className="shrink-0"/>
                        </button>

                      </td>

                      <td>
                        <button onClick={() => handleAuditSite(globalIdx)}>Audit</button>
                      </td>

                      <td>
                        <button onClick={() => handleRecommendSite(globalIdx)}>Recommend</button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </section>

      </div>
    </div>
  );
};

export default InputSection;
