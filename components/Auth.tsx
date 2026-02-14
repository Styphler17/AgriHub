
import React, { useState } from 'react';
import { User, Language } from '../types';
import { Sprout, Mail, Lock, User as UserIcon, LogIn } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  lang: Language;
  t: any;
}

const Auth: React.FC<Props> = ({ onLogin, lang, t }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, integrate with Firebase Auth
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'Yaw Boateng',
      location: 'Kumasi',
      role: 'farmer'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 animate-slide-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
            <Sprout size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">AgriHub</h1>
          <p className="text-slate-500 font-medium">{isRegistering ? 'Create your account' : 'Welcome back, Farmer'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-600 transition-all outline-none"
                  placeholder="Yaw Boateng"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-600 transition-all outline-none"
                placeholder="yaw@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
              {!isRegistering && <button type="button" className="text-xs text-green-600 font-bold">Forgot?</button>}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-600 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-200 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isRegistering ? 'Sign Up' : 'Login Now'} <LogIn size={20} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-bold text-slate-500"
          >
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Join Hub"}
          </button>
        </div>
        
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center gap-2">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connect with local markets</p>
           <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-green-600 cursor-pointer">G</div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-green-600 cursor-pointer">f</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
