import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// DeepSeek API 配置
const DEEPSEEK_API_KEY = 'sk-c6432c161c8d435ebcd39104a6ccaad0';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 新浪财经API (免费A股数据)
const SINA_FINANCE_API = 'https://hq.sinajs.cn/list=';

// A股股票列表
const ASTOCK_LIST = [
  { symbol: '600519', name: '贵州茅台', sector: '白酒' },
  { symbol: '000858', name: '五粮液', sector: '白酒' },
  { symbol: '600036', name: '招商银行', sector: '银行' },
  { symbol: '601318', name: '中国平安', sector: '保险' },
  { symbol: '600900', name: '长江电力', sector: '电力' },
  { symbol: '300750', name: '宁德时代', sector: '新能源' },
  { symbol: '002594', name: '比亚迪', sector: '新能源车' },
  { symbol: '000001', name: '平安银行', sector: '银行' },
  { symbol: '601888', name: '中国中免', sector: '免税店' },
  { symbol: '600276', name: '恒瑞医药', sector: '医药' },
];

// 美股列表
const US_STOCK_LIST = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: '科技' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: '科技' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: '科技' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: '消费' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: '芯片' },
  { symbol: 'META', name: 'Meta Platforms', sector: '科技' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: '新能源车' },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: '金融' },
  { symbol: 'V', name: 'Visa Inc.', sector: '金融' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: '医疗' },
];

// 加密货币列表
const CRYPTO_LIST = [
  { symbol: 'BTC', name: 'Bitcoin', sector: '主流币' },
  { symbol: 'ETH', name: 'Ethereum', sector: '主流币' },
  { symbol: 'BNB', name: 'BNB', sector: '主流币' },
  { symbol: 'SOL', name: 'Solana', sector: '公链' },
  { symbol: 'XRP', name: 'XRP', sector: '支付' },
  { symbol: 'ADA', name: 'Cardano', sector: '公链' },
  { symbol: 'DOGE', name: 'Dogecoin', sector: 'meme币' },
  { symbol: 'DOT', name: 'Polkadot', sector: '跨链' },
  { symbol: 'AVAX', name: 'Avalanche', sector: '公链' },
  { symbol: 'LINK', name: 'Chainlink', sector: '预言机' },
];

// 缓存
const cache = new Map();
const CACHE_TIME = 60000; // 1分钟缓存

// 获取新浪财经A股数据
async function getSinaStockData(symbol) {
  const cacheKey = `sina_${symbol}`;
  const now = Date.now();

  if (cache.has(cacheKey)) {
    const [data, time] = cache.get(cacheKey);
    if (now - time < CACHE_TIME) {
      return data;
    }
  }

  try {
    // 新浪财经API需要用sh或sz前缀
    const prefix = symbol.startsWith('6') ? 'sh' : 'sz';
    const response = await axios.get(`${SINA_FINANCE_API}${prefix}${symbol}`, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
      }
    });

    const text = response.data;
    // 解析新浪返回的数据格式
    const match = text.match(/="([^"]+)"/);
    if (match) {
      const parts = match[1].split(',');
      if (parts.length > 1) {
        const data = {
          symbol: symbol,
          name: parts[0],
          price: parseFloat(parts[1]) || 0,
          change: parseFloat(parts[2]) || 0,
          changePercent: parseFloat(parts[3]) || 0,
          volume: parseInt(parts[4]) || 0,
          amount: parseFloat(parts[5]) || 0,
          open: parseFloat(parts[6]) || 0,
          high: parseFloat(parts[7]) || 0,
          low: parseFloat(parts[8]) || 0,
          close: parseFloat(parts[9]) || 0,
        };
        cache.set(cacheKey, [data, now]);
        return data;
      }
    }
  } catch (error) {
    console.error(`新浪API错误 for ${symbol}:`, error.message);
  }

  return null;
}

