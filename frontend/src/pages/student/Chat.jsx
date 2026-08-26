import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import ConversationSidebar from '../../components/history/ConversationSidebar';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import AiLoadingIndicator from '../../components/chat/AiLoadingIndicator';
import SnuLogo from '../../components/ui/SnuLogo';
import ThemeToggle from '../../components/ui/ThemeToggle';
import ThemeToast from '../../components/ui/ThemeToast';
import { Menu, GraduationCap, FileText, DollarSign, Building, Compass } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : '';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const skipFetchRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiLoading]);

  // Pre-warm backend server (wakes up serverless / server if asleep)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    // Prevent overriding optimistic messages during new chat creation
    if (skipFetchRef.current === activeConversationId) {
      skipFetchRef.current = null;
      return;
    }
    fetchMessages(activeConversationId);
  }, [activeConversationId]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setAiLoading(false);
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await supabase.from('conversations').delete().eq('id', convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const handleSendMessage = async (content) => {
    if (!user || !content.trim()) return;

    const trimmedContent = content.trim();

    // 1. Optimistically display user message & show AI loading indicator immediately
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: trimmedContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setAiLoading(true);

    let convId = activeConversationId;

    try {
      // 2. Create conversation in DB if this is a new chat
      if (!convId) {
        const title = trimmedContent.length > 32 ? trimmedContent.substring(0, 32) + '...' : trimmedContent;
        const { data: newConv, error: convErr } = await supabase
          .from('conversations')
          .insert([{ user_id: user.id, title }])
          .select()
          .single();

        if (convErr) throw convErr;
        convId = newConv.id;
        skipFetchRef.current = convId;
        setActiveConversationId(convId);
        setConversations((prev) => [newConv, ...prev]);
      }

      // 3. Insert User Message into Supabase DB
      await supabase
        .from('messages')
        .insert([{ conversation_id: convId, role: 'user', content: trimmedContent }]);

      // 4. Query Express / Netlify Serverless Backend with Gemini RAG pipeline
      let res = null;
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          res = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: trimmedContent,
              conversationId: convId,
              userId: user.id,
            }),
          });

          if (res && res.ok) {
            break; // Successfully got 200 OK from AI Backend
          } else {
            console.warn(`Attempt ${attempts}: Backend returned status ${res?.status}`);
          }
        } catch (fetchErr) {
          console.warn(`Attempt ${attempts} network error reaching backend:`, fetchErr);
        }

        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      try {
        if (res && res.ok) {
          const data = await res.json();
          const aiMsg = data.message || {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.answer,
            sources: data.sources,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, { ...aiMsg, sources: data.sources }]);
        } else {
          throw new Error(`Backend server response not OK`);
        }
      } catch (backendErr) {
        console.warn('Backend server unavailable, executing intelligent Supabase RAG fallback:', backendErr);

        let fallbackAnswer = '';
        let fallbackSources = [];

        try {
          // Direct fallback querying official document chunks from Supabase
          const { data: chunks } = await supabase
            .from('document_chunks')
            .select('content, metadata')
            .limit(5);

          if (chunks && chunks.length > 0) {
            fallbackSources = [...new Set(chunks.map((c) => c.metadata?.file_name || 'Official SNU Document'))];

            const isDocsOrRequirements = /(dukument|shuruud|diiwaangelin|codsan|apply|require|shahaado|waraaq)/i.test(trimmedContent);
            const isFaculties = /(kuliyad|kulliyad|barnaamij|facult|program)/i.test(trimmedContent);
            const isTuition = /(lacag|fiis|fees|tuition|simistar|admin)/i.test(trimmedContent);

            if (isDocsOrRequirements) {
              fallbackAnswer = `Welcome to Somali National University!\n\nSi aad u codsato ama isu diiwaangeliso Jaamacadda Ummadda Soomaaliyeed (SNU), dukumentiyada iyo shuruudaha rasmiga ah ee looga baahan yahay ardayda cusub waa:\n\n* **Shahaadada Dugsiga Sare:** Shahaadada asalka ah ee Dugsiga Sare ee dowladda Soomaaliya aqoonsan tahay (ama shahaado u dhiganta).\n* **Waraaqaha Natiijooyinka (Transcripts):** Nuqullada rasmiga ah ee darajooyinka dugsiga sare.\n* **Sawirro Cabbirka Baasaboorka:** 4 ilaa 6 sawir oo ah cabbirka baasaboorka (background cadi ah).\n* **Kaarka Aqoonsiga / Dhalashada:** Kaarka Aqoonsiga Qaranka ama Shahaadada Dhalashada (ama Baasaboor).\n* **Lacagta Diiwaangelinta:** US$55 oo ah lacagta diiwaangelinta iyo kaarka aqoonsiga.\n* **Foomka Codsiga:** Buuxinta foomka diiwaangelinta online-ka ah.\n\n*Fiiro gaar ah:* Dhammaan barnaamijyada heerka koowaad (Bachelor's) ee SNU waa waxbarasho bilaash ah (tuition-free), kaliya waxaa la bixiyaa kharashka diiwaangelinta iyo maamulka.`;
            } else if (isFaculties) {
              fallbackAnswer = `Welcome to Somali National University!\n\nJaamacadda Ummadda Soomaaliyeed waxay bixisaa 12 kuliyadood oo heerka koowaad ah (Bachelor's):\n\n1. Kuliyadda Beeraha iyo Sayniska Deegaanka (4 Sano)\n2. Kuliyadda Dhaqaalaha iyo Sayniska Maamulka (4 Sano)\n3. Kuliyadda Waxbarashada (4 Sano)\n4. Kuliyadda Injineernimada (4 Sano)\n5. Kuliyadda Cilmiga Caafimaadka iyo Dawada Kulaylaha (4 Sano)\n6. Kuliyadda Luuqadaha (4 Sano)\n7. Kuliyadda Sharciga (4 Sano)\n8. Kuliyadda Daawada iyo Qalliinka (6 Sano)\n9. Kuliyadda Sayniska (4 Sano)\n10. Kuliyadda Shareecada iyo Daraasaadka Islaamka (4 Sano)\n11. Kuliyadda Sayniska Bulshada (4 Sano)\n12. Kuliyadda Daawada Xoolaha iyo Xanaanada Xoolaha (5 Sano)`;
            } else if (isTuition) {
              fallbackAnswer = `Welcome to Somali National University!\n\nDhammaan barnaamijyada heerka koowaad (Bachelor's) ee Jaamacadda Ummadda Soomaaliyeed waa kuwo **bilaash ah (Tuition-Free)**:\n\n* **Lacagta Diiwaangelinta:** US$55 (Registration & ID Card Fee)\n* **Kharashka Maamulka:** US$50 ilaa US$125 simistarkiiba (marka loo eego kuliyadda aad doorato)\n* **Barnaamijka Aasaasiga ah (Foundation Program & English):** US$350 (5 heer oo Ingiriisi ah)`;
            } else {
              fallbackAnswer = `Welcome to Somali National University!\n\nIyadoo lagu saleynayo dukumiintiyada rasmiga ah ee SNU:\n\n${chunks[0]?.content?.slice(0, 450)}...\n\nWixii faahfaahin dheeraad ah booqo snu.edu.so ama kala xiriir Xafiiska Admissions-ka (admissions@snu.edu.so).`;
            }
          }
        } catch (e) {
          console.error('Client RAG fallback error:', e);
        }

        if (!fallbackAnswer) {
          fallbackAnswer = `Welcome to Somali National University!\n\nSi aad u hesho xogta ugu dambaysay ee ku saabsan diiwaangelinta, shuruudaha, iyo kuliyadaha, fadlan la xiriir Xafiiska Aqbalaadda SNU (admissions@snu.edu.so) ama booqo https://snu.edu.so.`;
        }

        const { data: aiMsg } = await supabase
          .from('messages')
          .insert([{ conversation_id: convId, role: 'assistant', content: fallbackAnswer }])
          .select()
          .single();

        setMessages((prev) => [
          ...prev,
          aiMsg || {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fallbackAnswer,
            sources: fallbackSources,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const suggestionCards = [
    {
      icon: FileText,
      title: 'Shuruudaha Aqbalaadda',
      subtitle: 'Admission Requirements',
      text: 'Maxay yihiin dukumentiyada looga baahan yahay diiwaangelinta sanad dugsiyeedka 2026?',
      color: 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10',
    },
    {
      icon: GraduationCap,
      title: 'Kuliyadaha & Barnaamijyada',
      subtitle: 'Faculties & Programs',
      text: 'Waa kuwee kuliyadaha iyo barnaamijyada shahaadada koowaad ee ay bixiso Jaamacadda Ummadda Soomaaliyeed?',
      color: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    },
    {
      icon: DollarSign,
      title: 'Fiiska & Lacag-bixinta',
      subtitle: 'Tuition & Fees',
      text: 'Waa imisa lacagta diiwaangelinta iyo waxbarashada simistarkiiba ee kuliyadaha kala duwan?',
      color: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: Building,
      title: 'Xarumaha & Saacadaha Shaqada',
      subtitle: 'Campuses & Contact',
      text: 'Halkee ayay ku yaallaan xarumaha Jaamacadda Ummadda, maxayse yihiin saacadaha shaqada xafiiska aqbalaadda?',
      color: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10',
    },
  ];

  return (
    <div className="flex w-full h-full bg-slate-100 dark:bg-[#030712] overflow-hidden transition-colors">
      {/* Responsive Conversation Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050b18] overflow-hidden relative transition-colors">
        {/* Top Header Navigation */}
        <header className="h-16 bg-white/90 dark:bg-[#070d1a]/95 border-b border-slate-200 dark:border-sky-950/80 flex items-center justify-between px-3 sm:px-4 md:px-6 z-10 backdrop-blur-xl transition-colors gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <SnuLogo className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white tracking-tight leading-none font-display truncate">
                    SNU AI Assistant
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    2026 Admissions
                  </span>
                </div>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 whitespace-nowrap">
                  <span className="sm:hidden">Jaamacadda Ummadda Soomaaliyeed</span>
                  <span className="hidden sm:inline">Jaamacadda Ummadda Soomaaliyeed • Somali National University</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0">
            <ThemeToggle />
          </div>
        </header>

        {/* Chat Feed Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-sky-950/40 pb-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* AI Thinking / Loading Indicator */}
              {aiLoading && <AiLoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Empty State Hero Greeting */
            <div className="flex flex-col items-center p-4 md:p-8 text-center max-w-3xl mx-auto py-8">
              {/* Emblem with glow halo */}
              <div className="relative mb-5 group">
                <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-2xl group-hover:bg-sky-500/30 transition-all"></div>
                <SnuLogo className="w-20 h-20 md:w-24 md:h-24 relative" />
              </div>

              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-700/50 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-3 shadow-sm">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>Ku soo dhowow Jaamacadda Ummadda Soomaaliyeed</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight font-display">
                Sideen Kuu Caawin Karaa Maanta?
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xl leading-relaxed">
                Weydii wax walba oo ku saabsan shuruudaha diiwaangelinta, kuliyadaha, fiiska waxbarashada, iyo jadwalka imtixaanka ee SNU.
              </p>

              {/* Suggestion Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {suggestionCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(card.text)}
                      className="p-4 rounded-lg bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-700/60 hover:border-sky-400 dark:hover:border-sky-500/50 hover:bg-sky-50/50 dark:hover:bg-[#0f1b33] transition-all group text-left shadow-sm hover:shadow-md active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className={`p-2 rounded-md border ${card.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                            {card.title}
                          </h3>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
                            {card.subtitle}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {card.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Responsive Chat Input Bar */}
        <ChatInput onSendMessage={handleSendMessage} disabled={aiLoading} />
      </div>

      {/* Time-based theme welcome toast */}
      <ThemeToast />
    </div>
  );
};

export default Chat;
