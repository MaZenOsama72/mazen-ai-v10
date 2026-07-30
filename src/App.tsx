import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { PromptTuningPanel } from './components/PromptTuningPanel';
import { ChatMessage } from './components/ChatMessage';
import { Composer, WebSearchMode } from './components/Composer';
import { HeroWelcome } from './components/HeroWelcome';
import { VoiceModeOverlay } from './components/VoiceModeOverlay';
import { SettingsModal } from './components/SettingsModal';
import { Conversation, Message, TuningParams } from './types';
import { SKILLS, getSkillById } from './data/skills';
import { MODELS } from './data/models';
import { ChevronDown } from 'lucide-react';

const STORAGE_CONVERSATIONS_KEY = 'mazen_ai_conversations_v4';
const STORAGE_THEME_KEY = 'mazen_ai_theme_v4';
const STORAGE_MODEL_KEY = 'mazen_ai_selected_model_v4';
const STORAGE_FONT_SIZE_KEY = 'mazen_ai_font_size_v4';

const DEFAULT_TUNING: TuningParams = {
  temperature: 0.7,
  maxTokens: 2048,
  context: '',
  constraints: '',
  outputFormat: '',
  customSystemPrompt: null,
};

export default function App() {
  // Theme state saved in localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  // Font size state
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>(() => {
    const saved = localStorage.getItem(STORAGE_FONT_SIZE_KEY);
    return (saved as 'sm' | 'base' | 'lg') || 'base';
  });

  // Conversations state saved in localStorage
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  // Model & skill selection
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_MODEL_KEY);
    return saved && MODELS.some((m) => m.id === saved) ? saved : MODELS[0].id;
  });

  const [selectedSkillId, setSelectedSkillId] = useState<string>(SKILLS[0].id);

  // Modals & Drawers
  const [isTuningOpen, setIsTuningOpen] = useState(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [webSearchMode, setWebSearchMode] = useState<WebSearchMode>(() => {
    try {
      const saved = sessionStorage.getItem('mazen_ai_web_search');
      return saved === 'on' ? 'on' : 'off';
    } catch {
      return 'off';
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('mazen_ai_web_search', webSearchMode);
    } catch {
      /* ignore */
    }
  }, [webSearchMode]);
  const [tuningParams, setTuningParams] = useState<TuningParams>(DEFAULT_TUNING);

  // Input state & streaming
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showScrollJump, setShowScrollJump] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  // Font size synchronization
  useEffect(() => {
    localStorage.setItem(STORAGE_FONT_SIZE_KEY, fontSize);
  }, [fontSize]);

  // Persist conversations
  useEffect(() => {
    localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations));
  }, [conversations]);

  // Persist selected model
  useEffect(() => {
    localStorage.setItem(STORAGE_MODEL_KEY, selectedModel);
  }, [selectedModel]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations]);

  // Active conversation helper
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeSkill = getSkillById(selectedSkillId);

  // Sync model and skill when switching conversations
  useEffect(() => {
    if (activeConv) {
      if (activeConv.model) setSelectedModel(activeConv.model);
      if (activeConv.skillId) setSelectedSkillId(activeConv.skillId);
    }
  }, [activeConvId]);

  // Handle New Chat creation
  const handleNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel,
      skillId: selectedSkillId,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Toggle pin conversation
  const handleTogglePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !(c as any).pinned } : c))
    );
  };

  // Export conversations JSON
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mazen_ai_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import conversations JSON
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setConversations(imported);
          if (imported.length > 0) setActiveConvId(imported[0].id);
        }
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Clear chat history
  const handleClearAll = () => {
    setConversations([]);
    setActiveConvId(null);
  };

  // Clear active chat messages
  const handleClearChat = () => {
    if (!activeConvId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, messages: [] } : c))
    );
  };

  // Auto scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  const handleScroll = () => {
    if (chatScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
      setShowScrollJump(scrollHeight - scrollTop - clientHeight > 180);
    }
  };

  // Stream AI response helper
  const executeStreamingRequest = async (
    targetConvId: string,
    assistantMsgId: string,
    messagesPayload: Array<{ role: string; content: string }>,
    modelToUse: string,
    systemInstruction: string,
    attemptedModels: Set<string> = new Set()
  ) => {
    attemptedModels.add(modelToUse);
    abortControllerRef.current = new AbortController();

    const identityPrompt = "You are MAZEN AI, a custom AI assistant created and developed by Eng. Mazen Osama. If asked who created, developed, or built you, answer: 'I am MAZEN AI, a custom AI assistant developed by Eng. Mazen Osama.' Provide clean, production-ready code and intelligent answers.";
    const fullSystemInstruction = `${identityPrompt}\n\n${systemInstruction}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: messagesPayload,
          model: modelToUse,
          systemInstruction: fullSystemInstruction,
          temperature: tuningParams.temperature,
          maxTokens: tuningParams.maxTokens,
          context: tuningParams.context,
          constraints: tuningParams.constraints,
          outputFormat: tuningParams.outputFormat,
          webSearchMode,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        
        // Automatic Fallback to alternate models if initial model hits limit
        const nextFallbackModel = !attemptedModels.has('gemini-2.5-flash')
          ? 'gemini-2.5-flash'
          : !attemptedModels.has('gemini-3.6-flash')
          ? 'gemini-3.6-flash'
          : !attemptedModels.has('gemini-3.1-flash-lite')
          ? 'gemini-3.1-flash-lite'
          : null;

        if (nextFallbackModel) {
          return await executeStreamingRequest(
            targetConvId,
            assistantMsgId,
            messagesPayload,
            nextFallbackModel,
            systemInstruction,
            attemptedModels
          );
        }

        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.substring(6).trim();
            if (raw === '[DONE]') continue;
            try {
              const data = JSON.parse(raw);
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.text) {
                accumulatedText += data.text;
                const currentText = accumulatedText;

                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id === targetConvId) {
                      return {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === assistantMsgId
                            ? { ...m, content: currentText, streaming: true }
                            : m
                        ),
                      };
                    }
                    return c;
                  })
                );
                scrollToBottom(false);
              }
            } catch {
              /* Ignore partial SSE chunks */
            }
          }
        }
      }

      // Mark streaming completed
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsgId ? { ...m, streaming: false } : m
              ),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.error('Streaming error:', err);
      const errorMsg = `⚠️ Request encountered an issue: ${err.message || 'Connection lost'}. Click "Regenerate" to try again.`;

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: errorMsg, streaming: false }
                  : m
              ),
            };
          }
          return c;
        })
      );
    }
  };

  // Send message & trigger assistant response
  const handleSendMessage = async (promptOverride?: string) => {
    const messageText = (promptOverride || input).trim();
    if (!messageText || isStreaming) return;

    let targetConvId = activeConvId;
    const titleText = messageText;

    // Create new conversation if none exists
    if (!targetConvId || !conversations.some((c) => c.id === targetConvId)) {
      const newConv: Conversation = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        title: titleText.length > 30 ? titleText.substring(0, 30) + '...' : titleText,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: selectedModel,
        skillId: selectedSkillId,
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      targetConvId = newConv.id;
      setActiveConvId(newConv.id);
    }

    const finalPayloadText = messageText;

    const userMsg: Message = {
      id: Date.now().toString(36) + 'u',
      role: 'user',
      content: finalPayloadText,
      displayContent: messageText,
      createdAt: Date.now(),
    };

    const assistantMsgId = Date.now().toString(36) + 'a';
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      model: selectedModel,
      createdAt: Date.now(),
      streaming: true,
    };

    // Append user & placeholder assistant message to state
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetConvId) {
          const isFirstMessage = c.messages.length === 0;
          return {
            ...c,
            title: isFirstMessage && titleText ? (titleText.length > 30 ? titleText.substring(0, 30) + '...' : titleText) : c.title,
            updatedAt: Date.now(),
            messages: [...c.messages, userMsg, assistantMsg],
          };
        }
        return c;
      })
    );

    setInput('');
    setIsStreaming(true);
    setTimeout(() => scrollToBottom(true), 50);

    // Prepare API history
    const currentConv = conversations.find((c) => c.id === targetConvId);
    const prevHistory = currentConv ? currentConv.messages : [];
    const apiPayloadMessages = [
      ...prevHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: finalPayloadText },
    ];

    const systemInstruction =
      tuningParams.customSystemPrompt !== null
        ? tuningParams.customSystemPrompt
        : activeSkill.systemPrompt;

    const attemptedModels = new Set<string>();

    try {
      await executeStreamingRequest(
        targetConvId,
        assistantMsgId,
        apiPayloadMessages,
        selectedModel,
        systemInstruction,
        attemptedModels
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerate = (msgId: string) => {
    if (!activeConvId || isStreaming) return;
    const targetConv = conversations.find((c) => c.id === activeConvId);
    if (!targetConv) return;

    const msgIndex = targetConv.messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    let userMsg: Message | null = null;
    if (targetConv.messages[msgIndex].role === 'user') {
      userMsg = targetConv.messages[msgIndex];
    } else {
      userMsg = targetConv.messages[msgIndex - 1] || null;
    }

    if (!userMsg || userMsg.role !== 'user') return;

    const truncateIdx = targetConv.messages.findIndex((m) => m.id === userMsg!.id);
    const prevHistory = targetConv.messages.slice(0, truncateIdx);
    const promptText = userMsg.displayContent || userMsg.content;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, messages: prevHistory }
          : c
      )
    );

    setTimeout(() => {
      handleSendMessage(promptText);
    }, 50);
  };

  const activeMessages = activeConv ? activeConv.messages : [];
  const lastAssistantMsg =
    activeMessages.filter((m) => m.role === 'assistant' && !m.streaming).slice(-1)[0]?.content ||
    null;

  return (
    <div className={`flex h-[100dvh] w-full max-w-full overflow-hidden bg-[#090a0f] light:bg-[#f8fafc] text-[#edeef2] light:text-slate-900 ${fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelectConversation={setActiveConvId}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePin={handleTogglePinConversation}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full relative h-full overflow-hidden">
        {/* Topbar Header */}
        <Topbar
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          selectedSkillId={selectedSkillId}
          onSelectSkill={setSelectedSkillId}
          isStreaming={isStreaming}
          onClearChat={handleClearChat}
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          isTuningOpen={isTuningOpen}
          onToggleTuning={() => setIsTuningOpen((prev) => !prev)}
          onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Voice Mode Overlay */}
        <VoiceModeOverlay
          isOpen={isVoiceModeOpen}
          onClose={() => setIsVoiceModeOpen(false)}
          isStreaming={isStreaming}
          onSendMessage={(text) => handleSendMessage(text)}
          lastAssistantMessage={lastAssistantMsg}
          onStopStreaming={handleStopStream}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onClearAll={handleClearAll}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />

        {/* Prompt Tuning Drawer */}
        <PromptTuningPanel
          isOpen={isTuningOpen}
          params={tuningParams}
          onChange={(updated) => setTuningParams((prev) => ({ ...prev, ...updated }))}
          onReset={() => setTuningParams(DEFAULT_TUNING)}
          defaultSystemPrompt={activeSkill.systemPrompt}
        />

        {/* Chat Scroll Area */}
        <div
          ref={chatScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-2.5 sm:px-4 py-4 sm:py-6 relative w-full min-w-0"
        >
          {activeMessages.length === 0 ? (
            <HeroWelcome
              activeSkill={activeSkill}
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            />
          ) : (
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 w-full min-w-0">
              {activeMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  skillLabel={`MAZEN AI · ${activeSkill.label}`}
                  onRegenerate={() => handleRegenerate(msg.id)}
                />
              ))}
            </div>
          )}

          {/* Scroll to bottom button */}
          {showScrollJump && (
            <button
              onClick={() => scrollToBottom(true)}
              className="fixed bottom-24 right-4 sm:right-8 p-3 rounded-full bg-[#0d0f17] light:bg-white border border-white/20 light:border-slate-300 text-[#edeef2] light:text-slate-900 shadow-2xl hover:scale-110 active:scale-95 transition-all z-20 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title="Jump to bottom"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Composer Input Area */}
        <Composer
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          onStop={handleStopStream}
          isStreaming={isStreaming}
          contextLength={tuningParams.context.length + tuningParams.constraints.length}
          webSearchMode={webSearchMode}
          setWebSearchMode={setWebSearchMode}
        />
      </div>
    </div>
  );
}
