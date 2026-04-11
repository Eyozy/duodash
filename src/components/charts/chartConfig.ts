import { DuoColors } from '../../styles/duolingoColors';

export const CHART_TOOLTIP_STYLE = {
  borderRadius: '12px',
  border: '1px solid #f1f5f9',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
  fontSize: 12,
  backgroundColor: '#ffffff'
} as const;

export const CHART_GRID_STYLE = {
  strokeDasharray: '3 3',
  vertical: false,
  stroke: '#f1f5f9'
} as const;

const CHART_AXIS_TICK_STYLE = {
  fill: '#94a3b8',
  fontSize: 10
} as const;

export const CHART_X_AXIS_PROPS = {
  dataKey: 'date',
  axisLine: false,
  tickLine: false,
  tick: CHART_AXIS_TICK_STYLE,
  dy: 5
} as const;

export const CHART_Y_AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: CHART_AXIS_TICK_STYLE,
  width: 32,
  domain: [0, 'auto'] as const
};

export const CHART_MARGIN = {
  top: 5,
  right: 10,
  bottom: 5,
  left: 0
} as const;

export const createDotStyle = (color: string) => ({
  r: 3,
  fill: color,
  strokeWidth: 2,
  stroke: '#fff'
} as const);

export const ACTIVE_DOT_STYLE = { r: 5 } as const;

export const CHART_COLORS = {
  xp: DuoColors.featherGreen,
  time: DuoColors.macawBlue
} as const;
