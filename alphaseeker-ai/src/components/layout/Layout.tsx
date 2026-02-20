import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Star,
  Newspaper,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  TrendingUp,
  Zap
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '控制台', iconColor: 'text-primary' },
  { path: '/screener', icon: Search, label: '智能选股', iconColor: 'text-primary' },
  { path: '/watchlist', icon: Star, label: '自选股', iconColor: 'text-accent' },
  { path: '/news', icon: Newspaper, label: '资讯流', iconColor: 'text-primary' },
  { path: '/settings', icon: Settings, label: '系统设置', iconColor: 'text-muted-foreground' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        background: 'linear-gradient(180deg, hsl(240 25% 10%) 0%, hsl(240 20% 5%) 100%)',
        borderRight: '1px solid hsl(240 30% 20% / 0.5)'
      }}
    >
      {/* Logo区域 */}
      <div className="h-16 flex items-center justify-between px-4" style={{ borderBottom: '1px solid hsl(240 30% 20% / 0.5)' }}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-lg bg-primary/20 animate-pulse-glow" />
              <div className="relative z-10 w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Cpu className="w-5 h-5 text-black" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg gradient-text">AlphaSeeker</span>
              <div className="text-[10px] text-muted-foreground -mt-1">AI Trading</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <Cpu className="w-5 h-5 text-black" />
          </div>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="p-3 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30'
                  : 'hover:bg-secondary/30 border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'neon-glow' : item.iconColor}`} />
              {!collapsed && (
                <span className={isActive ? 'text-primary font-medium' : 'text-muted-foreground'}>
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary neon-glow" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 底部装饰 */}
      {!collapsed && (
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <div className="p-4 rounded-xl" style={{ background: 'hsl(240 30% 10% / 0.5)', border: '1px solid hsl(240 30% 20% / 0.3)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">系统状态</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-bullish animate-pulse" />
            </div>
            <div className="text-[10px] text-muted-foreground">
              AI 模型运行中 • 实时分析
            </div>
          </div>
        </div>
      )}

      {/* 折叠按钮 */}
      <button
        onClick={onToggle}
        className="absolute bottom-4 right-0 translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, hsl(190 100% 60% / 0.2) 0%, hsl(320 100% 60% / 0.2) 100%)',
          border: '1px solid hsl(190 100% 60% / 0.3)'
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-primary" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-primary" />
        )}
      </button>
    </aside>
  );
};

// Header组件
interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6"
      style={{
        background: 'linear-gradient(90deg, hsl(240 25% 8% / 0.9) 0%, hsl(240 20% 5% / 0.9) 100%)',
        borderBottom: '1px solid hsl(240 30% 20% / 0.3)'
      }}
    >
      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索股票代码、名称或关键词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl text-sm"
            style={{
              background: 'hsl(240 30% 10% / 0.5)',
              border: '1px solid hsl(240 30% 20% / 0.3)'
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="px-2 py-0.5 text-[10px] rounded" style={{ background: 'hsl(240 30% 15%)', border: '1px solid hsl(240 30% 20% / 0.5)' }}>
              ⌘K
            </kbd>
          </div>
        </div>
      </form>

      {/* 右侧信息 */}
      <div className="flex items-center gap-4">
        {/* 市场状态 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'hsl(240 30% 10% / 0.5)', border: '1px solid hsl(240 30% 20% / 0.3)' }}>
          <div className="w-2 h-2 rounded-full bg-bullish animate-pulse neon-glow" />
          <span className="text-sm text-muted-foreground">市场开盘</span>
        </div>

        {/* 全局情绪 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'hsl(240 30% 10% / 0.5)', border: '1px solid hsl(240 30% 20% / 0.3)' }}>
          <TrendingUp className="w-4 h-4 text-bullish" />
          <span className="text-sm font-medium">情绪: 72</span>
          <span className="text-xs text-primary">(偏多)</span>
        </div>

        {/* 用户头像 */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg, hsl(190 100% 60%) 0%, hsl(320 100% 60%) 100%)'
          }}
        >
          AI
        </div>
      </div>
    </header>
  );
};

// 主布局组件
interface MainLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebarCollapsed,
  onSidebarToggle
}) => {
  return (
    <div className="min-h-screen background-grid">
      <Sidebar collapsed={sidebarCollapsed} onToggle={onSidebarToggle} />
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        <Header />
        <main className="p-6">
          <div className="background-grid">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
