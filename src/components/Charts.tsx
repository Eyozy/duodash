import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';
import type { Course } from '../types';

const COLORS = ['#58cc02', '#ce82ff', '#ff9600', '#ff4b4b', '#1cb0f6', '#ffc800'];

interface XpHistoryChartProps {
  data: { date: string; xp: number }[];
}

export const XpHistoryChart: React.FC<XpHistoryChartProps> = ({ data }) => {
  const totalXp = data.reduce((sum, d) => sum + d.xp, 0);
  const gradientId = React.useId();
  
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id={`xpGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffc800" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ffc800" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#afafaf', fontSize: 10 }} dy={5} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#afafaf', fontSize: 10 }} width={40} domain={[0, 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
            formatter={(value: number) => [`${value} XP`, '经验值']}
          />
          <Area type="monotone" dataKey="xp" stroke="#ffc800" strokeWidth={3} fill={`url(#xpGradient-${gradientId})`} dot={{ r: 3, fill: '#ffc800', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-center text-xs text-gray-400 pb-3">本周共获得 <span className="text-[#ffc800] font-bold">{totalXp}</span> XP</div>
    </div>
  );
};

interface TimeHistoryChartProps {
  data: { date: string; time: number }[];
}

export const TimeHistoryChart: React.FC<TimeHistoryChartProps> = ({ data }) => {
  const totalTime = data.reduce((sum, d) => sum + d.time, 0);
  const hours = Math.floor(totalTime / 60);
  const mins = totalTime % 60;
  const gradientId = React.useId();
  
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id={`timeGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1cb0f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#1cb0f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#afafaf', fontSize: 10 }} dy={5} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#afafaf', fontSize: 10 }} width={40} domain={[0, 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
            formatter={(value: number) => [`${value} 分钟`, '学习时间']}
          />
          <Area type="monotone" dataKey="time" stroke="#1cb0f6" strokeWidth={3} fill={`url(#timeGradient-${gradientId})`} dot={{ r: 3, fill: '#1cb0f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-center text-xs text-gray-400 pb-3">本周学习 <span className="text-[#1cb0f6] font-bold">{hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`}</span></div>
    </div>
  );
};

interface LanguagePieChartProps {
  courses: Course[];
}

// 热力图组件 - 支持多年和季度视图
interface HeatmapChartProps {
  data: { date: string; xp: number; time?: number }[];
  totalXp?: number;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
  const [selectedDay, setSelectedDay] = React.useState<{ date: string; xp: number; time?: number; x: number; y: number } | null>(null);
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  
  // 检测屏幕宽度
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // 根据是否移动端决定日期范围
  const getDateRange = () => {
    if (isMobile) {
      // 季度视图：Q1=1-3 月，Q2=4-6 月，Q3=7-9 月，Q4=10-12 月
      const startMonth = (selectedQuarter - 1) * 3;
      const endMonth = startMonth + 2;
      return {
        start: new Date(selectedYear, startMonth, 1),
        end: new Date(selectedYear, endMonth + 1, 0) // 该月最后一天
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
  const quarterMonths = [
    ['1月', '2月', '3月'],
    ['4月', '5月', '6月'],
    ['7月', '8月', '9月'],
    ['10月', '11月', '12月']
  ];
  
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
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                year === selectedYear 
                  ? 'bg-[#58cc02] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
        
        {/* 季度选择 - 仅在小屏幕显示 */}
        {isMobile && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(q => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                  q === selectedQuarter 
                    ? 'bg-[#1cb0f6] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Q{q}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="w-full pb-2">
        <div className="relative w-full">
          {/* 月份标签 */}
          <div className="flex ml-4 mb-1 text-xs text-gray-400 h-4 relative w-full">
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
            className="grid gap-[2px] relative w-full" 
            style={{ 
              gridTemplateColumns: `16px repeat(${weeks.length}, 1fr)`,
            }}
          >
            {/* 星期标签列 */}
            {['日', '一', '二', '三', '四', '五', '六'].map((label, idx) => (
              <div 
                key={`label-${idx}`} 
                className="text-[10px] text-gray-400 flex items-center justify-center"
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
                  <div className="text-gray-400 text-xs">{selectedDay.time} 分钟</div>
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
              {isMobile ? (
                <>
                  {selectedYear} Q{selectedQuarter} 学习 <span className="text-[#58cc02] font-bold">{activeDays}</span> 天，
                  获得 <span className="text-[#ffc800] font-bold">{viewXp.toLocaleString()}</span> XP
                </>
              ) : (
                <>
                  {selectedYear} 年学习 <span className="text-[#58cc02] font-bold">{activeDays}</span> 天，
                  获得 <span className="text-[#ffc800] font-bold">{viewXp.toLocaleString()}</span> XP
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
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

export const LanguagePieChart: React.FC<LanguagePieChartProps> = ({ courses }) => {
  const activeCourses = courses.filter(c => c.xp > 0);
  const totalXp = activeCourses.reduce((sum, item) => sum + item.xp, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = totalXp > 0 ? ((data.xp / totalXp) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 z-50">
          <p className="font-bold text-gray-700">{data.title}</p>
          <p className="text-[#58cc02] font-semibold">{data.xp.toLocaleString()} XP</p>
          <p className="text-gray-400 text-xs">占比 {percent}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full [&_.recharts-pie]:outline-none [&_.recharts-sector]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={activeCourses} 
            cx="50%" 
            cy="50%" 
            innerRadius={60} 
            outerRadius={80} 
            paddingAngle={5} 
            dataKey="xp" 
            nameKey="title"
            stroke="none"
          >
            {activeCourses.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-gray-600 font-bold ml-1 text-xs">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
