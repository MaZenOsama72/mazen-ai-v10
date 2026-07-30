import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import hljs from 'highlight.js';
import {
  Copy,
  Check,
  RotateCcw,
  User,
  Zap,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Message } from '../types';
import { MermaidDiagram } from './MermaidDiagram';

interface ChatMessageProps {
  message: Message;
  skillLabel?: string;
  onRegenerate?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  skillLabel = 'MAZEN AI',
  onRegenerate,
}) => {
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 1600);
  };

  const handleCopyCode = (codeText: string, codeId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(codeId);
    setTimeout(() => setCopiedCodeId(null), 1600);
  };

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex gap-2 sm:gap-3.5 mb-3.5 sm:mb-5 animate-msg-in w-full min-w-0 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm transition-colors ${
          isUser
            ? 'bg-white/10 light:bg-slate-200 border border-white/10 light:border-slate-300 text-[#edeef2] light:text-slate-900'
            : isSystem
            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 light:text-amber-600'
            : 'bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] text-white shadow-md shadow-[#6C63FF]/20'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#edeef2] light:text-slate-900" />
        ) : isSystem ? (
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <span className="font-display font-black text-xs sm:text-sm">M</span>
        )}
      </div>

      {/* Message Content Container */}
      <div className={`flex-1 min-w-0 max-w-[95%] sm:max-w-3xl ${isUser ? 'items-end flex flex-col' : ''}`}>
        {/* Meta Header */}
        <div className={`flex items-center gap-2 mb-1 text-xs ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="font-display font-bold text-[#edeef2] light:text-slate-900 flex items-center gap-1.5 text-[11px] sm:text-xs">
            {!isUser && !isSystem && <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" />}
            {isUser ? 'You' : isSystem ? 'System Notice' : skillLabel}
          </span>
          {message.model && (
            <span className="font-mono text-[9px] sm:text-[10px] text-[#8b93a7] light:text-slate-500 bg-white/5 light:bg-slate-100 px-2 py-0.5 rounded-full border border-white/10 light:border-slate-200">
              {message.model}
            </span>
          )}
        </div>

        {/* Message Content Bubble */}
        <div
          className={`group relative text-[15px] sm:text-base leading-[1.7] break-words overflow-wrap-anywhere ${
            isUser
              ? 'bg-[#6C63FF]/20 light:bg-[#6C63FF]/15 border border-[#6C63FF]/40 light:border-[#6C63FF]/30 rounded-2xl rounded-tr-xs px-3.5 py-2.5 sm:px-4.5 sm:py-3.5 text-[#edeef2] light:text-slate-900 shadow-sm max-w-full'
              : isSystem
              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 light:text-amber-800 rounded-2xl p-3 sm:p-4 max-w-full'
              : 'text-[#edeef2] light:text-slate-900 space-y-3 max-w-full min-w-0'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.displayContent || message.content}</p>
          ) : message.streaming && !message.content ? (
            /* Streaming Wave Indicator */
            <div className="flex items-center gap-2.5 py-2 text-xs font-mono text-[#6C63FF] light:text-[#4F46E5]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-ping" />
                <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-bounce" />
              </div>
              <span>MAZEN AI is reasoning...</span>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p({ children }: any) {
                  return <p className="mb-3.5 last:mb-0 leading-[1.75]">{children}</p>;
                },
                ul({ children }: any) {
                  return <ul className="list-disc list-inside space-y-1.5 my-2 pl-1">{children}</ul>;
                },
                ol({ children }: any) {
                  return <ol className="list-decimal list-inside space-y-1.5 my-2 pl-1">{children}</ol>;
                },
                table({ children }: any) {
                  return (
                    <div className="my-3 overflow-x-auto max-w-full rounded-xl border border-white/10 light:border-slate-300">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">{children}</table>
                    </div>
                  );
                },
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const codeString = String(children).replace(/\n$/, '');
                  const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

                  if (language === 'mermaid') {
                    return <MermaidDiagram chart={codeString} />;
                  }

                  if (!inline && language) {
                    let highlightedCode = codeString;
                    try {
                      if (language && hljs.getLanguage(language)) {
                        highlightedCode = hljs.highlight(codeString, { language }).value;
                      } else {
                        highlightedCode = hljs.highlightAuto(codeString).value;
                      }
                    } catch (err) {
                      /* fallback to raw text */
                    }

                    return (
                      <div className="my-3 max-w-full overflow-hidden rounded-2xl border border-white/10 light:border-slate-300 bg-[#07080d] light:bg-slate-900 text-[#edeef2] shadow-xl">
                        {/* Code Header Bar */}
                        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-mono text-[#8b93a7]">
                          <span className="uppercase text-[10px] sm:text-[11px] font-bold tracking-wider text-[#6C63FF]">
                            {language}
                          </span>
                          <button
                            onClick={() => handleCopyCode(codeString, codeId)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors min-h-[32px]"
                          >
                            {copiedCodeId === codeId ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 text-[11px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        {/* Code Body */}
                        <div className="p-3 sm:p-4 overflow-x-auto max-w-full font-mono text-xs leading-relaxed">
                          <code
                            dangerouslySetInnerHTML={{ __html: highlightedCode }}
                            className="hljs whitespace-pre inline-block min-w-full"
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="bg-white/10 light:bg-slate-200 px-1.5 py-0.5 rounded text-xs font-mono text-[#6C63FF] light:text-[#4F46E5] font-semibold break-all"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                a({ href, children }: any) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#6C63FF] hover:underline font-medium break-all"
                    >
                      {children}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {/* Action Bar (Copy & Regenerate) */}
          {!isUser && !isSystem && message.content && (
            <div className="flex items-center gap-2 pt-2 text-xs border-t border-white/5 light:border-slate-200 text-[#8b93a7]">
              <button
                onClick={() => handleCopyText(message.content)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/5 light:hover:bg-slate-100 transition-colors min-h-[32px]"
                title="Copy response"
              >
                {copiedMsg ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/5 light:hover:bg-slate-100 transition-colors min-h-[32px]"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
