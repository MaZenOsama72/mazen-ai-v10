import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Square, X, Settings2, Play, Pause, Radio, Sparkles } from 'lucide-react';

export interface VoiceSettings {
  lang: string; // 'ar-EG' | 'en-US'
  speed: number; // 0.8 - 1.5
  volume: number; // 0 - 1
  isMuted: boolean;
  autoListen: boolean; // Continuous voice mode
}

const STORAGE_VOICE_SETTINGS_KEY = 'mazen_ai_voice_settings_v3';

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  lang: 'ar-EG',
  speed: 1.0,
  volume: 1.0,
  isMuted: false,
  autoListen: true,
};

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  lastAssistantMessage: string | null;
  onStopStreaming: () => void;
}

export const VoiceModeOverlay: React.FC<VoiceModeOverlayProps> = ({
  isOpen,
  onClose,
  isStreaming,
  onSendMessage,
  lastAssistantMessage,
  onStopStreaming,
}) => {
  // Voice Settings State
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOICE_SETTINGS_KEY);
      return saved ? { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_VOICE_SETTINGS;
    } catch {
      return DEFAULT_VOICE_SETTINGS;
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcriptText, setTranscriptText] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const lastSpokenMsgRef = useRef<string | null>(null);

  // Save settings in localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_VOICE_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Load available Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Try to match Egyptian or Arabic voice
        const arabicVoice =
          voices.find((v) => v.lang === 'ar-EG') ||
          voices.find((v) => v.lang.startsWith('ar')) ||
          voices.find((v) => v.name.toLowerCase().includes('arabic'));

        if (arabicVoice) {
          setSelectedVoice(arabicVoice);
        } else if (voices.length > 0) {
          setSelectedVoice(voices[0]);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  // Update Voice selection when language setting changes
  useEffect(() => {
    if (availableVoices.length === 0) return;
    if (settings.lang.startsWith('ar')) {
      const arVoice =
        availableVoices.find((v) => v.lang === 'ar-EG') ||
        availableVoices.find((v) => v.lang.startsWith('ar')) ||
        availableVoices[0];
      if (arVoice) setSelectedVoice(arVoice);
    } else {
      const enVoice =
        availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0];
      if (enVoice) setSelectedVoice(enVoice);
    }
  }, [settings.lang, availableVoices]);

  // Handle Speech Recognition setup & lifecycle
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    if (status === 'listening') {
      setStatus('idle');
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    if (status === 'speaking') {
      setStatus('idle');
    }
  };

  const startListening = () => {
    stopSpeaking();
    onStopStreaming();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser environment.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = settings.lang;

      recognition.onstart = () => {
        setStatus('listening');
        setTranscriptText('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscriptText(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setStatus('idle');
        }
      };

      recognition.onend = () => {
        if (transcriptText.trim()) {
          const textToSend = transcriptText.trim();
          setTranscriptText('');
          setStatus('thinking');
          onSendMessage(textToSend);
        } else {
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setStatus('idle');
    }
  };

  // Sync state with streaming AI response
  useEffect(() => {
    if (isStreaming) {
      stopSpeaking();
      setStatus('thinking');
    }
  }, [isStreaming]);

  // Speak AI response when generation completes
  useEffect(() => {
    if (!isOpen) return;

    if (!isStreaming && lastAssistantMessage && lastAssistantMessage !== lastSpokenMsgRef.current) {
      lastSpokenMsgRef.current = lastAssistantMessage;

      if (!settings.isMuted && synthRef.current) {
        stopSpeaking();

        // Strip Markdown tags for clean speech output
        const cleanText = lastAssistantMessage
          .replace(/```[\s\S]*?```/g, 'Code block omitted.')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/[*_~#]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .trim();

        if (cleanText) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = settings.lang;
          utterance.rate = settings.speed;
          utterance.volume = settings.volume;

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          utterance.onstart = () => {
            setStatus('speaking');
          };

          utterance.onend = () => {
            setStatus('idle');
            // Continuous hands-free loop: resume listening automatically!
            if (settings.autoListen && isOpen) {
              setTimeout(() => {
                startListening();
              }, 400);
            }
          };

          utterance.onerror = () => {
            setStatus('idle');
          };

          synthRef.current.speak(utterance);
        } else if (settings.autoListen && isOpen) {
          setTimeout(() => {
            startListening();
          }, 400);
        }
      } else if (settings.autoListen && isOpen) {
        setTimeout(() => {
          startListening();
        }, 400);
      }
    }
  }, [isStreaming, lastAssistantMessage, isOpen]);

  // Start listening automatically when opening Voice Mode if idle
  useEffect(() => {
    if (isOpen && status === 'idle' && !isStreaming) {
      const timer = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c10]/90 light:bg-[#f5f4f0]/90 backdrop-blur-2xl animate-msg-in">
      <div className="relative w-full max-w-lg bg-[#12151d] light:bg-white border border-white/15 light:border-black/15 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            stopListening();
            stopSpeaking();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 light:bg-black/5 hover:bg-white/10 light:hover:bg-black/10 border border-white/10 light:border-black/10 text-[#8b93a7] light:text-[#475569] hover:text-[#edeef2] transition-colors"
          title="Exit Voice Mode"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b7fe8]/15 border border-[#8b7fe8]/30 text-xs font-mono font-semibold text-[#8b7fe8] light:text-[#6366f1] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MAZEN AI Voice Mode · Arabic & English (ar-EG / en-US)</span>
        </div>

        {/* Central Audio Wave & Status Visualizer */}
        <div className="relative my-8 flex items-center justify-center">
          {/* Animated Wave Rings */}
          {status === 'listening' && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-[#8b7fe8]/20 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full bg-[#8b7fe8]/30 animate-pulse" />
            </>
          )}

          {status === 'thinking' && (
            <div className="absolute w-32 h-32 rounded-full bg-amber-500/20 animate-pulse" />
          )}

          {status === 'speaking' && (
            <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '1.8s' }} />
          )}

          {/* Core Interactive Mic Sphere */}
          <button
            onClick={() => {
              if (status === 'listening') {
                stopListening();
              } else if (status === 'speaking') {
                stopSpeaking();
              } else {
                startListening();
              }
            }}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl cursor-pointer ${
              status === 'listening'
                ? 'bg-gradient-to-br from-[#8b7fe8] to-[#f0a860] text-white scale-110 shadow-[#8b7fe8]/40'
                : status === 'speaking'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-400 text-white scale-105 shadow-emerald-500/40'
                : status === 'thinking'
                ? 'bg-gradient-to-br from-amber-500 to-orange-400 text-white animate-pulse'
                : 'bg-white/10 light:bg-black/10 text-[#edeef2] light:text-[#1b1e27] hover:scale-105 border border-white/20'
            }`}
          >
            {status === 'listening' ? (
              <Mic className="w-10 h-10 animate-pulse" />
            ) : status === 'speaking' ? (
              <div className="flex items-center gap-1 h-8">
                <span className="w-1.5 h-6 bg-white rounded-full animate-pulse" />
                <span className="w-1.5 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <span className="w-1.5 h-7 bg-white rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
              </div>
            ) : status === 'thinking' ? (
              <Radio className="w-10 h-10 animate-spin" />
            ) : (
              <MicOff className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Status Label & Transcript */}
        <div className="space-y-2 mb-6 w-full">
          <div className="text-lg font-display font-semibold text-[#edeef2] light:text-[#1b1e27]">
            {status === 'listening' && 'Listening... Speak now'}
            {status === 'thinking' && 'Thinking & processing...'}
            {status === 'speaking' && 'AI Assistant is Speaking...'}
            {status === 'idle' && 'Tap microphone to talk'}
          </div>

          {transcriptText && (
            <p className="text-sm font-sans italic text-amber-300 light:text-amber-700 bg-white/5 light:bg-black/5 px-4 py-2 rounded-xl border border-white/10">
              "{transcriptText}"
            </p>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          {/* Mute / Unmute */}
          <button
            onClick={() => setSettings((s) => ({ ...s, isMuted: !s.isMuted }))}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-semibold ${
              settings.isMuted
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-white/5 light:bg-black/5 text-[#edeef2] light:text-[#1b1e27] border-white/10 hover:bg-white/10'
            }`}
            title="Toggle AI Speech Output"
          >
            {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{settings.isMuted ? 'Muted' : 'Voice On'}</span>
          </button>

          {/* Continuous Hands-Free Switch */}
          <button
            onClick={() => setSettings((s) => ({ ...s, autoListen: !s.autoListen }))}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-semibold ${
              settings.autoListen
                ? 'bg-[#8b7fe8]/20 text-[#8b7fe8] light:text-[#6366f1] border-[#8b7fe8]/40'
                : 'bg-white/5 light:bg-black/5 text-[#8b93a7] border-white/10'
            }`}
            title="Continuous Hands-Free Conversation"
          >
            <Radio className="w-4 h-4" />
            <span>{settings.autoListen ? 'Hands-Free On' : 'Push-to-Talk'}</span>
          </button>

          {/* Settings Drawer Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-2xl bg-white/5 light:bg-black/5 hover:bg-white/10 border border-white/10 text-[#edeef2] light:text-[#1b1e27] transition-all"
            title="Voice Customization"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Voice Customization Panel */}
        {showSettings && (
          <div className="w-full text-left bg-white/5 light:bg-black/5 border border-white/10 light:border-black/10 rounded-2xl p-4 space-y-4 animate-msg-in">
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#8b93a7] mb-1">
                Recognition & Speech Language
              </label>
              <select
                value={settings.lang}
                onChange={(e) => setSettings((s) => ({ ...s, lang: e.target.value }))}
                className="w-full bg-[#12151d] light:bg-white border border-white/15 light:border-black/15 rounded-xl px-3 py-2 text-xs text-[#edeef2] light:text-[#1b1e27] focus:outline-none"
              >
                <option value="ar-EG">Egyptian Arabic (اللهجة المصرية - ar-EG)</option>
                <option value="ar-SA">Standard Arabic (العربية - ar-SA)</option>
                <option value="en-US">English (US - en-US)</option>
              </select>
            </div>

            {/* Voice Speed Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#8b93a7]">Voice Speed</span>
                <span className="text-amber-400 font-bold">{settings.speed}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={settings.speed}
                onChange={(e) => setSettings((s) => ({ ...s, speed: parseFloat(e.target.value) }))}
                className="w-full accent-[#8b7fe8]"
              />
            </div>

            {/* Volume Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#8b93a7]">Volume</span>
                <span className="text-amber-400 font-bold">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.volume}
                onChange={(e) => setSettings((s) => ({ ...s, volume: parseFloat(e.target.value) }))}
                className="w-full accent-[#8b7fe8]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
