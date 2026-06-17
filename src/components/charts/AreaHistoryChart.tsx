import { memo, useId, useRef } from 'react';
import type { ReactElement } from 'react';
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
} from './chartConfig';

interface AreaHistoryChartProps {
  data: { date: string; [key: string]: number | string }[];
  dataKey: string;
  color: string;
  label: string;
  summary: string;
}

function AreaHistoryChart({ data, dataKey, color, label, summary }: AreaHistoryChartProps): ReactElement {
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useChartDimensions(containerRef);

  return (
    <div className="w-full">
      <div ref={containerRef} className="chart-shell w-full h-32 sm:h-40">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <AreaChart width={dimensions.width} height={dimensions.height} data={data} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id={`areaGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID_STYLE} />
            <XAxis {...CHART_X_AXIS_PROPS} />
            <YAxis {...CHART_Y_AXIS_PROPS} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey={dataKey}
              name={label}
              stroke={color}
              strokeWidth={3}
              fill={`url(#areaGradient-${gradientId})`}
              dot={createDotStyle(color)}
              activeDot={ACTIVE_DOT_STYLE}
            />
          </AreaChart>
        )}
      </div>
      <div className="text-center text-xs text-neutral-500 pb-2 sm:pb-3">{summary}</div>
    </div>
  );
}

export default memo(AreaHistoryChart);
