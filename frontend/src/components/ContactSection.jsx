import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, HelpCircle, Server, Shield, Sparkles, ChevronDown } from 'lucide-react';

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  const faqs = [
    {
      q: 'How does SubTrack handle subscription lifecycle state transitions?',
      a: 'SubTrack uses an event-driven microservices architecture. When a user activates a plan, subscription-service issues a payment request to payment-service via OpenFeign. Once approved, the status is set to ACTIVE and expiry dates are tracked automatically.'
    },
    {
      q: 'What happens when a recurring payment fails during auto-renewal?',
      a: 'If a payment fails or is declined, the system sets the subscription status to PAYMENT_FAILED or EXPIRED, preventing service leakage while alerting the user on their dashboard.'
    },
    {
      q: 'How are microservices routed through the API Gateway?',
      a: 'All frontend requests flow through Spring Cloud Gateway on port 8080, which dynamically discovers registered instances (`user-service`, `subscription-service`, `payment-service`) via Eureka Discovery Server on port 8761.'
    },
    {
      q: 'Is there an admin portal for managing subscription plans?',
      a: 'Yes! Accounts created with the "System Administrator" role can access `/admin/plans` to create new pricing tiers, edit plan durations, or adjust pricing dynamically.'
    }
  ];

  return (
    <section id="contact" className="relative py-28 px-4 border-t border-slate-800/80 bg-[#05070a] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-4 shadow-inner">
            <MessageSquare size={14} className="text-cyan-400" />
            <span>SUPPORT & INQUIRIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            We’re Here to Help You Succeed.
          </h2>

          <p className="text-slate-400 text-base md:text-lg mt-4 leading-relaxed">
            Have questions about SubTrack microservices, custom Enterprise plans, or API integration? Send us a message or check our FAQs below.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 glass-panel p-8 sm:p-10 border border-slate-800/80 rounded-3xl bg-slate-900/60 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <span>Send Us a Message</span>
              <Sparkles size={18} className="text-cyan-400" />
            </h3>
            <p className="text-slate-400 text-sm mb-6">Fill out the form below and our architecture team will get back to you shortly.</p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-200 text-center space-y-3 animate-fade-in">
                <CheckCircle2 size={40} className="text-cyan-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Message Sent Successfully!</h4>
                <p className="text-xs text-slate-300">Thank you for reaching out to SubTrack support. We will get back to your email within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Your Email</label>
                    <input
                      type="email"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="Microservices Architecture / Account Inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Message</label>
                  <textarea
                    rows={4}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                    placeholder="Tell us how we can help you with your subscription lifecycle..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-[0_0_25px_rgba(0,240,255,0.35)] transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  <Send size={16} />
                  <span>Send Message to SubTrack Team</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: FAQs & Support Info */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 bg-slate-900/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <HelpCircle size={20} className="text-cyan-400" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/50 transition-all"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full px-4 py-3 text-left font-semibold text-sm text-slate-200 hover:text-cyan-400 flex items-center justify-between transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-900/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Microservices Endpoint Info */}
            <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950/90 to-cyan-950/20 text-slate-300 space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Server size={14} />
                <span>System Gateways & Endpoints</span>
              </div>
              <div className="text-xs space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">API Gateway Proxy</span>
                  <code className="text-cyan-400 font-mono">http://localhost:8080</code>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Eureka Service Registry</span>
                  <code className="text-cyan-400 font-mono">http://localhost:8761</code>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactSection;
