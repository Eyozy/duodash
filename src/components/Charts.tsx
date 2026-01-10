import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DuoColors } from '../styles/duolingoColors';

interface HeatmapChartProps {
  data: { date: string; xp: number; time?: number }[];
}

type ViewMode = 'quarter' | 'half' | 'year';
type TooltipAlignment = 'center' | 'left' | 'right';

interface SelectedDayInfo {
  date: string;
  xp: number;
  time?: number;
  x: number;
  y: number;
  showBelow: boolean;
  alignment: TooltipAlignment;
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getColor(xp: number, maxXp: number): string {
  if (xp < 0) return 'transparent';
  if (xp === 0) return '#EBEDF0';
  const intensity = Math.min(xp / maxXp, 1);
  if (intensity < 0.25) return '#9BE9A8';
  if (intensity < 0.5) return '#40C463';
  if (intensity < 0.75) return DuoColors.featherGreen;
  return '#216E39';
}

export function HeatmapChart({ data }: HeatmapChartProps): React.ReactElement {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.ceil((now.getMonth() + 1) / 3));
  const [selectedHalf, setSelectedHalf] = useState<number>(now.getMonth() < 6 ? 1 : 2);
  const [selectedDay, setSelectedDay] = useState<SelectedDayInfo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('year');
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function checkScreenSize(): void {
      const width = window.innerWidth;
      if (width < 640) {
        setViewMode('quarter');
      } else if (width < 1024) {
        setViewMode('half');
      } else {
        setViewMode('year');
      }
    }

    function debouncedCheck(): void {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    }

