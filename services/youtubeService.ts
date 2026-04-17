export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  watchTime: number; // in minutes
  ctr: number; // in percentage
  publishedAt: string;
  dislikes: number;
  postedBy: string;
}

export interface TalentStat {
  name: string;
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalWatchTime: number;
  avgCtr: number;
  engagementRate: number; // (likes+comments)/views
}

export interface ChannelStats {
  totalViews: number;
  watchTime: number;
  subscribers: number;
  avgCtr: number;
  trendData: { day: string; views: number; subs: number }[];
}

const MOCK_VIDEOS: YoutubeVideo[] = [
  {
    id: 'v1',
    title: 'Market Open: Sensex, Nifty Outlook',
    description: 'Latest market updates and outlook for the day. Posted by: Rahul',
    views: 12500,
    likes: 450,
    comments: 89,
    watchTime: 45000,
    ctr: 8.2,
    publishedAt: '2026-04-16T09:00:00Z',
    dislikes: 12,
    postedBy: 'Rahul'
  },
  {
    id: 'v2',
    title: 'Top Stocks to Watch Today',
    description: 'Analysis of top stocks for your portfolio. Anchor - Hardik',
    views: 8900,
    likes: 310,
    comments: 42,
    watchTime: 32000,
    ctr: 6.5,
    publishedAt: '2026-04-16T10:30:00Z',
    dislikes: 8,
    postedBy: 'Hardik'
  },
  {
    id: 'v3',
    title: 'Crypto Market Regulation Update',
    description: 'Expert panel discusses new regulations. Posted by: Rahul',
    views: 15600,
    likes: 670,
    comments: 124,
    watchTime: 68000,
    ctr: 9.1,
    publishedAt: '2026-04-15T16:00:00Z',
    dislikes: 45,
    postedBy: 'Rahul'
  },
  {
    id: 'v4',
    title: 'Real Estate Investment Guide',
    description: 'How to build a property portfolio. Anchor - Tanvi',
    views: 5400,
    likes: 180,
    comments: 29,
    watchTime: 18000,
    ctr: 5.4,
    publishedAt: '2026-04-15T11:00:00Z',
    dislikes: 15,
    postedBy: 'Tanvi'
  },
  {
    id: 'v5',
    title: 'Electric Vehicle Policy Breakdown',
    description: 'What the new subsidies mean for you. Posted by: Sameer',
    views: 7200,
    likes: 290,
    comments: 56,
    watchTime: 25000,
    ctr: 7.1,
    publishedAt: '2026-04-14T14:00:00Z',
    dislikes: 22,
    postedBy: 'Sameer'
  },
  {
    id: 'v6',
    title: 'Budget 2026: What to Expect',
    description: 'In-depth analysis of the upcoming budget. Anchor - Rahul',
    views: 22000,
    likes: 1100,
    comments: 210,
    watchTime: 95000,
    ctr: 10.4,
    publishedAt: '2026-04-13T09:00:00Z',
    dislikes: 3,
    postedBy: 'Rahul'
  }
];

export const fetchYoutubeData = async (): Promise<YoutubeVideo[]> => {
  return MOCK_VIDEOS;
};

export const getChannelStats = (videos: YoutubeVideo[]): ChannelStats => {
  const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
  const totalWatchTime = videos.reduce((acc, v) => acc + v.watchTime, 0);
  const avgCtr = videos.reduce((acc, v) => acc + v.ctr, 0) / videos.length;
  
  // Simulated trend data for the last 7 days
  const trendData = [
    { day: 'Mon', views: 12000, subs: 120 },
    { day: 'Tue', views: 15000, subs: 150 },
    { day: 'Wed', views: 11000, subs: 90 },
    { day: 'Thu', views: 18000, subs: 200 },
    { day: 'Fri', views: 22000, subs: 250 },
    { day: 'Sat', views: 25000, subs: 300 },
    { day: 'Sun', views: 28000, subs: 350 },
  ];

  return {
    totalViews,
    watchTime: Math.round(totalWatchTime / 60), // in hours
    subscribers: 1450, // simulated
    avgCtr,
    trendData
  };
};

export const getTalentLeaderboard = (videos: YoutubeVideo[]): TalentStat[] => {
  const statsMap: Record<string, TalentStat> = {};

  videos.forEach(v => {
    // Check both patterns in description or use existing postedBy
    // Robust parser logic
    let name = v.postedBy;
    const patterns = [/Posted by - ([A-Za-z ]+)/, /Anchor - ([A-Za-z ]+)/];
    for (const p of patterns) {
      const match = v.description.match(p);
      if (match) {
        name = match[1].trim();
        break;
      }
    }

    if (!statsMap[name]) {
      statsMap[name] = {
        name,
        videoCount: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalWatchTime: 0,
        avgCtr: 0,
        engagementRate: 0
      };
    }

    const s = statsMap[name];
    s.videoCount += 1;
    s.totalViews += v.views;
    s.totalLikes += v.likes;
    s.totalComments += v.comments;
    s.totalWatchTime += v.watchTime;
    s.avgCtr += v.ctr;
  });

  return Object.values(statsMap).map(s => {
    s.avgCtr = s.avgCtr / s.videoCount;
    s.engagementRate = ((s.totalLikes + s.totalComments) / s.totalViews) * 100;
    return s;
  }).sort((a, b) => b.engagementRate - a.engagementRate);
};
