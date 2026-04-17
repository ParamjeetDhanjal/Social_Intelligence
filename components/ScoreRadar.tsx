
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { ScoreDimension } from '../types';

interface ScoreRadarProps {
  scores: ScoreDimension[];
}

const ScoreRadar: React.FC<ScoreRadarProps> = ({ scores }) => {
  // Format data for Recharts with safety check
  const safeScores = scores || [];
  const data = safeScores.map(s => ({
    subject: s.dimension?.split('/')?.[0]?.trim() || 'Dimension', // Shorten name
    A: s.score || 0,
    fullDimension: s.dimension || 'Unknown Dimension',
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 p-3 rounded shadow-xl text-xs">
          <p className="font-bold text-white mb-1">{payload[0].payload.fullDimension}</p>
          <p className="text-red-400 font-mono">Score: {payload[0].value}/10</p>
        </div>
      );
    }
    return null;
  };

  if (safeScores.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-slate-500 italic text-sm">
        No scoring data available
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#dc2626"
            strokeWidth={2}
            fill="#dc2626"
            fillOpacity={0.4}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreRadar;