    checkScreenSize();
    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!selectedDay || isHoveringTooltip) return;
    const timer = setTimeout(() => setSelectedDay(null), 2500);
    return () => clearTimeout(timer);
  }, [selectedDay, isHoveringTooltip]);

  const { xpMap, timeMap, sortedYears } = useMemo(() => {
    const xpM = new Map<string, number>();
    const timeM = new Map<string, number | undefined>();
    const yearsSet = new Set<number>();
    const currentYear = new Date().getFullYear();

    for (const d of data) {
      xpM.set(d.date, d.xp);
      timeM.set(d.date, d.time);
      const year = new Date(d.date).getFullYear();
      if (year > 2010 && year <= currentYear) {
        yearsSet.add(year);
      }
    }

    const sorted = Array.from(yearsSet).sort((a, b) => b - a);
    if (sorted.length === 0) sorted.push(currentYear);

    return { xpMap: xpM, timeMap: timeM, sortedYears: sorted };
  }, [data]);

  const { allDates, weeks, monthLabels, maxXp } = useMemo(() => {
    const startMonth = viewMode === 'quarter'
      ? (selectedQuarter - 1) * 3
      : viewMode === 'half'
        ? (selectedHalf - 1) * 6
        : 0;
    const monthCount = viewMode === 'quarter' ? 3 : viewMode === 'half' ? 6 : 12;
    const startDate = new Date(selectedYear, startMonth, 1);
    const endDate = new Date(selectedYear, startMonth + monthCount, 0);

    const dates: { date: Date; xp: number; time?: number; dateStr: string }[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = toLocalDateStr(current);
      dates.push({
        date: new Date(current),
        xp: xpMap.get(dateStr) || 0,
        time: timeMap.get(dateStr),
        dateStr
      });
      current.setDate(current.getDate() + 1);
    }

    const max = Math.max(...dates.map(d => d.xp), 50);

    const weeksArr: typeof dates[] = [];
    let currentWeek: typeof dates = [];
    const firstDayOfWeek = dates[0]?.date.getDay() || 0;

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: new Date(0), xp: -1, time: undefined, dateStr: '' });
    }

    for (const d of dates) {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(0), xp: -1, time: undefined, dateStr: '' });
      }
      weeksArr.push(currentWeek);
    }

    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeksArr.forEach((week, weekIndex) => {
      const validDay = week.find(d => d.xp >= 0);
      if (validDay && validDay.date.getTime() > 0) {
        const month = validDay.date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: MONTHS[month], weekIndex });
          lastMonth = month;
        }
      }
    });

    return { allDates: dates, weeks: weeksArr, monthLabels: labels, maxXp: max };
  }, [selectedYear, selectedQuarter, selectedHalf, viewMode, xpMap, timeMap]);

  const viewXp = allDates.reduce((sum, d) => sum + (d.xp > 0 ? d.xp : 0), 0);
  const activeDays = allDates.filter(d => d.xp > 0).length;

  function handleDayClick(day: typeof allDates[0], e: React.MouseEvent<HTMLDivElement>): void {
    if (day.xp < 0 || !day.dateStr) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const showBelow = rect.top < 100;
    const x = rect.left + rect.width / 2;
    const y = showBelow ? rect.bottom : rect.top;

    let alignment: TooltipAlignment = 'center';
    if (x < 80) alignment = 'left';
    else if (x > window.innerWidth - 80) alignment = 'right';

    setSelectedDay({ date: day.dateStr, xp: day.xp, time: day.time, x, y, showBelow, alignment });
  }

  function getTooltipTransform(): string {
    if (!selectedDay) return '';
    const { showBelow, alignment } = selectedDay;
    const xOffset = alignment === 'left' ? '-15%' : alignment === 'right' ? '-85%' : '-50%';
    const yOffset = showBelow ? '0' : '-100%';
    return `translate(${xOffset}, ${yOffset})`;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {sortedYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${year === selectedYear
                ? 'bg-[#58cc02] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* 季度选择 - 小屏幕 */}
        {viewMode === 'quarter' && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(q => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${q === selectedQuarter
                  ? 'bg-[#1cb0f6] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Q{q}
              </button>
            ))}
          </div>
        )}

        {/* 半年选择 - 中等屏幕 */}
        {viewMode === 'half' && (
          <div className="flex items-center gap-1">
            {[1, 2].map(h => (
              <button
                key={h}
                onClick={() => setSelectedHalf(h)}
                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${h === selectedHalf
                  ? 'bg-[#1cb0f6] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {h === 1 ? '上半年' : '下半年'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full pb-2">
        <div className="relative w-full">
          {/* 月份标签 */}
          <div className="flex ml-4 mb-1 text-xs text-gray-600 h-4 relative w-full">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                className="absolute"
                style={{ left: `${(label.weekIndex / weeks.length) * 100}%` }}
              >
                {label.month}
              </div>
            ))}
          </div>

          {/* 使用 grid 统一布局 */}
          <div
            className="grid gap-[1px] lg:gap-[2px] relative w-full p-[3px]"
            style={{
              gridTemplateColumns: `16px repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >
            {WEEKDAYS.map((label, idx) => (
              <div
                key={`label-${idx}`}
                className="text-[10px] text-gray-500 flex items-center justify-center"
                style={{ gridColumn: 1, gridRow: idx + 1 }}
              >
                {idx % 2 === 1 ? label : ''}
              </div>
            ))}

            {weeks.map((week, weekIdx) => (
              week.map((day, dayIdx) => {
                const isValidDay = day.xp >= 0 && day.dateStr;
                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`w-full rounded-sm transition-all ${isValidDay ? 'cursor-pointer hover:ring-2 hover:ring-[#58cc02]' : ''}`}
                    style={{
                      backgroundColor: getColor(day.xp, maxXp),
                      gridColumn: weekIdx + 2,
                      gridRow: dayIdx + 1,
                      paddingBottom: '100%',
                    }}
                    onClick={(e) => handleDayClick(day, e)}
                  />
                );
              })
            ))}

            {selectedDay && typeof document !== 'undefined' && createPortal(
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setSelectedDay(null)}
                />
                <div
                  className="fixed z-[9999] bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap"
                  style={{
                    left: `${selectedDay.x}px`,
                    top: selectedDay.showBelow ? `${selectedDay.y + 10}px` : `${selectedDay.y - 10}px`,
                    transform: getTooltipTransform()
                  }}
                  onMouseEnter={() => setIsHoveringTooltip(true)}
                  onMouseLeave={() => setIsHoveringTooltip(false)}
                >
                  <div className="font-bold">{selectedDay.date}</div>
                  <div className="text-[#58cc02]">{selectedDay.xp} XP</div>
                  {selectedDay.time !== undefined && selectedDay.time > 0 && (
                    <div className="text-gray-300 text-xs">{selectedDay.time} 分钟</div>
                  )}
                  <div
                    className={`absolute w-0 h-0 border-l-[6px] border-r-[6px] border-transparent ${
                      selectedDay.showBelow
                        ? 'top-[-6px] border-b-[6px] border-b-gray-800'
                        : 'bottom-[-6px] border-t-[6px] border-t-gray-800'
                    }`}
                    style={{
                      left: selectedDay.alignment === 'left' ? '15%' : selectedDay.alignment === 'right' ? '85%' : '50%',
                      transform: 'translateX(-50%)'
                    }}
                  />
                </div>
              </>,
              document.body
            )}
          </div>

          {/* 图例 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-1 sm:gap-0">
            <div className="text-xs text-gray-500">
              {selectedYear}
              {viewMode === 'quarter' && ` Q${selectedQuarter}`}
              {viewMode === 'half' && ` ${selectedHalf === 1 ? '上半年' : '下半年'}`}
              {viewMode === 'year' && ' 年'}
              学习 <span style={{ color: DuoColors.featherGreen }} className="font-bold">{activeDays}</span> 天，
              获得 <span style={{ color: DuoColors.beeYellow }} className="font-bold">{viewXp.toLocaleString()}</span> XP
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>少</span>
              {['#EBEDF0', '#9BE9A8', '#40C463', DuoColors.featherGreen, '#216E39'].map((color, i) => (
                <div key={i} className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: color }} />
              ))}
              <span>多</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
