import React, { useState } from 'react';
import { X, Moon, Sun, Volume2, Globe, Shield, Sparkles, Download, Upload, Trash2, Keyboard, Code, Sliders, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onClearAll: () => void;
  fontSize: 'sm' | 'base' | 'lg';
  setFontSize: (size: 'sm' | 'base' | 'lg') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  onExportData,
  onImportData,
  onClearAll,
  fontSize,
  setFontSize,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'voice' | 'data' | 'shortcuts' | 'about'>('general');
  const [importing, setImporting] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportData(e.target.files[0]);
      setImporting(true);
      setTimeout(() => setImporting(false), 1500);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to delete all conversations? This action cannot be undone.')) {
      onClearAll();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0d0f17] light:bg-white border border-white/15 light:border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#6C63FF]/20">
              M
            </div>
            <div>
              <h2 className="text-base font-bold text-[#edeef2] light:text-slate-900 tracking-tight">MAZEN AI Settings</h2>
              <p className="text-[11px] font-mono text-[#8b93a7] light:text-slate-500">Platform Preferences & Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 light:hover:bg-slate-200 text-[#8b93a7] hover:text-[#edeef2] light:hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Navigation Sidebar */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Settings Tabs (Horizontal scroll on mobile, Vertical list on desktop) */}
          <div className="w-full sm:w-48 border-b sm:border-b-0 sm:border-r border-white/10 light:border-slate-200 p-2 sm:p-3 flex sm:flex-col overflow-x-auto sm:overflow-x-visible shrink-0 space-x-1 sm:space-x-0 sm:space-y-1 bg-white/[0.02] light:bg-slate-50/50 no-scrollbar">
            <button
              onClick={() => setActiveTab('general')}
              className={`whitespace-nowrap sm:w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 ${
                activeTab === 'general'
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF] light:bg-[#6C63FF]/10 border border-[#6C63FF]/40'
                  : 'text-[#8b93a7] light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-[#edeef2]'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" /> General
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`whitespace-nowrap sm:w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 ${
                activeTab === 'voice'
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF] light:bg-[#6C63FF]/10 border border-[#6C63FF]/40'
                  : 'text-[#8b93a7] light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-[#edeef2]'
              }`}
            >
              <Volume2 className="w-4 h-4 shrink-0" /> Voice & Speech
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`whitespace-nowrap sm:w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 ${
                activeTab === 'data'
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF] light:bg-[#6C63FF]/10 border border-[#6C63FF]/40'
                  : 'text-[#8b93a7] light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-[#edeef2]'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" /> Data & Export
            </button>

            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`whitespace-nowrap sm:w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 ${
                activeTab === 'shortcuts'
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF] light:bg-[#6C63FF]/10 border border-[#6C63FF]/40'
                  : 'text-[#8b93a7] light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-[#edeef2]'
              }`}
            >
              <Keyboard className="w-4 h-4 shrink-0" /> Shortcuts
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`whitespace-nowrap sm:w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 ${
                activeTab === 'about'
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF] light:bg-[#6C63FF]/10 border border-[#6C63FF]/40'
                  : 'text-[#8b93a7] light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-[#edeef2]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" /> About MAZEN AI
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-sm text-[#edeef2] light:text-slate-800 min-w-0">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold mb-1 text-[#edeef2] light:text-slate-900">Appearance Theme</h3>
                  <p className="text-xs text-[#8b93a7] light:text-slate-500 mb-3">Choose how MAZEN AI looks on your screen</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={onToggleTheme}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        theme === 'dark'
                          ? 'border-[#6C63FF] bg-[#6C63FF]/15 text-[#edeef2]'
                          : 'border-white/10 bg-white/5 text-[#8b93a7] hover:border-white/20'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-[#6C63FF]" />
                      <div>
                        <div className="font-semibold text-xs">Dark Theme</div>
                        <div className="text-[10px] text-[#8b93a7]">Charcoal canvas with subtle purple glows</div>
                      </div>
                    </button>

                    <button
                      onClick={onToggleTheme}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        theme === 'light'
                          ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-semibold text-xs">Light Theme</div>
                        <div className="text-[10px] text-slate-500">Clean, crisp off-white atmosphere</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-1 text-[#edeef2] light:text-slate-900">Font Size</h3>
                  <p className="text-xs text-[#8b93a7] light:text-slate-500 mb-3">Adjust response text scale for high legibility</p>
                  <div className="flex gap-2">
                    {(['sm', 'base', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                          fontSize === size
                            ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-[#6C63FF]'
                            : 'border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-100 text-[#8b93a7] light:text-slate-600'
                        }`}
                      >
                        {size === 'sm' ? 'Compact' : size === 'base' ? 'Standard' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#edeef2] light:text-slate-900">Voice Mode Capabilities</h3>
                <p className="text-xs text-[#8b93a7] light:text-slate-500 leading-relaxed">
                  MAZEN AI features hands-free continuous voice conversation with full support for Egyptian Arabic (<code className="font-mono text-[#6C63FF]">ar-EG</code>) and English (<code className="font-mono text-[#6C63FF]">en-US</code>).
                </p>

                <div className="p-4 rounded-2xl bg-white/5 light:bg-slate-50 border border-white/10 light:border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Supported Speech Languages</span>
                    <span className="text-[#6C63FF] font-mono">ar-EG / en-US</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Continuous Hands-Free Mode</span>
                    <span className="text-emerald-400 font-mono">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Speech Synthesis Engine</span>
                    <span className="text-amber-400 font-mono">Native Web Speech API</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#edeef2] light:text-slate-900">Data & Privacy Management</h3>
                <p className="text-xs text-[#8b93a7] light:text-slate-500">
                  Your chat history is saved locally in your browser. You can export your data as JSON or import backup files anytime.
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={onExportData}
                    className="w-full py-3 px-4 rounded-2xl bg-[#6C63FF]/20 hover:bg-[#6C63FF]/30 border border-[#6C63FF]/40 text-[#edeef2] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4 text-[#6C63FF]" /> Export Chat History (JSON)
                  </button>

                  <label className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#edeef2] light:text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-[#6C63FF]" />
                    <span>{importing ? 'Importing conversations...' : 'Import Backup File'}</span>
                    <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                  </label>

                  <button
                    onClick={handleClear}
                    className="w-full py-3 px-4 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Clear All Chat History
                  </button>
                  {clearedNotice && (
                    <p className="text-xs text-emerald-400 text-center font-mono">Chat history successfully cleared.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#edeef2] light:text-slate-900">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200">
                    <span>New Chat</span>
                    <kbd className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[11px]">⌘K / Ctrl+K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200">
                    <span>Send Message</span>
                    <kbd className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[11px]">Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200">
                    <span>New Line</span>
                    <kbd className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[11px]">Shift + Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200">
                    <span>Toggle Web Search</span>
                    <kbd className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[11px]">Globe Icon</kbd>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] p-0.5 mx-auto shadow-xl shadow-[#6C63FF]/30">
                  <div className="w-full h-full bg-[#0d0f17] rounded-[14px] flex items-center justify-center">
                    <span className="font-display font-black text-3xl bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] bg-clip-text text-transparent">
                      M
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#edeef2] light:text-slate-900">MAZEN AI v3.0</h3>
                  <p className="text-xs font-mono text-[#6C63FF] font-semibold mt-1">Next-Generation AI Platform</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 max-w-md mx-auto space-y-2 text-xs text-[#8b93a7] light:text-slate-600">
                  <p className="font-medium text-[#edeef2] light:text-slate-800">Developed by Eng. Mazen Osama</p>
                  <p>Designed for ultra-fast reasoning, real web search integration, code intelligence, and natural voice interaction.</p>
                </div>

                <p className="text-[11px] font-mono text-[#8b93a7]">
                  © 2026 MAZEN AI · Created by Eng. Mazen Osama
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
