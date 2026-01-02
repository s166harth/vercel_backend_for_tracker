import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export function StatsCard({ title, value, icon: Icon, trend, color = "blue" }) {
    return (
        <div className="stats-card">
            <div className="stats-header">
                <span className="stats-title">{title}</span>
                {Icon && <Icon className={`stats-icon ${color}`} size={20} />}
            </div>
            <div className="stats-body">
                <h3 className="stats-value">{value}</h3>
                {trend && (
                    <span className={`stats-trend ${trend > 0 ? 'positive' : 'negative'}`}>
                        {trend > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
}
