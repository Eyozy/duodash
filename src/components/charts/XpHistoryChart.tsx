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

export interface XpHistoryChartProps {
  data: { date: string; xp: number }[];
}

function XpHistoryChart({ data }: XpHistoryChartProps): React.ReactElement {
  const totalXp = useMemo(() => data.reduce((sum, d) => sum + d.xp, 0), [data]);
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useChartDimensions(containerRef);

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full h-32 sm:h-40">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <AreaChart width={dimensions.width} height={dimensions.height} data={data} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id={`xpGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.xp} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.xp} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID_STYLE} />
            <XAxis {...CHART_X_AXIS_PROPS} />
            <YAxis {...CHART_Y_AXIS_PROPS} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value: number | string | undefined) => {
                const xp = typeof value === 'number' ? value : Number(value ?? 0);
                return [`${xp} XP`, '经验值'];
              }}
            />
            <Area
              type="monotone"
              dataKey="xp"
              stroke={CHART_COLORS.xp}
              strokeWidth={3}
              fill={`url(#xpGradient-${gradientId})`}
              dot={createDotStyle(CHART_COLORS.xp)}
              activeDot={ACTIVE_DOT_STYLE}
            />
          </AreaChart>
        )}
      </div>
      <div className="text-center text-xs text-neutral-500 pb-2 sm:pb-3">
        本周共获得 <span style={{ color: CHART_COLORS.xp }} className="font-bold tabular-nums">{totalXp}</span> XP
      </div>
    </div>
  );
}

export default React.memo(XpHistoryChart);
