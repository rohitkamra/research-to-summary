import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, Link as LinkIcon, Globe } from 'lucide-react';
import { Button } from './Button';
import { TabOption, UploadedFile } from '../types';

interface InputSectionProps {
  onSummarize: (content: string, isFile: boolean, mimeType?: string) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onSummarize, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.FILE);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile) return;

    // Check file type
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload a PDF or TXT file.");
      return;
    }

    // Check file size (approx 10MB limit for safety with inline data)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = () => {
      const result = reader.result as string;
      // remove 'data:application/pdf;base64,' prefix
      const base64 = result.split(',')[1];
      setFile({
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        base64: base64
      });
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    setIsFetching(true);
    try {
      const response = await fetch(urlInput);
      if (!response.ok) throw new Error(`Failed to load URL: ${response.statusText}`);

      const contentType = response.headers.get('content-type') || 'application/pdf';
      const blob = await response.blob();

      // Basic size check for URL content (20MB limit)
      if (blob.size > 20 * 1024 * 1024) {
        throw new Error("The file at this URL is too large to process.");
      }

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        // Clean loading state before summarizing to switch to main loading indicator
        setIsFetching(false);
        onSummarize(base64, true, contentType);
      };
      reader.onerror = () => {
        throw new Error("Failed to process file data.");
      };

    } catch (error) {
      console.error(error);
      setIsFetching(false);
      alert("Unable to access this URL directly. This is often due to security restrictions (CORS) on the website hosting the file.\n\nPlease download the file to your computer and use the 'Upload Document' tab instead.");
    }
  };

  const handleSubmit = () => {
    if (activeTab === TabOption.TEXT) {
      if (!textInput.trim()) return;
      onSummarize(textInput, false);
    } else if (activeTab === TabOption.LINK) {
      handleUrlSubmit();
    } else {
      if (!file) return;
      onSummarize(file.base64, true, file.type);
    }
  };

  const isButtonDisabled = () => {
    if (isLoading || isFetching) return true;
    if (activeTab === TabOption.TEXT) return !textInput.trim();
    if (activeTab === TabOption.LINK) return !urlInput.trim();
    return !file;
  };

  const getButtonText = () => {
    if (isFetching) return "Retrieving Document...";
    if (isLoading) return "Analyzing...";
    return "Generate Summary";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors duration-300">
      <div className="border-b border-slate-200 dark:border-slate-800 flex bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={() => setActiveTab(TabOption.FILE)}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-all relative ${
            activeTab === TabOption.FILE
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
          {activeTab === TabOption.FILE && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab(TabOption.LINK)}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-all relative ${
            activeTab === TabOption.LINK
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Link
          {activeTab === TabOption.LINK && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab(TabOption.TEXT)}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center transition-all relative ${
            activeTab === TabOption.TEXT
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Text
          {activeTab === TabOption.TEXT && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-500"></div>
          )}
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {activeTab === TabOption.FILE && (
          <div className="flex-1 flex flex-col justify-center">
            {!file ? (
              <div
                className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400" 
                    : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-slate-900 dark:text-white font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">PDF or TXT (Max 10MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                  Select File
                </Button>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center relative flex-1">
                <button 
                  onClick={() => setFile(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-lg mb-4">
                   <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white truncate max-w-full px-4 text-center">{file.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="mt-6 flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  Ready to analyze
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === TabOption.LINK && (
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center text-center flex-1 justify-center">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full mb-6">
                <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-medium mb-2 text-lg">Import from URL</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-sm">
                Paste a direct link to a PDF research paper. <br/>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 block">(Note: Some websites block direct access due to security settings)</span>
              </p>
              
              <div className="w-full max-w-md relative">
                <input 
                  type="url" 
                  placeholder="https://example.com/paper.pdf" 
                  className="w-full pl-4 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
              </div>
            </div>
            
            <div className="text-xs text-slate-400 dark:text-slate-500 text-center px-4">
              Supported formats: PDF, Text files, and Web Articles (HTML)
            </div>
          </div>
        )}

        {activeTab === TabOption.TEXT && (
          <textarea
            className="flex-1 w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-500 resize-none font-mono text-sm leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all"
            placeholder="Paste your research paper abstract or full text here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <Button 
          className="w-full" 
          onClick={handleSubmit} 
          isLoading={isLoading || isFetching}
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};