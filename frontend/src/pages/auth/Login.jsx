import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, User, Shield } from 'lucide-react';
import SnuLogo from '../../components/ui/SnuLogo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { loginWithGoogle, loginWithEmail, registerWithEmail, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err.message || 'Galitaanka Google waa fashilmay. Fadlan mar kale isku day.');
      setGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Fadlan buuxi emailka iyo furahaaga sirta ah.');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      if (isRegisterMode) {
        if (!fullName.trim()) {
          setError('Fadlan qor magacaaga oo buuxa.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, fullName.trim());
        navigate('/student/chat');
      } else {
        const data = await loginWithEmail(email, password);
        const userProfile = await fetchProfile(data?.user?.id);
        if (userProfile?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/chat');
        }
      }
    } catch (err) {
      console.error('Email sign in error:', err);
      setError(
        err.message?.includes('Invalid login credentials')
          ? 'Emailka ama furaha sirta ah waa qalad. Fadlan hubi xogtaada.'
          : err.message || 'Galitaanku waa fashilmay. Fadlan hubi xogtaada.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Institutional Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-2 mb-3">
          <SnuLogo className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
          Jaamacadda Ummadda Soomaaliyeed
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
          Dhammaystirka Ogolaanshaha & Hagaha Ardayda • Admission Portal
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full bg-white dark:bg-[#0c1322] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Primary Action: Google 1-Click Fast SSO */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 dark:bg-[#111a2e] dark:hover:bg-[#16233d] text-slate-800 dark:text-slate-100 font-semibold rounded-xl border border-slate-300/90 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-200 shadow-sm active:scale-[0.99] group cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-sky-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.6-1.6-.9-3.6-.9-5.4z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
            )}
            <span className="text-xs sm:text-sm font-semibold">
              {googleLoading ? 'Fadlan sug...' : 'Ku Soo Gal Google (1-Click Sign In)'}
            </span>
          </button>

          {/* Clean Editorial Divider */}
          <div className="relative flex items-center my-5">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
              ama ku gal emailkaaga
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>
        </div>

        {/* Email Credentials Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {/* Full Name field (only if user clicks to register with email) */}
          {isRegisterMode && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Magacaaga oo Buuxa (Full Name)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Axmed Cali Maxamed"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-sm"
                  required={isRegisterMode}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ciwaanka Emailka (Email Address)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arday@snu.edu.so ama emailkaaga"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Furaha Sirta ah (Password)
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={showPassword ? 'Qari furaha sirta ah' : 'Muuji furaha sirta ah'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 py-2.5 sm:py-3 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 dark:active:bg-sky-700 shadow-sm shadow-sky-600/20 hover:shadow-md hover:shadow-sky-600/30 active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegisterMode ? 'Sameyso Koonto Cusub' : 'Gal Koontadaada (Sign In)'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Inline Register Toggle Switch */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {isRegisterMode ? (
            <p>
              Hore ma u lahayd koonto?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError(null);
                }}
                className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Soo Gal Halkan
              </button>
            </p>
          ) : (
            <p>
              Arday cusub ma tahay?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError(null);
                }}
                className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Email ku diiwaangeli
              </button>
              <span className="text-slate-400 dark:text-slate-600 mx-1.5">•</span>
              <span className="text-slate-400 dark:text-slate-500">Toos ugu gal Google</span>
            </p>
          )}
        </div>

        {/* Security & Verification micro-badge */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <Shield className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>Xogtaadu waa mid ammaan ah oo sugan (256-bit SSL)</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
