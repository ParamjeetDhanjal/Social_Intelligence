import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Activity, FileText, Hash, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsDashboard: React.FC = () => {
  // Empty data as requested
  const engagementData: any[] = [];
  const platformComparison: any[] = [];
  const contentTypeData: any[] = [];
  const topPosts: any[] = [];
  const lowestPosts: any[] = [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-slate-900 text-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Analytics <span className="text-blue-500">Dashboard</span></h2>
          <p className="text-slate-400 text-sm mt-1">Social Intelligence Unit Overview</p>
        </div>
      </div>

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-mono uppercase">Total Posts</p>
            <p className="text-3xl font-bold text-white mt-2">0</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><TrendingUp size={12} /> Awaiting Data</p>
          </div>
          <div className="bg-blue-900/50 p-4 rounded-lg text-blue-400"><FileText size={24} /></div>
        </div>
        
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-mono uppercase">Avg Engagement</p>
            <p className="text-3xl font-bold text-white mt-2">0%</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><TrendingUp size={12} /> Awaiting Data</p>
          </div>
          <div className="bg-emerald-900/50 p-4 rounded-lg text-emerald-400"><Activity size={24} /></div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-mono uppercase">Best Platform</p>
            <p className="text-3xl font-bold text-white mt-2">-</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">Awaiting Data</p>
          </div>
          <div className="bg-purple-900/50 p-4 rounded-lg text-purple-400"><Users size={24} /></div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-mono uppercase">Content Processed</p>
            <p className="text-3xl font-bold text-white mt-2">0</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">Awaiting Data</p>
          </div>
          <div className="bg-orange-900/50 p-4 rounded-lg text-orange-400"><FileText size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GRAPHS */}
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg relative min-h-[300px]">
          <h3 className="text-sm font-bold text-slate-300 uppercase font-mono mb-6">Engagement Over Time</h3>
          {engagementData.length === 0 ? (
             <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-xs">NO DATA AVAILABLE</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg relative min-h-[300px]">
          <h3 className="text-sm font-bold text-slate-300 uppercase font-mono mb-6">Platform Comparison</h3>
          {platformComparison.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-xs">NO DATA AVAILABLE</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                  <Bar dataKey="posts" fill="#3b82f6" name="Posts" />
                  <Bar dataKey="engagement" fill="#8b5cf6" name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* HASHTAGS & INSIGHTS */}
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg relative">
          <h3 className="text-sm font-bold text-slate-300 uppercase font-mono mb-4 flex items-center gap-2"><Hash size={16}/> Top Hashtags</h3>
          <div className="flex flex-wrap gap-2 mb-8 min-h-[40px]">
             <span className="text-slate-500 font-mono text-xs italic">Awaiting data...</span>
          </div>

          <h3 className="text-sm font-bold text-slate-300 uppercase font-mono mb-4 flex items-center gap-2"><PieChartIcon size={16}/> Content Type</h3>
          {contentTypeData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 font-mono text-xs">NO DATA AVAILABLE</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={contentTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* PERFORMANCE TABLES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg min-h-[200px]">
            <h3 className="text-sm font-bold text-white bg-slate-800 p-4 border-b border-slate-700 uppercase font-mono flex items-center gap-2">Top Performing Posts</h3>
            {topPosts.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-500 font-mono text-xs">NO DATA AVAILABLE</div>
            ) : (
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-900/50 text-xs text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-right">Reach</th>
                  </tr>
                </thead>
                <tbody>
                  {topPosts.map(p => (
                    <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-medium text-white">{p.title}</td>
                      <td className="px-4 py-3"><span className="bg-slate-700 px-2 py-1 rounded text-xs">{p.platform}</span></td>
                      <td className="px-4 py-3 text-center"><span className="text-emerald-400 font-bold">{p.score}</span></td>
                      <td className="px-4 py-3 text-right font-mono">{p.reach}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
             )}
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg min-h-[200px]">
            <h3 className="text-sm font-bold text-slate-300 bg-slate-800 p-4 border-b border-slate-700 uppercase font-mono">Lowest Performing Posts</h3>
            {lowestPosts.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-500 font-mono text-xs">NO DATA AVAILABLE</div>
            ) : (
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-900/50 text-xs text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-right">Reach</th>
                  </tr>
                </thead>
                <tbody>
                  {lowestPosts.map(p => (
                    <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-slate-400">{p.title}</td>
                      <td className="px-4 py-3"><span className="bg-slate-700 px-2 py-1 rounded text-xs">{p.platform}</span></td>
                      <td className="px-4 py-3 text-center"><span className="text-red-400 font-bold">{p.score}</span></td>
                      <td className="px-4 py-3 text-right font-mono">{p.reach}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
