import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#030712] dark:via-[#030712]/95 dark:to-transparent border-t border-slate-200/80 dark:border-sky-950/50 pb-4 sm:pb-5 transition-colors">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
        <div className="relative flex items-end bg-slate-50 dark:bg-[#0c1427]/90 border border-slate-300 dark:border-sky-900/50 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-black/40 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all backdrop-blur-xl">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about SNU requirements, faculties, tuition, deadlines..."
            disabled={disabled}
            className="w-full py-3.5 pl-4 pr-14 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none resize-none max-h-32 custom-scrollbar leading-relaxed"
          />

          <button
            type="submit"
            disabled={!input.trim() || disabled}
            aria-label="Send message"
            className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-30 disabled:hover:from-sky-500 disabled:hover:to-blue-600 text-white transition-all shadow-md shadow-sky-600/30 active:scale-95 flex items-center justify-center"
          >
            {disabled ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Footer Hint / Brand Note */}
        <div className="flex items-center justify-between mt-2 px-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
            <span className="truncate">Jaamacadda Ummadda Soomaaliyeed • Admissions 2026</span>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-slate-400 dark:text-slate-600 flex-shrink-0 ml-2">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400">Enter ↵</kbd> to send
          </span>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
