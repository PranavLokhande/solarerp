import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { Sun, Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, login, switchDemoPersona, isLoading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('admin@heliosops.com');
  const [password, setPassword] = useState('Admin@2026');
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard immediately
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(identifier, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleDemoSwitch = async (email: string) => {
    setError(null);
    try {
      await switchDemoPersona(email);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-solar-500 text-navy-950 font-bold shadow-lg shadow-solar-500/20 mb-4">
          <Sun className="w-8 h-8 animate-spin-slow" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Helios<span className="text-solar-400">Ops</span> ERP
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enterprise Operating System for Indian Rooftop Solar EPC
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email or Employee ID</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-solar-500"
                  placeholder="admin@heliosops.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-solar-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-navy-950 bg-solar-500 hover:bg-solar-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-500 transition disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Operating System'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-2">
              <Shield className="w-3.5 h-3.5 text-solar-500" />
              <span>One-Click Role Demonstration Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              {DEMO_PERSONAS.slice(0, 6).map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleDemoSwitch(p.email)}
                  className="p-2 border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:bg-solar-50 hover:border-solar-300 transition truncate"
                >
                  <div className="font-semibold text-slate-900 truncate">{p.role}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
