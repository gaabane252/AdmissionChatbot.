import React, { useState, useMemo } from 'react';
import { Plus, LogOut, User, Search, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SnuLogo from '../ui/SnuLogo';

const ConversationSidebar = ({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  mobileOpen,
  setMobileOpen
}) => {
  const { user, profile, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(c =>
      (c.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const grouped = useMemo(() => {
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfThisWeek = startOfToday - (7 * 86400000);

    filteredConversations.forEach((c) => {
      const time = new Date(c.created_at || c.updated_at || Date.now()).getTime();
      if (time >= startOfToday) {
        today.push(c);
      } else if (time >= startOfYesterday) {
        yesterday.push(c);
      } else if (time >= startOfThisWeek) {
        thisWeek.push(c);
      } else {
        older.push(c);
      }
    });

    return { today, yesterday, thisWeek, older };
  }, [filteredConversations]);

  const renderGroup = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {title}
          </span>
        </div>
        <div className="space-y-0.5">
          {items.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                className={`group relative flex items-center rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/25'
                    : 'border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <button
                  onClick={() => {
                    onSelectConversation(conv.id);
                    setMobileOpen(false);
                  }}
                  className="flex-1 text-left px-3 py-2 text-xs truncate"
                >
                  <span className={`font-medium truncate block ${
                    isActive
                      ? 'text-sky-700 dark:text-sky-300'
                      : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                    {conv.title || 'New Chat Session'}
                  </span>
                </button>

                {onDeleteConversation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    title="Delete"
                    className="opacity-0 group-hover:opacity-100 p-1.5 mr-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-md transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 w-64 h-full flex flex-col bg-white dark:bg-[#0b1120] border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ boxShadow: '4px 0 24px 0 rgba(0,0,0,0.10)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <SnuLogo className="w-8 h-8" />
            <div>
              <h1 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                SNU AI Portal
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                Jaamacadda Ummadda
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 py-3">
          <button
            onClick={() => {
              onNewChat();
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white font-semibold text-xs transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Admission Chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
          {filteredConversations.length > 0 ? (
            <>
              {renderGroup('Today', grouped.today)}
              {renderGroup('Yesterday', grouped.yesterday)}
              {renderGroup('Previous 7 Days', grouped.thisWeek)}
              {renderGroup('Older', grouped.older)}
            </>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {searchQuery ? 'No matching chats' : 'No past conversations'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {searchQuery ? 'Try a different keyword' : 'Start your first inquiry above'}
              </p>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'Student'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-md transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ConversationSidebar;
