import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square, Globe } from 'lucide-react';

export type WebSearchMode = 'off' | 'on';

interface ComposerProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  contextLength?: number;
  webSearchMode?: WebSearchMode;
  setWebSearchMode?: React.Dispatch<React.SetStateAction<WebSearchMode>>;
}

export const Composer: React.FC<ComposerProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  contextLength = 0,
  webSearchMode = 'off',
  setWebSearchMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleSearchMode = () => {
    if (!setWebSearchMode) return;
    setWebSearchMode((prev) => (prev === 'on' ? 'off' : 'on'));
  };

  // Auto grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) {
        onStop();
      } else if (input.trim()) {
        onSend();
      }
    }
  };

  const handleSendClick = () => {
    if (isStreaming) {
      onStop();
    } else if (input.trim()) {
      onSend();
    }
  };

  const tokenEstimate = Math.max(1, Math.round((input.length + contextLength) / 4));

  return (
    <div className="p-2.5 sm:p-4 max-w-3xl mx-auto w-full transition-all">
      {/* Premium Compact Glassmorphism Input Card */}
      <div className="relative group rounded-2xl bg-[#0c0e14]/90 light:bg-white/95 backdrop-blur-2xl border border-white/12 light:border-slate-200/90 focus-within:border-[#6C63FF]/70 focus-within:ring-2 focus-within:ring-[#6C63FF]/20 transition-all duration-200 shadow-xl shadow-[#6C63FF]/5 overflow-hidden">
        
        {/* Textarea Input Area */}
        <div className="px-3.5 sm:px-4 pt-3 pb-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask MAZEN AI anything..."
            className="w-full bg-transparent border-none text-sm sm:text-base text-[#edeef2] light:text-[#0f172a] placeholder-[#565d6e] light:placeholder-[#94a3b8] focus:outline-none resize-none min-h-[42px] max-h-[200px] leading-normal font-normal tracking-wide"
          />
        </div>

        {/* Action Controls Bar */}
        <div className="px-3.5 sm:px-4 pb-3 pt-1 flex items-center justify-between gap-2.5">
          {/* Left Control: Web Search Toggle Pill & Token Counter */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSearchMode}
              className={`h-7.5 px-3 rounded-full flex items-center gap-1.5 text-[11px] font-medium transition-all duration-200 border cursor-pointer ${
                webSearchMode === 'on'
                  ? 'bg-gradient-to-r from-[#6C63FF]/25 to-purple-600/20 text-[#6C63FF] light:text-[#4F46E5] border-[#6C63FF]/50 shadow-sm shadow-[#6C63FF]/15'
                  : 'bg-white/5 light:bg-slate-100 text-[#64748b] light:text-slate-500 border-white/10 light:border-slate-200 hover:text-[#edeef2] light:hover:text-slate-900'
              }`}
              title={webSearchMode === 'on' ? 'Web Search is ON (Click to turn OFF)' : 'Web Search is OFF (Click to turn ON)'}
            >
              <Globe className={`w-3.5 h-3.5 ${webSearchMode === 'on' ? 'animate-spin-slow text-[#6C63FF]' : 'text-[#64748b]'}`} />
              <span className="font-sans">
                {webSearchMode === 'on' ? (
                  <span className="flex items-center gap-1.5 font-semibold">
                    Web Search: ON <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1">Web Search: OFF</span>
                )}
              </span>
            </button>

            {input.trim() && (
              <span className="text-[10px] font-mono text-[#565d6e] light:text-[#94a3b8] animate-fade-in">
                ~{tokenEstimate} tokens
              </span>
            )}
          </div>

          {/* Right Controls: Send/Stop Button */}
          <div className="flex items-center">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-red-500/20 active:scale-95"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendClick}
                disabled={!input.trim()}
                className="group relative w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] text-white flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-[#6C63FF]/25 font-bold"
                title="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
