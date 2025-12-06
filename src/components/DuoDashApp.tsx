import React, { useState, useEffect } from 'react';
import type { UserData } from '../types';
import { XpHistoryChart, TimeHistoryChart, HeatmapChart } from './Charts';
import { AiCoach } from './AiCoach';
import { LoginScreen } from './LoginScreen';
import { fetchDuolingoData, transformDuolingoData } from '../services/duolingoService';

const CHART_COLORS = ['#58cc02', '#ce82ff', '#ff9600', '#ff4b4b', '#1cb0f6', '#ffc800'];

const DEMO_DATA: UserData = {
  username: "SteveThePolyglot",
  fullname: "Steve O. (演示)",
  avatarUrl: "https://placehold.co/150x150/58cc02/white?text=S",
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
  // 演示数据 - 新增字段
  fluencyScore: 0.65,
  currentLevel: 14,
  levelProgress: 1434,
  levelPercent: 95,
  levelLeft: 66,
  languageStrength: 0.82,
  numSkillsLearned: 57,
  knownWords: 2450,
  xpToday: 180,
  lessonsToday: 5,
  streakExtendedToday: true,
  streakExtendedTime: "09:32",
  skills: [
    { name: "Basics 1", strength: 1, learned: true, mastered: true },
    { name: "Phrases", strength: 0.95, learned: true, mastered: false },
    { name: "Food", strength: 0.88, learned: true, mastered: false },
    { name: "Animals", strength: 0.75, learned: true, mastered: false },
    { name: "Plurals", strength: 1, learned: true, mastered: true },
    { name: "Colors", strength: 0.92, learned: true, mastered: false },
  ],
  friendsRanking: [
    { username: "SteveThePolyglot", displayName: "Steve O.", xp: 202663, rank: 1 },
    { username: "maria_learns", displayName: "Maria", xp: 156000, rank: 2 },
    { username: "john_doe", displayName: "John", xp: 98000, rank: 3 },
  ],
  nextLesson: { skillTitle: "Abstract Objects 1", skillUrl: "Abstract-Objects-1", lessonNumber: 1 },
};

// 从环境变量获取配置
const getEnvCredentials = () => {
  const username = import.meta.env.DUOLINGO_USERNAME || '';
  const jwt = import.meta.env.DUOLINGO_JWT || '';
  const hasCredentials = !!(username && jwt && username !== 'your_duolingo_username' && jwt !== 'your_jwt_token_here');
  return { username, jwt, hasCredentials };
};

// 检查是否配置了环境变量（用于初始状态）
const envCredentials = getEnvCredentials();

