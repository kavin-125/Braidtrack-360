/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Cpu, 
  Users, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  Settings, 
  LogOut, 
  Clock, 
  ChevronRight,
  User as UserIcon,
  Phone,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  Wrench,
  ArrowLeft,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

import { Machine, Operator, User, UserRole, MachineStatus } from './types';
import { MOCK_MACHINES, MOCK_OPERATORS, MOCK_ISSUES, ISSUE_TYPES } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100 + 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${Math.random() * 10 + 15}s`,
          }}
        />
      ))}
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen relative animate-gradient overflow-x-hidden">
    <ParticleBackground />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const Counter = ({ value, duration = 2, prefix = "", suffix = "" }: { value: number; duration?: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentCount = Math.floor(progress * (endValue - startValue) + startValue);
      setCount(currentCount);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg"
        >
          <GlassCard className="p-8 border-white/10 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            {children}
          </GlassCard>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const GlassCard = ({ children, className, hover = true, ...props }: { children: React.ReactNode; className?: string; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("glass rounded-2xl p-6", hover && "glass-hover", className)} {...props}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: MachineStatus }) => {
  const config = {
    running: { color: 'bg-neon-green', text: 'Running', glow: 'neon-glow-green', pulse: '' },
    off: { color: 'bg-silver', text: 'Off', glow: '', pulse: '' },
    issue: { color: 'bg-neon-orange', text: 'Issue', glow: 'neon-glow-orange', pulse: 'pulse-orange' },
    service: { color: 'bg-neon-red', text: 'Service', glow: 'neon-glow-red', pulse: 'pulse-red' },
  };
  const { color, text, glow, pulse } = config[status];
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        {pulse && <div className={cn("absolute w-3 h-3 rounded-full opacity-50", color, pulse)} />}
        <div className={cn("w-2 h-2 rounded-full relative z-10", color, glow)} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{text}</span>
    </div>
  );
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all relative group"
      >
        <Bell size={20} className="group-hover:text-neon-green transition-colors" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-neon-red rounded-full border-2 border-navy-900" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 z-50"
          >
            <GlassCard className="p-0 overflow-hidden border-white/10 shadow-2xl">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h4 className="text-sm font-bold">Notifications</h4>
                <span className="text-[10px] font-bold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded">2 NEW</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {[
                  { title: 'Machine BM002 Error', desc: 'Yarn break detected at 14:22', time: '5m ago', type: 'error' },
                  { title: 'Shift Report Ready', desc: 'Day shift production report is available', time: '1h ago', type: 'info' },
                ].map((n, i) => (
                  <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex justify-between mb-1">
                      <span className={cn("text-xs font-bold", n.type === 'error' ? 'text-neon-red' : 'text-neon-green')}>{n.title}</span>
                      <span className="text-[10px] text-white/30">{n.time}</span>
                    </div>
                    <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">{n.desc}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-[10px] font-bold text-white/40 hover:text-white transition-colors bg-white/5">VIEW ALL NOTIFICATIONS</button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileDropdown = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <div className="w-9 h-9 rounded-lg bg-neon-green flex items-center justify-center text-navy-900 font-bold shadow-lg shadow-neon-green/20">
          {user.name.charAt(0)}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold leading-none mb-1">{user.name}</p>
          <p className="text-[10px] text-white/40 font-mono leading-none">{user.role.toUpperCase()}</p>
        </div>
        <ChevronDown size={14} className={cn("text-white/20 transition-transform", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-56 z-50"
          >
            <GlassCard className="p-2 border-white/10 shadow-2xl">
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium">
                  <UserIcon size={16} className="text-white/40" /> Profile Settings
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium">
                  <Shield size={16} className="text-white/40" /> Security
                </button>
                <div className="h-px bg-white/5 my-2" />
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neon-red/10 text-neon-red transition-colors text-sm font-bold">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("shimmer rounded-xl bg-white/5", className)} />
);

// --- Pages ---

const LoginScreen = ({ onLogin }: { onLogin: (role: UserRole) => void }) => {
  const [activeTab, setActiveTab] = useState<UserRole>('operator');
  const [shift, setShift] = useState<'Day' | 'Night'>('Day');

  return (
    <Layout>
      <div className="min-h-screen flex">
        {/* Left Side: Industrial Background */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-navy-950">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 animate-gradient opacity-30" />
          
          {/* Blueprint Grid */}
          <div className="absolute inset-0 grid-blueprint opacity-20" />
          
          {/* Scanline */}
          <div className="scanline" />

          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="particle" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${Math.random() * 15 + 10}s`
                }} 
              />
            ))}
          </div>

          {/* 3D Wireframe Machine Simulation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              style={{ perspective: 1000 }}
              animate={{ 
                rotateY: [0, 360],
                y: [0, -20, 0]
              }}
              transition={{ 
                rotateY: { duration: 60, repeat: Infinity, ease: "linear" },
                y: { duration: 12, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative w-[600px] h-[600px] flex items-center justify-center"
            >
              {/* Wireframe SVG */}
              <svg viewBox="0 0 200 200" className="w-full h-full text-neon-green/20 drop-shadow-[0_0_20px_rgba(0,255,157,0.2)]">
                <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="65" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                <path d="M100 15 L100 185 M15 100 L185 100" stroke="currentColor" strokeWidth="0.2" />
                {[...Array(12)].map((_, i) => (
                  <g key={i} transform={`rotate(${i * 30} 100 100)`}>
                    <rect x="96" y="15" width="8" height="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="100" cy="25" r="1.5" className="hud-pulse" fill="currentColor" />
                  </g>
                ))}
                {/* Central Core */}
                <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="100" cy="100" r="10" className="pulse-green" fill="currentColor" fillOpacity="0.1" />
              </svg>

              {/* Pulsing Neon Rings */}
              {[1, 1.2, 1.4].map((scale, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 border border-neon-green/5 rounded-full"
                  animate={{ scale: [scale, scale * 1.1, scale], opacity: [0.05, 0.2, 0.05] }}
                  transition={{ duration: 6, repeat: Infinity, delay: i * 2 }}
                />
              ))}
            </motion.div>
          </div>

          {/* Floating Data Lines */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="data-line"
              style={{ 
                top: `${15 + i * 14}%`, 
                width: '300px',
                animationDelay: `${i * 1.5}s`,
                opacity: 0.3
              }}
            />
          ))}

          {/* HUD Elements */}
          <div className="absolute inset-0 p-16 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between items-start">
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl hud-pulse"
                >
                  <p className="caption text-[8px] mb-2">System Status</p>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neon-green pulse-green" />
                    <span className="text-[10px] font-mono font-black text-neon-green tracking-wider">ENCRYPTED_LINK_ACTIVE</span>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl"
                >
                  <p className="caption text-[8px] mb-2">Production Metrics</p>
                  <div className="space-y-3">
                    <div className="flex justify-between gap-12">
                      <span className="text-[10px] font-mono text-white/40 uppercase">RPM</span>
                      <span className="text-[10px] font-mono text-neon-green font-bold">1,240.5</span>
                    </div>
                    <div className="flex justify-between gap-12">
                      <span className="text-[10px] font-mono text-white/40 uppercase">Temp</span>
                      <span className="text-[10px] font-mono text-neon-orange font-bold">42.8°C</span>
                    </div>
                    <div className="flex justify-between gap-12">
                      <span className="text-[10px] font-mono text-white/40 uppercase">Volt</span>
                      <span className="text-[10px] font-mono text-white font-bold">220.4V</span>
                    </div>
                  </div>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="text-right"
              >
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl">
                  <p className="caption text-[8px] mb-2">Node Identifier</p>
                  <p className="text-[10px] font-mono text-white/60 font-bold">BRAID_HUB_v4.2.0</p>
                </div>
              </motion.div>
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 bg-neon-green rounded-3xl flex items-center justify-center neon-glow-green shadow-2xl">
                    <Cpu className="text-navy-900" size={40} />
                  </div>
                  <div>
                    <h1 className="text-6xl font-black tracking-tighter leading-none">BraidTrack <span className="text-neon-green">360</span></h1>
                    <p className="caption mt-2 tracking-[0.5em] text-neon-green/50">Industrial Intelligence</p>
                  </div>
                </div>
                <p className="text-2xl text-white/60 font-light max-w-lg leading-relaxed">
                  Smart Braiding Machine Monitoring System. <span className="text-white font-medium">Real-time analytics</span> for the modern factory floor.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-10 border-white/10 shadow-2xl">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                <p className="caption">Access your industrial dashboard</p>
              </div>

              <div className="flex gap-4 mb-8 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                {(['operator', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setActiveTab(role)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                      activeTab === role ? "bg-white/10 text-white shadow-lg border border-white/10" : "text-white/30 hover:text-white/50"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="caption block mb-3">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="Enter username"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-neon-green/50 transition-all text-sm"
                      defaultValue={activeTab === 'admin' ? 'admin' : 'operator01'}
                    />
                  </div>
                </div>
                <div>
                  <label className="caption block mb-3">Password</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-neon-green/50 transition-all text-sm"
                      defaultValue="password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="caption">Shift</span>
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                      <button 
                        onClick={() => setShift('Day')}
                        className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black tracking-tighter transition-all", shift === 'Day' ? "bg-neon-green text-navy-900" : "text-white/30")}
                      >
                        DAY
                      </button>
                      <button 
                        onClick={() => setShift('Night')}
                        className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black tracking-tighter transition-all", shift === 'Night' ? "bg-neon-green text-navy-900" : "text-white/30")}
                      >
                        NIGHT
                      </button>
                    </div>
                  </div>
                  <a href="#" className="text-[10px] font-bold text-neon-green hover:underline uppercase tracking-widest">Forgot?</a>
                </div>

                <button 
                  onClick={() => onLogin(activeTab)}
                  className="w-full bg-neon-green text-navy-900 font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow-green uppercase tracking-[0.2em] text-xs"
                >
                  LOGIN TO DASHBOARD
                </button>

                <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  Demo: {activeTab === 'admin' ? 'admin / password' : 'operator01 / password'}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

