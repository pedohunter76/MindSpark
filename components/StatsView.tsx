import React from 'react';
import { UserStats, CATEGORIES } from '../types';
import { Trophy, Flame, Target, Star, Award, TrendingUp } from 'lucide-react';

interface StatsViewProps {
  stats: UserStats;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  // Use CATEGORIES to ensure all topics are shown, even with 0 score
  const data = CATEGORIES.map(cat => ({
    name: cat.name,
    icon: cat.icon,
    score: stats.categoryScores[cat.name] || 0
  })).sort((a, b) => b.score - a.score); // Sort by highest score

  const maxScore = Math.max(...data.map(d => d.score), 1); // Avoid div by zero

  const COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Your Progress</h2>
        <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
          <Award className="w-3 h-3" />
          <span>Level {Math.floor(stats.correctAnswers / 10) + 1}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-full mb-2">
            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.correctAnswers}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold">Correct</div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-full mb-2">
            <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.bestStreak}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold">Streak</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold">Accuracy</div>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Performance by Topic</h3>
        </div>
        
        <div className="grid gap-3">
            {data.map((item, index) => {
                const percent = (item.score / maxScore) * 100;
                return (
                  <div key={item.name} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 relative overflow-hidden">
                      {/* Background Progress Bar */}
                      <div 
                        className="absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-out opacity-20 dark:opacity-40" 
                        style={{ width: `${percent}%`, backgroundColor: 'currentColor' }} 
                      />
                      
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${COLORS[index % COLORS.length]} text-white font-bold text-lg shadow-sm`}>
                          {item.name[0]}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="font-bold text-slate-800 dark:text-slate-100">{item.score}</span>
                            </div>
                          </div>
                          
                          {/* Visual Bar */}
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full ${COLORS[index % COLORS.length]}`} 
                                style={{ width: `${(item.score / (maxScore || 1)) * 100}%`, minWidth: item.score > 0 ? '4px' : '0' }}
                             ></div>
                          </div>
                      </div>
                  </div>
                );
            })}
        </div>
      </div>
      
      <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl text-xs text-slate-500 dark:text-slate-400 text-center">
        Stats are saved locally to your device.
      </div>
    </div>
  );
};