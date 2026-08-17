import React, { useState } from 'react';
import { User, Sparkles, ThumbsUp, ThumbsDown, BookOpen, Check, Copy, CheckCheck } from 'lucide-react';
import SnuLogo from '../ui/SnuLogo';

const ChatMessage = ({ message, showSources = false }) => {
  const isUser = message.role === 'user';
  const [feedback, setFeedback] = useState(null); // 'positive' | 'negative' | null
  const [copied, setCopied] = useState(false);

  const handleFeedback = (type) => {
    setFeedback(feedback === type ? null : type);
  };

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Formatting helper for markdown-like text (bold, bullet points, linebreaks)
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const paragraphs = content.split('\n');

    return paragraphs.map((para, pIdx) => {
      if (!para.trim()) {
        return <div key={pIdx} className="h-2" />;
      }

      const isBullet = para.trim().startsWith('•') || para.trim().startsWith('-') || para.trim().startsWith('* ');
      const cleanPara = isBullet ? para.trim().replace(/^[-*•]\s*/, '') : para;

      const parts = cleanPara.split(/(\*\*.*?\*\*)/g);

      const formattedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-bold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={pIdx} className="flex items-start gap-2.5 my-1 pl-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-[0_0_6px_#f59e0b]"></span>
            <span className="leading-relaxed">{formattedLine}</span>
          </div>
        );
      }

      return (
        <p key={pIdx} className="leading-relaxed mb-1.5 last:mb-0">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div
      className={`py-5 px-4 md:px-8 flex gap-3.5 md:gap-4 transition-colors ${
        isUser
          ? 'bg-transparent justify-end'
          : 'bg-white/90 border-y border-slate-200/80 dark:bg-[#0b1325]/70 dark:border-sky-950/60 backdrop-blur-md shadow-sm dark:shadow-none'
      }`}
    >
      <div className={`flex gap-3.5 md:gap-4 max-w-3xl w-full ${isUser ? 'ml-auto justify-end' : 'mr-auto'}`}>
        {/* Assistant Avatar (Official SNU Crest) */}
        {!isUser && (
          <div className="shrink-0 pt-0.5">
            <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-sky-100 to-amber-50 dark:from-sky-900/60 dark:via-slate-900 dark:to-amber-950/40 border border-sky-300 dark:border-sky-500/30 shadow-md shadow-sky-500/10">
              <SnuLogo className="w-8 h-8 md:w-9 md:h-9" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0b1325] rounded-full shadow-[0_0_6px_#10b981]"></span>
            </div>
          </div>
        )}

        {/* Message Bubble Container */}
        <div className={`space-y-2.5 ${isUser ? 'max-w-xl' : 'flex-1'}`}>
          {/* Header info */}
          <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs font-bold ${isUser ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'}`}>
              {isUser ? 'You' : 'SNU Admission AI'}
            </span>
            {!isUser && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800/60 font-semibold uppercase tracking-wider">
                Official Assistant
              </span>
            )}
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {new Date(message.created_at || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Body Content */}
          <div
            className={`text-sm md:text-[14.5px] rounded-2xl px-4 py-3.5 shadow-md leading-relaxed ${
              isUser
                ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-tr-none border border-sky-400/30 shadow-sky-900/20'
                : 'bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800/90'
            }`}
          >
            {renderFormattedContent(message.content)}
          </div>

          {/* AI Message Footer Extras: Verified Sources, Copy, Feedback */}
          {!isUser && (
            <div className="pt-1.5 space-y-2.5">
              {/* Document Sources — admin only */}
              {showSources && message.sources && message.sources.length > 0 && (
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 dark:bg-slate-950/70 dark:border-sky-900/40 text-xs space-y-1.5 shadow-inner">
                  <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>Verified Knowledge Sources</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {message.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-white hover:bg-sky-100/60 text-sky-900 dark:bg-sky-950/80 dark:hover:bg-sky-900/50 dark:text-sky-200 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-sky-200 dark:border-sky-800/60 transition-colors shadow-sm"
                      >
                        <span className="text-amber-500">📄</span> {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-[11px]">Was this helpful?</span>
                  <button
                    onClick={() => handleFeedback('positive')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      feedback === 'positive'
                        ? 'text-emerald-600 bg-emerald-100 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                    title="Helpful response"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback('negative')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      feedback === 'negative'
                        ? 'text-rose-600 bg-rose-100 border border-rose-300 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                  {feedback && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Feedback recorded
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  title="Copy message"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="shrink-0 pt-0.5">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-800 border border-sky-400/40 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <User className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
