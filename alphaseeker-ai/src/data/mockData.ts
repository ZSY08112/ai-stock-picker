// 模拟股票数据
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  roe: number;
  aiScore: number;
  verdict: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  verdictLabel: string;
  sector: string;
  heat: number;
  currency?: string;
  market?: string;
}

export interface StockNews {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: number;
  symbol?: string;
}

export interface AIAnalysis {
  overallScore: number;
  confidence: number;
  verdict: string;
  verdictCode: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  dimensions: {
    technical: {
      score: number;
      signal: string;
      indicators: {
        rsi: number;
        macd: string;
        ma5: string;
      };
    };
    fundamental: {
      score: number;
      signal: string;
      metrics: {
        pe: number;
        roe: number;
        revenueGrowth: number;
      };
    };
    sentiment: {
      score: number;
      signal: string;
      newsCount: number;
      positiveRatio: number;
    };
    capital: {
      score: number;
      signal: string;
      flow: number;
    };
  };
  bullishFactors: string[];
  bearishFactors: string[];
  trendPrediction: string;
  recommendation: string;
  targetPrice: {
    low: number;
    medium: number;
    high: number;
  };
  riskLevel: string;
}

// 模拟股票列表
export const mockStocks: Stock[] = [
  {
    symbol: '600519',
    name: '贵州茅台',
    price: 1850.00,
    change: 42.35,
    changePercent: 2.35,
    volume: 3250000,
    marketCap: 2324000000000,
    pe: 35,
    roe: 32,
    aiScore: 92,
    verdict: 'STRONG_BUY',
    verdictLabel: '强烈推荐',
    sector: '白酒',
    heat: 98.5,
  },
  {
    symbol: '000858',
    name: '五粮液',
    price: 168.50,
    change: 3.20,
    changePercent: 1.94,
    volume: 2850000,
    marketCap: 654000000000,
    pe: 28,
    roe: 28,
    aiScore: 87,
    verdict: 'STRONG_BUY',
    verdictLabel: '强烈推荐',
    sector: '白酒',
    heat: 95.2,
  },
  {
    symbol: '600036',
    name: '招商银行',
    price: 38.92,
    change: -0.45,
    changePercent: -1.14,
    volume: 45800000,
    marketCap: 981000000000,
    pe: 7,
    roe: 15,
    aiScore: 78,
    verdict: 'BUY',
    verdictLabel: '建议买入',
    sector: '银行',
    heat: 82.3,
  },
  {
    symbol: '601318',
    name: '中国平安',
    price: 48.30,
    change: 1.25,
    changePercent: 2.66,
    volume: 38500000,
    marketCap: 883000000000,
    pe: 10,
    roe: 14,
    aiScore: 82,
    verdict: 'BUY',
    verdictLabel: '建议买入',
    sector: '保险',
    heat: 88.7,
  },
  {
    symbol: '600900',
    name: '长江电力',
    price: 23.15,
    change: 0.08,
    changePercent: 0.35,
    volume: 12500000,
    marketCap: 528000000000,
    pe: 18,
    roe: 16,
    aiScore: 75,
    verdict: 'HOLD',
    verdictLabel: '观望',
    sector: '电力',
    heat: 72.1,
  },
  {
    symbol: '300750',
    name: '宁德时代',
    price: 178.60,
    change: -5.40,
    changePercent: -2.94,
    volume: 18500000,
    marketCap: 783000000000,
    pe: 32,
    roe: 24,
    aiScore: 71,
    verdict: 'HOLD',
    verdictLabel: '观望',
    sector: '新能源',
    heat: 90.5,
  },
  {
    symbol: '002594',
    name: '比亚迪',
    price: 256.80,
    change: 8.90,
    changePercent: 3.59,
    volume: 9850000,
    marketCap: 747000000000,
    pe: 45,
    roe: 18,
    aiScore: 85,
    verdict: 'BUY',
    verdictLabel: '建议买入',
    sector: '新能源车',
    heat: 94.8,
  },
  {
    symbol: '000001',
    name: '平安银行',
    price: 11.25,
    change: -0.18,
    changePercent: -1.57,
    volume: 52000000,
    marketCap: 218000000000,
    pe: 5,
    roe: 12,
    aiScore: 65,
    verdict: 'HOLD',
    verdictLabel: '观望',
    sector: '银行',
    heat: 68.4,
  },
  {
    symbol: '601888',
    name: '中国中免',
    price: 68.50,
    change: 2.15,
    changePercent: 3.24,
    volume: 15800000,
    marketCap: 134000000000,
    pe: 42,
    roe: 22,
    aiScore: 79,
    verdict: 'BUY',
    verdictLabel: '建议买入',
    sector: '免税店',
    heat: 85.6,
  },
  {
    symbol: '600276',
    name: '恒瑞医药',
    price: 52.30,
    change: -1.20,
    changePercent: -2.24,
    volume: 22500000,
    marketCap: 334000000000,
    pe: 65,
    roe: 10,
    aiScore: 58,
    verdict: 'SELL',
    verdictLabel: '建议卖出',
    sector: '医药',
    heat: 75.2,
  },
];

