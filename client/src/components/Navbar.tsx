import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { Sun, UserCheck, LogOut, ChevronDown, Bell, Shield, MapPin } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoPersona } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <header className="h-16 bg-navy-950 text-white border-b border-navy-800 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-solar-500 text-navy-950 font-bold shadow">
          <Sun className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight text-white flex items-center space-x-1.5">
            <span>HELIOS</span>
            <span className="text-solar-400 font-extrabold">OPS</span>
            <span className="text-[10px] uppercase font-semibold bg-navy-800 text-solar-300 px-1.5 py-0.5 rounded border border-navy-700 ml-1">
              EPC ERP
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Branch indicator */}
        <div className="hidden md:flex items-center space-x-1 text-xs text-navy-300 bg-navy-900 px-2.5 py-1 rounded border border-navy-800">
          <MapPin className="w-3.5 h-3.5 text-solar-400" />
          <span>{user?.branch?.name || 'Pune Central HQ'}</span>
        </div>

        {/* Demo Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center space-x-2 text-xs font-medium bg-solar-500/10 hover:bg-solar-500/20 text-solar-300 border border-solar-500/30 px-3 py-1.5 rounded-lg transition"
            title="Switch demo role to experience different permission views"
          >
            <UserCheck className="w-3.5 h-3.5 text-solar-400" />
            <span className="hidden sm:inline">Role Switcher:</span>
            <span className="font-semibold text-solar-200">{user?.role || 'Guest'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-solar-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Switch Enterprise Persona</span>
                <Shield className="w-3.5 h-3.5 text-solar-600" />
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {DEMO_PERSONAS.map((p) => (
                  <button
                    key={p.email}
                    onClick={() => {
                      switchDemoPersona(p.email);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition ${
                      user?.email === p.email ? 'bg-solar-50/80 font-bold text-navy-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">{p.label}</div>
                      <div className="text-[10px] text-slate-500">{p.email}</div>
                    </div>
                    {user?.email === p.email && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-navy-800">
          <div className="hidden lg:block text-right">
            <div className="text-xs font-semibold text-slate-100">{user?.fullName}</div>
            <div className="text-[10px] text-navy-300">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-navy-300 hover:text-rose-400 hover:bg-navy-900 rounded-lg transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
