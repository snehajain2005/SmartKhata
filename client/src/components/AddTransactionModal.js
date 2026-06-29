import React, { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useVoiceInput } from '../hooks/useVoiceInput';

export default function AddTransactionModal({ customerId, customerName, onClose, onSuccess }) {
  const [form, setForm] = useState({ type: 'credit', amount: '', items: '' });
  const [voiceResult, setVoiceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voiceConfirmStep, setVoiceConfirmStep] = useState(false);

  const handleVoiceResult = useCallback((result) => {
    setVoiceResult(result);
    if (result.amount) {
      setForm((f) => ({ ...f, amount: result.amount, items: result.items || f.items }));
    }
    setVoiceConfirmStep(true);
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

  const isCredit = form.type === 'credit';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-800">Add Transaction</h2>
            <p className="text-sm text-slate-500 mt-0.5">For: <span className="font-medium text-slate-700">{customerName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {/* Type Toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'credit' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isCredit
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Udhaar (Credit)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'payment' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                !isCredit
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Payment
            </button>
          </div>

          {/* Voice Result Banner */}
          {voiceConfirmStep && voiceResult && (
            <div className="bg-ink-50 border border-ink-200 rounded-xl p-3.5 mb-4">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-ink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-ink-700 font-medium text-sm">Heard: "{voiceResult.transcript}"</p>
                  <p className="text-ink-600 text-xs mt-0.5">Review and edit the values below before saving.</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">₹</span>
                <input
                  type="number"
                  id="transaction-amount"
                  className="input pl-8 text-xl font-bold text-slate-800"
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Items / Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Items / Note <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="transaction-items"
                className="input"
                placeholder="e.g. Rice 5kg, Sugar 2kg"
                value={form.items}
                onChange={(e) => setForm({ ...form, items: e.target.value })}
              />
            </div>

            {/* Voice Input */}
            {supported && (
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="relative">
                  {listening && (
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring opacity-60" />
                  )}
                  <button
                    type="button"
                    id="voice-input-btn"
                    onClick={listening ? stopListening : startListening}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      listening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                        : 'bg-ink-600 text-white hover:bg-ink-700 shadow-sm'
                    }`}
                    aria-label={listening ? 'Stop listening' : 'Start voice input'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {listening ? '🎤 Listening...' : 'Voice Input'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {listening ? 'Speak amount & items in Hindi/English' : 'Say e.g. "teen sau rupaye chawal"'}
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                id="save-transaction-btn"
                className={`flex-1 font-semibold px-5 py-2.5 rounded-xl transition-all text-white active:scale-[0.97] flex items-center justify-center gap-2 shadow-sm ${
                  isCredit
                    ? 'bg-rose-500 hover:bg-rose-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {loading ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save {isCredit ? 'Udhaar' : 'Payment'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