// 模拟财经新闻
export const mockNews: StockNews[] = [
  {
    id: '1',
    title: '茅台酒价格上调5%，终端需求持续旺盛',
    source: '新浪财经',
    time: '2026-02-20 09:30',
    sentiment: 0.85,
    symbol: '600519',
  },
  {
    id: '2',
    title: '多家机构上调白酒板块评级至买入',
    source: '东方财富',
    time: '2026-02-20 08:45',
    sentiment: 0.78,
  },
  {
    id: '3',
    title: '比亚迪发布新一代刀片电池，续航突破1000公里',
    source: '证券时报',
    time: '2026-02-20 10:15',
    sentiment: 0.92,
    symbol: '002594',
  },
  {
    id: '4',
    title: '宁德时代遭海外机构减持，股价承压',
    source: '华尔街见闻',
    time: '2026-02-19 16:30',
    sentiment: -0.65,
    symbol: '300750',
  },
  {
    id: '5',
    title: '招商银行年报显示净利润增长12%',
    source: '第一财经',
    time: '2026-02-19 15:20',
    sentiment: 0.55,
    symbol: '600036',
  },
  {
    id: '6',
    title: '恒瑞医药集采压力持续，业绩增速放缓',
    source: '财新网',
    time: '2026-02-19 14:10',
    sentiment: -0.72,
    symbol: '600276',
  },
  {
    id: '7',
    title: '新能源车销量创新高，产业链迎来发展机遇',
    source: '中国证券报',
    time: '2026-02-19 11:30',
    sentiment: 0.68,
  },
  {
    id: '8',
    title: '中国平安投资收益超预期，估值有望修复',
    source: 'Bloomberg',
    time: '2026-02-19 10:00',
    sentiment: 0.75,
    symbol: '601318',
  },
];

// 模拟AI分析结果
export const mockAIAnalysis: AIAnalysis = {
  overallScore: 92,
  confidence: 0.92,
  verdict: '强烈推荐买入',
  verdictCode: 'STRONG_BUY',
  dimensions: {
    technical: {
      score: 88,
      signal: 'MACD金叉，短期多头排列，均线向上发散',
      indicators: {
        rsi: 68,
        macd: 'golden_cross',
        ma5: 'above_ma10',
      },
    },
    fundamental: {
      score: 90,
      signal: 'ROE 32%，盈利能力行业领先，护城河深厚',
      metrics: {
        pe: 35,
        roe: 32,
        revenueGrowth: 15,
      },
    },
    sentiment: {
      score: 95,
      signal: '近期利好频传，市场关注度极高，机构一致看多',
      newsCount: 28,
      positiveRatio: 0.92,
    },
    capital: {
      score: 88,
      signal: '主力资金连续8日净流入，累计流入23亿元',
      flow: 2300000000,
    },
  },
  bullishFactors: [
    '技术面呈现MACD金叉信号，短期上涨动能充足',
    '净资产收益率ROE达32%，盈利能力行业顶尖',
    '近期获多家权威机构上调评级至买入或增持',
    '主力资金连续8日净流入，市场做多意愿强烈',
    '品牌护城河深厚，定价权强，业绩确定性高',
  ],
  bearishFactors: [
    '当前PE估值35倍，处于历史估值区间高位',
    '股价已创历史新高，短期有回调风险',
    '白酒行业整体估值受宏观经济影响有承压风险',
    '消费复苏力度不及预期的风险',
  ],
  trendPrediction: '短期震荡上行，中长期趋势向好',
  recommendation: '建议逢低布局，中长期持有，目标价2200元',
  targetPrice: {
    low: 1800,
    medium: 2000,
    high: 2200,
  },
  riskLevel: '中等',
};

// K线模拟数据
export const mockKLineData = [
  { date: '02-13', open: 1780, high: 1820, low: 1775, close: 1810, volume: 2800000 },
  { date: '02-14', open: 1810, high: 1835, low: 1800, close: 1825, volume: 3200000 },
  { date: '02-17', open: 1825, high: 1840, low: 1815, close: 1832, volume: 2950000 },
  { date: '02-18', open: 1832, high: 1860, low: 1828, close: 1850, volume: 3500000 },
  { date: '02-19', open: 1850, high: 1875, low: 1842, close: 1865, volume: 3800000 },
  { date: '02-20', open: 1865, high: 1880, low: 1855, close: 1870, volume: 3400000 },
];

// 均线数据
export const mockMAData = [
  { date: '02-13', ma5: 1795, ma10: 1770, ma30: 1720 },
  { date: '02-14', open: 1805, ma5: 1802, ma10: 1778, ma30: 1728 },
  { date: '02-17', open: 1818, ma5: 1812, ma10: 1788, ma30: 1736 },
  { date: '02-18', open: 1835, ma5: 1825, ma10: 1800, ma30: 1745 },
  { date: '02-19', open: 1852, ma5: 1840, ma10: 1815, ma30: 1755 },
  { date: '02-20', open: 1868, ma5: 1855, ma10: 1830, ma30: 1765 },
];

// 选股筛选条件
export interface ScreenerFilters {
  minMarketCap: number;
  maxPE: number;
  minROE: number;
  minRevenueGrowth: number;
  macdSignal: 'golden' | 'death' | 'any';
  rsiRange: [number, number];
  minVolume: number;
  sector?: string | null;
}

export const defaultFilters: ScreenerFilters = {
  minMarketCap: 10000000000,
  maxPE: 50,
  minROE: 10,
  minRevenueGrowth: 10,
  macdSignal: 'any',
  rsiRange: [30, 70],
  minVolume: 10000000,
};

// 自选股
export const mockWatchlist: Stock[] = [
  mockStocks[0],
  mockStocks[3],
  mockStocks[6],
];

// 板块数据
export const sectorData = [
  { name: '白酒', change: 3.25, count: 18, aiScore: 89 },
  { name: '新能源车', change: 2.15, count: 42, aiScore: 82 },
  { name: '银行', change: 0.85, count: 42, aiScore: 72 },
  { name: '医药', change: -1.25, count: 35, aiScore: 58 },
  { name: '半导体', change: 1.95, count: 28, aiScore: 75 },
  { name: '电力', change: 0.45, count: 25, aiScore: 70 },
];

// 全局情绪指数
export const marketSentiment = {
  score: 72,
  label: '偏多',
  fearGreed: 'Greed',
  updatedAt: '2026-02-20 10:30:00',
};
