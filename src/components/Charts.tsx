import React from 'react';
import { DuoColors } from '../styles/duolingoColors';

interface HeatmapChartProps {
  data: { date: string; xp: number; time?: number }[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
  const [selectedHalf, setSelectedHalf] = React.useState<number>(new Date().getMonth() < 6 ? 1 : 2);
  const [selectedDay, setSelectedDay] = React.useState<{ date: string; xp: number; time?: number; x: number; y: number } | null>(null);
  const [viewMode, setViewMode] = React.useState<'quarter' | 'half' | 'year'>('year');

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setViewMode('quarter');
      } else if (width < 1024) {
        setViewMode('half');
      } else {
        setViewMode('year');
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const xpMap = new Map<string, number>();
  const timeMap = new Map<string, number | undefined>();
  data.forEach(d => {
    xpMap.set(d.date, d.xp);
    timeMap.set(d.date, d.time);
  });

  const years = new Set<number>();
  data.forEach(d => {
    const year = new Date(d.date).getFullYear();
    if (year > 2010 && year <= new Date().getFullYear()) {
      years.add(year);
    }
  });
  const sortedYears = Array.from(years).sort((a, b) => b - a);
  if (sortedYears.length === 0) sortedYears.push(new Date().getFullYear());

  const toLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const getDateRange = () => {
    if (viewMode === 'quarter') {
      const startMonth = (selectedQuarter - 1) * 3;
      const endMonth = startMonth + 2;
      return {
        start: new Date(selectedYear, startMonth, 1),
        end: new Date(selectedYear, endMonth + 1, 0)
      };
    } else if (viewMode === 'half') {
      const startMonth = (selectedHalf - 1) * 6;
      const endMonth = startMonth + 5;
      return {
        start: new Date(selectedYear, startMonth, 1),
        end: new Date(selectedYear, endMonth + 1, 0)
      };
    } else {
      return {
        start: new Date(selectedYear, 0, 1),
        end: new Date(selectedYear, 11, 31)
      };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

  const allDates: { date: Date; xp: number; time?: number; dateStr: string }[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = toLocalDateStr(current);
    allDates.push({
      date: new Date(current),
      xp: xpMap.get(dateStr) || 0,
      time: timeMap.get(dateStr),
      dateStr
    });
    current.setDate(current.getDate() + 1);
  }

  const maxXp = Math.max(...allDates.map(d => d.xp), 50);

  const weeks: typeof allDates[] = [];
  let currentWeek: typeof allDates = [];

  const firstDayOfWeek = allDates[0]?.date.getDay() || 0;
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: new Date(0), xp: -1, time: undefined, dateStr: '' });
  }

  allDates.forEach(d => {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: new Date(0), xp: -1, time: undefined, dateStr: '' });
    }
    weeks.push(currentWeek);
  }

  const getColor = (xp: number) => {
    if (xp < 0) return 'transparent';
    if (xp === 0) return '#EBEDF0';
    const intensity = Math.min(xp / maxXp, 1);
    if (intensity < 0.25) return '#9BE9A8';
    if (intensity < 0.5) return '#40C463';
    if (intensity < 0.75) return DuoColors.featherGreen;
    return '#216E39';
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const monthLabels: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const validDay = week.find(d => d.xp >= 0);
    if (validDay && validDay.date.getTime() > 0) {
      const month = validDay.date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ month: months[month], weekIndex });
        lastMonth = month;
      }
    }
  });

  const viewXp = allDates.reduce((sum, d) => sum + (d.xp > 0 ? d.xp : 0), 0);
  const activeDays = allDates.filter(d => d.xp > 0).length;

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

      <div className="w-full pb-2 overflow-hidden">
        <div className="relative w-full overflow-hidden">
          {/* 月份标签 */}
          <div className="flex ml-4 mb-1 text-xs text-gray-600 h-4 relative w-full">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `calc(${(label.weekIndex / weeks.length) * 100}%)`
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          {/* 使用 grid 统一布局，确保星期标签和格子对齐 */}
          <div
            className="grid gap-[1px] lg:gap-[2px] relative w-full"
            style={{
              gridTemplateColumns: `16px repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >
            {/* 星期标签列 */}
            {['日', '一', '二', '三', '四', '五', '六'].map((label, idx) => (
              <div
                key={`label-${idx}`}
                className="text-[10px] text-gray-500 flex items-center justify-center"
                style={{ gridColumn: 1, gridRow: idx + 1 }}
              >
                {idx % 2 === 1 ? label : ''}
              </div>
            ))}

            {/* 热力图格子 */}
            {weeks.map((week, weekIdx) => (
              week.map((day, dayIdx) => (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  className="w-full rounded-sm cursor-pointer hover:ring-2 hover:ring-[#58cc02] transition-all"
                  style={{
                    backgroundColor: getColor(day.xp),
                    gridColumn: weekIdx + 2,
                    gridRow: dayIdx + 1,
                    paddingBottom: '100%',
                  }}
                  onClick={(e) => {
                    if (day.xp >= 0 && day.dateStr) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                      if (parentRect) {
                        setSelectedDay({
                          date: day.dateStr,
                          xp: day.xp,
                          time: day.time,
                          x: rect.left - parentRect.left + rect.width / 2,
                          y: rect.top - parentRect.top
                        });
                      }
                    }
                  }}
                />
              ))
            ))}

            {/* 详情弹窗 */}
            {selectedDay && (
              <div
                className="absolute z-50 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
                style={{
                  left: `${selectedDay.x}px`,
                  top: `${selectedDay.y - 60}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="font-bold">{selectedDay.date}</div>
                <div className="text-[#58cc02]">{selectedDay.xp} XP</div>
                {selectedDay.time !== undefined && selectedDay.time > 0 && (
                  <div className="text-gray-600 text-xs">{selectedDay.time} 分钟</div>
                )}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>

          {/* 关闭弹窗的遮罩 */}
          {selectedDay && (
            <div className="fixed inset-0 z-40" onClick={() => setSelectedDay(null)}></div>
          )}

          {/* 图例 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-1 sm:gap-0">
            <div className="text-xs text-gray-500">
              {viewMode === 'quarter' ? (
                <>
                  {selectedYear} Q{selectedQuarter} 学习 <span style={{ color: DuoColors.featherGreen }} className="font-bold">{activeDays}</span> 天，
                  获得 <span style={{ color: DuoColors.beeYellow }} className="font-bold">{viewXp.toLocaleString()}</span> XP
                </>
              ) : viewMode === 'half' ? (
                <>
                  {selectedYear} {selectedHalf === 1 ? '上半年' : '下半年'}学习 <span style={{ color: DuoColors.featherGreen }} className="font-bold">{activeDays}</span> 天，
                  获得 <span style={{ color: DuoColors.beeYellow }} className="font-bold">{viewXp.toLocaleString()}</span> XP
                </>
              ) : (
                <>
                  {selectedYear} 年学习 <span style={{ color: DuoColors.featherGreen }} className="font-bold">{activeDays}</span> 天，
                  获得 <span style={{ color: DuoColors.beeYellow }} className="font-bold">{viewXp.toLocaleString()}</span> XP
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>少</span>
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: '#EBEDF0' }} />
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: '#9BE9A8' }} />
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: '#40C463' }} />
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: DuoColors.featherGreen }} />
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: '#216E39' }} />
              <span>多</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
