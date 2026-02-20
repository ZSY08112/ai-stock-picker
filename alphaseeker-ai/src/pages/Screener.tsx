import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Brain
} from 'lucide-react';
import { StockList } from '../components/stock/StockCard';
import { runScreener, analyzeStockWithAI, getStockQuote, stockList } from '../services/api';
import { defaultFilters, type ScreenerFilters } from '../data/mockData';

export const Screener: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ScreenerFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleRunScreener = async () => {
    setIsLoading(true);
    try {
      // 使用API服务执行筛选
      const screened = await runScreener({
        minMarketCap: filters.minMarketCap,
        maxPE: filters.maxPE,
        minROE: filters.minROE,
        sector: filters.sector || null,
      });
      setResults(screened);
    } catch (error) {
      console.error('筛选失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: keyof ScreenerFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            智能选股
          </h1>
          <p className="text-muted-foreground mt-1">
            通过多维度筛选条件和AI分析，从全市场精选潜力股票
          </p>
        </div>
      </div>

      {/* 筛选面板 */}
      <div className="bg-card rounded-xl border border-border p-5">
        {/* 快速筛选条件 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* 最小市值 */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">最小市值</label>
            <select
              value={filters.minMarketCap}
              onChange={(e) => updateFilter('minMarketCap', Number(e.target.value))}
              className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={1000000000}>10亿</option>
              <option value={5000000000}>50亿</option>
              <option value={10000000000}>100亿</option>
              <option value={50000000000}>500亿</option>
              <option value={100000000000}>1000亿</option>
            </select>
          </div>

          {/* 最大PE */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">最大市盈率</label>
            <select
              value={filters.maxPE}
              onChange={(e) => updateFilter('maxPE', Number(e.target.value))}
              className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={10}>10倍</option>
              <option value={20}>20倍</option>
              <option value={30}>30倍</option>
              <option value={50}>50倍</option>
              <option value={100}>100倍</option>
            </select>
          </div>

          {/* 最小ROE */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">最低ROE</label>
            <select
              value={filters.minROE}
              onChange={(e) => updateFilter('minROE', Number(e.target.value))}
              className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={5}>5%</option>
              <option value={10}>10%</option>
              <option value={15}>15%</option>
              <option value={20}>20%</option>
              <option value={30}>30%</option>
            </select>
          </div>

          {/* MACD信号 */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">MACD信号</label>
            <select
              value={filters.macdSignal}
              onChange={(e) => updateFilter('macdSignal', e.target.value)}
              className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="any">不限</option>
              <option value="golden">金叉</option>
              <option value="death">死叉</option>
            </select>
          </div>
        </div>

        {/* 高级筛选按钮 */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <SlidersHorizontal className="w-4 h-4" />
          高级筛选条件
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* 高级筛选条件 */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-lg mb-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">最低营收增速</label>
              <input
                type="number"
                value={filters.minRevenueGrowth}
                onChange={(e) => updateFilter('minRevenueGrowth', Number(e.target.value))}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="%"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">RSI范围</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.rsiRange[0]}
                  onChange={(e) => updateFilter('rsiRange', [Number(e.target.value), filters.rsiRange[1]])}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="number"
                  value={filters.rsiRange[1]}
                  onChange={(e) => updateFilter('rsiRange', [filters.rsiRange[0], Number(e.target.value)])}
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">最低成交量</label>
              <input
                type="number"
                value={filters.minVolume}
                onChange={(e) => updateFilter('minVolume', Number(e.target.value))}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="手"
              />
            </div>
          </div>
        )}

        {/* 执行筛选按钮 */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            找到 <span className="text-primary font-bold">{results.length}</span> 只符合条件的股票
          </div>
          <button
            onClick={handleRunScreener}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                筛选中...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                开始筛选
              </>
            )}
          </button>
        </div>
      </div>

      {/* 筛选结果 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">筛选结果</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">排序：</span>
            <select className="px-3 py-1.5 bg-secondary rounded-lg border border-border text-sm">
              <option>AI评分</option>
              <option>涨幅</option>
              <option>热度</option>
              <option>市值</option>
            </select>
          </div>
        </div>
        <StockList
          stocks={results}
          onStockClick={(stock) => navigate(`/stock/${stock.symbol}`)}
          loading={isLoading}
        />
      </div>
    </div>
  );
};
