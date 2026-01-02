import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Common chart options for the theme
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: '#9ca3af' } // text-muted (gray-400)
        },
        tooltip: {
            backgroundColor: '#1a0808',
            titleColor: '#f3f4f6',
            bodyColor: '#9ca3af',
            borderColor: '#450a0a',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            grid: { color: '#450a0a' },
            ticks: {
                color: '#9ca3af',
                callback: function (value) {
                    // For horizontal bars, x-axis is values, usually safe.
                    // If vertical, we truncate. This callback handles both but truncation logic assumes labels.
                    // For linear scale (counts), labels aren't typically long strings, so this is fine.
                    return value;
                }
            }
        },
        y: {
            grid: { color: '#450a0a' },
            ticks: { color: '#9ca3af' }
        }
    }
};

export function ActivityChart({ data }) {
    const chartData = useMemo(() => {
        // Group data by date
        const dateGroups = {};
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedData.forEach(item => {
            const date = new Date(item.date).toLocaleDateString();
            dateGroups[date] = (dateGroups[date] || 0) + 1;
        });

        const labels = Object.keys(dateGroups);
        const values = Object.values(dateGroups);

        return {
            labels,
            datasets: [
                {
                    label: 'Activity',
                    data: values,
                    borderColor: '#dc2626', // Red-600
                    backgroundColor: 'rgba(220, 38, 38, 0.2)',
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    }, [data]);

    const options = {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            title: { display: false },
        },
        scales: {
            ...commonOptions.scales,
            x: {
                ...commonOptions.scales.x,
                ticks: {
                    ...commonOptions.scales.x.ticks,
                    callback: function (value) {
                        const label = this.getLabelForValue(value);
                        // Truncate logic for date strings if needed, though they are usually short
                        return label;
                    }
                }
            }
        }
    };

    return <Line options={options} data={chartData} />;
}

export function DistributionChart({ counts }) {
    const chartData = {
        labels: ['Articles', 'Books', 'Paintings', 'Writeups'],
        datasets: [
            {
                data: [counts.article, counts.book, counts.painting, counts.writeup],
                backgroundColor: [
                    '#dc2626', // Red-600
                    '#b91c1c', // Red-700
                    '#991b1b', // Red-800
                    '#7f1d1d', // Red-900
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: { color: '#9ca3af' }
            },
        },
    };

    return <Doughnut data={chartData} options={options} />;
}

export function BarChart({ labels, values, label, color }) {
    const data = {
        labels,
        datasets: [
            {
                label: label,
                data: values,
                backgroundColor: color || '#ef4444',
                borderColor: color || '#ef4444',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        ...commonOptions,
        plugins: {
            legend: { display: false },
        },
        scales: {
            ...commonOptions.scales,
            x: {
                ...commonOptions.scales.x,
                ticks: {
                    color: '#9ca3af',
                    callback: function (value) {
                        const label = this.getLabelForValue(value);
                        if (label.length > 15) {
                            return label.substring(0, 15) + '...';
                        }
                        return label;
                    }
                }
            }
        }
    };

    return <Bar data={data} options={options} />;
}

export function HorizontalBarChart({ labels, values, label, color }) {
    const data = {
        labels,
        datasets: [
            {
                label: label,
                data: values,
                backgroundColor: color || '#dc2626',
                borderColor: color || '#dc2626',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        indexAxis: 'y', // Makes it horizontal
        ...commonOptions,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                grid: { color: '#450a0a' },
                ticks: { color: '#9ca3af' }
            },
            y: {
                grid: { color: '#450a0a' },
                ticks: {
                    color: '#9ca3af',
                    autoSkip: false // Ensure all labels are shown
                }
            }
        }
    };

    const height = Math.max(300, labels.length * 30); // Dynamic height base on items

    return (
        <div style={{ height: `${height}px`, width: '100%' }}>
            <Bar data={data} options={options} />
        </div>
    );
}
