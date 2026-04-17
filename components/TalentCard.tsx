import React from 'react';
import { TalentStat } from '../services/youtubeService';
import { Youtube, TrendingUp, ThumbsUp, MessageCircle } from 'lucide-react';

interface TalentCardProps {
  stat: TalentStat;
  rank: number;
}

const TalentCard: React.FC<TalentCardProps> = ({ stat, rank }) => {
  return (
    <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/40 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
            #{rank}
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tight text-lg">{stat.name}</h4>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{stat.videoCount} Videos Produced</p>
          </div>
        </div>
        <div className="bg-red-500/10 p-2 rounded-lg text-red-400">
           <Youtube size={16} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter flex items-center gap-1">
            <TrendingUp size={10} className="text-indigo-400" /> REACH
          </p>
          <p className="text-white font-bold">{stat.totalViews.toLocaleString()}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter flex items-center gap-1">
            <ThumbsUp size={10} className="text-emerald-400" /> LIKES
          </p>
          <p className="text-white font-bold">{stat.totalLikes.toLocaleString()}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter flex items-center gap-1">
            <MessageCircle size={10} className="text-blue-400" /> COMMENTS
          </p>
          <p className="text-white font-bold">{stat.totalComments.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar for relative performance */}
      <div className="mt-6">
        <div className="flex justify-between text-[8px] uppercase font-black mb-1.5">
           <span className="text-slate-500">Performance Index</span>
           <span className="text-indigo-400">Stable</span>
        </div>
        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
           <div 
             className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400" 
             style={{ width: `${Math.min(100, (stat.totalViews / 30000) * 100)}%` }}
           ></div>
        </div>
      </div>
    </div>
  );
};

export default TalentCard;
