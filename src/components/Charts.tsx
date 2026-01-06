import React from 'react';

// 热力图组件 - 支持多年和季度视图
interface HeatmapChartProps {
  data: { date: string; xp: number; time?: number }[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
  const [selectedHalf, setSelectedHalf] = React.useState<number>(new Date().getMonth() < 6 ? 1 : 2);
  const [selectedDay, setSelectedDay] = React.useState<{ date: string; xp: number; time?: number; x: number; y: number } | null>(null);
  // 视图模式：'quarter' | 'half' | 'year'
  const [viewMode, setViewMode] = React.useState<'quarter' | 'half' | 'year'>('year');

  // 检测屏幕宽度，三档断点
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

  // 创建日期到 XP 和时间的映射
  const xpMap = new Map<string, number>();
  const timeMap = new Map<string, number | undefined>();
  data.forEach(d => {
    xpMap.set(d.date, d.xp);
    timeMap.set(d.date, d.time);
  });

  // 获取所有年份
  const years = new Set<number>();
  data.forEach(d => {
    const year = new Date(d.date).getFullYear();
    if (year > 2010 && year <= new Date().getFullYear()) {
      years.add(year);
    }
  });
  const sortedYears = Array.from(years).sort((a, b) => b - a);
  if (sortedYears.length === 0) sortedYears.push(new Date().getFullYear());

  // 辅助函数：生成本地日期字符串 YYYY-MM-DD
  const toLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // 根据视图模式决定日期范围
  const getDateRange = () => {
    if (viewMode === 'quarter') {
      // 季度视图：Q1=1-3 月，Q2=4-6 月，Q3=7-9 月，Q4=10-12 月
      const startMonth = (selectedQuarter - 1) * 3;
      const endMonth = startMonth + 2;
      return {
        start: new Date(selectedYear, startMonth, 1),
        end: new Date(selectedYear, endMonth + 1, 0) // 该月最后一天
      };
    } else if (viewMode === 'half') {
      // 半年视图：H1=1-6 月，H2=7-12 月
      const startMonth = (selectedHalf - 1) * 6;
      const endMonth = startMonth + 5;
      return {
        start: new Date(selectedYear, startMonth, 1),
        end: new Date(selectedYear, endMonth + 1, 0)
      };
    } else {
      // 全年视图
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

  // 获取当前视图的最大 XP
  const maxXp = Math.max(...allDates.map(d => d.xp), 50);

  // 按周分组（从周日开始）
  const weeks: typeof allDates[] = [];
  let currentWeek: typeof allDates = [];

  // 填充第一周的空白
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

  // 颜色函数
  const getColor = (xp: number) => {
    if (xp < 0) return 'transparent';
    if (xp === 0) return '#ebedf0';
    const intensity = Math.min(xp / maxXp, 1);
    if (intensity < 0.25) return '#c6efc6';
    if (intensity < 0.5) return '#7bc96f';
    if (intensity < 0.75) return '#58cc02';
    return '#3d8c00';
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  // 计算月份标签位置
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

  // 统计数据
  const viewXp = allDates.reduce((sum, d) => sum + (d.xp > 0 ? d.xp : 0), 0);
  const activeDays = allDates.filter(d => d.xp > 0).length;

  return (
    <div className="w-full">
      {/* 年份和季度选择器 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        {/* 年份选择 */}
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

        {/* 季度选择 - 仅在小屏幕 (< 640px)显示 */}
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

        {/* 半年选择 - 仅在中等屏幕 (640px-1024px) 显示 */}
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
              gridTemplateColumns: `16px repeat(${weeks.length}, 1fr)`,
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
                  className="aspect-square w-full rounded-sm cursor-pointer hover:ring-2 hover:ring-[#58cc02] transition-all"
                  style={{
                    backgroundColor: getColor(day.xp),
                    gridColumn: weekIdx + 2,
                    gridRow: dayIdx + 1
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

            {/* 点击后显示的详情弹窗 */}
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

          {/* 点击空白处关闭弹窗 */}
          {selectedDay && (
            <div className="fixed inset-0 z-40" onClick={() => setSelectedDay(null)}></div>
          )}

          {/* 图例 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-1 sm:gap-0">
            <div className="text-xs text-gray-500">
              {viewMode === 'quarter' ? (
                <>
                  {selectedYear} Q{selectedQuarter} 学习 <span className="text-[#58cc02] font-bold">{activeDays}</span> 天，
                  获得 <span className="text-[#ffc800] font-bold">{viewXp.toLocaleString()}</span> XP
                </>
              ) : viewMode === 'half' ? (
                <>
                  {selectedYear} {selectedHalf === 1 ? '上半年' : '下半年'}学习 <span className="text-[#58cc02] font-bold">{activeDays}</span> 天，
                  获得 <span className="text-[#ffc800] font-bold">{viewXp.toLocaleString()}</span> XP
                </>
              ) : (
                <>
                  {selectedYear} 年学习 <span className="text-[#58cc02] font-bold">{activeDays}</span> 天，
                  获得 <span className="text-[#ffc800] font-bold">{viewXp.toLocaleString()}</span> XP
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>少</span>
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: '#ebedf0' }} />
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: '#c6efc6' }} />
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: '#7bc96f' }} />
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: '#58cc02' }} />
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: '#3d8c00' }} />
              <span>多</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
