import React from 'react';
import { mockKLineData } from '../../data/mockData';

interface KLineChartProps {
  symbol?: string;
  showMA?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">¥{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 简化的K线图组件 - 使用SVG
export const KLineChart: React.FC<KLineChartProps> = ({ showMA = true }) => {
  const data = mockKLineData;

  // 计算数据范围
  const prices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices) - 10;
  const maxPrice = Math.max(...prices) + 10;
  const priceRange = maxPrice - minPrice;

  // 计算K线宽度和间距
  const chartWidth = 600;
  const chartHeight = 300;
  const candleWidth = (chartWidth / data.length) * 0.6;
  const gap = (chartWidth / data.length) * 0.4;

  // 转换价格到Y坐标
  const priceToY = (price: number) =>
    chartHeight - ((price - minPrice) / priceRange) * chartHeight;

  return (
    <div className="w-full h-full overflow-hidden">
      <svg
        viewBox={`0 0 ${chartWidth + 60} ${chartHeight + 40}`}
        className="w-full h-[300px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y轴标签 */}
        {Array.from({ length: 6 }, (_, i) => {
          const price = minPrice + (priceRange * (5 - i)) / 5;
          const y = (chartHeight / 5) * i;
          return (
            <g key={`y-${i}`}>
              <line
                x1="40"
                y1={y}
                x2={chartWidth + 40}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.3"
              />
              <text
                x="35"
                y={y + 4}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
              >
                ¥{price.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* K线蜡烛图 */}
        {data.map((candle, index) => {
          const x = 40 + index * (candleWidth + gap) + gap / 2;
          const isUp = candle.close >= candle.open;
          const color = isUp ? '#10b981' : '#ef4444';

          const highY = priceToY(candle.high);
          const lowY = priceToY(candle.low);
          const openY = priceToY(candle.open);
          const closeY = priceToY(candle.close);

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(openY - closeY), 1);

          return (
            <g key={`candle-${index}`}>
              {/* 上下影线 */}
              <line
                x1={x + candleWidth / 2}
                y1={highY}
                x2={x + candleWidth / 2}
                y2={lowY}
                stroke={color}
                strokeWidth="1"
              />
              {/* 蜡烛体 */}
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isUp ? 'transparent' : color}
                stroke={color}
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* X轴标签 */}
        {data.map((candle, index) => {
          const x = 40 + index * (candleWidth + gap) + candleWidth / 2;
          if (index % 2 === 0) {
            return (
              <text
                key={`x-${index}`}
                x={x}
                y={chartHeight + 20}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
              >
                {candle.date}
              </text>
            );
          }
          return null;
        })}

        {/* 均线 - 简化版 */}
        {showMA && (
          <g>
            {/* MA5 */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              points={data.map((d, i) => {
                const x = 40 + i * (candleWidth + gap) + candleWidth / 2;
                const maValue = d.close - (i * 2); // 简化计算
                const y = priceToY(maValue);
                return `${x},${y}`;
              }).join(' ')}
            />
            {/* MA10 */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              points={data.map((d, i) => {
                const x = 40 + i * (candleWidth + gap) + candleWidth / 2;
                const maValue = d.close - (i * 3); // 简化计算
                const y = priceToY(maValue);
                return `${x},${y}`;
              }).join(' ')}
            />
            {/* MA30 模拟 */}
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              points={data.map((d, i) => {
                const x = 40 + i * (candleWidth + gap) + candleWidth / 2;
                const maValue = d.close - (i * 5); // 简化计算
                const y = priceToY(maValue);
                return `${x},${y}`;
              }).join(' ')}
            />
          </g>
        )}
      </svg>

      {/* 图例 */}
      {showMA && (
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-0.5 bg-[#f59e0b]"></div>
            <span className="text-muted-foreground">MA5</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-0.5 bg-[#3b82f6]"></div>
            <span className="text-muted-foreground">MA10</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-0.5 bg-[#8b5cf6]"></div>
            <span className="text-muted-foreground">MA30</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 成交量柱状图 - 简化版
export const VolumeChart: React.FC = () => {
  const data = mockKLineData;
  const maxVolume = Math.max(...data.map(d => d.volume));

  return (
    <div className="w-full h-24">
      <svg viewBox="0 0 600 80" className="w-full h-full" preserveAspectRatio="none">
        {data.map((item, index) => {
          const height = (item.volume / maxVolume) * 70;
          const width = 600 / data.length * 0.6;
          const x = index * (width + 600 / data.length * 0.4);
          const isUp = item.close >= item.open;

          return (
            <rect
              key={index}
              x={x}
              y={75 - height}
              width={width}
              height={height}
              fill={isUp ? '#10b981' : '#ef4444'}
              opacity="0.6"
            />
          );
        })}
      </svg>
    </div>
  );
};

// 迷你K线图（用于卡片展示）
export const MiniKLineChart: React.FC<{ data?: typeof mockKLineData }> = ({ data = mockKLineData }) => {
  const isUp = data[data.length - 1].close >= data[0].close;
  const color = isUp ? '#10b981' : '#ef4444';

  const minValue = Math.min(...data.map((d) => d.low));
  const maxValue = Math.max(...data.map((d) => d.high));
  const range = maxValue - minValue || 1;

  // 归一化数据
  const normalizedData = data.map((item) => ({
    value: ((item.close - minValue) / range) * 100,
  }));

  const pathData = normalizedData
    .map((point, index) => {
      const x = (index / (normalizedData.length - 1)) * 100;
      const y = 100 - point.value;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id={`miniGradient-${isUp ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={pathData + ' L 100 100 L 0 100 Z'} fill={`url(#miniGradient-${isUp ? 'up' : 'down'})`} />
      <path d={pathData} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
};
