import React, { useState } from 'react';
import { Question, GameState, SearchGroundingResult, CATEGORIES, Difficulty } from '../types';
import { generateQuestion, deepDiveTopic, playTextToSpeech } from '../services/geminiService';
import { Volume2, Search, ArrowRight, Loader2, CheckCircle2, XCircle, Lightbulb, Zap, Gauge, RotateCcw, ChevronLeft, Brain } from 'lucide-react';

interface LearningModeProps {
  onUpdateStats: (correct: boolean, questionText: string, category: string) => void;
  seenQuestions: string[];
  energy: number;
  onConsumeEnergy: (amount: number) => void;
}

export const LearningMode: React.FC<LearningModeProps> = ({ onUpdateStats, seenQuestions, energy, onConsumeEnergy }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [deepDiveInfo, setDeepDiveInfo] = useState<{ text: string, sources: SearchGroundingResult[] } | null>(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');

  const getHintCost = () => {
    switch (difficulty) {
      case 'Easy': return 15;
      case 'Hard': return 40;
      case 'Medium':
      default: return 25;
    }
  };

  const handleStartCategory = async (catId: string) => {
    setSelectedCategory(catId);
    setGameState(GameState.LOADING);
    setShowHint(false);
    try {
      // Pass the last 30 seen questions to avoid recent repeats
      const historyContext = seenQuestions.slice(-30);
      const q = await generateQuestion(catId, historyContext, difficulty);
      setCurrentQuestion(q);
      setGameState(GameState.ANSWERING);
    } catch (e) {
      console.error(e);
      setGameState(GameState.ERROR);
    }
  };

  const handleAnswer = (option: string) => {
    if (gameState !== GameState.ANSWERING || !currentQuestion) return;
    setSelectedOption(option);
    setGameState(GameState.REVIEWING);
    
    const isCorrect = option === currentQuestion.correctAnswer;
    const categoryName = CATEGORIES.find(c => c.id === currentQuestion.category)?.name || currentQuestion.category;
    onUpdateStats(isCorrect, currentQuestion.questionText, categoryName);

    // Auto-play explanation TTS on answer
    playTextToSpeech(isCorrect ? "Correct! " + currentQuestion.explanation : "Not quite. " + currentQuestion.explanation);
  };

  const handleNext = async () => {
    if (!selectedCategory) return;
    setGameState(GameState.LOADING);
    setSelectedOption(null);
    setDeepDiveInfo(null);
    setShowHint(false);
    try {
      const historyContext = seenQuestions.slice(-30);
      const q = await generateQuestion(selectedCategory, historyContext, difficulty);
      setCurrentQuestion(q);
      setGameState(GameState.ANSWERING);
    } catch (e) {
      setGameState(GameState.ERROR);
    }
  };

  const handleRetry = () => {
    const retryCost = 10;
    if (energy >= retryCost && currentQuestion) {
      onConsumeEnergy(retryCost);
      
      // Shuffle options to give a fresh attempt feel
      const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
      
      setCurrentQuestion({
        ...currentQuestion,
        options: shuffledOptions
      });
      
      setSelectedOption(null);
      setGameState(GameState.ANSWERING);
      setShowHint(false); // Reset hint so they can choose to use it again if needed
      setDeepDiveInfo(null);
    }
  };

  const handleDeepDive = async () => {
    if (!currentQuestion) return;
    setIsLoadingDeepDive(true);
    const result = await deepDiveTopic(currentQuestion.correctAnswer + " " + currentQuestion.category);
    setDeepDiveInfo(result);
    setIsLoadingDeepDive(false);
  };

  const handleUseHint = () => {
    const cost = getHintCost();
    if (energy >= cost && !showHint) {
      onConsumeEnergy(cost);
      setShowHint(true);
    }
  };

  const handleBackToCategories = () => {
    setGameState(GameState.IDLE);
    setSelectedCategory(null);
    setCurrentQuestion(null);
  };

  if (gameState === GameState.IDLE || !selectedCategory) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* Difficulty Selector */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
           <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
             <Gauge className="w-4 h-4" />
             Difficulty
           </h2>
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all
                    ${difficulty === level 
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-[1.02]' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {level}
                </button>
              ))}
           </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Topics</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => handleStartCategory(cat.id)}
                className="relative group p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 active:scale-95 transition-all flex flex-col items-center gap-3 shadow-sm hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm transition-colors
                  ${['bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'][idx % 4]}`}
                >
                  {cat.name[0]}
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === GameState.LOADING) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-6 text-center">
        <div className="relative">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full animate-ping absolute"></div>
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 dark:text-indigo-400 relative z-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-2">Generating Question</h3>
        <p className="text-sm max-w-[200px]">Crafting a {difficulty.toLowerCase()} challenge about {CATEGORIES.find(c => c.id === selectedCategory)?.name}...</p>
      </div>
    );
  }

  if (!currentQuestion) return <div className="p-4 text-center">Something went wrong. <button onClick={handleBackToCategories} className="text-indigo-600 font-bold underline">Go Back</button></div>;

  const currentHintCost = getHintCost();

  return (
    <div className="space-y-4 pb-12 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header with Back, Category, Difficulty, Energy */}
      <div className="flex justify-between items-center mb-2">
         <button onClick={handleBackToCategories} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <ChevronLeft className="w-6 h-6" />
         </button>
         
         <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
               {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className={`text-xs font-bold uppercase ${
               difficulty === 'Easy' ? 'text-green-500' : difficulty === 'Hard' ? 'text-red-500' : 'text-blue-500'
            }`}>
               {difficulty}
            </span>
         </div>

         <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/30 shadow-sm">
            <Zap className="w-4 h-4 fill-amber-500 stroke-amber-600" />
            <span className="font-bold text-sm">{energy}</span>
         </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden relative">
        <div className="p-6 pb-8 bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-slate-900 text-white relative">
          
          <div className="flex justify-between items-start gap-4">
             <h3 className="text-lg md:text-xl font-semibold leading-relaxed">{currentQuestion.questionText}</h3>
          </div>
          
          <button 
            onClick={() => playTextToSpeech(currentQuestion.questionText)}
            className="absolute bottom-[-20px] right-6 w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 hover:scale-110 transition-transform"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Hint Display */}
        {showHint && (
           <div className="mt-6 mx-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-3 animate-in slide-in-from-top-2">
             <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
             <p className="text-sm text-amber-800 dark:text-amber-200 italic font-medium">{currentQuestion.hint}</p>
           </div>
        )}

        <div className={`p-4 space-y-3 ${showHint ? 'pt-4' : 'pt-8'}`}>
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const showResult = gameState === GameState.REVIEWING;

            let btnClass = "w-full text-left p-4 rounded-2xl border-2 transition-all font-medium text-[15px] relative overflow-hidden ";
            
            if (showResult) {
              if (isCorrect) btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 shadow-md";
              else if (isSelected && !isCorrect) btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
              else btnClass += "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60";
            } else {
              btnClass += isSelected 
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" 
                : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm";
            }

            return (
              <button
                key={idx}
                disabled={showResult}
                onClick={() => handleAnswer(option)}
                className={btnClass}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className="leading-snug pr-6">{option}</span>
                  {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Hint Button */}
        {gameState === GameState.ANSWERING && !showHint && (
          <div className="px-4 pb-6">
            <button
              onClick={handleUseHint}
              disabled={energy < currentHintCost}
              className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all
                ${energy >= currentHintCost 
                  ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-900/50 shadow-sm' 
                  : 'text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed border border-slate-100 dark:border-slate-800'}`}
            >
              <Brain className="w-4 h-4" />
              Use Hint (-{currentHintCost})
            </button>
          </div>
        )}
      </div>

      {/* Review Section */}
      {gameState === GameState.REVIEWING && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 delay-100 pb-10">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
              Explanation
              <button 
                className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full transition-colors"
                onClick={() => playTextToSpeech(currentQuestion.explanation)}
              >
                 <Volume2 className="w-4 h-4 text-indigo-500" />
              </button>
            </h4>
            <p className="text-indigo-800 dark:text-indigo-300 text-[15px] leading-relaxed">{currentQuestion.explanation}</p>
          </div>

          <div className="flex gap-3">
             {selectedOption !== currentQuestion.correctAnswer && (
                 <button
                    onClick={handleRetry}
                    disabled={energy < 10}
                    className={`flex-1 py-4 border rounded-2xl font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95
                      ${energy >= 10 
                        ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                 >
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-xs">Retry (-10)</span>
                 </button>
             )}

             {!deepDiveInfo && (
                <button
                  onClick={handleDeepDive}
                  disabled={isLoadingDeepDive}
                  className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  {isLoadingDeepDive ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 text-blue-500" />}
                  <span className="text-xs">Deep Dive</span>
                </button>
              )}
          </div>

          {deepDiveInfo && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                 <Search className="w-4 h-4 text-blue-500" />
                 Deep Dive Info
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">{deepDiveInfo.text}</p>
              
              {deepDiveInfo.sources.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sources</p>
                  {deepDiveInfo.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 dark:text-blue-400 truncate hover:underline py-0.5"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Next Question
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};