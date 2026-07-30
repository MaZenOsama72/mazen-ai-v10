import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, Trash2, SlidersHorizontal, Mic, Sparkles, Settings } from 'lucide-react';
import { MODELS } from '../data/models';
import { SKILLS } from '../data/skills';

interface TopbarProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  selectedSkillId: string;
  onSelectSkill: (skillId: string) => void;
  isStreaming: boolean;
  onClearChat: () => void;
  onToggleMobileMenu: () => void;
  isTuningOpen: boolean;
  onToggleTuning: () => void;
  onOpenVoiceMode?: () => void;
  onOpenSettings?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  selectedModel,
  onSelectModel,
  selectedSkillId,
  onSelectSkill,
  isStreaming,
  onClearChat,
  onToggleMobileMenu,
  isTuningOpen,
  onToggleTuning,
  onOpenVoiceMode,
  onOpenSettings,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);

  const modelRef = useRef<HTMLDivElement>(null);
  const skillRef = useRef<HTMLDivElement>(null);

  const activeModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];
  const activeSkill = SKILLS.find((s) => s.id === selectedSkillId) || SKILLS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
      if (skillRef.current && !skillRef.current.contains(event.target as Node)) {
        setSkillDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-13 px-3.5 border-b border-white/10 light:border-slate-200 bg-[#090a0f]/90 light:bg-[#f8fafc]/90 backdrop-blur-xl flex items-center justify-between gap-2 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden h-8 w-8 rounded-xl text-[#8b93a7] hover:text-[#edeef2] hover:bg-white/5 flex items-center justify-center transition-colors"
          title="Open Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Model Selection Dropdown */}
        <div className="relative" ref={modelRef}>
          <button
            onClick={() => {
              setModelDropdownOpen(!modelDropdownOpen);
              setSkillDropdownOpen(false);
            }}
            className="h-8 flex items-center gap-2 px-3 rounded-full bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 text-xs font-semibold text-[#edeef2] light:text-slate-800 transition-all max-w-[160px] sm:max-w-none truncate"
          >
            <span className="w-2 h-2 rounded-full bg-[#6C63FF] shrink-0" />
            <span className="truncate">{activeModel.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#565d6e] shrink-0" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#0d0f17] light:bg-white border border-white/15 light:border-slate-200 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#565d6e] tracking-wider font-semibold">
                Select Model
              </div>
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id);
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex flex-col gap-0.5 transition-colors ${
                    m.id === selectedModel
                      ? 'bg-[#6C63FF]/20 text-[#edeef2] font-semibold border border-[#6C63FF]/40'
                      : 'text-[#8b93a7] hover:bg-white/5 light:hover:bg-slate-100 hover:text-[#edeef2]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{m.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[#6C63FF]">
                      {m.tag}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#565d6e] font-normal truncate">
                    {m.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Persona Preset Dropdown */}
        <div className="relative" ref={skillRef}>
          <button
            onClick={() => {
              setSkillDropdownOpen(!skillDropdownOpen);
              setModelDropdownOpen(false);
            }}
            className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 text-xs font-semibold text-[#edeef2] light:text-slate-800 transition-all max-w-[140px] sm:max-w-none truncate"
          >
            <span className="text-amber-400 font-bold">{activeSkill.icon}</span>
            <span className="truncate">{activeSkill.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#565d6e] shrink-0" />
          </button>

          {skillDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 max-h-80 overflow-y-auto bg-[#0d0f17] light:bg-white border border-white/15 light:border-slate-200 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#565d6e] tracking-wider font-semibold">
                Persona Preset
              </div>
              {SKILLS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectSkill(s.id);
                    setSkillDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                    s.id === selectedSkillId
                      ? 'bg-[#6C63FF]/20 text-[#edeef2] font-semibold border border-[#6C63FF]/40'
                      : 'text-[#8b93a7] hover:bg-white/5 light:hover:bg-slate-100 hover:text-[#edeef2]'
                  }`}
                >
                  <span className="text-base text-amber-400 w-5 text-center shrink-0">
                    {s.icon}
                  </span>
                  <div className="flex-1 truncate">
                    <div className="font-semibold truncate">{s.label}</div>
                    <div className="text-[10px] text-[#565d6e] font-normal truncate">
                      {s.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Topbar Right Controls (Aligned Uniform Height h-8) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Streaming Signal Animation Indicator */}
        <div
          className={`flex items-center gap-0.5 h-8 px-1.5 rounded-lg ${
            isStreaming ? 'opacity-100' : 'opacity-20'
          } transition-opacity`}
          title={isStreaming ? 'Generating response...' : 'Idle'}
        >
          <div className={`w-0.75 bg-[#6C63FF] rounded-full ${isStreaming ? 'animate-signal-1' : 'h-1.5'}`} />
          <div className={`w-0.75 bg-[#6C63FF] rounded-full ${isStreaming ? 'animate-signal-2' : 'h-3'}`} />
          <div className={`w-0.75 bg-[#6C63FF] rounded-full ${isStreaming ? 'animate-signal-3' : 'h-2'}`} />
        </div>

        {/* Voice Mode Button */}
        {onOpenVoiceMode && (
          <button
            onClick={onOpenVoiceMode}
            className="h-8 px-3 rounded-full bg-gradient-to-r from-[#6C63FF]/20 to-[#8B5CF6]/20 hover:from-[#6C63FF]/30 hover:to-[#8B5CF6]/30 border border-[#6C63FF]/40 text-xs font-semibold text-[#6C63FF] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Start Hands-Free Voice Mode"
          >
            <Mic className="w-3.5 h-3.5 text-[#6C63FF]" />
            <span className="hidden sm:inline">Voice</span>
          </button>
        )}

        {/* Prompt Tuning Toggle */}
        <button
          onClick={onToggleTuning}
          className={`h-8 px-3 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
            isTuningOpen
              ? 'bg-[#6C63FF]/20 border-[#6C63FF]/50 text-[#6C63FF]'
              : 'bg-white/5 light:bg-slate-100 border-white/10 light:border-slate-200 text-[#8b93a7] hover:text-[#edeef2]'
          }`}
          title="System Prompt & Tuning"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Tune</span>
        </button>

        {/* Settings Modal Toggle */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="h-8 w-8 rounded-xl bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 text-[#8b93a7] hover:text-[#edeef2] light:hover:text-slate-900 transition-colors flex items-center justify-center"
            title="Open Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Clear Chat */}
        <button
          onClick={onClearChat}
          className="h-8 w-8 rounded-xl bg-white/5 light:bg-slate-100 hover:bg-red-500/10 border border-white/10 light:border-slate-200 text-[#8b93a7] hover:text-red-400 transition-colors flex items-center justify-center"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
