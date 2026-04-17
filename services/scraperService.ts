export interface SitemapArticle {
  title: string;
  url: string;
  loc: string;
  publicationDate?: string;
}

export const fetchNewsSitemap = async (): Promise<SitemapArticle[]> => {
  try {
    const response = await fetch('/api/ndtv/news_sitemap.xml');
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Sitemap uses <url> with <news:news> content
    const urlEls = Array.from(xmlDoc.getElementsByTagName('url'));
    
    const articles: SitemapArticle[] = urlEls.map(urlEl => {
      const locEl = urlEl.getElementsByTagName('loc')[0];
      const newsEl = urlEl.getElementsByTagNameNS('http://www.google.com/schemas/sitemap-news/0.9', 'news')[0]
                     || urlEl.getElementsByTagName('news:news')[0];
      
      let title = '';
      let pubDate = '';
      
      if (newsEl) {
        const titleEl = newsEl.getElementsByTagNameNS('http://www.google.com/schemas/sitemap-news/0.9', 'title')[0]
                        || newsEl.getElementsByTagName('news:title')[0];
        const dateEl = newsEl.getElementsByTagNameNS('http://www.google.com/schemas/sitemap-news/0.9', 'publication_date')[0]
                       || newsEl.getElementsByTagName('news:publication_date')[0];
        
        title = titleEl ? titleEl.textContent || '' : '';
        pubDate = dateEl ? dateEl.textContent || '' : '';
      }
      
      const loc = locEl ? locEl.textContent || '' : '';
      if (!title && loc) title = extractTitleFromUrl(loc);

      return {
        title,
        url: loc,
        loc,
        publicationDate: pubDate
      };
    })
    .filter(article => article.url !== '')
    .slice(0, 40); // Cap at 40 articles as requested

    return articles;
  } catch (error) {
    console.error("Error fetching " + error);
    return [];
  }
};

const extractTitleFromUrl = (url: string): string => {
  const parts = url.split('/');
  const lastSegment = parts.pop() || parts.pop() || '';
  return lastSegment.replace(/-/g, ' ').replace(/\.html$/, '');
};

export const fetchArticleContent = async (url: string): Promise<string> => {
  try {
    // Convert absolute URL to use our proxy if it belongs to ndtvprofit
    let proxyUrl = url;
    if (url.includes('ndtvprofit.com')) {
      const path = url.split('ndtvprofit.com')[1];
      proxyUrl = `/api/ndtv${path}`;
    }

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Article fetch failed with status ${response.status}`);
    }
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Remove scripts and styles
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(s => s.remove());

    // Basic extraction heuristic: grab paragraphs
    const paragraphs = Array.from(doc.querySelectorAll('p')).map(p => p.textContent?.trim()).filter(text => text && text.length > 20);
    
    // Fallback: if no p tags, just get body text content
    if (paragraphs.length === 0) {
       return doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
    }

    return paragraphs.join('\n\n');
  } catch (error) {
    console.error("Failed to fetch article content:", error);
    return "";
  }
};
