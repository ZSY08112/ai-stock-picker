import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Share2,
  TrendingUp,
  TrendingDown,
  Flame,
  Activity,
  DollarSign,
  Newspaper,
  AlertTriangle
} from 'lucide-react';
import { StockCard } from '../components/stock/StockCard';
import { AIAnalysisPanel } from '../components/analysis/AIAnalysisPanel';
import { KLineChart, VolumeChart } from '../components/chart/KLineChart';
import { NewsFeed } from '../components/news/NewsFeed';
import { stockList, getStockQuote, analyzeStockWithAI, getStockNews, getKLineData } from '../services/api';
import { mockAIAnalysis } from '../data/mockData';

type TabType = 'overview' | 'technical' | 'news' | 'financial' | 'risk';

export const StockDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isWatched, setIsWatched] = useState(false);
  const [stock, setStock] = useState<any>(null);
  const [stockNews, setStockNews] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(mockAIAnalysis);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStockData = async () => {
      setLoading(true);
      try {
        // 从股票列表中查找
        const stockInfo = stockList.find((s) => s.symbol === symbol);
        if (stockInfo) {
          // 获取实时报价
          const quote = await getStockQuote(stockInfo.symbol);
          // 获取AI分析
          const aiAnalysis = await analyzeStockWithAI({
            ...stockInfo,
            ...quote
          });
          // 添加货币信息到分析结果
          aiAnalysis.currency = quote.currency;
          setAnalysis(aiAnalysis);
          setStock({
            ...stockInfo,
            ...quote,
            aiScore: aiAnalysis.overallScore,
            verdict: aiAnalysis.verdictCode,
            verdictLabel: aiAnalysis.verdict,
          });
          // 获取新闻
          const news = await getStockNews(stockInfo.symbol);
          setStockNews(news);
        }
      } catch (error) {
        console.error('加载股票数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      loadStockData();
    }
  }, [symbol]);

  if (loading || !stock) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isUp = stock.change >= 0;

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: '概要', icon: <Activity className="w-4 h-4" /> },
    { key: 'technical', label: '技术分析', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'news', label: '消息面', icon: <Newspaper className="w-4 h-4" /> },
    { key: 'financial', label: '财务', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'risk', label: '风险', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* 返回按钮与头部信息 */}
      <div className="flex items-start justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWatched(!isWatched)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              isWatched
                ? 'bg-accent/20 border-accent text-accent'
                : 'border-border hover:bg-secondary'
            }`}
          >
            <Star className={`w-4 h-4 ${isWatched ? 'fill-current' : ''}`} />
            {isWatched ? '已加入自选' : '加入自选'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
            <Share2 className="w-4 h-4" />
            分享
          </button>
        </div>
      </div>

      {/* 股票基本信息 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{stock.sector.slice(0, 2)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold stock-code">{stock.symbol}</h1>
              <p className="text-lg text-muted-foreground">{stock.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-bullish/20 text-bullish rounded text-sm font-medium">
                {analysis.verdict}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">AI置信度 {((analysis.confidence || 0.85) * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold">{stock.currency === 'USD' ? '$' : '¥'}{stock.price.toFixed(2)}</div>
            <div className={`flex items-center gap-1 ${isUp ? 'text-bullish' : 'text-destructive'}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isUp ? '+' : ''}{stock.change.toFixed(2)}</span>
              <span>({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">热度指数</div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              <span className="text-xl font-bold">{stock.heat}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">市值</div>
            <div className="text-xl font-bold">{(stock.marketCap / 100000000).toFixed(0)}亿</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">AI综合评分</div>
            <div className="text-2xl font-bold text-primary">{analysis.overallScore}</div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-border">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 标签页内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：图表/列表区域 */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* K线图 */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold mb-4">价格走势</h3>
                <KLineChart />
                <div className="mt-4">
                  <VolumeChart />
                </div>
              </div>

              {/* 关键指标 */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold mb-4">关键指标</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">市盈率 (PE)</div>
                    <div className="text-xl font-bold">{stock.pe}</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">净资产收益率</div>
                    <div className="text-xl font-bold">{stock.roe}%</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">成交量</div>
                    <div className="text-xl font-bold">{(stock.volume / 10000).toFixed(1)}万</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">所属行业</div>
                    <div className="text-xl font-bold">{stock.sector}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'technical' && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-4">技术分析</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>MACD</span>
                  </div>
                  <span className="px-3 py-1 bg-bullish/20 text-bullish rounded">金叉</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>均线多头排列</span>
                  </div>
                  <span className="px-3 py-1 bg-bullish/20 text-bullish rounded">是</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>RSI (14)</span>
                  </div>
                  <span className="px-3 py-1 bg-secondary rounded">68</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="bg-card rounded-xl border border-border p-5">
              <NewsFeed news={stockNews} />
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-4">财务数据</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">市盈率 (PE-TTM)</span>
                  <span className="font-medium">{stock.pe}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">市净率 (PB)</span>
                  <span className="font-medium">8.5</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">净资产收益率 (ROE)</span>
                  <span className="font-medium">{stock.roe}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">毛利率</span>
                  <span className="font-medium">91%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">净利率</span>
                  <span className="font-medium">52%</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">资产负债率</span>
                  <span className="font-medium">25%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-4">风险提示</h3>
              <div className="space-y-3">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">估值风险</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    当前PE估值35倍，处于历史高位区间，注意回调风险
                  </p>
                </div>
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">市场风险</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    白酒行业受宏观经济影响较大，消费复苏不及预期可能影响股价
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：AI分析面板 */}
        <div className="lg:col-span-1">
          <AIAnalysisPanel analysis={analysis} />
        </div>
      </div>
    </div>
  );
};
