import React from 'react';
import { RotateCcw, Sliders } from 'lucide-react';
import { TuningParams } from '../types';

interface PromptTuningPanelProps {
  isOpen: boolean;
  params: TuningParams;
  onChange: (updated: Partial<TuningParams>) => void;
  onReset: () => void;
  defaultSystemPrompt: string;
}

export const PromptTuningPanel: React.FC<PromptTuningPanelProps> = ({
  isOpen,
  params,
  onChange,
  onReset,
  defaultSystemPrompt,
}) => {
  if (!isOpen) return null;

  const currentSystemPrompt =
    params.customSystemPrompt !== null ? params.customSystemPrompt : defaultSystemPrompt;

  return (
    <div className="bg-[#0b0c14] light:bg-[#f1f5f9] border-b border-white/10 light:border-slate-200 p-4 transition-all duration-200 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#6C63FF]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#6C63FF] font-semibold">
              MAZEN AI System Prompt & Controls
            </span>
            {params.customSystemPrompt !== null && (
              <span className="text-[10px] font-mono bg-[#6C63FF]/20 text-[#6C63FF] px-2 py-0.5 rounded-full border border-[#6C63FF]/30">
                Custom System Prompt
              </span>
            )}
          </div>
          <button
            onClick={onReset}
            className="text-xs text-[#8b93a7] hover:text-[#edeef2] flex items-center gap-1 hover:underline font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* System Prompt */}
          <div className="md:col-span-2 space-y-1">
            <label className="font-mono text-[11px] text-[#8b93a7] flex items-center justify-between">
              <span>System Prompt (Model Role & Assistant Identity)</span>
              {params.customSystemPrompt !== null && (
                <span className="text-[10px] text-[#6C63FF]">Modified</span>
              )}
            </label>
            <textarea
              value={currentSystemPrompt}
              onChange={(e) =>
                onChange({
                  customSystemPrompt:
                    e.target.value === defaultSystemPrompt ? null : e.target.value,
                })
              }
              rows={2}
              className="w-full bg-[#10121c] light:bg-white border border-white/10 light:border-slate-300 rounded-xl p-2.5 text-[#edeef2] light:text-slate-900 focus:outline-none focus:border-[#6C63FF] font-mono text-xs resize-y"
              placeholder="Defines how MAZEN AI responds..."
            />
          </div>

          {/* Context */}
          <div className="space-y-1">
            <label className="font-mono text-[11px] text-[#8b93a7]">Context (Background / Code)</label>
            <textarea
              value={params.context}
              onChange={(e) => onChange({ context: e.target.value })}
              rows={2}
              className="w-full bg-[#10121c] light:bg-white border border-white/10 light:border-slate-300 rounded-xl p-2.5 text-[#edeef2] light:text-slate-900 focus:outline-none focus:border-[#6C63FF] font-mono text-xs resize-y"
              placeholder="Inject background knowledge, specs, or code snippets..."
            />
          </div>

          {/* Constraints */}
          <div className="space-y-1">
            <label className="font-mono text-[11px] text-[#8b93a7]">Constraints (Rules & Boundaries)</label>
            <textarea
              value={params.constraints}
              onChange={(e) => onChange({ constraints: e.target.value })}
              rows={2}
              className="w-full bg-[#10121c] light:bg-white border border-white/10 light:border-slate-300 rounded-xl p-2.5 text-[#edeef2] light:text-slate-900 focus:outline-none focus:border-[#6C63FF] font-mono text-xs resize-y"
              placeholder="Rules response must follow (e.g., max 200 words, strictly valid JSON)..."
            />
          </div>

          {/* Output Format */}
          <div className="space-y-1">
            <label className="font-mono text-[11px] text-[#8b93a7]">Output Format Spec</label>
            <input
              type="text"
              value={params.outputFormat}
              onChange={(e) => onChange({ outputFormat: e.target.value })}
              className="w-full bg-[#10121c] light:bg-white border border-white/10 light:border-slate-300 rounded-xl p-2.5 text-[#edeef2] light:text-slate-900 focus:outline-none focus:border-[#6C63FF] font-mono text-xs"
              placeholder="e.g. JSON schema, bullet points, Markdown code block..."
            />
          </div>

          {/* Temperature & Max Tokens */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between font-mono text-[11px] text-[#8b93a7]">
                <span>Temperature</span>
                <span className="text-[#edeef2] font-semibold">{params.temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.temperature}
                onChange={(e) => onChange({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-[#6C63FF] cursor-pointer"
              />
            </div>

            <div className="w-28 space-y-1">
              <label className="font-mono text-[11px] text-[#8b93a7]">Max Tokens</label>
              <input
                type="number"
                min="64"
                max="8192"
                step="64"
                value={params.maxTokens}
                onChange={(e) => onChange({ maxTokens: parseInt(e.target.value, 10) || 2048 })}
                className="w-full bg-[#10121c] light:bg-white border border-white/10 light:border-slate-300 rounded-xl px-2.5 py-1 text-[#edeef2] light:text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
