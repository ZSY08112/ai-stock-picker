import React from 'react';
import { TrendingUp, TrendingDown, Flame, Zap, Target } from 'lucide-react';
import type { Stock } from '../../data/mockData';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
  compact?: boolean;
}

const getVerdictStyle = (verdict: string) => {
  switch (verdict) {
    case 'STRONG_BUY':
      return {
        border: 'border-l-bullish',
        gradient: 'from-bullish/20 to-transparent',
        glow: 'hover:shadow-bullish/20'
      };
    case 'BUY':
      return {
        border: 'border-l-primary',
        gradient: 'from-primary/20 to-transparent',
        glow: 'hover:shadow-primary/20'
      };
    case 'HOLD':
      return {
        border: 'border-l-muted-foreground',
        gradient: 'from-muted/10 to-transparent',
        glow: ''
      };
    case 'SELL':
      return {
        border: 'border-l-accent',
        gradient: 'from-accent/20 to-transparent',
        glow: 'hover:shadow-accent/20'
      };
    case 'STRONG_SELL':
      return {
        border: 'border-l-destructive',
        gradient: 'from-destructive/20 to-transparent',
        glow: 'hover:shadow-destructive/20'
      };
    default:
      return {
        border: 'border-l-primary',
        gradient: 'from-primary/20 to-transparent',
        glow: ''
      };
  }
};

const getVerdictBadge = (score: number) => {
  if (score >= 80) {
    return { label: '强买', className: 'bg-bullish/20 text-bullish border border-bullish/30' };
  } else if (score >= 60) {
    return { label: '买入', className: 'bg-primary/20 text-primary border border-primary/30' };
  } else if (score >= 40) {
    return { label: '观望', className: 'bg-muted/50 text-muted-foreground border border-muted-foreground/30' };
  } else if (score >= 20) {
    return { label: '卖出', className: 'bg-accent/20 text-accent border border-accent/30' };
  } else {
    return { label: '强卖', className: 'bg-destructive/20 text-destructive border border-destructive/30' };
  }
};

const formatNumber = (num: number): string => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

export const StockCard: React.FC<StockCardProps> = ({ stock, onClick, compact }) => {
  const isUp = stock.change >= 0;
  const verdictBadge = getVerdictBadge(stock.aiScore);
  const verdictStyle = getVerdictStyle(stock.verdict);

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-l-4 ${verdictStyle.border} ${verdictStyle.glow}`}
        style={{
          background: `linear-gradient(135deg, hsl(240 25% 10%) 0%, hsl(240 25% 8%) 100%)`,
          borderLeft: '3px solid'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="stock-code text-sm gradient-text">{stock.symbol}</span>
            <span className="text-sm text-muted-foreground">{stock.name}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${verdictBadge.className}`}>
            {verdictBadge.label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{stock.currency === 'USD' ? '$' : '¥'}{stock.price.toFixed(2)}</span>
          <div className={`flex items-center gap-1 ${isUp ? 'text-bullish' : 'text-destructive'}`}>
            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent hover:border-primary/30 ${verdictStyle.glow}`}
      style={{
        background: `linear-gradient(135deg, hsl(240 25% 10%) 0%, hsl(240 20% 8%) 100%)`,
        borderLeft: '3px solid'
      }}
    >
      {/* 头部信息 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(190 100% 60% / 0.1) 0%, hsl(320 100% 60% / 0.1) 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
            <span className="relative text-xs font-bold gradient-text">{stock.sector.slice(0, 2)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="stock-code text-base font-semibold gradient-text">{stock.symbol}</span>
              <span className="text-sm text-muted-foreground">{stock.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{stock.sector}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded-lg text-xs font-bold ${verdictBadge.className}`}>
            {verdictBadge.label}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
            <Zap className="w-3 h-3 text-primary" />
            AI评分 {stock.aiScore}
          </div>
        </div>
      </div>

      {/* 价格信息 */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-2xl font-bold gradient-text">{stock.currency === 'USD' ? '$' : '¥'}{stock.price.toFixed(2)}</div>
          <div className={`flex items-center gap-1 ${isUp ? 'text-bullish' : 'text-destructive'}`}>
            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-medium">
              {isUp ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        {/* 迷你K线图占位 */}
        <div className="w-28 h-14 rounded-lg flex items-center justify-center" style={{ background: 'hsl(240 30% 10%)' }}>
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <polyline
              fill="none"
              stroke={isUp ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              points="0,40 15,35 30,38 45,28 60,32 75,20 90,15 100,10"
            />
          </svg>
        </div>
      </div>

      {/* 标签信息 */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'hsl(240 30% 10%)' }}>
          <Flame className="w-3 h-3 text-accent" />
          <span>热度 {stock.heat}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'hsl(240 30% 10%)' }}>
          <Target className="w-3 h-3 text-primary" />
          <span>机构持仓</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'hsl(240 30% 10%)' }}>
          <span>市值 {formatNumber(stock.marketCap)}</span>
        </div>
      </div>
    </div>
  );
};

// 股票列表组件
interface StockListProps {
  stocks: Stock[];
  onStockClick?: (stock: Stock) => void;
  loading?: boolean;
}

export const StockList: React.FC<StockListProps> = ({ stocks, onStockClick, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl animate-pulse" style={{ background: 'hsl(240 25% 10%)' }}>
            <div className="h-4 w-1/2 rounded mb-4" style={{ background: 'hsl(240 30% 15%)' }}></div>
            <div className="h-8 w-3/4 rounded mb-4" style={{ background: 'hsl(240 30% 15%)' }}></div>
            <div className="h-4 w-1/3 rounded" style={{ background: 'hsl(240 30% 15%)' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stocks.map((stock, index) => (
        <div
          key={stock.symbol}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <StockCard
            stock={stock}
            onClick={() => onStockClick?.(stock)}
          />
        </div>
      ))}
    </div>
  );
};