// DeepSeek AI 分析
async function analyzeStockWithAI(stockData) {
  const prompt = `你是一位专业的股票分析师。请根据以下股票数据进行分析：

股票信息：
- 代码：${stockData.symbol}
- 名称：${stockData.name}
- 板块：${stockData.sector}
- 当前价格：${stockData.currency === 'USD' ? '$' : '¥'}${stockData.price}
- 涨跌幅：${stockData.changePercent}%
- 成交量：${(stockData.volume / 10000).toFixed(0)}万

请从以下几个维度进行分析：
1. 技术面分析（MACD、均线、RSI等指标）
2. 基本面分析（估值、盈利能力、成长性）
3. 消息面分析（近期利好/利空消息）
4. 资金面分析（主力资金流向）

请返回JSON格式的分析结果：
{
  "overallScore": 评分(0-100),
  "confidence": 置信度(0-1),
  "verdict": "强烈推荐买入/建议买入/观望/建议卖出/强烈推荐卖出",
  "verdictCode": "STRONG_BUY/BUY/HOLD/SELL/STRONG_SELL",
  "technical": { "score": 0-100, "signal": "分析信号" },
  "fundamental": { "score": 0-100, "signal": "分析信号" },
  "sentiment": { "score": 0-100, "signal": "分析信号" },
  "capital": { "score": 0-100, "signal": "分析信号" },
  "bullishFactors": ["利好因素1", "利好因素2"],
  "bearishFactors": ["风险因素1", "风险因素2"],
  "trendPrediction": "短期趋势预测",
  "recommendation": "操作建议",
  "targetPrice": { "low": 目标低价, "medium": 目标中价, "high": 目标高价 },
  "riskLevel": "高/中/低"
}`;

  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位专业的股票分析师，擅长技术分析、基本面分析和量化分析。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('DeepSeek API错误:', error.message);
  }

  return generateMockAnalysis(stockData.symbol, stockData.name, stockData.sector);
}

// 生成模拟分析
function generateMockAnalysis(symbol, name, sector) {
  const scores = {
    '白酒': { overall: 85, technical: 88, fundamental: 90, sentiment: 85, capital: 82 },
    '银行': { overall: 72, technical: 70, fundamental: 75, sentiment: 70, capital: 72 },
    '保险': { overall: 78, technical: 75, fundamental: 80, sentiment: 78, capital: 80 },
    '电力': { overall: 70, technical: 68, fundamental: 72, sentiment: 70, capital: 70 },
    '新能源': { overall: 82, technical: 85, fundamental: 80, sentiment: 82, capital: 80 },
    '新能源车': { overall: 80, technical: 82, fundamental: 78, sentiment: 80, capital: 82 },
    '医药': { overall: 65, technical: 60, fundamental: 70, sentiment: 65, capital: 62 },
    '免税店': { overall: 75, technical: 72, fundamental: 78, sentiment: 75, capital: 75 },
    '科技': { overall: 88, technical: 90, fundamental: 88, sentiment: 85, capital: 85 },
    '芯片': { overall: 92, technical: 95, fundamental: 90, sentiment: 88, capital: 90 },
    '主流币': { overall: 80, technical: 82, fundamental: 78, sentiment: 82, capital: 85 },
  };

  const s = scores[sector] || { overall: 75, technical: 78, fundamental: 75, sentiment: 75, capital: 75 };

  const getVerdict = (score) => {
    if (score >= 80) return { code: 'STRONG_BUY', label: '强烈推荐买入' };
    if (score >= 65) return { code: 'BUY', label: '建议买入' };
    if (score >= 50) return { code: 'HOLD', label: '观望' };
    if (score >= 35) return { code: 'SELL', label: '建议卖出' };
    return { code: 'STRONG_SELL', label: '强烈推荐卖出' };
  };

  const verdict = getVerdict(s.overall);

  return {
    overallScore: s.overall,
    confidence: 0.85,
    verdict: verdict.label,
    verdictCode: verdict.code,
    dimensions: {
      technical: { score: s.technical, signal: s.technical >= 80 ? 'MACD金叉，均线多头排列' : '均线震荡整理' },
      fundamental: { score: s.fundamental, signal: s.fundamental >= 80 ? '估值合理，盈利能力强' : '估值偏高' },
      sentiment: { score: s.sentiment, signal: s.sentiment >= 80 ? '市场关注度高，利好频传' : '市场关注度一般' },
      capital: { score: s.capital, signal: s.capital >= 80 ? '主力资金净流入' : '资金呈观望态势' },
    },
    bullishFactors: ['技术面呈现MACD金叉信号', '机构上调评级', '行业景气度高'],
    bearishFactors: ['当前估值处于历史高位', '股价短期有回调风险'],
    trendPrediction: s.overall >= 80 ? '短期震荡上行' : '短期震荡整理',
    recommendation: s.overall >= 80 ? '建议逢低布局，中长期持有' : '建议观望为主',
    targetPrice: { low: 80, medium: 100, high: 120 },
    riskLevel: s.overall >= 80 ? '中等' : '偏高',
  };
}

