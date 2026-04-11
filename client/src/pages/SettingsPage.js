import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const DEFAULT_TEMPLATE_EN = 'Hello {name}! You have a pending balance of ₹{amount}. Please clear it soon. - {shopName}';
const DEFAULT_TEMPLATE_HI = 'Namaste {name}! Aapka {amount} rupaye ka udhaar baaki hai. Kripya jald se jald chukta karein. - {shopName}';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
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
    <div className="pb-20 md:pb-0 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your shop preferences</p>
      </div>

      {/* Shop Info */}
      <div className="card mb-5">
        <h2 className="font-display text-lg font-bold text-slate-800 mb-4">Shop Information</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-700 font-bold text-xl">
            {user?.shopName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg">{user?.shopName}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="card mb-5">
        <h2 className="font-display text-lg font-bold text-slate-800 mb-1">Language</h2>
        <p className="text-slate-500 text-sm mb-4">Choose your preferred interface language</p>
        <div className="flex gap-3">
          {[{ code: 'en', label: '🇬🇧 English' }, { code: 'hi', label: '🇮🇳 Hindi' }].map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-all ${
                lang === l.code
                  ? 'border-ink-600 bg-ink-50 text-ink-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Reminder Template */}
      <div className="card mb-5">
        <h2 className="font-display text-lg font-bold text-slate-800 mb-1">WhatsApp Reminder Template</h2>
        <p className="text-slate-500 text-sm mb-3">
          Use <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">{'{name}'}</code>,{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">{'{amount}'}</code>,{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">{'{shopName}'}</code> as variables.
        </p>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTemplate(DEFAULT_TEMPLATE_EN)}
            className="text-xs btn-secondary py-1.5 px-3"
          >
            Use English Template
          </button>
          <button
            onClick={() => setTemplate(DEFAULT_TEMPLATE_HI)}
            className="text-xs btn-secondary py-1.5 px-3"
          >
            Use Hindi Template
          </button>
        </div>

        <textarea
          className="input resize-none"
          rows={4}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Enter reminder message..."
        />

        {/* Preview */}
        <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-xs font-semibold text-green-700 mb-1.5">💬 Preview:</p>
          <p className="text-sm text-green-800">{previewMessage}</p>
        </div>
      </div>

      <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
        {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}
        Save Settings
      </button>
    </div>
  );
}
