import React, { useState } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Search, Filter, Clock } from 'lucide-react';
import { NewsFeed } from '../components/news/NewsFeed';
import { mockNews, type StockNews } from '../data/mockData';

export const News: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = mockNews.filter((news) => {
    // 筛选涨跌
    if (filter === 'bullish' && news.sentiment <= 0) return false;
    if (filter === 'bearish' && news.sentiment >= 0) return false;
    // 筛选搜索
    if (searchQuery && !news.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // 按时间分组
  const groupedNews = filteredNews.reduce((groups, news) => {
    const date = news.time.split(' ')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(news);
    return groups;
  }, {} as Record<string, StockNews[]>);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-primary" />
            财经资讯
          </h1>
          <p className="text-muted-foreground mt-1">
            最新财经新闻与AI情绪分析，助您把握市场脉搏
          </p>
        </div>
      </div>

      {/* 搜索与筛选 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索新闻..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('bullish')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'bullish'
                ? 'bg-bullish text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            利好
          </button>
          <button
            onClick={() => setFilter('bearish')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'bearish'
                ? 'bg-destructive text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingDown className="w-3 h-3" />
            利空
          </button>
        </div>
      </div>

      {/* 新闻统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">今日新闻</div>
          <div className="text-2xl font-bold">{mockNews.length}</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">利好消息</div>
          <div className="text-2xl font-bold text-bullish">
            {mockNews.filter((n) => n.sentiment > 0).length}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">利空消息</div>
          <div className="text-2xl font-bold text-destructive">
            {mockNews.filter((n) => n.sentiment < 0).length}
          </div>
        </div>
      </div>

      {/* 新闻列表 */}
      <div className="space-y-6">
        {Object.entries(groupedNews).map(([date, newsList]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold">{date}</h3>
            </div>
            <div className="space-y-3">
              {newsList.map((news, index) => (
                <div
                  key={news.id}
                  className="p-5 bg-card rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium mb-2 line-clamp-2">
                        {news.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Newspaper className="w-3 h-3" />
                          {news.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {news.time.split(' ')[1]}
                        </span>
                        {news.symbol && (
                          <span className="px-2 py-0.5 bg-secondary rounded text-primary">
                            {news.symbol}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {news.sentiment > 0.5 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-bullish/20 text-bullish rounded text-xs">
                          <TrendingUp className="w-3 h-3" />
                          利好
                        </span>
                      )}
                      {news.sentiment < -0.5 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive rounded text-xs">
                          <TrendingDown className="w-3 h-3" />
                          利空
                        </span>
                      )}
                      {news.sentiment >= -0.5 && news.sentiment <= 0.5 && (
                        <span className="px-2 py-1 bg-secondary text-muted-foreground rounded text-xs">
                          中性
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
