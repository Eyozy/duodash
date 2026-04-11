import React, { useId, useMemo, useRef } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartDimensions } from '../../hooks/useChartDimensions';
import {
  CHART_TOOLTIP_STYLE,
  CHART_GRID_STYLE,
  CHART_X_AXIS_PROPS,
  CHART_Y_AXIS_PROPS,
  CHART_MARGIN,
  createDotStyle,
  ACTIVE_DOT_STYLE,
  CHART_COLORS
} from './chartConfig';

export interface TimeHistoryChartProps {
  data: { date: string; time: number }[];
}

function TimeHistoryChart({ data }: TimeHistoryChartProps): React.ReactElement {
  const formattedTime = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.time, 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  }, [data]);
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useChartDimensions(containerRef);

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full h-32 sm:h-40">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <AreaChart width={dimensions.width} height={dimensions.height} data={data} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id={`timeGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.time} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.time} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID_STYLE} />
            <XAxis {...CHART_X_AXIS_PROPS} />
            <YAxis {...CHART_Y_AXIS_PROPS} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value: number | string | undefined) => {
                const minutes = typeof value === 'number' ? value : Number(value ?? 0);
                return [`${minutes} 分钟`, '学习时间'];
              }}
            />
            <Area
              type="monotone"
              dataKey="time"
              stroke={CHART_COLORS.time}
              strokeWidth={3}
              fill={`url(#timeGradient-${gradientId})`}
              dot={createDotStyle(CHART_COLORS.time)}
              activeDot={ACTIVE_DOT_STYLE}
            />
          </AreaChart>
        )}
      </div>
      <div className="text-center text-xs text-neutral-500 pb-2 sm:pb-3">
        本周学习 <span style={{ color: CHART_COLORS.time }} className="font-bold tabular-nums">{formattedTime}</span>
      </div>
    </div>
  );
}

export default React.memo(TimeHistoryChart);
