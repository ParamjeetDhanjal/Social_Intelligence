import React, { useState, useEffect } from 'react';
import { SiteRow, TVRow } from '../types';
import { 
  BarChart3, TrendingUp, CheckCircle2, AlertCircle, PieChart, 
  LayoutDashboard, Users2, Target, Zap, Clock, Calendar, ArrowRight,
  Award, BarChart, ChevronRight, Search, Video
} from 'lucide-react';
import { Youtube, Facebook, Instagram, Linkedin } from './SocialIcons';
import { fetchYoutubeData, YoutubeVideo, getTalentLeaderboard, TalentStat, getChannelStats, ChannelStats } from '../services/youtubeService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, BarChart as ReBarChart, Bar
} from 'recharts';
import TalentCard from './TalentCard';

interface AnalyticsViewProps {
  siteRows: SiteRow[];
  tvRows: TVRow[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ siteRows, tvRows }) => {
  const [activePlatform, setActivePlatform] = useState<string>('Overall');
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideo[]>([]);
  const [talentStats, setTalentStats] = useState<TalentStat[]>([]);
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<TalentStat | null>(null);

  useEffect(() => {
    const loadYoutube = async () => {
      const data = await fetchYoutubeData();
      setYoutubeVideos(data);
      setTalentStats(getTalentLeaderboard(data));
      setChannelStats(getChannelStats(data));
    };
    loadYoutube();
  }, []);

  const platforms = [
    { name: 'Overall', icon: <LayoutDashboard size={18} />, color: 'text-indigo-400' },
    { name: 'YouTube', icon: <Youtube size={18} />, color: 'text-red-500' },
    { name: 'Facebook', icon: <Facebook size={18} />, color: 'text-blue-500' },
    { name: 'Instagram', icon: <Instagram size={18} />, color: 'text-pink-500' },
    { name: 'LinkedIn', icon: <Linkedin size={18} />, color: 'text-blue-600' },
  ];

  // Logic to filter rows based on platform
  const getStats = (platform: string) => {
    let filtered;
    if (platform === 'Overall') {
      filtered = siteRows.filter(r => r.actionTaken && r.actionTaken.toLowerCase().includes('published'));
    } else if (platform === 'YouTube') {
      filtered = siteRows.filter(r => r.actionTaken && r.actionTaken.toLowerCase().includes('youtube'));
    } else if (platform === 'Facebook') {
      filtered = siteRows.filter(r => r.actionTaken && r.actionTaken.toLowerCase().includes('facebook'));
    } else if (platform === 'Instagram') {
      filtered = siteRows.filter(r => r.actionTaken && r.actionTaken.toLowerCase().includes('instagram'));
    } else if (platform === 'LinkedIn') {
      filtered = siteRows.filter(r => r.actionTaken && r.actionTaken.toLowerCase().includes('linkedin'));
    } else {
      filtered = [];
    }

    const totalAudited = siteRows.length;
    const publishedCount = filtered.length;
    const pendingCount = totalAudited - publishedCount;
    
    // Youtube specific stats use the mock/real service data
    let reachValue = platform === 'Overall' ? '8.4' : (7.5 + Math.random() * 2).toFixed(1);
    if (platform === 'YouTube' && channelStats) {
      reachValue = (channelStats.totalViews / 1000).toFixed(1) + 'K';
    }

    return { totalAudited, publishedCount, pendingCount, score: reachValue };
  };

  const currentStats = getStats(activePlatform);

  return (
    <div className="w-full h-full flex font-sans text-sm pb-6">
      {/* Side Panel */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col gap-8">
        <div>
          <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-6">Platforms</h4>
          <nav className="space-y-2">
            {platforms.map(p => (
              <button
                key={p.name}
                onClick={() => setActivePlatform(p.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activePlatform === p.name 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className={activePlatform === p.name ? p.color : 'text-slate-600'}>
                  {p.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">{p.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto bg-indigo-600/5 border border-indigo-500/10 p-4 rounded-xl">
           <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Editor's Tip</p>
           <p className="text-slate-500 text-[10px] leading-relaxed">
             {activePlatform === 'Overall' ? 'Track your cross-platform content velocity here.' : `Optimization for ${activePlatform} is currently trending up.`}
           </p>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {activePlatform.toUpperCase()} <span className="text-indigo-500">INSIGHTS</span>
            </h2>
            <p className="text-slate-500 text-lg">
              Performance data for your {activePlatform === 'Overall' ? 'entire social engine' : activePlatform} network.
            </p>
          </div>

          {activePlatform === 'YouTube' ? (
            <>
             <div className="space-y-12">
               {/* 1. Global KPI Row */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: 'Total Views', val: channelStats?.totalViews.toLocaleString(), icon: <BarChart3 size={18}/>, trend: '+12.5%', color: 'indigo' },
                   { label: 'Watch Time', val: channelStats?.watchTime + ' Hours', icon: <Clock size={18}/>, trend: '+9.1%', color: 'blue' },
                   { label: 'Subscribers', val: channelStats?.subscribers.toLocaleString(), icon: <Users2 size={18}/>, trend: '+250', color: 'emerald' },
                   { label: 'Avg. CTR', val: channelStats?.avgCtr.toFixed(1) + '%', icon: <Target size={18}/>, trend: '+3.8%', color: 'rose' },
                 ].map(kpi => (
                   <div key={kpi.label} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl group hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between mb-4">
                         <div className={`p-2 rounded-xl bg-${kpi.color}-500/10 text-${kpi.color}-400`}>
                            {kpi.icon}
                         </div>
                         <span className={`text-[10px] font-bold text-${kpi.color}-400 bg-${kpi.color}-500/5 px-2 py-1 rounded-full`}>{kpi.trend}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{kpi.label}</p>
                      <h3 className="text-2xl font-black text-white">{kpi.val}</h3>
                   </div>
                 ))}
               </div>

               {/* 2. Channel Health Trend */}
               <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h4 className="text-white font-bold uppercase tracking-tight text-sm">Channel Health Velocity</h4>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Growth metrics over the last 30 days</p>
                     </div>
                     <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Views</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Subscribers</div>
                     </div>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={channelStats?.trendData}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#6366f1" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
                        <Area type="monotone" dataKey="subs" stroke="#10b981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* 3. Producer Leaderboard & Deep-Dive Logic */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Leaderboard Table (2/3 width) */}
                  <div className="lg:col-span-2 space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                          <Users2 size={24} className="text-indigo-400" />
                          Talent Performance <span className="text-indigo-500/50">Registry</span>
                        </h3>
                        <div className="relative">
                           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                           <input type="text" placeholder="Search talent..." className="bg-slate-900/50 border border-slate-700 rounded-full px-10 py-2 text-[10px] w-48 focus:outline-none focus:border-indigo-500/50" />
                        </div>
                     </div>

                     <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden">
                        <table className="w-full text-left text-[10px]">
                           <thead className="bg-slate-900/30 border-b border-slate-700/50">
                              <tr className="text-slate-500 uppercase font-black tracking-widest">
                                 <th className="px-6 py-4">#</th>
                                 <th className="px-6 py-4">Anchor Name</th>
                                 <th className="px-6 py-4 text-center">Video Count</th>
                                 <th className="px-6 py-4 text-center">Reach Index</th>
                                 <th className="px-6 py-4 text-center">Engagement</th>
                                 <th className="px-6 py-4"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-700/30">
                              {talentStats.map((talent, idx) => (
                                 <tr 
                                   key={talent.name} 
                                   onClick={() => setSelectedTalent(talent)}
                                   className={`group cursor-pointer hover:bg-indigo-500/5 transition-all ${selectedTalent?.name === talent.name ? 'bg-indigo-500/10' : ''}`}
                                 >
                                    <td className="px-6 py-6 font-bold text-slate-600">{idx + 1}</td>
                                    <td className="px-6 py-6">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all">
                                             {talent.name.charAt(0)}
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-white font-black uppercase text-sm">{talent.name}</span>
                                             {idx === 0 && <span className="text-[8px] text-amber-500 font-bold uppercase flex items-center gap-1 mt-0.5"><Award size={10} /> Top Performer</span>}
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-6 text-center text-slate-300 font-bold">{talent.videoCount}</td>
                                    <td className="px-6 py-6 text-center">
                                       <span className="text-white font-bold">{(talent.totalViews / 1000).toFixed(1)}K</span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                       <div className="flex items-center justify-center gap-2">
                                          <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
                                             <div className="h-full bg-indigo-500" style={{ width: `${talent.engagementRate * 5}%` }}></div>
                                          </div>
                                          <span className="font-bold text-indigo-400">{talent.engagementRate.toFixed(1)}%</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                       <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* 4. Deep-Dive (1/3 width) */}
                  <div className="lg:col-span-1">
                     {selectedTalent ? (
                       <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-8 sticky top-8 animate-in fade-in slide-in-from-right-4 duration-500">
                          <div className="flex flex-col items-center text-center mb-8">
                             <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center text-3xl font-black text-white mb-4 relative">
                                {selectedTalent.name.charAt(0)}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] text-white">
                                  <Zap size={12} />
                                </div>
                             </div>
                             <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{selectedTalent.name}</h3>
                             <p className="text-indigo-400 text-[10px] uppercase font-bold tracking-[0.2em]">Producer Performance Hub</p>
                          </div>

                          <div className="space-y-6">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                                   <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Total Impact</p>
                                   <p className="text-lg font-black text-white">{(selectedTalent.totalViews / 1000).toFixed(1)}K</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                                   <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Avg CTR</p>
                                   <p className="text-lg font-black text-white">{selectedTalent.avgCtr.toFixed(1)}%</p>
                                </div>
                             </div>

                             <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                                <h4 className="text-[8px] text-slate-500 uppercase font-black mb-4">Benchmark vs Channel Average</h4>
                                <div className="h-32">
                                   <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={[
                                        { n: 'V1', v: 45, avg: 40 },
                                        { n: 'V2', v: 52, avg: 42 },
                                        { n: 'V3', v: 38, avg: 41 },
                                        { n: 'V4', v: 65, avg: 43 },
                                      ]}>
                                         <Line type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={3} dot={false} />
                                         <Line type="monotone" dataKey="avg" stroke="#475569" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                                      </LineChart>
                                   </ResponsiveContainer>
                                </div>
                             </div>

                             <div className="space-y-3">
                                <h4 className="text-[8px] text-slate-500 uppercase font-black">Attributed Feed</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                   {youtubeVideos.filter(v => v.postedBy === selectedTalent.name).map(v => (
                                     <div key={v.id} className="bg-slate-900/30 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center text-slate-600">
                                           <Youtube size={16}/>
                                        </div>
                                        <div className="min-w-0">
                                           <p className="text-[9px] text-white font-bold truncate">{v.title}</p>
                                           <p className="text-[8px] text-slate-500">{(v.views/1000).toFixed(1)}K Views • {v.ctr}% CTR</p>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       </div>
                     ) : (
                       <div className="h-full bg-slate-800/20 border border-slate-700/50 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-12">
                          <Users2 size={40} className="text-slate-700 mb-4" />
                          <h4 className="text-slate-400 font-bold uppercase text-xs">Select a Talent</h4>
                          <p className="text-slate-600 text-[10px] max-w-[150px] mt-2 leading-relaxed">Click on an anchor in the registry to see their performance deep-dive.</p>
                       </div>
                     )}
                   </div>
                </div>
             </div>

             {/* Content Performance Registry - NEW */}
             <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-2xl mt-8">
                <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                   <div>
                     <h3 className="text-sm font-bold text-white tracking-widest uppercase">Video Content Performance</h3>
                     <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Granular Video-wise Metrics & Sentiment</p>
                   </div>
                   <div className="flex gap-2">
                      <button className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1 rounded">EXPORT CSV</button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-slate-900/80">
                         <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Video Title</th>
                         <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Anchor</th>
                         <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right">Views</th>
                         <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right text-emerald-400">Likes</th>
                         <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right text-rose-400">Dislikes</th>
                         <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right">CTR</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800">
                       {youtubeVideos.map((v) => (
                         <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0">
                                   <Video size={14} className="text-slate-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-200 line-clamp-1">{v.title}</span>
                             </div>
                           </td>
                           <td className="px-6 py-4">
                             <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">{v.postedBy}</span>
                           </td>
                           <td className="px-6 py-4 text-right font-mono text-xs text-slate-300">
                             {v.views.toLocaleString()}
                           </td>
                           <td className="px-6 py-4 text-right font-mono text-xs text-emerald-400/80">
                             {v.likes.toLocaleString()}
                           </td>
                           <td className="px-6 py-4 text-right font-mono text-xs text-rose-400/80">
                             {v.dislikes.toLocaleString()}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <span className="font-mono text-xs text-slate-400">{v.ctr}%</span>
                                 <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${Math.min(v.ctr * 10, 100)}%` }}></div>
                                 </div>
                              </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>

          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 h-full">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-bold uppercase tracking-widest mb-2">No Data Available</h3>
            <p className="text-sm">Metrics for {activePlatform} are not yet integrated into the intelligence engine.</p>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsView;
