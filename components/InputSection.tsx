import React, { useState, useEffect } from 'react';
import { fetchNewsSitemap, fetchArticleContent } from '../services/scraperService';
import { Loader2, Link as LinkIcon } from 'lucide-react';
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

  // ✅ SAFE URL OPEN FUNCTION
  const openSafeUrl = (url: string) => {
    try {
      const validUrl = new URL(url);
      window.open(validUrl.toString(), "_blank", "noopener,noreferrer");
    } catch {
      alert("Invalid or unsafe URL");
    }
  };

  // Fetch sitemap
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (siteRows.length === 0) setLoading(true);

      const data = await fetchNewsSitemap();

      if (isMounted && data && data.length > 0) {
        setSiteRows(prev => {
          const existingByUrl = new Map((prev || []).map(r => [r.url, r]));

          return data.slice(0, 40).map((item, idx) => {
            const existing = existingByUrl.get(item.url);

            return existing
              ? { ...existing, id: idx + 1, title: item.title }
              : {
                  id: idx + 1,
                  title: item.title,
                  url: item.url,
                  timestamp: new Date().toLocaleTimeString(),
                  giveMeRec: '',
                  auditStatus: '' as const,
                  actionTaken: ''
                };
          });
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

  const handleAuditSite = async (index: number) => {
    const row = siteRows[index];

    if (row && row.url) {
      try {
        const extractedContent = await fetchArticleContent(row.url);

        const context = `TITLE: ${row.title}\nURL: ${row.url}\n\nCONTENT:\n${extractedContent.substring(0, 2000)}`;

        onProcessCustom(context, `Site URL: ${row.title}`);
      } catch (err) {
        console.error("Scraping failed", err);
        alert("Failed to fetch article content");
      }
    }
  };

  return (
    <div className="p-6 text-white">

      <h2 className="text-xl font-bold mb-4">Site URLs</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {siteRows.slice(0, 10).map((row, idx) => (
              <tr key={row.url} className="border-b border-gray-700">

                <td className="p-2">{row.title}</td>

                {/* ✅ FIXED URL COLUMN */}
                <td className="p-2">
                  <button
                    onClick={() => openSafeUrl(row.url)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Open <LinkIcon size={14} />
                  </button>
                </td>

                <td className="p-2">
                  <button
                    onClick={() => handleAuditSite(idx)}
                    className="bg-green-600 px-3 py-1 rounded text-xs"
                  >
                    Audit
                  </button>
                </td>

                <td className="p-2">
                  <button
                    onClick={() => onAIRecommend(idx)}
                    className="bg-blue-600 px-3 py-1 rounded text-xs"
                  >
                    Recommend
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InputSection;