export const DuoDashApp: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(envCredentials.hasCredentials);
  const [error, setError] = useState<string | null>(null);
  const [autoLoaded, setAutoLoaded] = useState(false);

  // 自动从环境变量加载数据
  useEffect(() => {
    const { username, jwt, hasCredentials } = getEnvCredentials();
    if (hasCredentials && !autoLoaded) {
      setAutoLoaded(true);
      handleConnect(username, jwt);
    }
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

  // 如果配置了环境变量且正在加载，显示加载界面
  if (!userData && envCredentials.hasCredentials && loading) {
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
  if (!userData && envCredentials.hasCredentials && error) {
    return (
      <div className="min-h-screen bg-[#235390] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">😢</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">连接失败</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <p className="text-gray-500 text-sm mb-6">请检查 .env.local 中的 DUOLINGO_USERNAME 和 DUOLINGO_JWT 配置是否正确</p>
          <button onClick={() => { setError(null); setAutoLoaded(false); }} 
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
            <div className="flex items-center gap-4">
              {userData.isPlus && (
                <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <span className="text-white text-lg">👑</span>
                  <span className="font-bold text-white text-sm">Super</span>
                </div>
              )}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-xl">
                <span className="text-red-500 text-lg">🔥</span>
                <span className="font-bold text-gray-700">{userData.streak}</span>
              </div>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-xl">
                <span className="text-blue-400 text-lg">💎</span>
                <span className="font-bold text-gray-700">{userData.gems.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-700">学习数据概览</h1>
          <p className="text-gray-500 font-semibold mt-1">
            已加入多邻国 <span className="text-gray-700">{userData.accountAgeDays}</span> 天。当前重点：<span className="text-[#58cc02]">{userData.learningLanguage}</span>
          </p>
        </div>

        {/* 统计卡片 - 自适应网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-2xl font-extrabold text-orange-500">{userData.streak}</div>
            <div className="text-xs text-gray-500 font-bold">连胜天数</div>
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
              {/* 连胜状态文字 */}
              {userData.streakExtendedToday ? (
                <div className="text-sm text-center text-gray-500">
                  🔥 {userData.streakExtendedTime ? `${userData.streakExtendedTime} 保住今日连胜` : '今日连胜已保住'}
                </div>
              ) : (
                <div className="text-sm text-center text-gray-400">
                  ⏰ 今日还未学习，完成目标保住连胜
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* 技能强度 */}
            {userData.skills && userData.skills.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-b-4 border-gray-200">
                <h3 className="text-gray-700 font-bold text-xl mb-4">技能强度</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {userData.skills.slice(0, 30).map((skill, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-700 truncate">{skill.name}</span>
                        <span className={`text-xs font-bold ${skill.mastered ? 'text-[#58cc02]' : 'text-gray-400'}`}>
                          {skill.mastered ? '已掌握' : `${Math.round(skill.strength * 100)}%`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" 
                          style={{ width: `${skill.strength * 100}%`, backgroundColor: skill.mastered ? '#58cc02' : '#ffc800' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                {userData.skills.length > 30 && (
                  <p className="text-xs text-gray-400 mt-3 text-center">还有 {userData.skills.length - 30} 个技能...</p>
                )}
              </div>
            )}

            {/* 好友排行 */}
            {userData.friendsRanking && userData.friendsRanking.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-b-4 border-gray-200">
                <h3 className="text-gray-700 font-bold text-xl mb-4">好友排行榜</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userData.friendsRanking.map((friend, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${friend.username === userData.username ? 'bg-[#58cc02]/10 border border-[#58cc02]' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {friend.rank}
                        </span>
                        <span className="font-bold text-gray-700">{friend.displayName}</span>
                        {friend.username === userData.username && <span className="text-xs bg-[#58cc02] text-white px-2 py-0.5 rounded">你</span>}
                      </div>
                      <span className="font-bold text-gray-600">{friend.xp.toLocaleString()} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 证书 */}
            {userData.certificates && userData.certificates.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-b-4 border-gray-200">
                <h3 className="text-gray-700 font-bold text-xl mb-4">语言证书</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.certificates.map((cert, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🏅</span>
                        <div>
                          <div className="font-bold text-gray-700">{cert.language}</div>
                          <div className="text-sm text-gray-500">得分：<span className="font-bold text-orange-500">{cert.score}</span></div>
                          <div className="text-xs text-gray-400">{cert.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="space-y-6">
            {/* 下一课推荐 */}
            {userData.nextLesson && (
              <div className="bg-gradient-to-br from-[#58cc02] to-[#4caf00] rounded-2xl p-6 shadow-sm border-b-4 border-[#3d8c00] text-white">
                <h3 className="font-extrabold text-xl mb-2">下一课推荐</h3>
                <p className="font-semibold opacity-90 mb-3">{userData.nextLesson.skillTitle}</p>
                <div className="text-sm opacity-80 mb-4">第 {userData.nextLesson.lessonNumber} 课</div>
                <a href={`https://www.duolingo.com/skill/${userData.nextLesson.skillUrl}`} target="_blank" rel="noreferrer"
                  className="block w-full text-center bg-white text-[#58cc02] font-extrabold py-3 px-4 rounded-xl hover:bg-gray-50 uppercase tracking-widest text-sm">
                  开始学习
                </a>
              </div>
            )}

          </div>
        </div>

        {/* 年度学习热力图 - 全宽显示在最底部 */}
        {userData.yearlyXpHistory && userData.yearlyXpHistory.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-b-4 border-gray-200 mt-6">
            <h3 className="text-gray-700 font-bold text-xl mb-4">📅 年度学习热力图</h3>
            <HeatmapChart data={userData.yearlyXpHistory} />
          </div>
        )}
      </main>
    </div>
  );
};

export default DuoDashApp;
