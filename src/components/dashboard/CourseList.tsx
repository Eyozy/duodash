import React from 'react';
import type { Course } from '../../types';

const CHART_COLORS = ['#58cc02', '#ce82ff', '#ff9600', '#ff4b4b', '#1cb0f6', '#ffc800'];

interface CourseListProps {
  courses: Course[];
  seq: number;
}

export function CourseList({ courses, seq }: CourseListProps): React.ReactElement {
  const sortedCourses = [...courses].sort((a, b) => b.xp - a.xp);
  const totalCourseXp = sortedCourses.reduce((acc, c) => acc + c.xp, 0);
  const maxCourseXp = sortedCourses[0]?.xp ?? 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 border-b-4 border-gray-200 animate-seq seq-${seq}`}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-gray-700 font-bold text-lg">语言分布</h2>
        {courses.length > 0 && (
          <span className="text-xs text-gray-500">
            共 {courses.length} 门课程 · {totalCourseXp.toLocaleString()} XP
          </span>
        )}
      </div>

      {courses.length > 0 ? (
        <div className="p-4">
          <div className="flex flex-wrap gap-3">
            {sortedCourses.map((course, idx) => {
              const percent = totalCourseXp > 0 ? ((course.xp / totalCourseXp) * 100).toFixed(1) : '0';
              const relativeWidth = maxCourseXp > 0 ? (course.xp / maxCourseXp) * 100 : 0;
              const color = CHART_COLORS[idx % CHART_COLORS.length];

              return (
                <div
                  key={course.id}
                  className="flex-1 min-w-[200px] sm:min-w-[240px] bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-bold text-gray-700 text-sm truncate">{course.title}</span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xl font-black" style={{ color }}>{course.xp.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">XP</span>
                    <span className="text-xs text-gray-500 ml-auto">{percent}%</span>
                  </div>

                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${relativeWidth}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-sm text-center py-6">暂无课程数据</div>
      )}
    </div>
  );
}

export default CourseList;
