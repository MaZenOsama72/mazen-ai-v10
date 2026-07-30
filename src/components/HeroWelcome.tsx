import React from 'react';
import { Sparkles, Code, PenTool, Search, FileText, BarChart3, Languages, Lightbulb, Compass, ArrowUpRight } from 'lucide-react';
import { Skill } from '../types';

interface HeroWelcomeProps {
  activeSkill: Skill;
  onSelectPrompt: (prompt: string) => void;
}

const QUICK_ACTIONS = [
  { label: 'Code', icon: Code, prompt: 'Write a clean TypeScript function with error handling and types' },
  { label: 'Create', icon: PenTool, prompt: 'Brainstorm creative concepts for a modern tech brand identity' },
  { label: 'Research', icon: Search, prompt: 'Research recent breakthroughs in artificial intelligence and quantum computing' },
  { label: 'Write', icon: FileText, prompt: 'Draft a professional project proposal email to key stakeholders' },
  { label: 'Analyze', icon: BarChart3, prompt: 'Analyze key architectural trade-offs between SQL and NoSQL databases' },
  { label: 'Translate', icon: Languages, prompt: 'Translate technical documentation into fluent Egyptian Arabic' },
  { label: 'Summarize', icon: FileText, prompt: 'Summarize key principles of effective system architecture' },
  { label: 'Generate Ideas', icon: Lightbulb, prompt: 'Generate 5 innovative full-stack web application ideas' },
];

export const HeroWelcome: React.FC<HeroWelcomeProps> = ({
  activeSkill,
  onSelectPrompt,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-10 px-3 sm:px-6 text-center space-y-5 sm:space-y-7 animate-msg-in w-full min-w-0 overflow-x-hidden">
      {/* Central Modern MAZEN AI Emblem (+15% larger, tight glow) */}
      <div className="relative inline-flex items-center justify-center">
        {/* Glow halo */}
        <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-[#6C63FF]/30 via-[#8B5CF6]/25 to-[#4F46E5]/30 blur-2xl animate-pulse" />
        
        {/* MA Logo Container */}
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] p-0.5 shadow-2xl shadow-[#6C63FF]/35">
          <div className="w-full h-full bg-[#090a10] light:bg-[#ffffff] rounded-[14px] sm:rounded-[22px] flex items-center justify-center">
            <span className="font-display font-black text-3xl sm:text-5xl bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] bg-clip-text text-transparent tracking-tight">
              M
            </span>
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-2 sm:space-y-3 max-w-xl mx-auto px-2">
        <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-[#edeef2] light:text-slate-900 leading-tight">
          How can <span className="bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] bg-clip-text text-transparent">MAZEN AI</span> help you today?
        </h1>
      </div>

      {/* Quick Action Badges with Glow */}
      <div className="max-w-2xl mx-auto space-y-2.5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#565d6e] light:text-slate-400 font-semibold">
          Quick Actions
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_ACTIONS.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt(action.prompt)}
                className="group flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-white/5 light:bg-slate-100/90 border border-white/10 light:border-slate-200 hover:border-[#6C63FF]/60 hover:bg-[#6C63FF]/15 text-xs font-semibold text-[#edeef2] light:text-slate-800 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-[#6C63FF]/15 active:scale-95 cursor-pointer min-h-[38px] sm:min-h-0"
              >
                <Icon className="w-3.5 h-3.5 text-[#6C63FF] group-hover:scale-110 transition-transform shrink-0" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Persona Starters */}
      <div className="space-y-3 text-left max-w-2xl mx-auto pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-[#565d6e] light:text-slate-400">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#6C63FF]" />
            <span>Recommended for {activeSkill.label}</span>
          </div>
          <span className="text-[10px] bg-white/5 light:bg-slate-200 px-2 py-0.5 rounded-full border border-white/10 light:border-slate-300">
            {activeSkill.promptStarters.length} suggestions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeSkill.promptStarters.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(starter)}
              className="group relative p-3.5 rounded-xl bg-[#0e1017] light:bg-white border border-white/10 light:border-slate-200 hover:border-[#6C63FF]/60 hover:shadow-md hover:shadow-[#6C63FF]/10 text-left text-xs font-medium text-[#edeef2] light:text-slate-800 hover:bg-white/[0.06] light:hover:bg-slate-50 transition-all duration-200 flex flex-col justify-between min-h-[85px] cursor-pointer"
            >
              <span className="line-clamp-2 leading-relaxed pr-5 text-xs sm:text-sm">{starter}</span>
              
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 light:border-slate-100 text-[10px] font-mono text-[#565d6e] light:text-slate-500">
                <span>Tap to launch</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#565d6e] group-hover:text-[#6C63FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
