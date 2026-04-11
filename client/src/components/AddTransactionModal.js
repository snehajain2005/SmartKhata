import React, { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useVoiceInput } from '../hooks/useVoiceInput';

export default function AddTransactionModal({ customerId, customerName, onClose, onSuccess }) {
  const [form, setForm] = useState({ type: 'credit', amount: '', items: '' });
  const [voiceResult, setVoiceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'confirm-voice'

  const handleVoiceResult = useCallback((result) => {
    setVoiceResult(result);
    if (result.amount) {
      setForm((f) => ({ ...f, amount: result.amount, items: result.items || f.items }));
    }
    setStep('confirm-voice');
  }, []);

  const { listening, supported, startListening, stopListening } = useVoiceInput(handleVoiceResult);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      return toast.error('Please enter a valid amount');
    }
    setLoading(true);
    try {
      await api.post('/transactions', {
        customerId,
        type: form.type,
        amount: Number(form.amount),
        items: form.items,
      });
      toast.success(`${form.type === 'credit' ? 'Udhaar' : 'Payment'} recorded!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800">Add Transaction</h2>
            <p className="text-sm text-slate-500">For: {customerName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">✕</button>
        </div>

        <div className="p-5">
          {/* Type Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'credit' })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                form.type === 'credit' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              📤 Udhaar (Credit)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'payment' })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                form.type === 'payment' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              📥 Payment
            </button>
          </div>

          {/* Voice Result Banner */}
          {step === 'confirm-voice' && voiceResult && (
            <div className="bg-ink-50 border border-ink-200 rounded-xl p-3 mb-4 text-sm">
              <p className="text-ink-700 font-medium mb-1">🎤 Heard: "{voiceResult.transcript}"</p>
              <p className="text-ink-600 text-xs">Please review and confirm the values below.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
              <input
                type="number"
                className="input text-lg font-semibold"
                placeholder="0"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Items / Note <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Rice 5kg, Sugar 2kg"
                value={form.items}
                onChange={(e) => setForm({ ...form, items: e.target.value })}
              />
            </div>

            {/* Voice Input */}
            {supported && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    listening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-ink-600 text-white hover:bg-ink-700'
                  }`}
                >
                  🎤 {listening ? 'Listening...' : 'Voice Input'}
                </button>
                <p className="text-xs text-slate-500">
                  {listening ? 'Speak amount & items in Hindi/English' : 'Say e.g. "teen sau rupaye chawal"'}
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 font-semibold px-5 py-2.5 rounded-xl transition-all text-white ${
                  form.type === 'credit' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
                } flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : `Save ${form.type === 'credit' ? 'Udhaar' : 'Payment'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
