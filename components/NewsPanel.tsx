import React, { useState, useEffect } from 'react';
import { fetchNewsSitemap, fetchArticleContent, SitemapArticle } from '../services/scraperService';
import { Newspaper, ChevronRight, ChevronLeft, Loader2, Play } from 'lucide-react';

interface NewsPanelProps {
  onProcessArticle: (title: string, url: string, content: string) => void;
  isProcessing: boolean;
}

const ITEMS_PER_PAGE = 10;

const NewsPanel: React.FC<NewsPanelProps> = ({ onProcessArticle, isProcessing }) => {
  const [articles, setArticles] = useState<SitemapArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchingContentUrl, setFetchingContentUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSitemap();
  }, []);

  const loadSitemap = async () => {
    setLoading(true);
    const data = await fetchNewsSitemap();
    setArticles(data);
    setLoading(false);
  };

  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const currentArticles = articles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAction = async (article: SitemapArticle) => {
    if (isProcessing || fetchingContentUrl) return;
    setFetchingContentUrl(article.url);
    const content = await fetchArticleContent(article.url);
    setFetchingContentUrl(null);
    onProcessArticle(article.title, article.url, content);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4 shrink-0 flex items-center justify-between">
         <h2 className="text-lg font-bold text-white flex items-center gap-2">
           <Newspaper className="text-blue-500" size={20} />
           NDTV Profit Latest News
         </h2>
         <div className="text-xs font-mono text-slate-500">
           {articles.length > 0 ? `${articles.length} items fetched` : 'Fetching...'}
         </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-500">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-sm font-mono">Fetching NDTV Sitemap...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm">
            Failed to load or parsing error. <br/>Check network/proxy.
          </div>
        ) : (
          currentArticles.map((article, idx) => (
            <div key={idx} className="bg-slate-900/50 hover:bg-slate-700/50 transition-colors rounded-lg border border-slate-700 p-3 flex flex-col gap-3 group">
              <div>
                 <h3 className="text-sm font-semibold text-slate-200 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2" title={article.title}>
                   {article.title}
                 </h3>
                 <a href={article.url} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-slate-300 font-mono truncate block mt-1">
                   {article.url.substring(0, 50)}...
                 </a>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => handleAction(article)}
                  disabled={isProcessing || fetchingContentUrl !== null}
                  className={`
                    flex items-center gap-1 text-xs px-3 py-1.5 rounded transition-colors font-medium
                    ${fetchingContentUrl === article.url 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                      : (isProcessing ? 'bg-slate-800 text-slate-600' : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 hover:text-blue-300 border border-blue-800/50')}
                  `}
                >
                  {fetchingContentUrl === article.url ? (
                    <><Loader2 className="animate-spin" size={12} /> EXTRACTING TEXT</>
                  ) : (
                    <><Play size={12} fill="currentColor" /> PROCESS ARTICLE</>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && articles.length > 0 && (
        <div className="bg-slate-900 border-t border-slate-700 p-3 shrink-0 flex items-center justify-between">
           <button 
             disabled={currentPage === 1}
             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
             className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-1"
           >
             <ChevronLeft size={20} />
           </button>
           
           <div className="flex gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
             {/* Show a sliding window of pages or just current if simple */}
             {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
               // Quick logic for sliding window if > 5 pages
               let pageNum = i + 1;
               if (totalPages > 5 && currentPage > 3) {
                 pageNum = currentPage - 2 + i;
                 if (pageNum > totalPages) pageNum = totalPages - 4 + i;
               }

               return (
                 <button
                   key={pageNum}
                   onClick={() => setCurrentPage(pageNum)}
                   className={`w-7 h-7 rounded text-xs font-mono flex items-center justify-center transition-colors ${
                     currentPage === pageNum 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   {pageNum}
                 </button>
               );
             })}
           </div>

           <button 
             disabled={currentPage === totalPages}
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-1"
           >
             <ChevronRight size={20} />
           </button>
        </div>
      )}
    </div>
  );
};

export default NewsPanel;
