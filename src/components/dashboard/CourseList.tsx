import React from 'react';
import type { Course } from '../../types';
import { DistributionIcon } from '../icons';

const CHART_COLORS = ['#58cc02', '#ce82ff', '#ff9600', '#ff4b4b', '#1cb0f6', '#ffc800'];

interface CourseListProps {
  courses: Course[];
}

export const CourseList = React.memo(function CourseList({ courses }: CourseListProps): React.ReactElement {
  const sortedCourses = [...courses].sort((a, b) => b.xp - a.xp);
  const totalCourseXp = sortedCourses.reduce((acc, c) => acc + c.xp, 0);
  const maxCourseXp = sortedCourses[0]?.xp ?? 0;

  return (
    <div className="panel-card animate-fade-in-up">
      <div className="panel-header">
        <h2 className="panel-title">
          <DistributionIcon className="panel-title-icon h-5 w-5" />
          <span className="leading-none">语言分布</span>
        </h2>
        {courses.length > 0 && (
          <span className="text-xs text-neutral-500 whitespace-nowrap">
            共 {courses.length} 门课程 · {totalCourseXp.toLocaleString()} XP
          </span>
        )}
      </div>

      {courses.length > 0 ? (
        <div className="p-3 sm:p-4">
          <div className={`grid gap-3 ${
            courses.length === 1 ? 'grid-cols-1' :
            courses.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            courses.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {sortedCourses.map((course, idx) => {
              const percent = totalCourseXp > 0 ? ((course.xp / totalCourseXp) * 100).toFixed(1) : '0';
              const relativeWidth = maxCourseXp > 0 ? (course.xp / maxCourseXp) * 100 : 0;
              const color = CHART_COLORS[idx % CHART_COLORS.length];

              return (
                <div
                  key={course.id}
                  className="panel-card-muted w-full p-3 sm:p-4 transition-colors hover:border-[#58cc02]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-pill flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-bold text-neutral-800 text-xs sm:text-sm truncate">{course.title}</span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg sm:text-xl font-black tabular-nums" style={{ color }}>{course.xp.toLocaleString()}</span>
                    <span className="text-[10px] sm:text-xs text-neutral-400">XP</span>
                    <span className="text-[10px] sm:text-xs text-neutral-500 ml-auto tabular-nums">{percent}%</span>
                  </div>

                  <div className="h-1.5 sm:h-2 w-full bg-neutral-100 rounded-pill overflow-hidden">
                    <div
                      className="h-full rounded-pill origin-left transition-transform duration-200 ease-out"
                      style={{ transform: `scaleX(${relativeWidth / 100})`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-neutral-500 text-sm text-center py-6">暂无课程数据</div>
      )}
    </div>
  );
});
