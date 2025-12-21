import React from 'react';

interface StatCardProps {
    icon: string;
    value: string | number;
    label: string;
    colorClass: string;
    seq: number;
    isLargeText?: boolean;
}

/**
 * 统计卡片组件 - 用于展示单个统计数据
 */
export const StatCard: React.FC<StatCardProps> = ({
    icon,
    value,
    label,
    colorClass,
    seq,
    isLargeText = true,
}) => {
    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200 animate-seq seq-${seq}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`${isLargeText ? 'text-2xl' : 'text-lg'} font-extrabold ${colorClass}`}>
                {value}
            </div>
            <div className="text-xs text-gray-500 font-bold">{label}</div>
        </div>
    );
};

export default StatCard;
