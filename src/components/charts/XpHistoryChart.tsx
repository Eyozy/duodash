import React from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { useNonZeroSize } from './useNonZeroSize';

export interface XpHistoryChartProps {
  data: { date: string; xp: number }[];
}

const XpHistoryChart: React.FC<XpHistoryChartProps> = ({ data }) => {
  const totalXp = data.reduce((sum, d) => sum + d.xp, 0);
  const gradientId = React.useId();
  const { ref: chartRef, width, height, ready: chartReady } = useNonZeroSize<HTMLDivElement>();

  return (
    <div className="w-full min-w-0">
      <div ref={chartRef} className="h-40 w-full min-w-0">
        {chartReady ? (
          <AreaChart data={data} width={width} height={height} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id={`xpGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffc800" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffc800" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={5} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} width={40} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
              formatter={(value: number) => [`${value} XP`, '经验值']}
            />
            <Area
              type="monotone"
              dataKey="xp"
              stroke="#ffc800"
              strokeWidth={3}
              fill={`url(#xpGradient-${gradientId})`}
              dot={{ r: 3, fill: '#ffc800', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        ) : (
          <div className="h-full w-full bg-gray-100 rounded-xl animate-pulse" aria-hidden="true" />
        )}
      </div>
      <div className="text-center text-xs text-gray-500 pb-3">
        本周共获得 <span className="text-[#e2b100] font-bold">{totalXp}</span> XP
      </div>
    </div>
  );
};

export default XpHistoryChart;
