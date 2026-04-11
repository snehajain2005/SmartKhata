import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate, formatTime, generateWhatsAppLink } from '../utils/helpers';
import AddTransactionModal from '../components/AddTransactionModal';
import toast from 'react-hot-toast';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    api.get(`/customers/${id}`)
      .then(({ data: res }) => setData(res.data))
      .catch(() => toast.error('Failed to load customer'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteTxn = async (txnId) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${txnId}`);
      toast.success('Transaction deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete transaction');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-ink-600 border-t-transparent" />
    </div>
  );

  if (!data) return (
    <div className="card text-center py-16">
      <p className="text-slate-500">Customer not found.</p>
      <Link to="/customers" className="text-ink-600 mt-2 inline-block">← Back to Customers</Link>
    </div>
  );

  const { customer, transactions, summary } = data;
  const whatsappLink = generateWhatsAppLink(
    customer.phone,
    customer.name,
    summary.balance,
    user?.shopName,
    user?.settings?.reminderTemplate
  );

  return (
    <div className="pb-24 md:pb-0">
      {/* Back */}
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ink-600 mb-5 transition-colors">
        ← Back to Customers
      </Link>

      {/* Customer Header */}
      <div className="card mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-700 font-bold text-xl">
              {customer.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-800">{customer.name}</h1>
              <a href={`tel:${customer.phone}`} className="text-slate-500 text-sm hover:text-ink-600">📞 {customer.phone}</a>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={`text-2xl font-bold ${summary.balance > 0 ? 'text-rose-500' : summary.balance < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
              {formatCurrency(Math.abs(summary.balance))}
            </div>
            <div className="text-xs text-slate-400">
              {summary.balance > 0 ? '⚠️ Pending Balance' : summary.balance < 0 ? '✅ Advance Paid' : '✅ All Clear'}
            </div>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Udhaar</p>
            <p className="font-bold text-rose-500 mt-1">{formatCurrency(summary.totalCredit)}</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Paid Back</p>
            <p className="font-bold text-emerald-500 mt-1">{formatCurrency(summary.totalPayment)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Net Balance</p>
            <p className={`font-bold mt-1 ${summary.balance > 0 ? 'text-rose-500' : 'text-slate-600'}`}>{formatCurrency(Math.abs(summary.balance))}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-5">
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          ➕ Add Transaction
        </button>
        {summary.balance > 0 && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            💬 Send WhatsApp Reminder
          </a>
        )}
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="font-display text-lg font-bold text-slate-800 mb-4">
          Transaction History
          <span className="text-sm font-normal text-slate-400 ml-2">({transactions.length} entries)</span>
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <div className="text-4xl mb-2">📭</div>
            <p>No transactions yet</p>
            <button onClick={() => setShowModal(true)} className="text-ink-600 text-sm font-medium mt-2 block mx-auto">
              Add first transaction →
            </button>
          </div>
        ) : (
          <>
            {/* Mobile List */}
            <div className="flex flex-col gap-2 md:hidden">
              {transactions.map((txn) => (
                <div key={txn._id} className={`flex items-center gap-3 p-3 rounded-xl ${txn.type === 'credit' ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${txn.type === 'credit' ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                    {txn.type === 'credit' ? '📤' : '📥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">{formatDate(txn.createdAt)} · {formatTime(txn.createdAt)}</p>
                    {txn.items && <p className="text-xs text-slate-600 truncate">{txn.items}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${txn.type === 'credit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <button onClick={() => handleDeleteTxn(txn._id)} className="text-xs text-slate-400 hover:text-rose-500 mt-0.5">delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 text-slate-500 font-semibold">Date</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-semibold">Type</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-semibold">Items / Note</th>
                    <th className="text-right py-3 px-2 text-slate-500 font-semibold">Amount</th>
                    <th className="text-right py-3 px-2 text-slate-500 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 text-slate-600">
                        <div>{formatDate(txn.createdAt)}</div>
                        <div className="text-xs text-slate-400">{formatTime(txn.createdAt)}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={txn.type === 'credit' ? 'badge-credit' : 'badge-payment'}>
                          {txn.type === 'credit' ? '📤 Udhaar' : '📥 Payment'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 max-w-xs truncate">{txn.items || '—'}</td>
                      <td className={`py-3 px-2 text-right font-bold ${txn.type === 'credit' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button onClick={() => handleDeleteTxn(txn._id)} className="text-xs text-slate-400 hover:text-rose-500 transition-colors">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <AddTransactionModal
          customerId={customer._id}
          customerName={customer.name}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
