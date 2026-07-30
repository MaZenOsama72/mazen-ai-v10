import React, { useState, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Moon,
  Sun,
  X,
  Search,
  Pin,
  Edit3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onTogglePin?: (id: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePin,
  theme,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Persisted collapse state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mazen_sidebar_collapsed');
      if (saved !== null) {
        return saved === 'true';
      }
      if (typeof window !== 'undefined') {
        return window.innerWidth < 1024; // Default collapsed on tablet
      }
    } catch {
      /* ignore */
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mazen_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    } catch {
      /* ignore */
    }
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const filteredConvs = conversations.filter((c) =>
    (c.title || 'Untitled Conversation').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConvs = filteredConvs.filter((c) => (c as any).pinned);
  const unpinnedConvs = filteredConvs.filter((c) => !(c as any).pinned);
  const sortedUnpinned = [...unpinnedConvs].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title || 'Untitled Conversation');
  };

  const handleSaveRename = (id: string) => {
    if (onRenameConversation && editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`group fixed lg:static inset-y-0 left-0 bg-[#0a0c12]/95 light:bg-[#f8fafc] border-r border-white/10 light:border-slate-200 flex flex-col z-40 backdrop-blur-2xl transition-all duration-300 ease-in-out shrink-0 relative ${
          isOpenMobile
            ? 'translate-x-0 w-[300px]'
            : `-translate-x-full lg:translate-x-0 ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[300px]'}`
        }`}
      >
        {/* Subtle Hover Highlight Strip along the Divider */}
        <div className="hidden lg:block absolute top-0 bottom-0 -right-[1px] w-[2px] bg-transparent group-hover:bg-[#6C63FF]/50 transition-colors duration-200 pointer-events-none z-30" />

        {/* Floating Circular Collapse Toggle Button on the Divider */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0d0f17]/90 light:bg-white/95 backdrop-blur-md border border-white/20 light:border-slate-300/80 text-[#8b93a7] light:text-slate-600 hover:text-[#edeef2] light:hover:text-slate-900 items-center justify-center shadow-md shadow-black/40 hover:border-[#6C63FF]/70 hover:shadow-[0_0_14px_rgba(108,99,255,0.45)] hover:scale-110 active:scale-95 opacity-70 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200 z-50 cursor-pointer"
          title={isCollapsed ? 'Expand sidebar (▶)' : 'Collapse sidebar (◀)'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#6C63FF] stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#8b93a7] hover:text-[#edeef2] stroke-[2.5]" />
          )}
        </button>

        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-white/10 light:border-slate-200 min-h-[57px] overflow-hidden">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo Icon */}
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] p-0.5 flex items-center justify-center shadow-md shadow-[#6C63FF]/25 shrink-0">
              <div className="w-full h-full bg-[#0a0c12] rounded-[14px] flex items-center justify-center">
                <span className="font-display font-black text-lg bg-gradient-to-tr from-[#6C63FF] via-[#8B5CF6] to-[#4F46E5] bg-clip-text text-transparent">
                  M
                </span>
              </div>
            </div>

            {/* Logo Text (Hidden when collapsed on desktop) */}
            {(!isCollapsed || isOpenMobile) && (
              <div className="truncate transition-opacity duration-200">
                <h1 className="font-display font-extrabold text-sm tracking-tight text-[#edeef2] light:text-slate-900 leading-none">
                  MAZEN AI
                </h1>
                <p className="font-mono text-[9px] text-[#6C63FF] tracking-wider uppercase font-semibold mt-0.5">
                  v3.0
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#8b93a7] hover:text-[#edeef2] hover:bg-white/5 transition-colors"
            title="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          {isCollapsed && !isOpenMobile ? (
            <button
              onClick={() => {
                onNewChat();
                onCloseMobile();
              }}
              className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#5b52f0] hover:to-[#7c4dff] text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-[#6C63FF]/25 hover:scale-105 active:scale-95 cursor-pointer"
              title="New Conversation (⌘K)"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={() => {
                onNewChat();
                onCloseMobile();
              }}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#5b52f0] hover:to-[#7c4dff] text-white font-bold text-xs flex items-center justify-between transition-all duration-200 shadow-md shadow-[#6C63FF]/25 active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Conversation</span>
              </div>
              <kbd className="hidden sm:inline-block font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Search Conversations Input (Only in expanded mode) */}
        {(!isCollapsed || isOpenMobile) && (
          <div className="px-3 pb-2 transition-opacity duration-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565d6e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 text-xs text-[#edeef2] light:text-slate-800 placeholder-[#565d6e] focus:outline-none focus:border-[#6C63FF] font-medium"
              />
            </div>
          </div>
        )}

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-3 py-1">
          {/* Pinned Section */}
          {pinnedConvs.length > 0 && (
            <div className="space-y-1">
              {(!isCollapsed || isOpenMobile) && (
                <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#6C63FF] font-semibold flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Pinned
                </div>
              )}
              {pinnedConvs.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeId}
                  isEditing={editingId === conv.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  isCollapsed={isCollapsed && !isOpenMobile}
                  onSelect={() => {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }}
                  onDelete={() => onDeleteConversation(conv.id)}
                  onStartRename={() => handleStartRename(conv)}
                  onSaveRename={() => handleSaveRename(conv.id)}
                  onTogglePin={() => onTogglePin && onTogglePin(conv.id)}
                />
              ))}
            </div>
          )}

          {/* Recent Conversations */}
          <div className="space-y-1">
            {(!isCollapsed || isOpenMobile) && (
              <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#565d6e] light:text-slate-400 flex items-center justify-between">
                <span>Recent Chats</span>
                <span className="text-[10px] bg-white/5 light:bg-slate-200 px-1.5 py-0.5 rounded">
                  {conversations.length}
                </span>
              </div>
            )}

            {sortedUnpinned.length === 0 ? (
              (!isCollapsed || isOpenMobile) && (
                <div className="p-4 text-center text-xs text-[#565d6e] light:text-slate-400 font-mono leading-relaxed">
                  {searchQuery ? 'No matching chats' : 'No previous chats yet'}
                </div>
              )
            ) : (
              sortedUnpinned.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeId}
                  isEditing={editingId === conv.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  isCollapsed={isCollapsed && !isOpenMobile}
                  onSelect={() => {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }}
                  onDelete={() => onDeleteConversation(conv.id)}
                  onStartRename={() => handleStartRename(conv)}
                  onSaveRename={() => handleSaveRename(conv.id)}
                  onTogglePin={() => onTogglePin && onTogglePin(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 light:border-slate-200 space-y-2">
          {isCollapsed && !isOpenMobile ? (
            /* Collapsed Footer: Stacked Icon Buttons */
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onToggleTheme}
                className="w-10 h-10 rounded-xl bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 text-[#8b93a7] light:text-slate-600 hover:text-[#edeef2] light:hover:text-slate-900 border border-white/10 light:border-slate-200 transition-colors flex items-center justify-center cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-[#6C63FF]" />
                )}
              </button>

              <button
                onClick={onOpenSettings}
                className="w-10 h-10 rounded-xl bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 text-[#8b93a7] light:text-slate-600 hover:text-[#edeef2] light:hover:text-slate-900 border border-white/10 light:border-slate-200 transition-colors flex items-center justify-center cursor-pointer"
                title="Open Settings"
              >
                <Settings className="w-4 h-4 text-[#6C63FF]" />
              </button>
            </div>
          ) : (
            /* Expanded Footer: Horizontal Row */
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleTheme}
                  className="p-2.5 rounded-xl bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 text-[#8b93a7] light:text-slate-600 hover:text-[#edeef2] light:hover:text-slate-900 border border-white/10 light:border-slate-200 transition-colors flex items-center justify-center gap-2 text-xs font-semibold flex-1 cursor-pointer"
                  title="Toggle Dark/Light Mode"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-[#6C63FF]" />
                      <span>Dark</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onOpenSettings}
                  className="p-2.5 rounded-xl bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 text-[#8b93a7] light:text-slate-600 hover:text-[#edeef2] light:hover:text-slate-900 border border-white/10 light:border-slate-200 transition-colors flex items-center justify-center gap-2 text-xs font-semibold flex-1 cursor-pointer"
                  title="Open Settings"
                >
                  <Settings className="w-4 h-4 text-[#6C63FF]" />
                  <span>Settings</span>
                </button>
              </div>

              <div className="px-2 pt-1 text-center">
                <p className="text-[10px] font-mono text-[#565d6e] light:text-slate-400">
                  MAZEN AI v3.0
                </p>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  isCollapsed: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onStartRename: () => void;
  onSaveRename: () => void;
  onTogglePin: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conv,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  isCollapsed,
  onSelect,
  onDelete,
  onStartRename,
  onSaveRename,
  onTogglePin,
}) => {
  const titleText = conv.title || 'Untitled Conversation';

  if (isCollapsed) {
    return (
      <div
        onClick={onSelect}
        title={titleText}
        className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
          isActive
            ? 'bg-[#6C63FF]/20 light:bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/50 shadow-sm'
            : 'text-[#8b93a7] light:text-slate-500 hover:bg-white/5 light:hover:bg-slate-200 hover:text-[#edeef2]'
        }`}
      >
        {(conv as any).pinned ? (
          <Pin className="w-4 h-4 text-[#6C63FF]" />
        ) : (
          <MessageSquare className="w-4 h-4" />
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="px-2 py-1 flex items-center gap-1">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveRename();
          }}
          autoFocus
          className="flex-1 bg-white/10 light:bg-slate-200 border border-[#6C63FF] px-2 py-1 rounded text-xs text-[#edeef2] light:text-slate-900 focus:outline-none font-medium"
        />
        <button
          onClick={onSaveRename}
          className="px-2 py-1 bg-[#6C63FF] text-white rounded text-[11px] font-bold cursor-pointer"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ease-out ${
        isActive
          ? 'bg-[#6C63FF]/15 light:bg-[#6C63FF]/10 text-[#edeef2] light:text-slate-900 border border-[#6C63FF]/35 shadow-sm shadow-[#6C63FF]/10 font-semibold'
          : 'text-[#8b93a7] light:text-slate-600 hover:bg-white/[0.06] light:hover:bg-slate-200/60 hover:text-[#edeef2] light:hover:text-slate-900'
      }`}
    >
      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#6C63FF]' : 'text-[#565d6e]'}`} />

      <span className="truncate flex-1 text-left font-sans">{titleText}</span>

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className="p-1 rounded hover:bg-white/10 text-[#565d6e] hover:text-[#6C63FF] transition-colors"
          title="Pin conversation"
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartRename();
          }}
          className="p-1 rounded hover:bg-white/10 text-[#565d6e] hover:text-[#edeef2] transition-colors"
          title="Rename conversation"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-red-500/20 text-[#565d6e] hover:text-red-400 transition-colors"
          title="Delete conversation"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
