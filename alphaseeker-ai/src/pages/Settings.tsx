import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette, Shield, HelpCircle, Info, ExternalLink } from 'lucide-react';

export const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    priceAlert: true,
    newsAlert: true,
    aiUpdate: true,
    weeklyReport: false,
  });

  const [theme, setTheme] = useState('dark');

  const settingsSections = [
    {
      title: '账户设置',
      items: [
        { icon: User, label: '个人资料', description: '修改用户名、头像等信息' },
        { icon: Shield, label: '安全设置', description: '修改密码、绑定手机' },
      ],
    },
    {
      title: '通知设置',
      items: [
        { icon: Bell, label: '价格提醒', description: '股票达到目标价格时通知', toggle: true, key: 'priceAlert' },
        { icon: Bell, label: '新闻提醒', description: '重要财经新闻即时推送', toggle: true, key: 'newsAlert' },
        { icon: Bell, label: 'AI更新', description: 'AI评分变化时通知', toggle: true, key: 'aiUpdate' },
        { icon: Bell, label: '周报', description: '每周投资组合报告', toggle: true, key: 'weeklyReport' },
      ],
    },
    {
      title: '显示设置',
      items: [
        { icon: Palette, label: '主题模式', description: '选择界面主题', value: '深色模式' },
      ],
    },
    {
      title: '其他',
      items: [
        { icon: HelpCircle, label: '帮助中心', description: '常见问题与使用指南' },
        { icon: Info, label: '关于我们', description: '了解AlphaSeeker AI' },
      ],
    },
  ];

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 页面头部 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-primary" />
          设置
        </h1>
        <p className="text-muted-foreground mt-1">
          管理您的账户偏好和通知设置
        </p>
      </div>

      {/* 设置内容 */}
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 bg-secondary/30 border-b border-border">
              <h2 className="font-semibold">{section.title}</h2>
            </div>
            <div className="divide-y divide-border">
              {section.items.map((item, index) => (
                <div
                  key={item.label}
                  className={`px-5 py-4 flex items-center justify-between ${
                    index !== section.items.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                  <div>
                    {'toggle' in item && item.toggle ? (
                      <button
                        onClick={() => item.key && toggleNotification(item.key as keyof typeof notifications)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications]
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                            notifications[item.key as keyof typeof notifications]
                              ? 'translate-x-6'
                              : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    ) : 'value' in item ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{item.value}</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    ) : (
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 免责声明 */}
      <div className="bg-secondary/30 rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-3">免责声明</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            1. 本平台提供的所有数据、分析和建议仅供参考，不构成任何投资建议。
          </p>
          <p>
            2. 股市有风险，投资需谨慎。投资者应自行承担投资风险，理性投资。
          </p>
          <p>
            3. 本平台不对任何因使用本服务而导致的直接或间接损失负责。
          </p>
          <p>
            4. AI分析基于历史数据和公开信息，不保证未来表现。
          </p>
        </div>
      </div>

      {/* 版本信息 */}
      <div className="text-center text-sm text-muted-foreground">
        <p>AlphaSeeker AI v1.0.0</p>
        <p className="mt-1">Powered by MiniMax Agent</p>
      </div>
    </div>
  );
};
