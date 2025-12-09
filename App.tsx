import React, { useState, useEffect } from 'react';
import { Bot, Moon, Sun } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { SummaryDisplay } from './components/SummaryDisplay';
import { summarizeContentStream } from './services/geminiService';
import { SummaryState } from './types';

function App() {
  const [state, setState] = useState<SummaryState>({
    isLoading: false,
    error: null,
    content: '',
    isStreaming: false
  });

  const [hasStarted, setHasStarted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from system preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleSummarize = async (content: string, isFile: boolean, mimeType?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, content: '', isStreaming: true }));
    setHasStarted(true);

    try {
      const stream = await summarizeContentStream(content, isFile, mimeType);
      
      setState(prev => ({ ...prev, isLoading: false })); // Loading initial request done, now streaming

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          setState(prev => ({
            ...prev,
            content: prev.content + chunkText
          }));
        }
      }
    } catch (error) {
      console.error(error);
      setState(prev => ({
        ...prev,
        error: "Failed to generate summary. Please check your API key or try a different file.",
        content: prev.content || "Error occurred while generating summary."
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false, isStreaming: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Research to Summary</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Intelligent Paper Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 hidden md:block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
              Gemini 2.5 Flash
            </div>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)] min-h-[600px]">
          
          {/* Left Column: Input */}
          <div className="h-full flex flex-col">
            <InputSection 
              onSummarize={handleSummarize} 
              isLoading={state.isLoading || state.isStreaming} 
            />
          </div>

          {/* Right Column: Output */}
          <div className="h-full flex flex-col">
            {state.error ? (
               <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center text-red-700 dark:text-red-400 h-full flex items-center justify-center flex-col shadow-sm">
                 <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-full mb-4">
                    <Bot className="w-6 h-6 text-red-600 dark:text-red-400" />
                 </div>
                 <p className="font-medium mb-2 text-lg">Analysis Failed</p>
                 <p className="text-sm opacity-90 max-w-xs mx-auto mb-6">{state.error}</p>
                 <button 
                   onClick={() => setState(prev => ({ ...prev, error: null }))}
                   className="px-4 py-2 bg-white dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/60 transition-colors"
                 >
                   Try Again
                 </button>
               </div>
            ) : (
              <SummaryDisplay 
                content={state.content} 
                isStreaming={state.isStreaming}
                hasStarted={hasStarted}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;