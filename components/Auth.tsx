import React, { useState } from 'react';
import { Sprout, Mail, Lock, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { db } from '../db';

interface Props {
  lang: string;
  t: any;
}

const Auth: React.FC<Props> = ({ lang, t }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await db.cloud.login({ email });
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await db.cloud.login({ email, otp });

      // On success, we wait a beat for the user to be initialized in Dexie Cloud
      // and then save their name to our profiles table
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      // Dexie Cloud login is async and returns after response. 
      // The db.cloud.currentUser will be updated shortly.
      // We can try to get the userId and save the profile.
      const userId = db.cloud.currentUser.getValue()?.userId;
      if (userId && fullName.length > 1) {
        await db.profiles.put({
          id: userId,
          name: fullName,
          location: 'Ghana',
          role: 'farmer'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 animate-slide-in relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ring-8 ring-green-50">
              <Sprout size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">AgriHub</h1>
            <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Empowering Ghana's Farmers</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-[1.2rem] transition-all outline-none font-bold text-slate-700"
                    placeholder="Kojo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-[1.2rem] transition-all outline-none font-bold text-slate-700"
                    placeholder="Asante"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${email ? 'text-green-600' : 'text-slate-400'}`} size={20} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold text-slate-700"
                    placeholder="farmer@example.com"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-green-600/30 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Continue <LogIn size={24} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Enter OTP Code</label>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-xs text-green-600 font-black flex items-center gap-1 hover:underline"
                  >
                    <ArrowLeft size={12} /> Change Email
                  </button>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${otp ? 'text-green-600' : 'text-slate-400'}`} size={20} />
                  <input
                    required
                    autoFocus
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                    className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-[1.5rem] transition-all outline-none font-black text-2xl tracking-[0.5em] text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold text-center mt-4 uppercase">Check your email for the secret code</p>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-green-600/30 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Verify & Login <LogIn size={24} /></>}
              </button>
            </form>
          )}

          <div className="mt-12 text-center space-y-4">
            <div className="h-[1px] bg-slate-100 w-full relative">
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Community Hub</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-4">
              By logging in, you agree to connect with your local farming network and receive market updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

