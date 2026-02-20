import React from 'react';
import { Newspaper, TrendingUp, TrendingDown, Clock, ExternalLink } from 'lucide-react';
import type { StockNews } from '../../data/mockData';

interface NewsFeedProps {
  news: StockNews[];
  limit?: number;
  showSource?: boolean;
  onNewsClick?: (news: StockNews) => void;
}

const SentimentBadge: React.FC<{ sentiment: number }> = ({ sentiment }) => {
  if (sentiment > 0.5) {
    return (
      <span className="flex items-center gap-1 text-xs text-bullish">
        <TrendingUp className="w-3 h-3" />
        利好
      </span>
    );
  }
  if (sentiment < -0.5) {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <TrendingDown className="w-3 h-3" />
        利空
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      中性
    </span>
  );
};

const NewsCard: React.FC<{ news: StockNews; onClick?: () => void }> = ({ news, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium line-clamp-2 mb-2">{news.title}</h4>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{news.source}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {news.time}
            </span>
            {news.symbol && (
              <span className="px-1.5 py-0.5 bg-secondary rounded text-primary">
                {news.symbol}
              </span>
            )}
          </div>
        </div>
        <SentimentBadge sentiment={news.sentiment} />
      </div>
    </div>
  );
};

export const NewsFeed: React.FC<NewsFeedProps> = ({
  news,
  limit,
  showSource = true,
  onNewsClick
}) => {
  const displayNews = limit ? news.slice(0, limit) : news;

  if (limit === 1) {
    const item = displayNews[0];
    return (
      <NewsCard
        news={item}
        onClick={() => onNewsClick?.(item)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {showSource && (
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-primary" />
          <span className="font-semibold">财经资讯</span>
        </div>
      )}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {displayNews.map((item, index) => (
          <div
            key={item.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <NewsCard
              news={item}
              onClick={() => onNewsClick?.(item)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 滚动新闻栏
export const NewsTicker: React.FC<{ news: StockNews[] }> = ({ news }) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
        <Newspaper className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">最新资讯</span>
      </div>
      <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
        {news.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
          >
            <SentimentBadge sentiment={item.sentiment} />
            <span className="flex-1 line-clamp-1">{item.title}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {item.time.split(' ')[1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
