import React from 'react';
import type { Course } from '../../types';

const CHART_COLORS = ['#58cc02', '#ce82ff', '#ff9600', '#ff4b4b', '#1cb0f6', '#ffc800'];

interface CourseListProps {
    courses: Course[];
    seq: number;
}

/**
 * 语言分布列表组件 - 显示课程 XP 分布
 */
export const CourseList: React.FC<CourseListProps> = ({ courses, seq }) => {
    const sortedCourses = [...courses].sort((a, b) => b.xp - a.xp);
    const totalCourseXp = sortedCourses.reduce((acc, c) => acc + c.xp, 0);
    const maxCourseXp = sortedCourses.length > 0 ? sortedCourses[0].xp : 0;

    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200 animate-seq seq-${seq}`}>
            <h2 className="text-gray-700 font-bold text-lg mb-3">语言分布</h2>
            {courses.length > 0 ? (
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
                                    <span className="text-xs text-gray-700">{course.xp.toLocaleString()} XP ({percent}%)</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${relativeWidth}%`, backgroundColor: color }}></div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="pt-2 border-t border-gray-100 text-center text-xs text-gray-600">
                        共 {courses.length} 门课程 · 总计 {totalCourseXp.toLocaleString()} XP
                    </div>
                </div>
            ) : (
                <div className="text-gray-600 text-sm text-center py-4">没有课程</div>
            )}
        </div>
    );
};

export default CourseList;
