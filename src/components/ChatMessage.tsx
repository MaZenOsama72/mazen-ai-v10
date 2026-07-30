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
    <div className={`flex gap-3.5 mb-6 animate-msg-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm transition-colors ${
          isUser
            ? 'bg-white/10 light:bg-slate-200 border border-white/10 light:border-slate-300 text-[#edeef2] light:text-slate-900'
            : isSystem
            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 light:text-amber-600'
            : 'bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] text-white shadow-md shadow-[#6C63FF]/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-[#edeef2] light:text-slate-900" />
        ) : isSystem ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <span className="font-display font-black">M</span>
        )}
      </div>

      {/* Message Content Container */}
      <div className={`flex-1 min-w-0 max-w-3xl ${isUser ? 'items-end flex flex-col' : ''}`}>
        {/* Meta Header */}
        <div className={`flex items-center gap-2 mb-1.5 text-xs ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="font-display font-bold text-[#edeef2] light:text-slate-900 flex items-center gap-1.5">
            {!isUser && !isSystem && <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" />}
            {isUser ? 'You' : isSystem ? 'System Notice' : skillLabel}
          </span>
          {message.model && (
            <span className="font-mono text-[10px] text-[#8b93a7] light:text-slate-500 bg-white/5 light:bg-slate-100 px-2 py-0.5 rounded-full border border-white/10 light:border-slate-200">
              {message.model}
            </span>
          )}
        </div>

        {/* Message Content Bubble */}
        <div
          className={`group relative text-sm leading-relaxed ${
            isUser
              ? 'bg-[#6C63FF]/20 light:bg-[#6C63FF]/15 border border-[#6C63FF]/40 light:border-[#6C63FF]/30 rounded-2xl rounded-tr-xs px-4.5 py-3 text-[#edeef2] light:text-slate-900 shadow-sm'
              : isSystem
              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 light:text-amber-800 rounded-2xl p-4'
              : 'text-[#edeef2] light:text-slate-900 space-y-3'
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
                      <div className="my-3 overflow-hidden rounded-2xl border border-white/10 light:border-slate-300 bg-[#07080d] light:bg-slate-900 text-[#edeef2] shadow-xl">
                        {/* Code Header Bar */}
                        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-mono text-[#8b93a7]">
                          <span className="uppercase text-[11px] font-bold tracking-wider text-[#6C63FF]">
                            {language}
                          </span>
                          <button
                            onClick={() => handleCopyCode(codeString, codeId)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
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
                        <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed">
                          <code
                            dangerouslySetInnerHTML={{ __html: highlightedCode }}
                            className="hljs"
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="bg-white/10 light:bg-slate-200 px-1.5 py-0.5 rounded text-xs font-mono text-[#6C63FF] light:text-[#4F46E5] font-semibold"
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
                      className="inline-flex items-center gap-1 text-[#6C63FF] hover:underline font-medium"
                    >
                      {children}
                      <ExternalLink className="w-3 h-3" />
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
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
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
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
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
