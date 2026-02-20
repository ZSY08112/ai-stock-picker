import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Trash2, Bell, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { StockList } from '../components/stock/StockCard';
import { mockWatchlist, mockStocks, type Stock } from '../data/mockData';

export const Watchlist: React.FC = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<Stock[]>(mockWatchlist);
  const [activeGroup, setActiveGroup] = useState('all');

  const groups = [
    { key: 'all', label: '全部', count: watchlist.length },
    { key: 'growth', label: '成长股', count: 2 },
    { key: 'value', label: '价值股', count: 1 },
  ];

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s.symbol !== symbol));
  };

  // 计算组合统计
  const portfolioStats = {
    totalValue: watchlist.reduce((sum, s) => sum + s.price * 100, 0),
    avgScore: Math.round(watchlist.reduce((sum, s) => sum + s.aiScore, 0) / watchlist.length),
    change: watchlist.reduce((sum, s) => sum + s.changePercent, 0) / watchlist.length,
    bullish: watchlist.filter((s) => s.change >= 0).length,
    bearish: watchlist.filter((s) => s.change < 0).length,
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-7 h-7 text-accent" />
            自选股
          </h1>
          <p className="text-muted-foreground mt-1">
            管理您的自选股票，追踪投资组合表现
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          添加股票
        </button>
      </div>

      {/* 组合概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">组合总值</span>
          </div>
          <div className="text-2xl font-bold">¥{(portfolioStats.totalValue / 10000).toFixed(1)}万</div>
          <div className="text-xs text-muted-foreground mt-1">模拟数据</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">平均AI评分</span>
          </div>
          <div className="text-2xl font-bold text-primary">{portfolioStats.avgScore}</div>
          <div className="text-xs text-muted-foreground mt-1">分</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            {portfolioStats.change >= 0 ? (
              <TrendingUp className="w-5 h-5 text-bullish" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <span className="text-sm text-muted-foreground">平均涨跌</span>
          </div>
          <div className={`text-2xl font-bold ${portfolioStats.change >= 0 ? 'text-bullish' : 'text-destructive'}`}>
            {portfolioStats.change >= 0 ? '+' : ''}{portfolioStats.change.toFixed(2)}%
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">涨跌分布</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-bullish">{portfolioStats.bullish} ↑</span>
            <span className="text-lg font-bold text-destructive">{portfolioStats.bearish} ↓</span>
          </div>
        </div>
      </div>

      {/* 分组标签 */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {groups.map((group) => (
          <button
            key={group.key}
            onClick={() => setActiveGroup(group.key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeGroup === group.key
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            {group.label}
            <span className="ml-2 text-sm opacity-70">({group.count})</span>
          </button>
        ))}
      </div>

      {/* 自选股列表 */}
      {watchlist.length > 0 ? (
        <div className="space-y-3">
          {watchlist.map((stock, index) => (
            <div
              key={stock.symbol}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 股票信息 */}
              <div
                className="flex-1 cursor-pointer"
                onClick={() => navigate(`/stock/${stock.symbol}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{stock.sector.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="stock-code font-semibold">{stock.symbol}</span>
                      <span className="text-muted-foreground">{stock.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{stock.sector}</div>
                  </div>
                </div>
              </div>

              {/* 价格与涨跌幅 */}
              <div className="text-right">
                <div className="text-lg font-semibold">¥{stock.price.toFixed(2)}</div>
                <div className={`flex items-center justify-end gap-1 ${
                  stock.change >= 0 ? 'text-bullish' : 'text-destructive'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="text-sm">
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* AI评分 */}
              <div className="text-center px-4">
                <div className={`text-lg font-bold ${
                  stock.aiScore >= 80 ? 'text-bullish' :
                  stock.aiScore >= 60 ? 'text-primary' :
                  stock.aiScore >= 40 ? 'text-muted-foreground' : 'text-destructive'
                }`}>
                  {stock.aiScore}
                </div>
                <div className="text-xs text-muted-foreground">AI评分</div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary">
                  <Bell className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeFromWatchlist(stock.symbol)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">暂无自选股票</h3>
          <p className="text-muted-foreground mb-4">添加股票到自选，方便追踪关注</p>
          <button
            onClick={() => navigate('/screener')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            去选股
          </button>
        </div>
      )}
    </div>
  );
};
