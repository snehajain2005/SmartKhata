import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const DEFAULT_TEMPLATE_EN = 'Hello {name}! You have a pending balance of ₹{amount}. Please clear it soon. - {shopName}';
const DEFAULT_TEMPLATE_HI = 'Namaste {name}! Aapka {amount} rupaye ka udhaar baaki hai. Kripya jald se jald chukta karein. - {shopName}';

const SectionCard = ({ title, subtitle, children }) => (
  <div className="card mb-4">
    <div className="mb-4">
      <h2 className="font-display text-base font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [lang, setLang] = useState(user?.settings?.language || 'en');
  const [template, setTemplate] = useState(
    user?.settings?.reminderTemplate || DEFAULT_TEMPLATE_HI
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/settings', { language: lang, reminderTemplate: template });
      updateUser({ settings: data.data });
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const previewMessage = template
    .replace('{name}', 'Ramesh Kumar')
    .replace('{amount}', '1,500')
    .replace('{shopName}', user?.shopName || 'My Shop');

  return (
    <div className="pb-24 md:pb-6 max-w-2xl animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your shop preferences and account</p>
      </div>

      {/* ── Shop Info ── */}
      <SectionCard title="Shop Information" subtitle="Your registered shop details">
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ink-400 to-ink-700 flex items-center justify-center text-white font-bold text-2xl shadow-sm flex-shrink-0">
            {user?.shopName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg leading-tight">{user?.shopName}</p>
            <p className="text-slate-500 text-sm mt-0.5">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── Language ── */}
      <SectionCard title="Language" subtitle="Choose your preferred interface language">
        <div className="flex gap-3">
          {[
            { code: 'en', flag: '🇬🇧', label: 'English' },
            { code: 'hi', flag: '🇮🇳', label: 'Hindi' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm border-2 transition-all duration-200 ${
                lang === l.code
                  ? 'border-ink-500 bg-ink-50 text-ink-700 shadow-sm'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">{l.flag}</span>
              {l.label}
              {lang === l.code && (
                <svg className="w-4 h-4 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── WhatsApp Reminder Template ── */}
      <SectionCard
        title="WhatsApp Reminder Template"
        subtitle="Customize the message sent to customers"
      >
        {/* Variable chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['{name}', '{amount}', '{shopName}'].map((v) => (
            <button
              key={v}
              onClick={() => setTemplate((t) => t + v)}
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold bg-slate-100 hover:bg-ink-50 hover:text-ink-700 text-slate-600 border border-slate-200 hover:border-ink-200 px-2.5 py-1 rounded-lg transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {v}
            </button>
          ))}
        </div>

        {/* Quick templates */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTemplate(DEFAULT_TEMPLATE_EN)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs btn-secondary py-2"
          >
            <span>🇬🇧</span> English Template
          </button>
          <button
            onClick={() => setTemplate(DEFAULT_TEMPLATE_HI)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs btn-secondary py-2"
          >
            <span>🇮🇳</span> Hindi Template
          </button>
        </div>

        <textarea
          id="reminder-template-input"
          className="input resize-none font-mono text-sm"
          rows={4}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Enter your reminder message..."
        />

        {/* Live Preview */}
        <div className="mt-4 rounded-2xl overflow-hidden border border-green-200">
          <div className="bg-green-500 px-4 py-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <p className="text-xs text-white font-semibold">Message Preview</p>
          </div>
          <div className="bg-green-50 px-4 py-3">
            <p className="text-sm text-slate-800 leading-relaxed">{previewMessage}</p>
          </div>
        </div>
      </SectionCard>

      {/* ── Save Button ── */}
      <button
        id="save-settings-btn"
        onClick={handleSave}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Saving...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Settings
          </>
        )}
      </button>

      {/* ── Danger Zone ── */}
      <div className="mt-6 card border-rose-100">
        <h2 className="font-display text-base font-bold text-slate-700 mb-1">Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">Actions here cannot be easily undone.</p>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to logout?')) {
              logout();
            }
          }}
          className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-semibold hover:bg-rose-50 px-4 py-2.5 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout from this device
        </button>
      </div>
    </div>
  );
}
