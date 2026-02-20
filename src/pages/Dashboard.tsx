import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, ArrowRight, Activity, Newspaper, Cpu, Zap, Target, Layers } from 'lucide-react';
import { StockList } from '../components/stock/StockCard';
import { AIAnalysisPanel } from '../components/analysis/AIAnalysisPanel';
import { NewsFeed } from '../components/news/NewsFeed';
import { KLineChart } from '../components/chart/KLineChart';
import { stockList, getStockListByMarket, getStockQuote, analyzeStockWithAI, getStockNews, MarketType } from '../services/api';
import { marketSentiment } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [activeMarket, setActiveMarket] = useState<MarketType>('A');

  const marketLabels: Record<MarketType, string> = {
    'A': 'A股',
    'US': '美股',
    'CRYPTO': '加密货币'
  };

  const marketColors: Record<MarketType, string> = {
    'A': 'text-primary',
    'US': 'text-blue-400',
    'CRYPTO': 'text-yellow-400'
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 根据选择的市场加载数据
        const currentList = getStockListByMarket(activeMarket);

        const stockPromises = currentList.map(async (stock: any) => {
          const quote = await getStockQuote(stock.symbol);
          const analysis = await analyzeStockWithAI({
            ...stock,
            ...quote
          });
          // 添加货币信息
          analysis.currency = quote.currency;
          return {
            ...stock,
            ...quote,
            aiScore: analysis.overallScore,
            verdict: analysis.verdictCode,
            verdictLabel: analysis.verdict,
            aiAnalysis: analysis,
            heat: quote.heat,
          };
        });

        const stocksData = await Promise.all(stockPromises);
        setStocks(stocksData);

        // 加载新闻
        const defaultSymbol = activeMarket === 'A' ? '600519' : activeMarket === 'US' ? 'AAPL' : 'BTC';
        const newsData = await getStockNews(defaultSymbol);
        setNews(newsData);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeMarket]);

  // 获取AI精选股票（评分最高的）
  const aiPicks = [...stocks].sort((a, b) => b.aiScore - a.aiScore).slice(0, 6);

  // 获取热门股票
  const hotStocks = [...stocks].sort((a, b) => b.heat - a.heat).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 市场选择标签 */}
      <div className="flex items-center gap-4 mb-2">
        <span className="text-sm text-muted-foreground">选择市场:</span>
        <div className="flex gap-2">
          {(['A', 'US', 'CRYPTO'] as MarketType[]).map((market) => (
            <button
              key={market}
              onClick={() => setActiveMarket(market)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeMarket === market
                  ? 'bg-primary text-black neon-glow'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              }`}
            >
              {marketLabels[market]}
            </button>
          ))}
        </div>
      </div>

      {/* 科技感欢迎横幅 */}
      <div className="relative overflow-hidden rounded-2xl p-8 tech-border">
        {/* 背景效果 */}
        <div className="absolute inset-0 data-flow-bg" />
        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Cpu className="w-5 h-5 text-primary neon-glow" />
              </div>
              <span className="text-sm font-medium gradient-text">AI 智能选股系统 v2.0</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">
              <span className={`gradient-text ${marketColors[activeMarket]}`}>AlphaSeeker AI - {marketLabels[activeMarket]}</span>
            </h1>
            <p className="text-muted-foreground mb-6 max-w-xl">
              基于大语言模型深度分析股票基本面、技术面、消息面与资金面，
              实时捕捉市场机会，智能推荐潜力标的
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/screener')}
                className="btn-cyber inline-flex items-center gap-2 px-6 py-3 rounded-xl"
              >
                <Zap className="w-5 h-5" />
                启动智能选股
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/screener')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 hover:bg-primary/10 transition-all"
              >
                <Target className="w-5 h-5 text-primary" />
                查看策略
              </button>
            </div>
          </div>

          {/* 右侧装饰 */}
          <div className="hidden lg:block relative">
            <div className="w-48 h-48 relative">
              {/* 动态光环 */}
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow" />
              <div className="absolute inset-4 rounded-full border border-primary/30" />
              <div className="absolute inset-8 rounded-full border border-accent/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="w-16 h-16 text-primary neon-glow" />
              </div>
              {/* 旋转装饰 */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 5" className="text-primary/30" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 实时数据流展示 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 tech-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">实时分析</span>
          </div>
          <div className="text-2xl font-bold gradient-text">10,285</div>
          <div className="text-xs text-muted-foreground">分析股票数</div>
        </div>
        <div className="glass rounded-xl p-4 tech-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-bullish" />
            <span className="text-xs text-muted-foreground">今日推荐</span>
          </div>
          <div className="text-2xl font-bold text-bullish">28</div>
          <div className="text-xs text-muted-foreground">强势股票</div>
        </div>
        <div className="glass rounded-xl p-4 tech-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">AI 模型</span>
          </div>
          <div className="text-2xl font-bold gradient-text">GPT-4o</div>
          <div className="text-xs text-muted-foreground">深度分析</div>
        </div>
        <div className="glass rounded-xl p-4 tech-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">准确率</span>
          </div>
          <div className="text-2xl font-bold text-accent">87.5%</div>
          <div className="text-xs text-muted-foreground">历史命中率</div>
        </div>
      </div>

      {/* 市场情绪仪表盘 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 情绪仪表 */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 tech-border">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary neon-glow" />
              <h3 className="font-semibold">市场情绪指数</h3>
            </div>

            {/* 科技感仪表盘 */}
            <div className="relative flex justify-center mb-6">
              <svg viewBox="0 0 200 120" className="w-40">
                <defs>
                  <linearGradient id="gaugeGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(0 100% 60%)" />
                    <stop offset="30%" stopColor="hsl(45 100% 50%)" />
                    <stop offset="60%" stopColor="hsl(150 100% 45%)" />
                    <stop offset="100%" stopColor="hsl(150 100% 45%)" />
                  </linearGradient>
                </defs>
                {/* 弧形背景 */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="hsl(240 30% 15%)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* 渐变弧形 */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGradient2)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(marketSentiment.score / 100) * 251} 251`}
                />
                {/* 指针 */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="30"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${(marketSentiment.score / 100) * 180 - 90} 100 100)`}
                  className="drop-shadow-lg"
                />
                <circle cx="100" cy="100" r="8" fill="hsl(190 100% 60%)" className="neon-glow" />
              </svg>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold gradient-text">{marketSentiment.score}</div>
              <div className="text-sm text-primary font-medium mt-1">{marketSentiment.label}</div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
                实时更新 {marketSentiment.updatedAt}
              </div>
            </div>
          </div>
        </div>

        {/* AI精选股票 */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">AI 今日精选</h2>
              <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full border border-primary/30">
                TOP 6
              </span>
            </div>
            <button
              onClick={() => navigate('/screener')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              查看更多 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <StockList stocks={aiPicks} onStockClick={(stock) => navigate(`/stock/${stock.symbol}`)} loading={loading} />
        </div>
      </div>

      {/* 图表与资讯 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 图表区域 */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 tech-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">{stocks[0]?.symbol || '--'} {stocks[0]?.name || '加载中...'} 走势分析</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs bg-secondary/50 rounded-lg border border-primary/20 text-primary">MA5</span>
              <span className="px-3 py-1 text-xs bg-secondary/50 rounded-lg border border-blue-500/20 text-blue-400">MA10</span>
              <span className="px-3 py-1 text-xs bg-secondary/50 rounded-lg border border-purple-500/20 text-purple-400">MA30</span>
            </div>
          </div>
          <KLineChart />
        </div>

        {/* 资讯区域 */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-5 tech-border h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent/20 border border-accent/30">
                <Newspaper className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold">财经资讯流</h3>
            </div>
            <NewsFeed news={news.length > 0 ? news : []} limit={5} />
          </div>
        </div>
      </div>

      {/* 热门股票 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/20 border border-accent/30">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-semibold">市场热点</h2>
          <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full border border-accent/30">
            HOT
          </span>
        </div>
        <StockList stocks={hotStocks} onStockClick={(stock) => navigate(`/stock/${stock.symbol}`)} loading={loading} />
      </div>
    </div>
  );
};
