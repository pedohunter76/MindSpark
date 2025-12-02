import React from 'react';
import { AppMode } from '../types';
import { BrainCircuit, BarChart2, Home, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentMode: AppMode;
  onNavigate: (mode: AppMode) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentMode, onNavigate, isDarkMode, onToggleTheme }) => {
  const navItems = [
    { mode: AppMode.DASHBOARD, label: 'Home', icon: Home },
    { mode: AppMode.LEARNING, label: 'Learn', icon: BrainCircuit },
    { mode: AppMode.STATS, label: 'Stats', icon: BarChart2 },
  ];

  return (
    <div className="h-[100dvh] bg-slate-50 dark:bg-slate-950 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-indigo-600 dark:bg-indigo-900 text-white p-4 z-20 shadow-md transition-colors duration-300 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6" />
            MindSpark
          </h1>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-medium opacity-80 bg-indigo-700 dark:bg-indigo-800 px-2 py-1 rounded">Made by dani</span>
             <button 
               onClick={onToggleTheme}
               className="p-1.5 rounded-full bg-indigo-700/50 hover:bg-indigo-700 dark:bg-indigo-800/50 dark:hover:bg-indigo-800 transition-colors"
               aria-label="Toggle Theme"
             >
               {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-100" />}
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth pb-24 dark:text-slate-200 relative z-0">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 absolute bottom-0 w-full z-10 transition-colors duration-300">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => onNavigate(item.mode)}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200
                  ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};