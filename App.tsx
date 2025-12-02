import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LearningMode } from './components/LearningMode';
import { StatsView } from './components/StatsView';
import { AppMode, UserStats } from './types';
import { BookOpen, Sparkles, Zap, Flame, Trophy } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.DASHBOARD);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Local Stats persistence
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('mindspark_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure seenQuestions and energy exists for backward compatibility
      return {
        ...parsed,
        seenQuestions: parsed.seenQuestions || [],
        energy: parsed.energy ?? 100 // Default 100 energy
      };
    }
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      categoryScores: {},
      seenQuestions: [],
      energy: 100
    };
  });

  useEffect(() => {
    localStorage.setItem('mindspark_stats', JSON.stringify(stats));
  }, [stats]);

  const updateStats = (correct: boolean, questionText: string, category: string) => {
    setStats(prev => {
      const newStreak = correct ? prev.currentStreak + 1 : 0;
      // Replenish 10 energy on correct answer, cap at 100
      const newEnergy = correct ? Math.min(100, prev.energy + 10) : prev.energy;
      
      const newCategoryScores = { ...prev.categoryScores };
      if (correct) {
        newCategoryScores[category] = (newCategoryScores[category] || 0) + 1;
      }

      return {
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        categoryScores: newCategoryScores,
        seenQuestions: [...prev.seenQuestions, questionText],
        energy: newEnergy
      };
    });
  };

  const consumeEnergy = (amount: number) => {
    setStats(prev => ({
      ...prev,
      energy: Math.max(0, prev.energy - amount)
    }));
  };

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.LEARNING:
        return (
          <LearningMode 
            onUpdateStats={updateStats} 
            seenQuestions={stats.seenQuestions}
            energy={stats.energy}
            onConsumeEnergy={consumeEnergy}
          />
        );
      case AppMode.STATS:
        return <StatsView stats={stats} />;
      case AppMode.DASHBOARD:
      default:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900/20 rounded-full blur-xl -ml-6 -mb-6"></div>
                <BookOpen className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                
                <div className="relative z-10">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/10">
                      <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                      <span>Daily Challenge</span>
                   </div>
                   <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                   <p className="text-indigo-100 mb-6 max-w-[90%] text-sm leading-relaxed opacity-90">Ready to expand your mind? Your energy is full and waiting.</p>
                   <button 
                     onClick={() => setCurrentMode(AppMode.LEARNING)}
                     className="w-full py-3.5 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition-all active:scale-[0.98]"
                   >
                     Start New Quiz
                   </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                         <Flame className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Streak</span>
                   </div>
                   <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.currentStreak}</div>
                   <div className="text-xs text-slate-500 mt-1">days in a row</div>
                </div>
                
                <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                         <Trophy className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Score</span>
                   </div>
                   <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.correctAnswers}</div>
                   <div className="text-xs text-slate-500 mt-1">total correct</div>
                </div>

                <div className="col-span-2 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex items-center justify-between">
                    <div>
                       <div className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase mb-1">Energy Level</div>
                       <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.energy}/100</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm">
                       <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                    </div>
                </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-slate-400 dark:text-slate-600">
                MindSpark v1.0 • Offline Capable
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout currentMode={currentMode} onNavigate={setCurrentMode} isDarkMode={isDarkMode} onToggleTheme={toggleTheme}>
      {renderContent()}
    </Layout>
  );
}