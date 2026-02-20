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

// 模拟股票数据（当API不可用时使用）
const mockStocks = [
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

// DeepSeek AI 分析
async function analyzeStockWithAI(stockData) {
  const prompt = `你是一位专业的股票分析师。请根据以下股票数据进行分析：

股票信息：
- 代码：${stockData.symbol}
- 名称：${stockData.name}
- 板块：${stockData.sector}
- 当前价格：¥${stockData.price}
- 涨跌幅：${stockData.change >= 0 ? '+' : ''}${stockData.changePercent}%
- 成交量：${(stockData.volume / 10000).toFixed(0)}万
- 市值：${(stockData.marketCap / 100000000).toFixed(0)}亿
- 市盈率：${stockData.pe}
- ROE：${stockData.roe}%

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
  "bullishFactors": ["利好因素1", "利好因素2", "利好因素3"],
  "bearishFactors": ["风险因素1", "风险因素2", "风险因素3"],
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
          {
            role: 'system',
            content: '你是一位专业的股票分析师，擅长技术分析、基本面分析和量化分析。'
          },
          {
            role: 'user',
            content: prompt
          }
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

    // 尝试解析JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('JSON解析失败，使用备用解析');
    }

    return { raw: content, error: '需要手动解析' };
  } catch (error) {
    console.error('DeepSeek API错误:', error.response?.data || error.message);
    throw error;
  }
}

// 股票搜索
app.get('/api/stocks/search', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json(mockStocks);
  }

  const results = mockStocks.filter(s =>
    s.symbol.includes(q) ||
    s.name.includes(q) ||
    s.sector.includes(q)
  );

  res.json(results);
});

// 获取股票实时数据（模拟）
app.get('/api/stocks/:symbol/quote', async (req, res) => {
  const { symbol } = req.params;

  // 模拟实时价格数据
  const basePrice = {
    '600519': 1850,
    '000858': 168.5,
    '600036': 38.92,
    '601318': 48.30,
    '600900': 23.15,
    '300750': 178.60,
    '002594': 256.80,
    '000001': 11.25,
    '601888': 68.50,
    '600276': 52.30,
  }[symbol] || 100;

  const randomChange = (Math.random() - 0.5) * 10;
  const price = basePrice * (1 + randomChange / 100);
  const change = price - basePrice;
  const changePercent = (change / basePrice) * 100;

  res.json({
    symbol,
    price: price.toFixed(2),
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    volume: Math.floor(Math.random() * 50000000) + 1000000,
    marketCap: Math.floor(Math.random() * 500000000000) + 10000000000,
    pe: Math.floor(Math.random() * 50) + 5,
    roe: Math.floor(Math.random() * 30) + 5,
    aiScore: Math.floor(Math.random() * 40) + 60,
    heat: (Math.random() * 30 + 70).toFixed(1),
  });
});

// AI分析接口
app.post('/api/analyze', async (req, res) => {
  const { symbol, name, sector, price, change, changePercent, volume, marketCap, pe, roe } = req.body;

  try {
    const result = await analyzeStockWithAI({
      symbol,
      name,
      sector,
      price: parseFloat(price),
      change: parseFloat(change),
      changePercent: parseFloat(changePercent),
      volume: parseInt(volume),
      marketCap: parseInt(marketCap),
      pe: parseInt(pe),
      roe: parseInt(roe),
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    // 如果API调用失败，返回模拟分析
    const mockAnalysis = generateMockAnalysis(symbol, name, sector);
    res.json({
      success: true,
      data: mockAnalysis,
      note: '使用模拟分析（API不可用）'
    });
  }
});

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
  };

  const s = scores[sector] || { overall: 70, technical: 68, fundamental: 72, sentiment: 70, capital: 70 };

  const bullishFactors = [
    '技术面呈现MACD金叉信号，短期上涨动能充足',
    '净资产收益率ROE表现优异，盈利能力较强',
    '近期获多家机构上调评级',
    '主力资金持续净流入，市场关注度高',
    '行业景气度高，政策支持力度大',
  ];

  const bearishFactors = [
    '当前估值处于历史高位区间',
    '股价短期有回调风险',
    '行业竞争加剧',
    '宏观经济不确定性',
  ];

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
    confidence: 0.85 + Math.random() * 0.1,
    verdict: verdict.label,
    verdictCode: verdict.code,
    dimensions: {
      technical: {
        score: s.technical,
        signal: s.technical >= 80 ? 'MACD金叉，均线多头排列' : '均线震荡整理',
      },
      fundamental: {
        score: s.fundamental,
        signal: s.fundamental >= 80 ? '估值合理，盈利能力强' : '估值偏高',
      },
      sentiment: {
        score: s.sentiment,
        signal: s.sentiment >= 80 ? '市场关注度高，利好频传' : '市场关注度一般',
      },
      capital: {
        score: s.capital,
        signal: s.capital >= 80 ? '主力资金净流入' : '资金呈观望态势',
      },
    },
    bullishFactors: bullishFactors.slice(0, 3),
    bearishFactors: bearishFactors.slice(0, 2),
    trendPrediction: s.overall >= 80 ? '短期震荡上行' : '短期震荡整理',
    recommendation: s.overall >= 80 ? '建议逢低布局，中长期持有' : '建议观望为主',
    targetPrice: {
      low: Math.floor(Math.random() * 20 + 80),
      medium: Math.floor(Math.random() * 30 + 100),
      high: Math.floor(Math.random() * 40 + 120),
    },
    riskLevel: s.overall >= 80 ? '中等' : '偏高',
  };
}

// 批量分析股票
app.post('/api/analyze/batch', async (req, res) => {
  const { stocks } = req.body;

  const results = stocks.map(stock => {
    const analysis = generateMockAnalysis(stock.symbol, stock.name, stock.sector);
    return {
      ...stock,
      aiAnalysis: analysis,
    };
  });

  // 按AI评分排序
  results.sort((a, b) => b.aiAnalysis.overallScore - a.aiAnalysis.overallScore);

  res.json({
    success: true,
    data: results,
  });
});

// 财经新闻接口
app.get('/api/news', async (req, res) => {
  const { symbol } = req.query;

  // 模拟新闻数据
  const news = [
    {
      id: '1',
      title: `${symbol || '市场'}出现重大利好信号，机构纷纷加仓`,
      source: '财经网',
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      sentiment: 0.8,
      symbol: symbol,
    },
    {
      id: '2',
      title: 'GDP数据超预期，经济复苏势头强劲',
      source: '新浪财经',
      time: new Date(Date.now() - 3600000).toISOString().slice(0, 16).replace('T', ' '),
      sentiment: 0.7,
    },
    {
      id: '3',
      title: '央行释放流动性，市场资金面宽裕',
      source: '东方财富',
      time: new Date(Date.now() - 7200000).toISOString().slice(0, 16).replace('T', ' '),
      sentiment: 0.6,
    },
    {
      id: '4',
      title: '外资持续流入A股市场',
      source: '证券时报',
      time: new Date(Date.now() - 10800000).toISOString().slice(0, 16).replace('T', ' '),
      sentiment: 0.75,
    },
    {
      id: '5',
      title: '上市公司业绩预增，利润大幅增长',
      source: '第一财经',
      time: new Date(Date.now() - 14400000).toISOString().slice(0, 16).replace('T', ' '),
      sentiment: 0.65,
    },
  ];

  res.json(news);
});

// 获取K线数据
app.get('/api/stocks/:symbol/kline', async (req, res) => {
  const { symbol } = req.params;
  const { period = '6' } = req.query;

  // 模拟K线数据
  const days = parseInt(period);
  const klineData = [];

  let basePrice = 100;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.48) * 5;
    const open = basePrice;
    const close = basePrice * (1 + change / 100);
    const high = Math.max(open, close) * (1 + Math.random() * 2 / 100);
    const low = Math.min(open, close) * (1 - Math.random() * 2 / 100);

    klineData.push({
      date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      open: open.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      close: close.toFixed(2),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });

    basePrice = close;
  }

  res.json(klineData);
});

// 智能选股筛选
app.post('/api/screener', async (req, res) => {
  const {
    minMarketCap = 10000000000,
    maxPE = 50,
    minROE = 10,
    sector
  } = req.body;

  // 获取所有股票的实时数据
  const results = [];

  for (const stock of mockStocks) {
    if (sector && stock.sector !== sector) continue;

    try {
      const quoteRes = await axios.get(`http://localhost:${PORT}/api/stocks/${stock.symbol}/quote`);
      const quote = quoteRes.data;

      if (quote.marketCap < minMarketCap) continue;
      if (quote.pe > maxPE && quote.pe > 0) continue;
      if (quote.roe < minROE) continue;

      const analysis = generateMockAnalysis(stock.symbol, stock.name, stock.sector);

      results.push({
        ...stock,
        ...quote,
        aiScore: analysis.overallScore,
        verdict: analysis.verdictCode,
        verdictLabel: analysis.verdict,
        aiAnalysis: analysis,
      });
    } catch (e) {
      console.error(`获取 ${stock.symbol} 数据失败:`, e.message);
    }
  }

  // 按AI评分排序
  results.sort((a, b) => b.aiScore - a.aiScore);

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    api: 'AlphaSeeker AI Backend'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 AlphaSeeker AI Backend Server              ║
║                                                   ║
║   服务器运行: http://localhost:${PORT}             ║
║                                                   ║
║   可用接口:                                       ║
║   • GET  /api/stocks/search?q=关键词             ║
║   • GET  /api/stocks/:symbol/quote              ║
║   • POST /api/analyze                            ║
║   • POST /api/analyze/batch                      ║
║   • POST /api/screener                           ║
║   • GET  /api/news                               ║
║   • GET  /api/stocks/:symbol/kline              ║
║   • GET  /api/health                             ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});
