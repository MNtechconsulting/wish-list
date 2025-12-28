/**
 * PriceChart component using SVG
 * Lightweight chart component for price history visualization
 * Requirements: 4.2
 */

import React from 'react';
import { ChartDataPoint } from '../../types';

interface PriceChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  width = 600,
  height = 300,
  color, // Will use theme color if not provided
  className = ''
}) => {
  // Use theme primary color as default if no color specified
  const chartColor = color || 'var(--color-primary)';
  
  // Return empty state if no data
  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center theme-surface rounded-lg theme-transition ${className}`}
        style={{ width, height }}
      >
        <span className="text-theme-text-muted">No data available</span>
      </div>
    );
  }

  // Chart dimensions with padding
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Convert dates to timestamps for calculations
  const dataWithTimestamps = data.map(point => ({
    ...point,
    timestamp: point.x instanceof Date ? point.x.getTime() : Number(point.x)
  }));

  // Find min/max values for scaling
  const minY = Math.min(...dataWithTimestamps.map(d => d.y));
  const maxY = Math.max(...dataWithTimestamps.map(d => d.y));
  const minX = Math.min(...dataWithTimestamps.map(d => d.timestamp));
  const maxX = Math.max(...dataWithTimestamps.map(d => d.timestamp));

  // Add some padding to Y range for better visualization
  const yRange = maxY - minY;
  const yPadding = yRange * 0.1; // 10% padding
  const adjustedMinY = minY - yPadding;
  const adjustedMaxY = maxY + yPadding;
  const adjustedYRange = adjustedMaxY - adjustedMinY;

  // Scale functions
  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * chartWidth + padding;
  const scaleY = (y: number) => height - (((y - adjustedMinY) / adjustedYRange) * chartHeight + padding);

  // Generate path for the line
  const pathData = dataWithTimestamps
    .map((point, index) => {
      const x = scaleX(point.timestamp);
      const y = scaleY(point.y);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Generate area path (for gradient fill)
  const areaPathData = pathData + 
    ` L ${scaleX(dataWithTimestamps[dataWithTimestamps.length - 1].timestamp)} ${height - padding}` +
    ` L ${scaleX(dataWithTimestamps[0].timestamp)} ${height - padding} Z`;

  // Generate Y-axis labels
  const yAxisLabels = [];
  const labelCount = 5;
  for (let i = 0; i <= labelCount; i++) {
    const value = adjustedMinY + (adjustedYRange * i / labelCount);
    const y = scaleY(value);
    yAxisLabels.push({
      value: value,
      y: y,
      label: `$${value.toFixed(0)}`
    });
  }

  // Generate X-axis labels (dates)
  const xAxisLabels = [];
  const xLabelCount = Math.min(5, dataWithTimestamps.length);
  for (let i = 0; i < xLabelCount; i++) {
    const index = Math.floor((dataWithTimestamps.length - 1) * i / (xLabelCount - 1));
    const point = dataWithTimestamps[index];
    const x = scaleX(point.timestamp);
    const date = new Date(point.timestamp);
    xAxisLabels.push({
      x: x,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={chartColor} stopOpacity="0.05" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.1"/>
          </filter>
        </defs>

        {/* Grid lines */}
        {yAxisLabels.map((label, index) => (
          <line
            key={`grid-y-${index}`}
            x1={padding}
            y1={label.y}
            x2={width - padding}
            y2={label.y}
            stroke="var(--color-border)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}

        {/* Chart area fill */}
        <path
          d={areaPathData}
          fill="url(#priceGradient)"
        />

        {/* Main price line */}
        <path
          d={pathData}
          fill="none"
          stroke={chartColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow)"
        />

        {/* Data points */}
        {dataWithTimestamps.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={scaleX(point.timestamp)}
            cy={scaleY(point.y)}
            r="4"
            fill={chartColor}
            stroke="white"
            strokeWidth="2"
            filter="url(#shadow)"
          />
        ))}

        {/* Y-axis labels */}
        {yAxisLabels.map((label, index) => (
          <text
            key={`y-label-${index}`}
            x={padding - 10}
            y={label.y + 4}
            textAnchor="end"
            className="text-xs fill-theme-text-muted"
            fontSize="12"
          >
            {label.label}
          </text>
        ))}

        {/* X-axis labels */}
        {xAxisLabels.map((label, index) => (
          <text
            key={`x-label-${index}`}
            x={label.x}
            y={height - padding + 20}
            textAnchor="middle"
            className="text-xs fill-theme-text-muted"
            fontSize="12"
          >
            {label.label}
          </text>
        ))}

        {/* Chart border */}
        <rect
          x={padding}
          y={padding}
          width={chartWidth}
          height={chartHeight}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
        />
      </svg>

      {/* Hover tooltip (simple implementation) */}
      <div className="absolute top-2 right-2 theme-surface rounded-lg shadow-theme-medium p-2 text-xs text-theme-text-muted border theme-border theme-transition">
        <div>Latest: {data[data.length - 1]?.label || 'N/A'}</div>
        <div>Points: {data.length}</div>
      </div>
    </div>
  );
};