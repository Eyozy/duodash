import React, { useId, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DuoColors } from '../../styles/duolingoColors';

export interface TimeHistoryChartProps {
  data: { date: string; time: number }[];
}

const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  fontSize: 12
} as const;

const dotStyle = { r: 3, fill: DuoColors.macawBlue, strokeWidth: 2, stroke: '#fff' } as const;
const activeDotStyle = { r: 5 } as const;

function TimeHistoryChart({ data }: TimeHistoryChartProps): React.ReactElement {
  const { totalTime, formattedTime } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.time, 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return {
      totalTime: total,
      formattedTime: hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
    };
  }, [data]);
  const gradientId = useId();

  return (
    <div className="w-full min-w-0">
      <div className="h-40 w-full min-w-0" style={{ minHeight: '160px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id={`timeGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={DuoColors.macawBlue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={DuoColors.macawBlue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={5} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} width={40} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${value} 分钟`, '学习时间']}
            />
            <Area
              type="monotone"
              dataKey="time"
              stroke={DuoColors.macawBlue}
              strokeWidth={3}
              fill={`url(#timeGradient-${gradientId})`}
              dot={dotStyle}
              activeDot={activeDotStyle}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center text-xs text-gray-500 pb-3">
        本周学习 <span style={{ color: DuoColors.macawBlue }} className="font-bold">{formattedTime}</span>
      </div>
    </div>
  );
}

export default React.memo(TimeHistoryChart);
