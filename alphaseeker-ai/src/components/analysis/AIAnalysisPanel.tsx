import React from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  DollarSign,
  Newspaper,
  Zap
} from 'lucide-react';
import type { AIAnalysis } from '../../data/mockData';

interface AIAnalysisPanelProps {
  analysis: any;
  compact?: boolean;
}

const ScoreGauge: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-20 overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0 100% 60%)" />
              <stop offset="30%" stopColor="hsl(45 100% 50%)" />
              <stop offset="60%" stopColor="hsl(150 100% 45%)" />
              <stop offset="100%" stopColor="hsl(150 100% 45%)" />
            </linearGradient>
          </defs>
          {/* 弧形背景 */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="hsl(240 30% 15%)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* 渐变弧形 */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 126} 126`}
          />
          {/* 指针 */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${(score / 100) * 180 - 90} 50 50)`}
          />
          <circle cx="50" cy="50" r="4" fill="hsl(190 100% 60%)" className="neon-glow" />
        </svg>
      </div>
      <div className="mt-2 text-center">
        <div className="text-3xl font-bold gradient-text">{score}</div>
        <div className="text-xs text-primary">{label}</div>
      </div>
    </div>
  );
};

const DimensionCard: React.FC<{
  title: string;
  score: number;
  signal: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, score, signal, icon, color }) => {
  return (
    <div className="p-4 rounded-xl transition-all duration-300 hover:border-primary/30" style={{ background: 'hsl(240 30% 10% / 0.5)', border: '1px solid hsl(240 30% 20% / 0.3)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${color}`} style={{ background: color.replace('text-', 'hsl(190 100% 60% / 0.1)').replace('bg-', 'hsl(') }}>
          {icon}
        </div>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">评分</span>
        <span className={`text-lg font-bold ${color}`}>{score}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{signal}</p>
    </div>
  );
};

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ analysis, compact }) => {
  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('强烈推荐') || verdict.includes('强买')) {
      return 'text-bullish';
    }
    if (verdict.includes('买入') || verdict.includes('建议买入')) {
      return 'text-primary';
    }
    if (verdict.includes('观望') || verdict.includes('持有')) {
      return 'text-muted-foreground';
    }
    if (verdict.includes('卖出')) {
      return 'text-accent';
    }
    return 'text-destructive';
  };

  if (compact) {
    return (
      <div className="p-4 rounded-xl tech-border" style={{ background: 'linear-gradient(135deg, hsl(240 25% 10%) 0%, hsl(240 20% 8%) 100%)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-primary neon-glow" />
          <span className="font-semibold">AI综合分析</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-muted-foreground">综合评分</div>
            <div className="text-2xl font-bold gradient-text">{analysis.overallScore}/100</div>
          </div>
          <div className={`text-lg font-semibold ${getVerdictColor(analysis.verdict)}`}>
            {analysis.verdict}
          </div>
        </div>
        <div className="score-bar">
          <div
            className={`score-bar-fill ${analysis.overallScore >= 80 ? 'bg-bullish' : analysis.overallScore >= 60 ? 'bg-primary' : 'bg-muted-foreground'}`}
            style={{ width: `${analysis.overallScore}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden tech-border" style={{ background: 'linear-gradient(135deg, hsl(240 25% 10%) 0%, hsl(240 20% 8%) 100%)' }}>
      {/* 头部 */}
      <div className="p-5" style={{ borderBottom: '1px solid hsl(240 30% 20% / 0.3)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, hsl(190 100% 60% / 0.2) 0%, hsl(320 100% 60% / 0.2) 100%)' }}>
            <Brain className="w-6 h-6 text-primary neon-glow" />
          </div>
          <span className="font-bold text-lg gradient-text">AI 综合分析</span>
        </div>

        <div className="flex items-center justify-between">
          <ScoreGauge score={analysis.overallScore || 0} label="综合评分" />
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              AI 置信度
            </div>
            <div className="text-2xl font-bold gradient-text">
              {((analysis.confidence || 0.85) * 100).toFixed(0)}%
            </div>
            <div className={`text-lg font-semibold mt-2 ${getVerdictColor(analysis.verdict)}`}>
              {analysis.verdict}
            </div>
          </div>
        </div>
      </div>

      {/* 多维度分析 */}
      <div className="p-5" style={{ borderBottom: '1px solid hsl(240 30% 20% / 0.3)' }}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          多维度分析
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <DimensionCard
            title="技术面"
            score={analysis.dimensions?.technical?.score || analysis.technical?.score || 70}
            signal={analysis.dimensions?.technical?.signal || analysis.technical?.signal || '技术面分析中'}
            icon={<Activity className="w-4 h-4 text-primary" />}
            color="text-primary"
          />
          <DimensionCard
            title="基本面"
            score={analysis.dimensions?.fundamental?.score || analysis.fundamental?.score || 70}
            signal={analysis.dimensions?.fundamental?.signal || analysis.fundamental?.signal || '基本面分析中'}
            icon={<DollarSign className="w-4 h-4 text-bullish" />}
            color="text-bullish"
          />
          <DimensionCard
            title="消息面"
            score={analysis.dimensions?.sentiment?.score || analysis.sentiment?.score || 70}
            signal={analysis.dimensions?.sentiment?.signal || analysis.sentiment?.signal || '消息面分析中'}
            icon={<Newspaper className="w-4 h-4 text-accent" />}
            color="text-accent"
          />
          <DimensionCard
            title="资金面"
            score={analysis.dimensions?.capital?.score || analysis.capital?.score || 70}
            signal={analysis.dimensions?.capital?.signal || analysis.capital?.signal || '资金面分析中'}
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
            color="text-primary"
          />
        </div>
      </div>

      {/* 利好/风险因素 */}
      <div className="p-5" style={{ borderBottom: '1px solid hsl(240 30% 20% / 0.3)' }}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          因素分析
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-bullish neon-glow" />
              <span className="text-sm font-medium text-bullish">利好因素</span>
            </div>
            <ul className="space-y-1">
              {(analysis.bullishFactors || []).slice(0, 3).map((factor, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-bullish">●</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">风险因素</span>
            </div>
            <ul className="space-y-1">
              {(analysis.bearishFactors || []).slice(0, 3).map((factor, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-accent">●</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 趋势预测与建议 */}
      <div className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          趋势预测与操作建议
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'hsl(240 30% 10% / 0.5)' }}>
            <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">趋势判断</div>
              <div className="text-sm font-medium">{analysis.trendPrediction || '分析中...'}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'hsl(240 30% 10% / 0.5)' }}>
            <Target className="w-4 h-4 text-bullish mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">操作建议</div>
              <div className="text-sm font-medium">{analysis.recommendation || '分析中...'}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'hsl(240 30% 10% / 0.5)' }}>
            <DollarSign className="w-4 h-4 text-accent mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">目标价</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-destructive">{analysis.currency === 'USD' ? '$' : '¥'}{analysis.targetPrice?.low || '--'}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-bullish font-medium">{analysis.currency === 'USD' ? '$' : '¥'}{analysis.targetPrice?.medium || '--'}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-primary">{analysis.currency === 'USD' ? '$' : '¥'}{analysis.targetPrice?.high || '--'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
