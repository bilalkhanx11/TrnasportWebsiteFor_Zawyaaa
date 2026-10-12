import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { useLang } from '../../context/LanguageContext';

export function ContactSection() {
  const { t } = useLang();
  const c = t.contact;

  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', service: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await api.post('/dashboard/contact', form);
      setSent(true);
    } catch {
      setError(c.errorMsg);
    } finally {
      setSending(false);
    }
  };

  // Reset form when language changes so placeholders refresh
  const addressLines = c.addressValue.split('\n');

  return (
    <section id="contact" className="py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-brand-secondary text-xs font-semibold tracking-widest uppercase mb-3">
            {c.overline}
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-primary mb-4">
            {c.title} <span className="text-brand-secondary">{c.titleHighlight}</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {c.sub}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact info cards */}
          <div className="reveal-left space-y-6">
            {/* Email */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-3">
                <Mail className="text-brand-primary" size={20} />
              </div>
              <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">
                {c.emailLabel}
              </p>
              <a
                href="mailto:info@zawayaalkayan.com"
                className="text-brand-primary font-semibold text-sm hover:text-brand-secondary transition-colors"
              >
                info@zawayaalkayan.com
              </a>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-3">
                <Phone className="text-brand-primary" size={20} />
              </div>
              <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">
                {c.phoneLabel}
              </p>
              <a
                href="tel:+966500826759"
                className="text-brand-primary font-semibold text-sm hover:text-brand-secondary transition-colors"
              >
                +966 500 826 759
              </a>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center mb-3">
                <MapPin className="text-brand-primary" size={20} />
              </div>
              <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">
                {c.addressLabel}
              </p>
              <p className="text-brand-primary font-semibold text-sm">
                {addressLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 reveal">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              {sent ? (
                /* Success state */
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-brand-primary mb-2">
                    {c.successTitle}
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    {c.successMsg}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name + Company */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {c.nameLabel} *
                      </label>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder={c.namePh}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {c.companyLabel}
                      </label>
                      <input
                        value={form.company}
                        onChange={e => setForm({ ...form, company: e.target.value })}
                        placeholder={c.companyPh}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {c.emailFieldLabel} *
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="email@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        {c.phoneLabel}
                      </label>
                      <input
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder={c.phonePh}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Service dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      {c.serviceLabel}
                    </label>
                    <select
                      value={form.service}
                      onChange={e => setForm({ ...form, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 transition-all bg-white"
                    >
                      <option value="">{c.servicePh}</option>
                      {c.services.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      {c.messageLabel} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder={c.messagePh}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 transition-all resize-none"
                    />
                  </div>

                  {/* Inline error */}
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full btn-gold py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {sending ? (
                      c.sending
                    ) : (
                      <>
                        <Send size={16} />
                        {c.sendBtn}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
