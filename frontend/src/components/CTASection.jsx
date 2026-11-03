import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="relative py-28 px-4 overflow-hidden border-t border-slate-800/80">
      {/* Radial ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/20 to-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="glass-panel p-10 md:p-16 text-center border border-cyan-500/30 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-[#07090e]/95 shadow-[0_0_50px_rgba(0,240,255,0.08)]">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Ready to Transform Your Workflow?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
            Take Control of Every Subscription.
          </h2>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Join forward-thinking individuals and teams who automate renewals, eliminate hidden charges, and gain 100% visibility over recurring spend.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 transition-all text-center"
            >
              Sign In to Dashboard
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-800/80 pt-8 mt-2">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-cyan-400">99.9% Uptime</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Enterprise Microservices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-blue-400">&lt; 2 Mins</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Instant Onboarding</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-purple-400">Zero Cost</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Free Tier Available</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;
