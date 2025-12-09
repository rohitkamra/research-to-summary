import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Sparkles, BookOpen } from 'lucide-react';

interface SummaryDisplayProps {
  content: string;
  isStreaming: boolean;
  hasStarted: boolean;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ content, isStreaming, hasStarted }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasStarted) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Sparkles className="w-8 h-8 text-indigo-400 dark:text-indigo-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">Ready to Synthesize</h3>
        <p className="max-w-md text-slate-500 dark:text-slate-400">
          Upload a research paper or paste text to generate a structured AI summary.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full max-h-full transition-colors duration-300">
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 rounded-t-2xl">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold">Research Summary</h2>
          {isStreaming && (
            <span className="flex h-2 w-2 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-strong:text-slate-800 dark:prose-strong:text-slate-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};