import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate, formatTime, formatRelativeTime, getDaysSince } from '../utils/helpers';
import { SkeletonStatCard, SkeletonTransactionCard, SkeletonTableRow } from '../components/SkeletonCard';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, sub, icon, borderClass, valueClass }) => (
  <div className={`card flex-1 min-w-0 border-l-4 ${borderClass} hover:shadow-card-hover transition-all duration-200`}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`font-display text-2xl font-bold mt-1 ${valueClass || 'text-slate-800'}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl flex-shrink-0 border border-slate-100">
        {icon}
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, icon, label, desc, color }) => (
  <Link
    to={to}
    className="card flex-1 min-w-0 flex items-center gap-3 hover:shadow-card-hover hover:border-ink-100 transition-all duration-200 group cursor-pointer"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color} group-hover:scale-110 transition-transform duration-200`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="font-semibold text-slate-700 text-sm group-hover:text-ink-700 transition-colors">{label}</p>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  </Link>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data: res }) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  // Overdue customers: customers with balance > 0 and last txn > 7 days
  const overdueCustomers = data?.recentTransactions
    ? (() => {
        const customerMap = {};
        data.recentTransactions.forEach((txn) => {
          const cid = txn.customerId?._id;
          if (cid && !customerMap[cid]) {
            customerMap[cid] = { customer: txn.customerId, lastDate: txn.createdAt };
          }
        });
        return Object.values(customerMap).filter(
          (c) => getDaysSince(c.lastDate) > 7
        );
      })()
    : [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="pb-20 md:pb-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-7">
        <p className="text-slate-500 text-sm font-medium">{greeting()} 👋</p>
        <h1 className="font-display text-3xl font-bold text-slate-800 mt-0.5">
          {user?.shopName}
        </h1>
        <p className="text-slate-400 text-sm mt-1">{formatDate(new Date())} · Here's your khata summary</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {loading ? (
          Array(4).fill(null).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Udhaar"
              value={formatCurrency(data?.totalUdhaar || 0)}
              sub="Credit given"
              icon={<span>📤</span>}
              borderClass="border-rose-400"
              valueClass="text-rose-600"
            />
            <StatCard
              label="Recovered"
              value={formatCurrency(data?.totalRecovered || 0)}
              sub="Payments received"
              icon={<span>📥</span>}
              borderClass="border-emerald-400"
              valueClass="text-emerald-600"
            />
            <StatCard
              label="Pending"
              value={formatCurrency(data?.pendingAmount || 0)}
              sub="Outstanding balance"
              icon={<span>⏳</span>}
              borderClass="border-saffron-400"
              valueClass={data?.pendingAmount > 0 ? 'text-saffron-600' : 'text-slate-800'}
            />
            <StatCard
              label="Customers"
              value={data?.totalCustomers || 0}
              sub="Total registered"
              icon={<span>👥</span>}
              borderClass="border-ink-400"
              valueClass="text-ink-700"
            />
          </>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <QuickAction
          to="/customers"
          icon={<svg className="w-5 h-5 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
          label="Add Customer"
          desc="Register new customer"
          color="bg-ink-50 border border-ink-100"
        />
        <QuickAction
          to="/customers"
          icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          label="All Customers"
          desc="View & manage"
          color="bg-emerald-50 border border-emerald-100"
        />
        <QuickAction
          to="/settings"
          icon={<svg className="w-5 h-5 text-saffron-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          label="Settings"
          desc="Customize your khata"
          color="bg-saffron-50 border border-saffron-100"
        />
      </div>

      {/* ── Overdue Alert ── */}
      {!loading && overdueCustomers.length > 0 && (
        <div className="bg-saffron-50 border border-saffron-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-saffron-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-saffron-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-saffron-800 font-semibold text-sm">
              {overdueCustomers.length} customer{overdueCustomers.length > 1 ? 's' : ''} overdue for 7+ days
            </p>
            <p className="text-saffron-600 text-xs mt-0.5">
              {overdueCustomers.map((c) => c.customer?.name).filter(Boolean).slice(0, 3).join(', ')}
              {overdueCustomers.length > 3 ? ` +${overdueCustomers.length - 3} more` : ''}
            </p>
            <Link to="/customers" className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-700 hover:text-saffron-800 mt-1.5">
              Send reminders →
            </Link>
          </div>
        </div>
      )}

      {/* ── Recent Transactions ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-800">Recent Transactions</h2>
            {!loading && data?.recentTransactions?.length > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">{data.recentTransactions.length} latest entries</p>
            )}
          </div>
          <Link to="/customers" className="text-xs font-semibold text-ink-600 hover:text-ink-700 transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <>
            {/* Mobile skeleton */}
            <div className="flex flex-col gap-2.5 md:hidden">
              {Array(4).fill(null).map((_, i) => <SkeletonTransactionCard key={i} />)}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header">Customer</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Items</th>
                    <th className="table-header">Type</th>
                    <th className="table-header text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(5).fill(null).map((_, i) => <SkeletonTableRow key={i} />)}
                </tbody>
              </table>
            </div>
          </>
        ) : data?.recentTransactions?.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-4">
              📭
            </div>
            <h3 className="font-display text-base font-bold text-slate-600 mb-1">No transactions yet</h3>
            <p className="text-slate-400 text-sm mb-4">Add a customer and record your first udhaar</p>
            <Link to="/customers" className="btn-primary text-sm inline-flex">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile List */}
            <div className="flex flex-col gap-2.5 md:hidden">
              {data.recentTransactions.map((txn) => (
                <Link
                  key={txn._id}
                  to={`/customers/${txn.customerId?._id}`}
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-colors hover:opacity-90 ${
                    txn.type === 'credit' ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    txn.type === 'credit' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {txn.customerId?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{txn.customerId?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{formatRelativeTime(txn.createdAt)}</p>
                    {txn.items && <p className="text-xs text-slate-500 truncate">{txn.items}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${txn.type === 'credit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <span className={txn.type === 'credit' ? 'badge-credit' : 'badge-payment'}>
                      {txn.type === 'credit' ? 'Udhaar' : 'Payment'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header">Customer</th>
                    <th className="table-header">Date & Time</th>
                    <th className="table-header">Items / Note</th>
                    <th className="table-header">Type</th>
                    <th className="table-header text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.map((txn) => (
                    <tr key={txn._id} className="table-row">
                      <td className="table-cell">
                        <Link to={`/customers/${txn.customerId?._id}`} className="flex items-center gap-2.5 group">
                          <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-bold text-xs flex-shrink-0">
                            {txn.customerId?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-700 group-hover:underline">{txn.customerId?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-400">{txn.customerId?.phone}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="table-cell">
                        <p className="text-slate-700">{formatDate(txn.createdAt)}</p>
                        <p className="text-xs text-slate-400">{formatTime(txn.createdAt)}</p>
                      </td>
                      <td className="table-cell text-slate-500 max-w-[200px] truncate">{txn.items || '—'}</td>
                      <td className="table-cell">
                        <span className={txn.type === 'credit' ? 'badge-credit' : 'badge-payment'}>
                          {txn.type === 'credit' ? 'Udhaar' : 'Payment'}
                        </span>
                        {txn.paymentMethod === 'razorpay' && (
                          <span className="badge-razorpay ml-1">Online</span>
                        )}
                      </td>
                      <td className={`table-cell text-right font-bold ${txn.type === 'credit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
