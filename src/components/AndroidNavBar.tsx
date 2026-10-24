import React from 'react';
import { Target, TrendingUp, Calculator, BookOpen, HelpCircle } from 'lucide-react';

export type TabType = 'strategy' | 'ticker' | 'calculator' | 'journal' | 'rules';

interface AndroidNavBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  journalCount?: number;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  currentTab,
  onSelectTab,
  journalCount = 0,
}) => {
  const tabs = [
    { id: 'strategy' as TabType, label: 'Strategy', icon: Target },
    { id: 'ticker' as TabType, label: 'Live Ticker', icon: TrendingUp },
    { id: 'calculator' as TabType, label: 'Lot Calc', icon: Calculator },
    { id: 'journal' as TabType, label: 'Journal', icon: BookOpen, badge: journalCount },
    { id: 'rules' as TabType, label: 'Rules', icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-t border-gray-800/80 px-2 py-1 max-w-lg mx-auto">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition duration-150 ${
                isActive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-400 hover:text-gray-200 active:bg-gray-800/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-black text-[9px] font-black rounded-full px-1 min-w-3.5 h-3.5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold text-emerald-400' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