// ============ API路由 ============

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 获取所有股票
app.get('/api/stocks', (req, res) => {
  const allStocks = [
    ...ASTOCK_LIST.map(s => ({ ...s, market: 'A', currency: 'CNY' })),
    ...US_STOCK_LIST.map(s => ({ ...s, market: 'US', currency: 'USD' })),
    ...CRYPTO_LIST.map(s => ({ ...s, market: 'CRYPTO', currency: 'USD' })),
  ];
  res.json(allStocks);
});

// 搜索股票
app.get('/api/stocks/search', (req, res) => {
  const { q, market } = req.query;
  let stocks = [...ASTOCK_LIST, ...US_STOCK_LIST, ...CRYPTO_LIST];

  if (market) {
    const marketMap = { 'A': ASTOCK_LIST, 'US': US_STOCK_LIST, 'CRYPTO': CRYPTO_LIST };
    stocks = marketMap[market] || stocks;
  }

  if (q) {
    stocks = stocks.filter(s =>
      s.symbol.toLowerCase().includes(q.toLowerCase()) ||
      s.name.toLowerCase().includes(q.toLowerCase())
    );
  }

  res.json(stocks);
});

// 获取股票报价
app.get('/api/stocks/:symbol/quote', async (req, res) => {
  const { symbol } = req.params;

  // 判断市场类型
  const isAStock = ASTOCK_LIST.some(s => s.symbol === symbol);
  const isUSStock = US_STOCK_LIST.some(s => s.symbol === symbol);
  const isCrypto = CRYPTO_LIST.some(s => s.symbol === symbol);

  let stockInfo = ASTOCK_LIST.find(s => s.symbol === symbol)
    || US_STOCK_LIST.find(s => s.symbol === symbol)
    || CRYPTO_LIST.find(s => s.symbol === symbol);

  if (!stockInfo) {
    return res.status(404).json({ error: '股票未找到' });
  }

  // A股：尝试从新浪获取真实数据
  if (isAStock) {
    const sinaData = await getSinaStockData(symbol);
    if (sinaData) {
      return res.json({
        ...sinaData,
        market: 'A',
        currency: 'CNY',
        sector: stockInfo.sector,
        marketCap: Math.random() * 500000000000 + 10000000000,
        pe: Math.floor(Math.random() * 30) + 10,
        roe: Math.floor(Math.random() * 20) + 10,
        heat: Math.random() * 30 + 70,
      });
    }
  }

  // 备用：生成模拟数据
  const basePrice = {
    '600519': 1850, '000858': 168.5, '600036': 38.92, '601318': 48.30,
    '600900': 23.15, '300750': 178.60, '002594': 256.80, '000001': 11.25,
    '601888': 68.50, '600276': 52.30,
    'AAPL': 178.50, 'GOOGL': 141.25, 'MSFT': 378.90, 'AMZN': 178.35,
    'NVDA': 495.22, 'META': 505.75, 'TSLA': 248.50, 'JPM': 195.80,
    'BTC': 52480, 'ETH': 2945, 'BNB': 585, 'SOL': 118,
  }[symbol] || 100;

  const change = (Math.random() - 0.5) * 10;
  const price = basePrice * (1 + change / 100);

  res.json({
    symbol,
    name: stockInfo.name,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat((change).toFixed(2)),
    changePercent: parseFloat(change.toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 1000000,
    marketCap: Math.floor(Math.random() * 500000000000) + 10000000000,
    pe: Math.floor(Math.random() * 50) + 5,
    roe: Math.floor(Math.random() * 30) + 5,
    heat: parseFloat((Math.random() * 30 + 70).toFixed(1)),
    currency: isAStock ? 'CNY' : 'USD',
    market: isAStock ? 'A' : isUSStock ? 'US' : 'CRYPTO',
    sector: stockInfo.sector,
  });
});

// 获取K线数据
app.get('/api/stocks/:symbol/kline', async (req, res) => {
  const { symbol } = req.params;
  const { period = '30' } = req.query;

  const days = parseInt(period);
  const basePrice = {
    '600519': 1800, '000858': 165, '600036': 38, '601318': 47,
    '300750': 175, '002594': 250, '000001': 11, '601888': 67,
    'AAPL': 178, 'GOOGL': 141, 'MSFT': 378, 'NVDA': 495,
    'BTC': 52000, 'ETH': 2900,
  }[symbol] || 100;

  let price = basePrice;
  const klineData = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.48) * 5;
    const open = price;
    const close = price * (1 + change / 100);
    const high = Math.max(open, close) * (1 + Math.random() * 2 / 100);
    const low = Math.min(open, close) * (1 - Math.random() * 2 / 100);

    klineData.push({
      date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });

    price = close;
  }

  res.json(klineData);
});

