import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  formatCurrency, formatDate, formatTime, formatRelativeTime,
  generateWhatsAppLink, generateWhatsAppMessage
} from '../utils/helpers';
import AddTransactionModal from '../components/AddTransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import WhatsAppModal from '../components/WhatsAppModal';
import RazorpayButton from '../components/RazorpayButton';
import { SkeletonCard, SkeletonTransactionCard, SkeletonTableRow } from '../components/SkeletonCard';
import toast from 'react-hot-toast';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [deleteTxnTarget, setDeleteTxnTarget] = useState(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    api.get(`/customers/${id}`)
      .then(({ data: res }) => setData(res.data))
      .catch(() => toast.error('Failed to load customer'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteTxn = async () => {
    if (!deleteTxnTarget) return;
    try {
      await api.delete(`/transactions/${deleteTxnTarget}`);
      toast.success('Transaction deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete transaction');
    } finally {
      setDeleteTxnTarget(null);
    }
  };

  if (loading) return (
    <div className="pb-24 md:pb-6 animate-fade-in">
      <div className="skeleton h-4 w-24 rounded mb-5" />
      <SkeletonCard lines={4} />
      <div className="mt-5">
        <SkeletonCard lines={6} />
      </div>
    </div>
  );

  if (!data) return (
    <div className="card text-center py-16">
      <div className="text-4xl mb-3">😕</div>
      <p className="text-slate-500 font-medium">Customer not found.</p>
      <Link to="/customers" className="btn-secondary inline-flex mt-4">← Back to Customers</Link>
    </div>
  );

  const { customer, transactions, summary } = data;

  const whatsappMessage = generateWhatsAppMessage(
    customer.name,
    summary.balance,
    user?.shopName,
    user?.settings?.reminderTemplate
  );
  const whatsappLink = generateWhatsAppLink(
    customer.phone,
    customer.name,
    summary.balance,
    user?.shopName,
    user?.settings?.reminderTemplate
  );

  const avatarColors = {
    positive: 'bg-rose-100 text-rose-700',
    negative: 'bg-emerald-100 text-emerald-700',
    zero: 'bg-ink-100 text-ink-700',
  };
  const avatarColor = summary.balance > 0 ? avatarColors.positive : summary.balance < 0 ? avatarColors.negative : avatarColors.zero;

  return (
    <div className="pb-24 md:pb-6 animate-fade-in">
      {/* ── Back ── */}
      <Link
        to="/customers"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ink-600 mb-5 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Customers
      </Link>

      {/* ── Customer Header Card ── */}
      <div className="card mb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0 ${avatarColor}`}>
              {customer.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-800">{customer.name}</h1>
              <a
                href={`tel:${customer.phone}`}
                className="text-sm text-slate-500 hover:text-ink-600 transition-colors flex items-center gap-1.5 mt-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {customer.phone}
              </a>
            </div>
          </div>

          {/* Balance Display */}
          <div className="flex flex-col items-end gap-1">
            <div className={`font-display text-3xl font-bold ${
              summary.balance > 0 ? 'text-rose-600' :
              summary.balance < 0 ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              {formatCurrency(Math.abs(summary.balance))}
            </div>
            <div className="flex items-center gap-1.5">
              {summary.balance > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-semibold text-rose-600">Pending Balance</span>
                </>
              ) : summary.balance < 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">Advance Paid</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-xs font-semibold text-slate-500">All Clear</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Summary Row ── */}
        <div className="grid grid-cols-3 gap-0 mt-5 pt-5 border-t border-slate-100">
          <div className="text-center px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Udhaar</p>
            <p className="font-bold text-rose-500 mt-1 text-lg">{formatCurrency(summary.totalCredit)}</p>
          </div>
          <div className="text-center px-2 border-x border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Paid Back</p>
            <p className="font-bold text-emerald-500 mt-1 text-lg">{formatCurrency(summary.totalPayment)}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Net Balance</p>
            <p className={`font-bold mt-1 text-lg ${summary.balance > 0 ? 'text-rose-500' : 'text-slate-600'}`}>
              {formatCurrency(Math.abs(summary.balance))}
            </p>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        <button
          id="add-transaction-btn"
          onClick={() => setShowTxnModal(true)}
          className="btn-primary text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </button>

        {summary.balance > 0 && (
          <>
            <RazorpayButton
              customerId={customer._id}
              customerName={customer.name}
              customerPhone={customer.phone}
              amount={summary.balance}
              onSuccess={fetchData}
            />

            <button
              id="whatsapp-reminder-btn"
              onClick={() => setShowWhatsApp(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm text-sm active:scale-[0.97]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Reminder
            </button>
          </>
        )}
      </div>

      {/* ── Transaction History ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-800">Transaction History</h2>
            <p className="text-xs text-slate-400 mt-0.5">{transactions.length} entries</p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={() => setShowTxnModal(true)}
              className="text-xs text-ink-600 hover:text-ink-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-4">
              📭
            </div>
            <h3 className="font-display text-base font-bold text-slate-600 mb-1">No transactions yet</h3>
            <p className="text-slate-400 text-sm mb-4">Record the first udhaar or payment</p>
            <button onClick={() => setShowTxnModal(true)} className="btn-primary text-sm inline-flex">
              Add First Transaction
            </button>
          </div>
        ) : (
          <>
            {/* ── Mobile Timeline ── */}
            <div className="flex flex-col gap-2.5 md:hidden">
              {transactions.map((txn, idx) => (
                <div
                  key={txn._id}
                  className={`relative flex items-center gap-3 p-3.5 rounded-xl border ${
                    txn.type === 'credit'
                      ? 'bg-rose-50 border-rose-100'
                      : 'bg-emerald-50 border-emerald-100'
                  }`}
                >
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      txn.type === 'credit' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {txn.paymentMethod === 'razorpay' ? '💳' : txn.type === 'credit' ? '📤' : '📥'}
                    </div>
                    {idx < transactions.length - 1 && (
                      <div className="w-0.5 h-2 bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">{formatRelativeTime(txn.createdAt)} · {formatTime(txn.createdAt)}</p>
                    {txn.items && <p className="text-sm text-slate-700 mt-0.5 truncate">{txn.items}</p>}
                    {txn.paymentMethod === 'razorpay' && (
                      <span className="badge-razorpay text-xs">Online Payment</span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${txn.type === 'credit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <button
                      onClick={() => setDeleteTxnTarget(txn._id)}
                      className="text-xs text-slate-400 hover:text-rose-500 mt-0.5 transition-colors"
                      aria-label="Delete transaction"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header">Date</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Items / Note</th>
                    <th className="table-header text-right">Amount</th>
                    <th className="table-header text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="table-row group">
                      <td className="table-cell">
                        <p className="text-slate-700">{formatDate(txn.createdAt)}</p>
                        <p className="text-xs text-slate-400">{formatTime(txn.createdAt)}</p>
                      </td>
                      <td className="table-cell">
                        <span className={txn.type === 'credit' ? 'badge-credit' : 'badge-payment'}>
                          {txn.type === 'credit' ? '📤 Udhaar' : '📥 Payment'}
                        </span>
                        {txn.paymentMethod === 'razorpay' && (
                          <span className="badge-razorpay ml-1.5">Online</span>
                        )}
                      </td>
                      <td className="table-cell text-slate-500 max-w-[220px] truncate">
                        {txn.items || '—'}
                      </td>
                      <td className={`table-cell text-right font-bold ${
                        txn.type === 'credit' ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td className="table-cell text-right">
                        <button
                          onClick={() => setDeleteTxnTarget(txn._id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 ml-auto"
                          aria-label="Delete transaction"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {showTxnModal && (
        <AddTransactionModal
          customerId={customer._id}
          customerName={customer.name}
          onClose={() => setShowTxnModal(false)}
          onSuccess={fetchData}
        />
      )}

      {deleteTxnTarget && (
        <ConfirmModal
          title="Delete Transaction?"
          message="This transaction will be permanently removed and the balance will update accordingly."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDeleteTxn}
          onCancel={() => setDeleteTxnTarget(null)}
        />
      )}

      {showWhatsApp && (
        <WhatsAppModal
          customerName={customer.name}
          customerPhone={customer.phone}
          message={whatsappMessage}
          whatsappLink={whatsappLink}
          onClose={() => setShowWhatsApp(false)}
        />
      )}
    </div>
  );
}
