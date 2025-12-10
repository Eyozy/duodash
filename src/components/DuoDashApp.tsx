import React, { useState, useEffect } from 'react';
import type { UserData } from '../types';
import { XpHistoryChart, TimeHistoryChart, HeatmapChart } from './Charts';
import { AiCoach } from './AiCoach';
import { LoginScreen } from './LoginScreen';
import { fetchDuolingoData, transformDuolingoData } from '../services/duolingoService';

const CHART_COLORS = ['#58cc02', '#ce82ff', '#ff9600', '#ff4b4b', '#1cb0f6', '#ffc800'];

const DEMO_DATA: UserData = {
  streak: 2045,
  totalXp: 202663,
  gems: 15400,
  league: "钻石 (Diamond)",
  leagueTier: 9,
  learningLanguage: "Spanish",
  creationDate: "2015 年 5 月 12 日",
  accountAgeDays: 3200,
  isPlus: true,
  dailyGoal: 50,
  estimatedLearningTime: "562 小时 57 分钟",
  courses: [
    { id: 'es', title: "Spanish", xp: 125000, fromLanguage: "en", learningLanguage: "es", crowns: 150 },
    { id: 'fr', title: "French", xp: 55000, fromLanguage: "en", learningLanguage: "fr", crowns: 45 },
    { id: 'de', title: "German", xp: 12000, fromLanguage: "en", learningLanguage: "de", crowns: 20 },
    { id: 'jp', title: "Japanese", xp: 2500, fromLanguage: "en", learningLanguage: "ja", crowns: 5 },
  ],
  dailyXpHistory: [
    { date: '11/29', xp: 120 }, { date: '11/30', xp: 250 }, { date: '12/1', xp: 45 },
    { date: '12/2', xp: 320 }, { date: '12/3', xp: 150 }, { date: '12/4', xp: 550 }, { date: '12/5', xp: 400 },
  ],
  dailyTimeHistory: [
    { date: '11/29', time: 40 }, { date: '11/30', time: 83 }, { date: '12/1', time: 15 },
    { date: '12/2', time: 107 }, { date: '12/3', time: 50 }, { date: '12/4', time: 183 }, { date: '12/5', time: 133 },
  ],
  achievements: [
    { name: "Wildfire", stars: 10, totalStars: 10, description: "Reach a 365 day streak", icon: "" },
    { name: "Sage", stars: 8, totalStars: 10, description: "Earn 200,000 XP", icon: "" },
    { name: "Scholar", stars: 5, totalStars: 10, description: "Learn 2,000 words", icon: "" },
    { name: "Sharpshooter", stars: 1, totalStars: 5, description: "Complete 100 lessons with no mistakes", icon: "" },
  ],
  xpToday: 180,
  lessonsToday: 5,
  streakExtendedToday: true,
  streakExtendedTime: "09:32"
};