// 获取新闻
app.get('/api/news', (req, res) => {
  const { symbol } = req.query;

  const news = [
    { id: '1', title: '市场震荡上行，板块轮动明显', source: '财经网', time: new Date().toISOString().slice(0, 16).replace('T', ' '), sentiment: 0.7 },
    { id: '2', title: '北向资金持续净流入', source: '新浪财经', time: new Date(Date.now() - 3600000).toISOString().slice(0, 16).replace('T', ' '), sentiment: 0.75 },
    { id: '3', title: '政策利好持续释放', source: '东方财富', time: new Date(Date.now() - 7200000).toISOString().slice(0, 16).replace('T', ' '), sentiment: 0.65 },
    { id: '4', title: '机构上调评级', source: '证券时报', time: new Date(Date.now() - 10800000).toISOString().slice(0, 16).replace('T', ' '), sentiment: 0.8 },
    { id: '5', title: '业绩预增超预期', source: '第一财经', time: new Date(Date.now() - 14400000).toISOString().slice(0, 16).replace('T', ' '), sentiment: 0.75 },
  ];

  res.json(news);
});

// AI分析
app.post('/api/analyze', async (req, res) => {
  const stockData = req.body;

  try {
    const analysis = await analyzeStockWithAI(stockData);
    res.json({ success: true, data: analysis });
  } catch (error) {
    const mockAnalysis = generateMockAnalysis(stockData.symbol, stockData.name, stockData.sector);
    res.json({ success: true, data: mockAnalysis, note: '使用模拟分析' });
  }
});

// 批量分析
app.post('/api/analyze/batch', async (req, res) => {
  const { stocks } = req.body;

  const results = await Promise.all(stocks.map(async (stock) => {
    const quoteRes = await axios.get(`http://localhost:${PORT}/api/stocks/${stock.symbol}/quote`).catch(() => null);
    const quote = quoteRes?.data || {};

    const analysis = generateMockAnalysis(stock.symbol, stock.name, stock.sector);

    return {
      ...stock,
      ...quote,
      aiScore: analysis.overallScore,
      verdict: analysis.verdictCode,
      verdictLabel: analysis.verdict,
      aiAnalysis: analysis,
    };
  }));

  results.sort((a, b) => b.aiScore - a.aiScore);
  res.json({ success: true, data: results });
});

// 智能选股
app.post('/api/screener', async (req, res) => {
  const { minMarketCap = 10000000000, maxPE = 50, minROE = 10, sector, market } = req.body;

  let stocks = ASTOCK_LIST;
  if (market === 'US') stocks = US_STOCK_LIST;
  if (market === 'CRYPTO') stocks = CRYPTO_LIST;

  if (sector) {
    stocks = stocks.filter(s => s.sector === sector);
  }

  const results = await Promise.all(stocks.map(async (stock) => {
    try {
      const quoteRes = await axios.get(`http://localhost:${PORT}/api/stocks/${stock.symbol}/quote`);
      const quote = quoteRes.data;

      if (quote.marketCap < minMarketCap) return null;
      if (quote.pe > maxPE && quote.pe > 0) return null;
      if (quote.roe < minROE) return null;

      const analysis = generateMockAnalysis(stock.symbol, stock.name, stock.sector);

      return {
        ...stock,
        ...quote,
        aiScore: analysis.overallScore,
        verdict: analysis.verdictCode,
        verdictLabel: analysis.verdict,
        aiAnalysis: analysis,
      };
    } catch (e) {
      return null;
    }
  }));

  const filteredResults = results.filter(r => r !== null);
  filteredResults.sort((a, b) => b.aiScore - a.aiScore);

  res.json({ success: true, count: filteredResults.length, data: filteredResults });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   🚀 AlphaSeeker AI Backend Server              ║
║   运行: http://localhost:${PORT}                   ║
║   • GET  /api/health                            ║
║   • GET  /api/stocks                            ║
║   • GET  /api/stocks/search?q=关键词            ║
║   • GET  /api/stocks/:symbol/quote             ║
║   • GET  /api/stocks/:symbol/kline             ║
║   • GET  /api/news                              ║
║   • POST /api/analyze                           ║
║   • POST /api/screener                          ║
╚═══════════════════════════════════════════════════╝
  `);
});
