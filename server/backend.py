#!/usr/bin/env python3
"""
AlphaSeeker AI Backend - Python版本
使用AkShare获取真实A股数据
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import akshare as ak
import pandas as pd
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# A股股票列表
ASTOCK_LIST = [
    {"symbol": "600519", "name": "贵州茅台", "sector": "白酒"},
    {"symbol": "000858", "name": "五粮液", "sector": "白酒"},
    {"symbol": "600036", "name": "招商银行", "sector": "银行"},
    {"symbol": "601318", "name": "中国平安", "sector": "保险"},
    {"symbol": "600900", "name": "长江电力", "sector": "电力"},
    {"symbol": "300750", "name": "宁德时代", "sector": "新能源"},
    {"symbol": "002594", "name": "比亚迪", "sector": "新能源车"},
    {"symbol": "000001", "name": "平安银行", "sector": "银行"},
    {"symbol": "601888", "name": "中国中免", "sector": "免税店"},
    {"symbol": "600276", "name": "恒瑞医药", "sector": "医药"},
]

# 缓存机制
stock_cache = {}
cache_timeout = 60  # 60秒缓存

def get_stock_realtime_data(symbol):
    """获取个股实时数据"""
    cache_key = f"realtime_{symbol}"
    now = datetime.now()

    # 检查缓存
    if cache_key in stock_cache:
        cached_data, cached_time = stock_cache[cache_key]
        if (now - cached_time).seconds < cache_timeout:
            return cached_data

    try:
        # 使用AkShare获取实时数据
        df = ak.stock_zh_a_spot_em()

        # 查找对应股票
        stock_data = df[df['代码'] == symbol]

        if not stock_data.empty:
            row = stock_data.iloc[0]
            data = {
                "symbol": symbol,
                "name": row['名称'],
                "price": float(row['最新价']) if pd.notna(row['最新价']) else 0,
                "change": float(row['涨跌幅']) if pd.notna(row['涨跌幅']) else 0,
                "changePercent": float(row['涨跌幅']) if pd.notna(row['涨跌幅']) else 0,
                "volume": int(row['成交量']) if pd.notna(row['成交量']) else 0,
                "amount": float(row['成交额']) if pd.notna(row['成交额']) else 0,
                "amplitude": float(row['振幅']) if pd.notna(row['振幅']) else 0,
                "high": float(row['最高']) if pd.notna(row['最高']) else 0,
                "low": float(row['最低']) if pd.notna(row['最低']) else 0,
                "open": float(row['今开']) if pd.notna(row['今开']) else 0,
                "close": float(row['昨收']) if pd.notna(row['昨收']) else 0,
                "turnover": float(row['换手率']) if pd.notna(row['换手率']) else 0,
            }

            # 更新缓存
            stock_cache[cache_key] = (data, now)
            return data
    except Exception as e:
        print(f"获取 {symbol} 数据失败: {e}")

    return None

def get_stock_kline_data(symbol, period="daily"):
    """获取K线数据"""
    cache_key = f"kline_{symbol}_{period}"
    now = datetime.now()

    # 检查缓存
    if cache_key in stock_cache:
        cached_data, cached_time = stock_cache[cache_key]
        if (now - cached_time).seconds < cache_timeout * 5:
            return cached_data

    try:
        if period == "daily":
            # 日K线
            df = ak.stock_zh_a_hist(symbol=symbol, period="daily", adjust="qfq")
        else:
            # 其他周期
            df = ak.stock_zh_a_hist(symbol=symbol, period=period, adjust="qfq")

        # 取最近30天数据
        df = df.tail(30)

        kline_data = []
        for _, row in df.iterrows():
            date_str = str(row['日期'])[:10]
            kline_data.append({
                "date": date_str[5:] if len(date_str) > 5 else date_str,  # MM-DD格式
                "open": float(row['开盘']),
                "high": float(row['最高']),
                "low": float(row['最低']),
                "close": float(row['收盘']),
                "volume": int(row['成交量']),
            })

        # 更新缓存
        stock_cache[cache_key] = (kline_data, now)
        return kline_data
    except Exception as e:
        print(f"获取 {symbol} K线数据失败: {e}")

    return None

def get_stock_news(symbol=None):
    """获取财经新闻"""
    try:
        # 使用AkShare获取新闻
        df = ak.stock_news_em(symbol=symbol)

        if df is not None and not df.empty:
            news_data = []
            for _, row in df.head(10).iterrows():
                news_data.append({
                    "id": str(row.name),
                    "title": str(row['标题']),
                    "source": str(row['文章来源']),
                    "time": str(row['发布时间'])[:16] if pd.notna(row['发布时间']) else "",
                    "url": str(row['文章链接']) if '文章链接' in row else "",
                    "symbol": symbol,
                })
            return news_data
    except Exception as e:
        print(f"获取新闻失败: {e}")

    # 返回默认新闻
    default_news = [
        {"id": "1", "title": "A股市场今日震荡上行，板块轮动明显", "source": "财经网", "time": datetime.now().strftime("%Y-%m-%d %H:%M"), "symbol": symbol},
        {"id": "2", "title": "北向资金持续净流入，市场情绪回暖", "source": "新浪财经", "time": datetime.now().strftime("%Y-%m-%d %H:%M"), "symbol": symbol},
        {"id": "3", "title": "政策暖风频吹，行业发展迎新机遇", "source": "东方财富", "time": datetime.now().strftime("%Y-%m-%d %H:%M"), "symbol": symbol},
    ]
    return default_news

def get_market_index():
    """获取大盘指数"""
    try:
        # 上证指数
        df = ak.stock_zh_index_spot()
        sh_index = df[df['代码'] == '000001']

        if not sh_index.empty:
            row = sh_index.iloc[0]
            return {
                "sh": {
                    "name": "上证指数",
                    "price": float(row['最新价']) if pd.notna(row['最新价']) else 0,
                    "change": float(row['涨跌幅']) if pd.notna(row['涨跌幅']) else 0,
                }
            }
    except Exception as e:
        print(f"获取大盘指数失败: {e}")

    return {"sh": {"name": "上证指数", "price": 0, "change": 0}}

# ============ API路由 ============

@app.route('/api/health')
def health():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "time": datetime.now().isoformat(),
        "api": "AlphaSeeker AI Backend (Python + AkShare)"
    })

@app.route('/api/stocks')
def get_stocks():
    """获取股票列表"""
    return jsonify(ASTOCK_LIST)

@app.route('/api/stocks/search')
def search_stocks():
    """搜索股票"""
    q = request.args.get('q', '')
    if not q:
        return jsonify(ASTOCK_LIST)

    results = [s for s in ASTOCK_LIST if q in s['symbol'] or q in s['name']]
    return jsonify(results)

@app.route('/api/stocks/<symbol>/quote')
def get_quote(symbol):
    """获取股票实时报价"""
    # 优先尝试获取真实数据
    real_data = get_stock_realtime_data(symbol)

    if real_data:
        return jsonify(real_data)

    # 如果获取失败，返回模拟数据
    base_prices = {
        "600519": 1850, "000858": 168.5, "600036": 38.92, "601318": 48.30,
        "600900": 23.15, "300750": 178.60, "002594": 256.80, "000001": 11.25,
        "601888": 68.50, "600276": 52.30,
    }

    base_price = base_prices.get(symbol, 100)
    change = random.uniform(-5, 5)
    price = base_price * (1 + change / 100)

    return jsonify({
        "symbol": symbol,
        "name": next((s['name'] for s in ASTOCK_LIST if s['symbol'] == symbol), symbol),
        "price": round(price, 2),
        "change": round(change, 2),
        "changePercent": round(change, 2),
        "volume": random.randint(1000000, 50000000),
        "amount": random.randint(100000000, 10000000000),
        "marketCap": random.randint(10000000000, 500000000000),
    })

@app.route('/api/stocks/<symbol>/kline')
def get_kline(symbol):
    """获取K线数据"""
    period = request.args.get('period', 'daily')

    real_data = get_stock_kline_data(symbol, period)

    if real_data:
        return jsonify(real_data)

    # 返回模拟K线数据
    base_prices = {
        "600519": 1800, "000858": 165, "600036": 38, "601318": 47,
        "600900": 23, "300750": 175, "002594": 250, "000001": 11,
        "601888": 67, "600276": 51,
    }

    base_price = base_prices.get(symbol, 100)
    kline_data = []
    price = base_price

    for i in range(30, 0, -1):
        date = datetime.now()
        date = date.replace(day=max(1, date.day - i))

        change = random.uniform(-5, 5)
        open_price = price
        close_price = price * (1 + change / 100)
        high_price = max(open_price, close_price) * (1 + random.uniform(0, 2) / 100)
        low_price = min(open_price, close_price) * (1 - random.uniform(0, 2) / 100)

        kline_data.append({
            "date": date.strftime("%m-%d"),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "volume": random.randint(10000000, 50000000),
        })

        price = close_price

    return jsonify(kline_data)

@app.route('/api/news')
def get_news():
    """获取财经新闻"""
    symbol = request.args.get('symbol')
    return jsonify(get_stock_news(symbol))

@app.route('/api/market')
def get_market():
    """获取大盘指数"""
    return jsonify(get_market_index())

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """AI分析接口（返回分析建议，AI分析在前端完成）"""
    data = request.json
    symbol = data.get('symbol')

    # 返回分析建议
    return jsonify({
        "success": True,
        "message": "请使用前端的DeepSeek API进行AI分析",
        "data": {
            "suggestion": "该接口仅提供数据，AI分析请使用前端服务"
        }
    })

if __name__ == '__main__':
    print("""
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 AlphaSeeker AI Backend (Python版)           ║
║                                                   ║
║   使用AkShare获取真实A股数据                       ║
║                                                   ║
║   服务器运行: http://localhost:5001               ║
║                                                   ║
║   可用接口:                                       ║
║   • GET  /api/health                             ║
║   • GET  /api/stocks                             ║
║   • GET  /api/stocks/search?q=关键词              ║
║   • GET  /api/stocks/:symbol/quote               ║
║   • GET  /api/stocks/:symbol/kline               ║
║   • GET  /api/news?symbol=代码                   ║
║   • GET  /api/market                             ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    """)
    app.run(host='0.0.0.0', port=5001, debug=True)
