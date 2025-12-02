import React, { useState } from 'react';
import { useLiveTrivia } from '../hooks/useLiveTrivia';
import { Mic, MicOff, Radio, Activity } from 'lucide-react';
import { CATEGORIES } from '../types';

export const VoiceMode: React.FC = () => {
  const { isConnected, isSpeaking, error, connect, disconnect } = useLiveTrivia();
  const [selectedCat, setSelectedCat] = useState<string>('General Knowledge');
  const [hasStarted, setHasStarted] = useState(false);

  const handleToggle = () => {
    if (isConnected) {
      disconnect();
      setHasStarted(false);
    } else {
      connect(selectedCat);
      setHasStarted(true);
    }
  };

  if (!hasStarted && !isConnected) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <Mic className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Voice Challenge</h2>
          <p className="text-slate-500">Have a real conversation with QuizWhiz. No buttons, just talk!</p>
        </div>

        <div className="w-full max-w-xs space-y-2">
            <label className="text-sm font-medium text-slate-700">Choose a Category</label>
            <select 
                className="w-full p-3 rounded-xl border border-slate-200 bg-white"
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
            >
                {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
        </div>

        <button
          onClick={handleToggle}
          className="w-full py-4 bg-indigo-600 text-white rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform active:scale-95"
        >
          Start Conversation
        </button>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-between py-12 px-6 bg-slate-900 rounded-3xl relative overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl mix-blend-screen animate-pulse delay-1000"></div>
      </div>

      <div className="text-center z-10">
        <h3 className="text-lg font-medium text-indigo-200 uppercase tracking-widest mb-2">Live Session</h3>
        <h2 className="text-3xl font-bold">{selectedCat}</h2>
      </div>

      <div className="relative z-10 flex items-center justify-center">
        {/* Visualizer Circle */}
        <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${isSpeaking ? 'bg-indigo-500/20 scale-110' : 'bg-slate-800'}`}>
           <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isSpeaking ? 'bg-indigo-500/40 scale-110' : 'bg-slate-700'}`}>
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50">
                {isSpeaking ? (
                    <Activity className="w-8 h-8 text-indigo-600 animate-bounce" />
                ) : (
                    <Radio className="w-8 h-8 text-slate-400" />
                )}
             </div>
           </div>
        </div>
      </div>

      <div className="z-10 w-full space-y-6 text-center">
         <p className="text-indigo-200 font-medium animate-pulse">
            {isSpeaking ? "QuizWhiz is speaking..." : "Listening..."}
         </p>
         
         <button 
            onClick={handleToggle}
            className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto hover:bg-red-500/30 transition-colors"
        >
            <MicOff className="w-6 h-6 text-red-500" />
         </button>
      </div>
    </div>
  );
};