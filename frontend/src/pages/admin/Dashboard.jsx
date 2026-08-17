import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Users, MessageSquare, ShieldCheck, ArrowUpRight, Cpu, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import SnuLogo from '../../components/ui/SnuLogo';

const Dashboard = () => {
  const [stats, setStats] = useState({
    documents: 0,
    users: 0,
    conversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [docsRes, usersRes, convsRes] = await Promise.all([
        supabase.from('documents').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        documents: docsRes.count || 0,
        users: usersRes.count || 0,
        conversations: convsRes.count || 0,
      });
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Knowledge Base Documents',
      count: stats.documents,
      icon: FileText,
      color: 'bg-white border-slate-200 text-sky-700 dark:bg-gradient-to-b dark:from-sky-500/20 dark:to-blue-600/10 dark:border-sky-500/30 dark:text-sky-400',
      iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
      link: '/admin/documents',
      desc: 'Official SNU PDF sources',
    },
    {
      title: 'Registered Applicants',
      count: stats.users,
      icon: Users,
      color: 'bg-white border-slate-200 text-amber-700 dark:bg-gradient-to-b dark:from-amber-500/20 dark:to-yellow-600/10 dark:border-amber-500/30 dark:text-amber-400',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
      link: '#',
      desc: 'Active student profiles',
    },
    {
      title: 'AI Admission Inquiries',
      count: stats.conversations,
      icon: MessageSquare,
      color: 'bg-white border-slate-200 text-emerald-700 dark:bg-gradient-to-b dark:from-emerald-500/20 dark:to-teal-600/10 dark:border-emerald-500/30 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
      link: '#',
      desc: 'Total chat sessions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gradient-to-r dark:from-[#0c1427] dark:to-[#070e1c] p-6 rounded-3xl border border-slate-200 dark:border-sky-950/80 shadow-md dark:shadow-xl transition-colors">
        <div className="flex items-center gap-4">
          <SnuLogo className="w-12 h-12 shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
              SNU Administration Portal
            </h1>
            <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold">
              Jaamacadda Ummadda Soomaaliyeed • Admissions AI Control Center
            </p>
          </div>
        </div>

        <Link
          to="/admin/documents"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all active:scale-95 border border-sky-400/30 self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Knowledge Base</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`${card.color} rounded-2xl p-5 border backdrop-blur-xl relative overflow-hidden group hover:translate-y-[-2px] transition-all shadow-sm hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-display">
                  {loading ? '...' : card.count}
                </span>
                {card.link !== '#' ? (
                  <Link
                    to={card.link}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 font-bold"
                  >
                    View <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{card.desc}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RAG & System Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0b1325]/90 border border-slate-200 dark:border-sky-950/80 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Database Security & RLS</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Row Level Security Policies Active</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All student conversation histories and admin knowledge documents are strictly isolated via Supabase Row-Level Security.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0b1325]/90 border border-slate-200 dark:border-sky-950/80 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Gemini 2.0 Flash RAG Pipeline</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Vector Embedding Search Ready</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            PDF documents uploaded through the management portal are automatically chunked and indexed into 768-dimensional vector embeddings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
