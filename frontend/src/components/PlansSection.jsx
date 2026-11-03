import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Package, Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const PlansSection = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/plans');
      if (response.data && response.data.length > 0) {
        setPlans(response.data);
      } else {
        // Fallback default catalog if API is loading
        setPlans([
          { id: 1, name: 'Starter Tier', price: 0, durationDays: 30, description: 'Essential subscription tracking for individuals and small setups.' },
          { id: 2, name: 'Pro Subscription', price: 499, durationDays: 30, description: 'Automated renewal alerts, payment tracking, and analytics.' },
          { id: 3, name: 'Enterprise Business', price: 1499, durationDays: 365, description: 'Full microservices access, unlimited plans, and SLA uptime.' }
        ]);
      }
    } catch (err) {
      // Fallback UI data
      setPlans([
        { id: 1, name: 'Starter Tier', price: 0, durationDays: 30, description: 'Essential subscription tracking for individuals and small setups.' },
        { id: 2, name: 'Pro Subscription', price: 499, durationDays: 30, description: 'Automated renewal alerts, payment tracking, and analytics.' },
        { id: 3, name: 'Enterprise Business', price: 1499, durationDays: 365, description: 'Full microservices access, unlimited plans, and SLA uptime.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="plans" className="relative py-28 px-4 border-t border-slate-800/80 bg-[#07090e] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-4 shadow-inner">
            <Zap size={14} className="text-cyan-400" />
            <span>FLEXIBLE PRICING CATALOG</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Transparent Plans for Every Growth Stage.
          </h2>

          <p className="text-slate-400 text-base md:text-lg mt-4 leading-relaxed">
            Choose a plan tailored to your recurring revenue management needs. Automate billing cycles with zero hidden fees.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const isPopular = idx === 1 || plan.name.toLowerCase().includes('pro');

            return (
              <div
                key={plan.id || idx}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 ${
                  isPopular
                    ? 'glass-panel bg-gradient-to-b from-slate-900/90 via-cyan-950/40 to-slate-950/90 border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(0,240,255,0.2)]'
                    : 'glass-panel bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1">
                    <Sparkles size={12} />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${isPopular ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/60 text-indigo-400'}`}>
                      <Package size={24} />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50">
                      {plan.durationDays || 30} Days Duration
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 min-h-[40px] leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-800/80">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-extrabold text-white">₹{plan.price}</span>
                      <span className="text-slate-400 text-sm">/ {plan.durationDays || 30} days</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-medium mt-1 block">Includes OpenFeign Payment Gateway</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3.5 mb-8 text-sm text-slate-300">
                    <li className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-cyan-400" />
                      </div>
                      <span>Full Access to SubTrack Lifecycle APIs</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-cyan-400" />
                      </div>
                      <span>OpenFeign Payment Gateway Integration</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-cyan-400" />
                      </div>
                      <span>Automated Expiry & Renewal Alerts</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-cyan-400" />
                      </div>
                      <span>Eureka Service Discovery Support</span>
                    </li>
                  </ul>
                </div>

                <Link
                  to="/plans"
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center space-x-2 ${
                    isPopular
                      ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-slate-950 hover:from-cyan-300 hover:to-indigo-300 shadow-[0_0_25px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700'
                  }`}
                >
                  <span>Select {plan.name}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
          <ShieldCheck size={14} className="text-cyan-400" />
          <span>All plans backed by SubTrack Enterprise Microservices SLA</span>
        </div>

      </div>
    </section>
  );
};

export default PlansSection;
