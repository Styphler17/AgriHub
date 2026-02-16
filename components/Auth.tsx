import React, { useState, useEffect, useRef } from 'react';
import { Mail, LogIn, Loader2, ArrowLeft, Smartphone } from 'lucide-react';
import { db } from '../db';

interface Props {
  lang: string;
  t: any;
  initialMode?: 'signin' | 'signup';
  onBackToHome?: () => void;
}

const Auth: React.FC<Props> = ({ lang, t, initialMode = 'signup', onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep track of the current Dexie Cloud interaction
  const currentInteraction = useRef<any>(null);

  useEffect(() => {
    // Subscribe to Dexie Cloud interactions
    const subscription = db.cloud.userInteraction.subscribe(interaction => {
      if (!interaction) return;

      currentInteraction.current = interaction;

      if (interaction.type === 'otp') {
        setStep('otp');
        setLoading(false); // Stop spinner once we are ready for OTP
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Start login flow. This will trigger the userInteraction subscription
      await db.cloud.login({ email });

      // If we are signing up, update the profile once login is complete
      if (mode === 'signup') {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const userId = db.cloud.currentUser.getValue()?.userId;
        if (userId && fullName.length > 1) {
          await db.profiles.put({
            id: userId,
            name: fullName,
            location: 'Ghana',
            phoneNumber: phoneNumber,
            role: 'farmer'
          });
        }
      }
    } catch (err: any) {
      if (!err.message?.includes('Interaction cancelled')) {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInteraction.current) {
      setError("Session expired. Please try again.");
      setStep('email');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Submit the OTP via the interaction object
      await currentInteraction.current.onSubmit({ otp });
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please check your email.');
      setLoading(false);
    }
    // Note: If successful, the App state will change and this component will unmount
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Solid Background Image Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
        style={{ backgroundImage: 'url(/og-image.webp)' }}
      />

      {/* Softening Overlay to ensure form readability */}
      <div className="fixed inset-0 bg-white/70 dark:bg-slate-900/80 z-0 pointer-events-none" />

      {/* Gradient Orbs for depth */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse z-0" style={{ animationDuration: '8s' }}></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl animate-pulse z-0" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>

      {/* Main Form Card */}
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white/20 dark:border-slate-700/50 animate-slide-in relative z-10">

        {/* Back to Home Button */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="absolute top-6 left-6 p-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all group"
            aria-label="Back to Home"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300 group-hover:-translate-x-1 transition-transform" />
          </button>
        )}

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.webp" alt="AgriHub Logo" className="w-auto h-16 object-contain" />
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">AgriHub</h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[8px] tracking-widest">Ghana</p>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-widest">Empowering Ghana's Farmers</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-green-600 dark:focus:border-green-500 focus:bg-white dark:focus:bg-slate-700 rounded-[1.2rem] transition-all outline-none font-bold text-slate-700 dark:text-slate-200"
                        placeholder="Afia"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-green-600 dark:focus:border-green-500 focus:bg-white dark:focus:bg-slate-700 rounded-[1.2rem] transition-all outline-none font-bold text-slate-700 dark:text-slate-200"
                        placeholder="Pokuaa"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Smartphone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${phoneNumber ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} size={20} />
                      <input
                        required
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-5 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-green-600 dark:focus:border-green-500 focus:bg-white dark:focus:bg-slate-700 rounded-[1.5rem] transition-all outline-none font-bold text-slate-700 dark:text-slate-200"
                        placeholder="024 XXX XXXX"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${email ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} size={20} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-5 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-green-600 dark:focus:border-green-500 focus:bg-white dark:focus:bg-slate-700 rounded-[1.5rem] transition-all outline-none font-bold text-slate-700 dark:text-slate-200"
                    placeholder="farmer@example.com"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-green-600 dark:bg-green-700 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-green-600/30 hover:bg-green-700 dark:hover:bg-green-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>{mode === 'signup' ? 'Get Started' : 'Sign In'} <LogIn size={24} /></>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                  className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {mode === 'signup' ? (
                    <>Already have an account? <span className="text-green-600 dark:text-green-500">Sign in</span></>
                  ) : (
                    <>New here? <span className="text-green-600 dark:text-green-500">Create account</span></>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                  Enter OTP Code <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">We sent a verification code to <span className="font-bold text-green-600 dark:text-green-400">{email}</span></p>
                <input
                  required
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-green-600 dark:focus:border-green-500 focus:bg-white dark:focus:bg-slate-700 rounded-[1.5rem] transition-all outline-none font-bold text-slate-700 dark:text-slate-200 text-center text-2xl tracking-widest"
                  placeholder="00000000"
                  maxLength={8}
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-green-600 dark:bg-green-700 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-green-600/30 hover:bg-green-700 dark:hover:bg-green-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Verify & Continue <LogIn size={24} /></>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setLoading(false);
                }}
                className="w-full py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Back to Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div >
  );
};

export default Auth;