export const DuoDashApp: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [configChecked, setConfigChecked] = useState(false);

  // 检查是否配置了环境变量，并自动加载数据
  useEffect(() => {
    const checkAndLoad = async () => {
      try {
        // 检查配置
        const configRes = await fetch('/api/config');
        const configData = await configRes.json();
        setIsConfigured(configData.configured);
        setConfigChecked(true);

        if (configData.configured) {
          // 自动加载数据
          const dataRes = await fetch('/api/data');
          const result = await dataRes.json();

          if (result.data) {
            const transformed = transformDuolingoData(result.data);
            setUserData(transformed);
          } else {
            setError(result.error || '加载数据失败');
          }
        }
      } catch (err: any) {
        setError('连接服务器失败');
      } finally {
        setLoading(false);
      }
    };

    checkAndLoad();
  }, []);

  const handleConnect = async (username: string, jwt: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDuolingoData(username, jwt);
      setUserData(data);
    } catch (err: any) {
      setError("连接失败：请尝试使用「粘贴 JSON」模式，或检查环境变量配置。");
    } finally {
      setLoading(false);
    }
  };

  const handleJsonInput = (jsonStr: string) => {
    try {
      const raw = JSON.parse(jsonStr);
      const userObj = raw.users ? raw.users[0] : raw;
      const transformed = transformDuolingoData(userObj);
      setUserData(transformed);
    } catch {
      setError("JSON 格式无效。请确保你复制了完整的页面内容。");
    }
  };

  const handleDemo = () => { setUserData(DEMO_DATA); };

  // 刷新数据功能
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataRes = await fetch('/api/data');
      const result = await dataRes.json();

      if (result.data) {
        const transformed = transformDuolingoData(result.data);
        setUserData(transformed);
      } else {
        setError(result.error || '刷新数据失败');
      }
    } catch (err: any) {
      setError('刷新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 正在检查配置或加载数据
  if (loading) {
    return (
      <div className="min-h-screen bg-[#235390] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <img src="https://design.duolingo.com/28e4b3aebfae83e5ff2f.svg" alt="Duo" className="w-24 h-24 mx-auto mb-6 animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-700 mb-4">正在加载数据...</h2>
          <p className="text-gray-500">正在连接 Duolingo API</p>
        </div>
      </div>
    );
  }

  // 如果配置了环境变量但加载失败，显示错误
  if (!userData && isConfigured && error) {
    return (
      <div className="min-h-screen bg-[#235390] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">😢</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">连接失败</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <p className="text-gray-500 text-sm mb-6">请检查环境变量中的 DUOLINGO_USERNAME 和 DUOLINGO_JWT 配置是否正确</p>
          <button onClick={() => window.location.reload()}
            className="bg-[#58cc02] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#4caf00]">
            重试
          </button>
        </div>
      </div>
    );
  }

  // 未配置环境变量，显示登录界面
  if (!userData) {
    return <LoginScreen onConnect={handleConnect} onJsonInput={handleJsonInput} onDemo={handleDemo} loading={loading} error={error} />;
  }

  const sortedCourses = [...userData.courses].sort((a, b) => b.xp - a.xp);
  const totalCourseXp = sortedCourses.reduce((acc, c) => acc + c.xp, 0);
  const maxCourseXp = sortedCourses.length > 0 ? sortedCourses[0].xp : 0;

  return (
    <div className="min-h-screen pb-12 bg-[#f7f7f7]">
      <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🦉</span>
              <span className="font-extrabold text-2xl text-[#58cc02] tracking-tight hidden sm:block">DuoDash</span>
            </div>
            <div className="flex items-center gap-3">
              {/* 刷新按钮 */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="刷新数据"
              >
                <span className={`text-base ${loading ? 'animate-spin' : ''}`}>🔄</span>
                <span className="hidden sm:inline font-semibold text-gray-700 text-sm">刷新</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和统计徽章 */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">学习数据概览</h1>
          <p className="text-base text-gray-600 mb-4">
            已加入多邻国 <span className="font-semibold text-gray-800">{userData.accountAgeDays}</span> 天 · 当前重点：<span className="font-semibold text-[#58cc02]">{userData.learningLanguage}</span>
          </p>

          {/* 统计徽章 - 所有尺寸都显示 */}
          <div className="flex flex-wrap items-center gap-3">
            {userData.isPlus && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm">
                <span className="text-white text-base">👑</span>
                <span className="font-bold text-white text-sm">Super</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-red-500 text-base">🔥</span>
              <span className="font-bold text-gray-700 text-sm">{userData.streak}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-blue-400 text-base">💎</span>
              <span className="font-bold text-gray-700 text-sm">{userData.gems.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-yellow-500 text-base">🏆</span>
              <span className="font-bold text-gray-700 text-sm truncate max-w-[150px]" title={userData.league}>{userData.league}</span>
            </div>
          </div>
        </div>

        {/* 所有内容区域使用统一的垂直间距 */}
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-2xl font-extrabold text-yellow-500">{userData.totalXp.toLocaleString()}</div>
              <div className="text-xs text-gray-500 font-bold">总经验</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200">
              <div className="text-2xl mb-1">📅</div>
              <div className="text-2xl font-extrabold text-blue-500">{userData.accountAgeDays}</div>
              <div className="text-xs text-gray-500 font-bold">注册天数</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-2xl font-extrabold text-teal-500">{userData.courses.length}</div>
              <div className="text-xs text-gray-500 font-bold">学习课程</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-lg font-extrabold text-purple-500">{userData.estimatedLearningTime}</div>
              <div className="text-xs text-gray-500 font-bold">预估投入</div>
            </div>
          </div>

          {/* 第一行：左侧图表 + 右侧语言分布 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：7 天经验和学习时间 */}
            <div className={`lg:col-span-2 grid gap-4 ${userData.dailyTimeHistory && userData.dailyTimeHistory.some(d => d.time > 0) ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200">
                <h3 className="text-gray-700 font-bold text-lg mb-3 flex items-center gap-2">
                  <span>⚡</span> 最近 7 天经验
                </h3>
                <XpHistoryChart data={userData.dailyXpHistory} />
              </div>
              {userData.dailyTimeHistory && userData.dailyTimeHistory.some(d => d.time > 0) && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200">
                  <h3 className="text-gray-700 font-bold text-lg mb-3 flex items-center gap-2">
                    <span>⏱️</span> 最近 7 天学习时间
                  </h3>
                  <TimeHistoryChart data={userData.dailyTimeHistory} />
                </div>
              )}
            </div>
            {/* 右侧：语言分布 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200">
              <h3 className="text-gray-700 font-bold text-lg mb-3">语言分布</h3>
              {userData.courses.length > 0 ? (
                <div className="space-y-3">
                  {sortedCourses.map((course, idx) => {
                    const percent = totalCourseXp > 0 ? ((course.xp / totalCourseXp) * 100).toFixed(1) : '0';
                    const relativeWidth = maxCourseXp > 0 ? (course.xp / maxCourseXp) * 100 : 0;
                    const color = CHART_COLORS[idx % CHART_COLORS.length];
                    return (
                      <div key={course.id} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                            <span className="font-bold text-gray-700 text-sm">{course.title}</span>
                          </div>
                          <span className="text-xs text-gray-500">{course.xp.toLocaleString()} XP ({percent}%)</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${relativeWidth}%`, backgroundColor: color }}></div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-gray-100 text-center text-xs text-gray-400">
                    共 {userData.courses.length} 门课程 · 总计 {totalCourseXp.toLocaleString()} XP
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm text-center py-4">没有课程</div>
              )}
            </div>
          </div>

          {/* 第二行：左侧 AI 点评 + 右侧今日概览 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-full">
              <AiCoach userData={userData} />
            </div>
            {/* 右侧：今日概览 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200 flex flex-col h-full">
              <h3 className="text-gray-700 font-bold text-lg mb-3">今日概览</h3>
              <div className="flex flex-col gap-3 flex-1">
                {/* 今日 XP 和课程 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#58cc02]/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-extrabold text-[#58cc02]">{userData.xpToday || '-'}</div>
                    <div className="text-xs text-gray-500 font-bold mt-1">今日 XP</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-extrabold text-blue-500">{userData.lessonsToday || '-'}</div>
                    <div className="text-xs text-gray-500 font-bold mt-1">今日课程</div>
                  </div>
                </div>

                {/* 连胜和学习时间 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-extrabold text-orange-500">{userData.streak}</div>
                    <div className="text-xs text-gray-500 font-bold mt-1">连胜天数</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-extrabold text-purple-500">
                      {userData.dailyTimeHistory && userData.dailyTimeHistory.length > 0
                        ? userData.dailyTimeHistory[userData.dailyTimeHistory.length - 1].time || '-'
                        : '-'}
                    </div>
                    <div className="text-xs text-gray-500 font-bold mt-1">学习分钟</div>
                  </div>
                </div>
                {/* 学习状态显示 */}
                {userData.xpToday && userData.xpToday > 0 ? (
                  <div className="text-sm text-center">
                    <div className="text-gray-700 font-semibold">
                      🔥 今日已学习 {userData.xpToday} XP
                    </div>
                    {userData.streakExtendedTime && (
                      <div className="text-xs text-gray-400 mt-1">
                        {userData.streakExtendedTime} 保住连胜
                      </div>
                    )}
                  </div>
                ) : userData.streakExtendedToday ? (
                  <div className="text-sm text-center text-blue-500">
                    ❄️ 使用了连胜冻结卡
                  </div>
                ) : (
                  <div className="text-sm text-center text-gray-400">
                    ⏰ 今日还未学习
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 年度学习热力图 */}
          {userData.yearlyXpHistory && userData.yearlyXpHistory.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-b-4 border-gray-200">
              <h3 className="text-gray-700 font-bold text-xl mb-4">📅 年度学习热力图</h3>
              <HeatmapChart data={userData.yearlyXpHistory} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DuoDashApp;