const OperatorDashboard = ({ user, onLogout, onSelectMachine }: { user: User; onLogout: () => void; onSelectMachine: (m: Machine) => void }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Issues', icon: AlertTriangle },
    { name: 'Shift Summary', icon: Clock },
    { name: 'Notifications', icon: Bell },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Running', value: 6, color: 'text-neon-green', icon: Activity },
                { label: 'Issues', value: 2, color: 'text-neon-orange', icon: AlertTriangle },
                { label: 'Service', value: 1, color: 'text-neon-red', icon: Wrench },
                { label: 'Off', value: 1, color: 'text-silver', icon: XCircle },
              ].map((stat) => (
                <GlassCard key={stat.label} className="flex items-center justify-between group p-5">
                  <div>
                    <p className="caption mb-1">{stat.label}</p>
                    <h3 className={cn("text-3xl font-bold tracking-tighter", stat.color)}>
                      <Counter value={stat.value} />
                    </h3>
                  </div>
                  <div className={cn("p-3 rounded-xl bg-white/5 transition-transform group-hover:scale-110 duration-500", stat.color.replace('text-', 'text-opacity-20 '))}>
                    <stat.icon size={24} />
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Machine Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Cpu className="text-neon-green" size={20} />
                  Machine Inventory
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_MACHINES.map((machine) => (
                  <motion.div
                    key={machine.id}
                    whileHover={{ y: -4 }}
                    onClick={() => onSelectMachine(machine)}
                    className="cursor-pointer"
                  >
                    <GlassCard className="p-5 h-full flex flex-col justify-between border-white/10 shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold font-mono tracking-tighter">{machine.id}</h4>
                          <StatusBadge status={machine.status} />
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/5">
                          <ChevronRight className="text-white/20" size={16} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">
                            <span>Production</span>
                            <span className="text-neon-green">{machine.production}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${machine.production}%` }}
                              className="h-full bg-neon-green neon-glow-green"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-white/40">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold font-mono">{machine.runtime}</span>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'Issues':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <AlertTriangle className="text-neon-orange" size={24} />
                  Active & Recent Issues
                </h3>
                <button className="px-4 py-2 rounded-xl bg-neon-orange text-navy-900 text-xs font-black hover:scale-105 transition-all uppercase tracking-widest">Report New Issue</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="p-4 caption">Machine ID</th>
                      <th className="p-4 caption">Issue Type</th>
                      <th className="p-4 caption">Date</th>
                      <th className="p-4 caption">Time</th>
                      <th className="p-4 caption">Status / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { id: 'BM002', issue: 'Yarn Break', date: '2024-05-23', time: '14:22', status: 'open' },
                      { id: 'BM015', issue: 'Mechanical Fault', date: '2024-05-23', time: '13:05', status: 'resolving' },
                      { id: 'BM008', issue: 'No Power', date: '2024-05-23', time: '11:40', status: 'completed' },
                      { id: 'BM022', issue: 'Needle Issue', date: '2024-05-23', time: '09:15', status: 'completed' },
                    ].map((row, i) => (
                      <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold font-mono text-neon-green">{row.id}</td>
                        <td className="p-4 text-sm font-medium">{row.issue}</td>
                        <td className="p-4 text-sm text-white/60">{row.date}</td>
                        <td className="p-4 text-sm text-white/40 font-mono">{row.time}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {row.status === 'open' && (
                              <button className="px-3 py-1.5 rounded-lg bg-neon-orange/20 text-neon-orange text-[10px] font-black uppercase tracking-widest hover:bg-neon-orange/30 transition-colors">Start Resolution</button>
                            )}
                            {row.status === 'resolving' && (
                              <button className="px-3 py-1.5 rounded-lg bg-neon-green/20 text-neon-green text-[10px] font-black uppercase tracking-widest hover:bg-neon-green/30 transition-colors">Mark Completed</button>
                            )}
                            {row.status === 'completed' && (
                              <span className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest">Resolved</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        );

      case 'Shift Summary':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <GlassCard className="p-8 border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Activity className="text-neon-green" size={24} />
                Production Performance
              </h3>
              <div className="space-y-8">
                {[
                  { label: 'Total Production', value: '4,280 units', sub: '+12% from target', color: 'text-neon-green' },
                  { label: 'Efficiency', value: '94.2%', sub: 'Above average', color: 'text-neon-green' },
                  { label: 'Total Downtime', value: '18m 45s', sub: '3 events today', color: 'text-neon-orange' },
                  { label: 'Idle Time', value: '12m 10s', sub: 'Machine BM005 idle', color: 'text-neon-red' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                    <div>
                      <p className="caption mb-1">{item.label}</p>
                      <p className={cn("text-3xl font-bold tracking-tighter", item.color)}>{item.value}</p>
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.sub}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-8 border-white/10 shadow-2xl flex flex-col">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <BarChart className="text-neon-green" size={24} />
                Hourly Output
              </h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { h: '08:00', v: 450 },
                    { h: '09:00', v: 520 },
                    { h: '10:00', v: 480 },
                    { h: '11:00', v: 610 },
                    { h: '12:00', v: 550 },
                    { h: '13:00', v: 670 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="h" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                    />
                    <Bar dataKey="v" fill="#00ff9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        );

      case 'Notifications':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Bell className="text-neon-red" size={24} />
                System Alerts
              </h3>
              <button className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Clear All</button>
            </div>
            {[
              { title: 'Target Not Reached', desc: 'Shift production is 5% below target for the last hour.', time: '10m ago', type: 'warning', icon: AlertTriangle },
              { title: 'Machine Idle for 15 min', desc: 'Machine BM005 has been idle without a reported issue.', time: '15m ago', type: 'error', icon: Clock },
              { title: 'Shift Summary Ready', desc: 'Your mid-shift performance report is now available for review.', time: '1h ago', type: 'info', icon: FileText },
              { title: 'Maintenance Scheduled', desc: 'Machine BM012 scheduled for routine service in 2 hours.', time: '2h ago', type: 'info', icon: Wrench },
            ].map((n, i) => (
              <GlassCard key={i} className={cn(
                "p-6 border-l-4 flex gap-6 items-start",
                n.type === 'error' ? "border-l-neon-red bg-neon-red/5" : 
                n.type === 'warning' ? "border-l-neon-orange bg-neon-orange/5" : 
                "border-l-neon-green bg-neon-green/5"
              )}>
                <div className={cn(
                  "p-3 rounded-xl",
                  n.type === 'error' ? "bg-neon-red/10 text-neon-red" : 
                  n.type === 'warning' ? "bg-neon-orange/10 text-neon-orange" : 
                  "bg-neon-green/10 text-neon-green"
                )}>
                  <n.icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-lg">{n.title}</h4>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{n.time}</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{n.desc}</p>
                  <div className="mt-4 flex gap-3">
                    <button className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">Acknowledge</button>
                    <button className="text-[10px] font-black text-neon-green hover:underline uppercase tracking-widest transition-colors">View Details</button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="w-20 lg:w-64 border-r border-white/10 bg-navy-900/50 backdrop-blur-xl flex flex-col z-20">
          <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-neon-green rounded-xl flex items-center justify-center neon-glow-green shrink-0">
              <Cpu className="text-navy-900" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tighter hidden lg:block">BraidTrack <span className="text-neon-green">360</span></h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                  activeTab === item.name 
                    ? "bg-neon-green text-navy-900 shadow-lg shadow-neon-green/20" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", activeTab === item.name ? "" : "group-hover:text-neon-green")} />
                <span className="text-sm font-bold tracking-tight hidden lg:block">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-neon-red hover:bg-neon-red/10 transition-all group"
            >
              <LogOut size={20} className="shrink-0" />
              <span className="text-sm font-bold tracking-tight hidden lg:block">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="h-20 border-b border-white/10 bg-navy-900/30 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight">{activeTab}</h2>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                <Clock size={14} />
                <span className="font-mono">{time.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-neon-green pulse-green" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">System Online</span>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold leading-none mb-1">{user.name}</p>
                    <p className="text-[10px] text-neon-green font-black uppercase tracking-tighter">Day Shift</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-neon-green flex items-center justify-center text-navy-900 font-bold shadow-lg shadow-neon-green/20">
                    {user.name.charAt(0)}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </Layout>
  );
};

const MachineIssuePage = ({ machine, onBack }: { machine: Machine; onBack: () => void }) => {
  const [selectedIssue, setSelectedIssue] = useState(ISSUE_TYPES[0]);
  const [isStarted, setIsStarted] = useState(false);
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    let interval: any;
    if (isStarted) {
      const start = Date.now();
      interval = setInterval(() => {
        const diff = Date.now() - start;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setDuration(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted]);

  return (
    <Layout>
      <div className="min-h-screen p-6 lg:p-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-white/40 hover:text-white mb-10 transition-all group font-bold text-xs tracking-widest uppercase"
        >
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          Back to Dashboard
        </button>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left: Machine Info */}
            <div className="w-full lg:w-1/3">
              <GlassCard className="text-center py-12 border-white/10 shadow-2xl">
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-inner">
                  <Cpu className="text-neon-green" size={48} />
                </div>
                <h2 className="text-4xl font-bold font-mono tracking-tighter mb-3">{machine.id}</h2>
                <div className="flex justify-center mb-10">
                  <StatusBadge status={machine.status} />
                </div>
                
                <div className="space-y-6 text-left border-t border-white/10 pt-8">
                  <div className="flex justify-between items-center">
                    <span className="caption">Last Production</span>
                    <span className="text-sm font-black text-neon-green">{machine.production}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="caption">Total Runtime</span>
                    <span className="text-sm font-bold font-mono">{machine.runtime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="caption">Last Service</span>
                    <span className="text-sm font-medium text-white/60">2 days ago</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Right: Issue Form */}
            <div className="w-full lg:w-2/3">
              <GlassCard className="h-full p-10 border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-bold flex items-center gap-4">
                    <AlertTriangle className="text-neon-orange" size={28} />
                    Report Machine Issue
                  </h3>
                  <div className="px-3 py-1 rounded-lg bg-neon-orange/10 text-neon-orange text-[10px] font-black uppercase tracking-widest">Priority: High</div>
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="caption block mb-3">Current Status</label>
                      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-black text-neon-orange uppercase tracking-widest flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-neon-orange pulse-orange" />
                        Issue Detected
                      </div>
                    </div>
                    <div>
                      <label className="caption block mb-3">Timestamp</label>
                      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-mono text-white/60">
                        {new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="caption block mb-3">Issue Reason</label>
                    <div className="relative">
                      <select 
                        value={selectedIssue}
                        onChange={(e) => setSelectedIssue(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-neon-green/50 appearance-none text-sm font-medium"
                      >
                        {ISSUE_TYPES.map(type => (
                          <option key={type} value={type} className="bg-navy-900">{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                    </div>
                  </div>

                  <div className="bg-navy-950/50 rounded-3xl p-10 border border-white/5 text-center shadow-inner">
                    <div className="text-6xl font-mono font-black text-neon-green tracking-tighter mb-3">{duration}</div>
                    <p className="caption tracking-[0.4em]">Resolution Timer</p>
                  </div>

                  <div className="flex gap-5">
                    {!isStarted ? (
                      <button 
                        onClick={() => setIsStarted(true)}
                        className="flex-1 bg-neon-green text-navy-900 font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow-green uppercase tracking-[0.2em] text-xs"
                      >
                        Start Resolution
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setIsStarted(false); onBack(); }}
                        className="flex-1 bg-neon-green text-navy-900 font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow-green uppercase tracking-[0.2em] text-xs"
                      >
                        Complete & Resolve
                      </button>
                    )}
                    <button className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const AdminDashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState(false);
  const [isAddOperatorModalOpen, setIsAddOperatorModalOpen] = useState(false);
  const [machines, setMachines] = useState(MOCK_MACHINES);
  const [operators, setOperators] = useState(MOCK_OPERATORS);

  const handleDownload = (reportName: string) => {
    const content = `Report: ${reportName}\nGenerated: ${new Date().toLocaleString()}\n\nThis is a simulated production report for BraidTrack 360.\n\nSummary Metrics:\n- Total Production: 45,200m\n- Efficiency: 94.2%\n- Downtime: 12h 45m\n- Revenue: $12,450\n\nDetailed data would follow here...`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.toLowerCase().replace(/\s+/g, '_')}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRemoveMachine = (id: string) => {
    if (confirm(`Are you sure you want to remove machine ${id}?`)) {
      setMachines(prev => prev.filter(m => m.id !== id));
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Machines', icon: Cpu },
    { name: 'Operators', icon: Users },
    { name: 'Issues', icon: AlertTriangle },
    { name: 'Reports', icon: FileText },
    { name: 'Revenue', icon: DollarSign },
    { name: 'Settings', icon: Settings },
  ];

  const chartData = [
    { name: '08:00', prod: 45, rev: 120, down: 5 },
    { name: '10:00', prod: 52, rev: 150, down: 2 },
    { name: '12:00', prod: 48, rev: 140, down: 10 },
    { name: '14:00', prod: 61, rev: 180, down: 0 },
    { name: '16:00', prod: 55, rev: 165, down: 4 },
    { name: '18:00', prod: 67, rev: 210, down: 1 },
    { name: '20:00', prod: 72, rev: 230, down: 0 },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'Dashboard':
        return (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[
                { label: 'Total Machines', value: 48, icon: Cpu, color: 'text-white' },
                { label: 'Running Now', value: 36, icon: Activity, color: 'text-neon-green' },
                { label: 'In Issue', value: 5, icon: AlertTriangle, color: 'text-neon-orange' },
                { label: 'In Service', value: 7, icon: Wrench, color: 'text-neon-red' },
              ].map((stat) => (
                <GlassCard key={stat.label} className="border-white/10 shadow-xl group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="caption mb-2">{stat.label}</p>
                      <h3 className={cn("text-4xl font-bold tracking-tighter", stat.color)}>
                        <Counter value={stat.value} />
                      </h3>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                      <stat.icon size={24} className={stat.color} />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <GlassCard className="h-[450px] flex flex-col border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-bold flex items-center gap-3">
                    <Activity className="text-neon-green" size={24} />
                    Production & Revenue
                  </h4>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-lg bg-neon-green/10 text-neon-green text-[10px] font-black uppercase tracking-widest">Live</span>
                  </div>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00ff9d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="prod" stroke="#00ff9d" fillOpacity={1} fill="url(#colorProd)" strokeWidth={4} />
                      <Area type="monotone" dataKey="rev" stroke="#ff9d00" fill="transparent" strokeWidth={2} strokeDasharray="8 8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard className="h-[450px] flex flex-col border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-bold flex items-center gap-3">
                    <AlertTriangle className="text-neon-orange" size={24} />
                    Downtime Analysis
                  </h4>
                  <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest outline-none">
                    <option>Today</option>
                    <option>Weekly</option>
                  </select>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                      />
                      <Bar dataKey="down" fill="#ff9d00" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            <GlassCard className="border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-bold">Recent Downtime Events</h4>
                <button className="text-[10px] font-black text-neon-green uppercase tracking-widest hover:underline">View All Logs</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-5 caption">Time</th>
                      <th className="pb-5 caption">Machine</th>
                      <th className="pb-5 caption">Duration</th>
                      <th className="pb-5 caption">Reason</th>
                      <th className="pb-5 caption">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { time: '14:22', machine: 'BM002', duration: '12m', reason: 'Yarn Break', status: 'Resolved' },
                      { time: '13:05', machine: 'BM015', duration: '45m', reason: 'Mechanical Fault', status: 'In Progress' },
                      { time: '11:40', machine: 'BM008', duration: '08m', reason: 'No Power', status: 'Resolved' },
                      { time: '09:15', machine: 'BM022', duration: '15m', reason: 'Needle Issue', status: 'Resolved' },
                    ].map((row, i) => (
                      <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 font-mono text-sm text-white/40">{row.time}</td>
                        <td className="py-5 font-bold tracking-tight">{row.machine}</td>
                        <td className="py-5 text-sm text-white/60">{row.duration}</td>
                        <td className="py-5 text-sm font-medium">{row.reason}</td>
                        <td className="py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                            row.status === 'Resolved' ? "bg-neon-green/10 text-neon-green" : "bg-neon-orange/10 text-neon-orange"
                          )}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        );

      case 'Machines':
        return (
          <motion.div 
            key="machines"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold tracking-tight">Machine Inventory</h3>
              <button 
                onClick={() => setIsAddMachineModalOpen(true)}
                className="bg-neon-green text-navy-900 px-8 py-2.5 rounded-xl font-black text-xs neon-glow-green uppercase tracking-widest"
              >
                Add New Machine
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {machines.map(m => (
                <GlassCard key={m.id} className="border-white/10 shadow-xl group">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-xl font-bold font-mono tracking-tighter">{m.id}</h4>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="caption">Production</span>
                      <span className="text-sm font-black text-neon-green">{m.production}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.production}%` }}
                        className="h-full bg-neon-green"
                      />
                    </div>
                    <div className="flex justify-between items-center text-white/40">
                      <span className="caption">Runtime</span>
                      <span className="text-xs font-mono font-bold">{m.runtime}</span>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button className="flex-1 py-2.5 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/5">Configure</button>
                      <button className="flex-1 py-2.5 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/5">History</button>
                    </div>
                    <button 
                      onClick={() => handleRemoveMachine(m.id)}
                      className="w-full py-2.5 rounded-xl bg-neon-red/10 text-neon-red text-[10px] font-black uppercase tracking-widest hover:bg-neon-red hover:text-white transition-all border border-neon-red/20"
                    >
                      Remove Machine
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>

            <Modal 
              isOpen={isAddMachineModalOpen} 
              onClose={() => setIsAddMachineModalOpen(false)} 
              title="Add New Machine"
            >
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsAddMachineModalOpen(false); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="caption">Machine ID</label>
                    <input type="text" placeholder="e.g. BM025" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green/50 text-sm font-mono" required />
                  </div>
                  <div className="space-y-2">
                    <label className="caption">Revenue per Meter ($)</label>
                    <input type="number" step="0.01" placeholder="0.50" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green/50 text-sm font-mono" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="caption">Production Target (m/shift)</label>
                  <input type="number" placeholder="5000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green/50 text-sm font-mono" required />
                </div>
                <div className="space-y-2">
                  <label className="caption">Ideal Production Rate (m/min)</label>
                  <input type="number" placeholder="12.5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green/50 text-sm font-mono" required />
                </div>
                <button type="submit" className="w-full bg-neon-green text-navy-900 font-black py-4 rounded-2xl neon-glow-green uppercase tracking-widest text-xs mt-4">
                  Register Machine
                </button>
              </form>
            </Modal>
          </motion.div>
        );

      case 'Operators':
        return (
          <motion.div 
            key="operators"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col lg:flex-row gap-10"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold tracking-tight">Operator Management</h2>
                <button 
                  onClick={() => setIsAddOperatorModalOpen(true)}
                  className="bg-neon-green text-navy-900 px-8 py-2.5 rounded-xl font-black text-xs neon-glow-green uppercase tracking-widest"
                >
                  Add Operator
                </button>
              </div>
              <GlassCard className="border-white/10 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-5 caption">Name</th>
                        <th className="pb-5 caption">ID</th>
                        <th className="pb-5 caption">Shift</th>
                        <th className="pb-5 caption">Machines</th>
                        <th className="pb-5 caption">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {operators.map((op) => (
                        <tr key={op.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black border border-white/10 shadow-inner">{op.name.charAt(0)}</div>
                              <span className="font-bold tracking-tight">{op.name}</span>
                            </div>
                          </td>
                          <td className="py-5 font-mono text-xs text-white/40">{op.id}</td>
                          <td className="py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                              op.shift === 'Day' ? "bg-neon-green/10 text-neon-green" : "bg-neon-orange/10 text-neon-orange"
                            )}>{op.shift}</span>
                          </td>
                          <td className="py-5 text-sm font-medium text-white/60">{op.machinesControlled.length} Machines</td>
                          <td className="py-5">
                            <button onClick={() => setSelectedOperator(op)} className="p-2.5 rounded-xl bg-white/5 hover:bg-neon-green/20 hover:text-neon-green transition-all border border-white/5">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>

            <Modal 
              isOpen={isAddOperatorModalOpen} 
              onClose={() => setIsAddOperatorModalOpen(false)} 
              title="Add New Operator"
            >
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsAddOperatorModalOpen(false); }}>
                <div className="space-y-2">
                  <label className="caption">Full Name</label>
                  <input type="text" placeholder="e.g. Robert Smith" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green/50 text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="caption">Phone Number</label>
                    <input type="tel" placeholder="+1 234 567 890" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green/50 text-sm font-mono" required />
                  </div>
                  <div className="space-y-2">
                    <label className="caption">Operator ID</label>
                    <input type="text" placeholder="OP025" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green/50 text-sm font-mono" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="caption">Shift Assignment</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green/50 text-sm appearance-none">
                    <option className="bg-navy-900">Day Shift (08:00 - 20:00)</option>
                    <option className="bg-navy-900">Night Shift (20:00 - 08:00)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="caption">Assign Machines</label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 bg-white/5 border border-white/10 rounded-xl">
                    {machines.map(m => (
                      <label key={m.id} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                        <input type="checkbox" className="accent-neon-green" />
                        <span className="text-[10px] font-mono font-bold">{m.id}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full bg-neon-green text-navy-900 font-black py-4 rounded-2xl neon-glow-green uppercase tracking-widest text-xs mt-4">
                  Register Operator
                </button>
              </form>
            </Modal>

            <AnimatePresence>
              {selectedOperator && (
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="w-full lg:w-96">
                  <GlassCard className="h-full border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="flex justify-between items-start mb-10">
                      <h3 className="text-xl font-bold tracking-tight">Operator Profile</h3>
                      <button onClick={() => setSelectedOperator(null)} className="text-white/20 hover:text-white transition-colors"><XCircle size={24} /></button>
                    </div>
                    <div className="text-center mb-10">
                      <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto mb-5 border border-white/10 shadow-inner">
                        <UserIcon className="text-neon-green" size={48} />
                      </div>
                      <h4 className="text-2xl font-bold tracking-tight">{selectedOperator.name}</h4>
                      <p className="text-white/30 font-mono text-xs mt-1 uppercase tracking-widest">{selectedOperator.id}</p>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                          <p className="caption mb-2">Performance</p>
                          <p className="text-2xl font-black text-neon-green tracking-tighter">{selectedOperator.performance}%</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                          <p className="caption mb-2">Status</p>
                          <p className="text-xs font-black text-neon-green mt-2 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-green pulse-green" />
                            Active
                          </p>
                        </div>
                      </div>
                      <div className="pt-6 space-y-3">
                        <button className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Edit Profile</button>
                        <button className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Reset Password</button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 'Issues':
        return (
          <motion.div 
            key="issues"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold tracking-tight">Active & Recent Issues</h3>
            <div className="grid grid-cols-1 gap-6">
              {MOCK_ISSUES.map(issue => (
                <GlassCard key={issue.id} className="flex items-center justify-between border-white/10 shadow-xl group">
                  <div className="flex items-center gap-8">
                    <div className={cn("p-5 rounded-2xl bg-white/5 shadow-inner transition-transform group-hover:scale-110", issue.status === 'open' ? "text-neon-orange" : "text-neon-green")}>
                      <AlertTriangle size={32} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold tracking-tight mb-1">{issue.type}</h4>
                      <p className="text-xs text-white/40 font-mono font-medium uppercase tracking-widest">{issue.machineId} • {issue.startTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black tracking-tighter mb-2">{issue.duration || 'Ongoing'}</p>
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]",
                      issue.status === 'open' ? "bg-neon-orange/10 text-neon-orange" : "bg-neon-green/10 text-neon-green"
                    )}>{issue.status}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        );

      case 'Reports':
        return (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold tracking-tight">System Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['Production Summary', 'Downtime Analysis', 'Operator Efficiency', 'Revenue Forecast'].map(report => (
                <GlassCard key={report} className="flex items-center justify-between border-white/10 shadow-xl group">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-white/5 text-neon-green shadow-inner group-hover:scale-110 transition-transform"><FileText size={28} /></div>
                    <h4 className="text-lg font-bold tracking-tight">{report}</h4>
                  </div>
                  <button 
                    onClick={() => handleDownload(report)}
                    className="px-6 py-3 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-neon-green hover:text-navy-900 transition-all border border-white/5"
                  >
                    Download PDF
                  </button>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        );

      case 'Revenue':
        return (
          <motion.div 
            key="revenue"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GlassCard className="border-white/10 shadow-xl">
                <p className="caption mb-3">Daily Revenue</p>
                <h3 className="text-5xl font-black text-neon-green tracking-tighter">
                  <Counter value={12450} prefix="$" />
                </h3>
              </GlassCard>
              <GlassCard className="border-white/10 shadow-xl">
                <p className="caption mb-3">Weekly Forecast</p>
                <h3 className="text-5xl font-black text-white tracking-tighter">
                  <Counter value={85200} prefix="$" />
                </h3>
              </GlassCard>
              <GlassCard className="border-white/10 shadow-xl">
                <p className="caption mb-3">Efficiency Rate</p>
                <h3 className="text-5xl font-black text-neon-orange tracking-tighter">94.2%</h3>
              </GlassCard>
            </div>
            <GlassCard className="h-[450px] border-white/10 shadow-2xl">
              <h4 className="text-xl font-bold mb-10">Revenue Growth (Simulated)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="rev" stroke="#00ff9d" strokeWidth={4} dot={{ r: 6, fill: '#00ff9d', strokeWidth: 2, stroke: '#0a0e1a' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        );

      case 'Settings':
        return (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl"
          >
            <h3 className="text-2xl font-bold tracking-tight mb-8">Factory Parameters</h3>
            <GlassCard className="space-y-10 border-white/10 shadow-2xl p-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="caption">Global Production Target</label>
                  <span className="text-sm font-black text-neon-green">85%</span>
                </div>
                <input type="range" className="w-full accent-neon-green h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer" defaultValue={85} />
              </div>
              <div className="space-y-4">
                <label className="caption block">Global Revenue per Meter ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:border-neon-green/50 transition-all font-mono text-sm" defaultValue={0.50} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="caption block">Idle Alert Threshold (Minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:border-neon-green/50 transition-all font-mono text-sm" defaultValue={15} />
                </div>
              </div>
              <div className="pt-6 flex gap-5">
                <button className="flex-1 bg-neon-green text-navy-900 font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow-green uppercase tracking-widest text-xs">Apply Changes</button>
                <button className="flex-1 bg-white/5 font-black py-4 rounded-2xl border border-white/10 uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">Factory Reset</button>
              </div>
            </GlassCard>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <div className="w-72 border-r border-white/10 flex flex-col p-8 sticky top-0 h-screen bg-navy-950/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 bg-neon-green rounded-2xl flex items-center justify-center neon-glow-green shadow-lg">
              <Cpu className="text-navy-900" size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter">BraidTrack <span className="text-neon-green">360</span></h1>
          </div>

          <nav className="flex-1 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActivePage(item.name)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative overflow-hidden",
                  activePage === item.name 
                    ? "bg-neon-green text-navy-900 font-black shadow-xl shadow-neon-green/20" 
                    : "text-white/30 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={22} className={cn("transition-colors", activePage === item.name ? "text-navy-900" : "group-hover:text-neon-green")} />
                <span className="text-sm tracking-wide">{item.name}</span>
                {activePage === item.name && (
                  <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-navy-900 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          <button 
            onClick={onLogout}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-neon-red hover:bg-neon-red/10 transition-all font-black mt-auto uppercase tracking-widest text-xs"
          >
            <LogOut size={20} />
            Logout System
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-12">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-2">{activePage}</h2>
              <p className="text-white/40 font-medium">
                {activePage === 'Dashboard' ? 'Factory overview and real-time performance metrics.' : `Manage your factory ${activePage.toLowerCase()} and system data.`}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-neon-green pulse-green" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">System Operational</span>
              </div>
              <div className="flex items-center gap-3">
                <NotificationBell />
                <ProfileDropdown user={user} />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default function App() {
  const [view, setView] = useState<'login' | 'operator' | 'admin' | 'machine-detail'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const handleLogin = (role: UserRole) => {
    const mockUser: User = {
      id: role === 'admin' ? 'AD001' : 'OP001',
      role,
      name: role === 'admin' ? 'Admin User' : 'John Doe',
      username: role === 'admin' ? 'admin' : 'operator01',
    };
    setUser(mockUser);
    setView(role);
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setView('machine-detail');
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen onLogin={handleLogin} />
          </motion.div>
        )}
        {view === 'operator' && user && (
          <motion.div key="operator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OperatorDashboard user={user} onLogout={handleLogout} onSelectMachine={handleSelectMachine} />
          </motion.div>
        )}
        {view === 'admin' && user && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </motion.div>
        )}
        {view === 'machine-detail' && selectedMachine && (
          <motion.div key="detail" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <MachineIssuePage machine={selectedMachine} onBack={() => setView('operator')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
