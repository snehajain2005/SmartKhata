import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className={`card flex-1 min-w-0 border-l-4 ${color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="font-display text-2xl font-bold text-slate-800 mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
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

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-ink-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-800">
          Namaste, {user?.shopName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">{formatDate(new Date())} — Here's your khata summary</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Udhaar"
          value={formatCurrency(data?.totalUdhaar || 0)}
          icon="📤"
          color="border-rose-400"
          sub="Total credit given"
        />
        <StatCard
          label="Recovered"
          value={formatCurrency(data?.totalRecovered || 0)}
          icon="📥"
          color="border-emerald-400"
          sub="Total payments received"
        />
        <StatCard
          label="Pending"
          value={formatCurrency(data?.pendingAmount || 0)}
          icon="⏳"
          color="border-saffron-400"
          sub="Outstanding balance"
        />
        <StatCard
          label="Customers"
          value={data?.totalCustomers || 0}
          icon="👥"
          color="border-ink-400"
          sub="Total customers"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <Link to="/customers" className="btn-primary flex items-center gap-2 text-sm">
          ➕ Add Customer
        </Link>
        <Link to="/customers" className="btn-secondary flex items-center gap-2 text-sm">
          📋 View All
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="font-display text-lg font-bold text-slate-800 mb-4">Recent Transactions</h2>
        {data?.recentTransactions?.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <div className="text-4xl mb-3">📭</div>
            <p>No transactions yet.</p>
            <Link to="/customers" className="text-ink-600 text-sm font-medium mt-2 inline-block">Add your first customer →</Link>
          </div>
        ) : (
          <>
            {/* Mobile list */}
            <div className="flex flex-col gap-3 md:hidden">
              {data?.recentTransactions?.map((txn) => (
                <Link
                  key={txn._id}
                  to={`/customers/${txn.customerId?._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                    txn.type === 'credit' ? 'bg-rose-100' : 'bg-emerald-100'
                  }`}>
                    {txn.type === 'credit' ? '📤' : '📥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{txn.customerId?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{formatDate(txn.createdAt)} · {formatTime(txn.createdAt)}</p>
                    {txn.items && <p className="text-xs text-slate-500 truncate">{txn.items}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${txn.type === 'credit' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <span className={txn.type === 'credit' ? 'badge-credit' : 'badge-payment'}>
                      {txn.type === 'credit' ? 'Udhaar' : 'Payment'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 text-slate-500 font-semibold">Customer</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-semibold">Date & Time</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-semibold">Items</th>
                    <th className="text-left py-3 px-2 text-slate-500 font-semibold">Type</th>
                    <th className="text-right py-3 px-2 text-slate-500 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentTransactions?.map((txn) => (
                    <tr key={txn._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2">
                        <Link to={`/customers/${txn.customerId?._id}`} className="font-medium text-ink-700 hover:underline">
                          {txn.customerId?.name || 'Unknown'}
                        </Link>
                        <p className="text-xs text-slate-400">{txn.customerId?.phone}</p>
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        <div>{formatDate(txn.createdAt)}</div>
                        <div className="text-xs text-slate-400">{formatTime(txn.createdAt)}</div>
                      </td>
                      <td className="py-3 px-2 text-slate-500 max-w-xs truncate">{txn.items || '—'}</td>
                      <td className="py-3 px-2">
                        <span className={txn.type === 'credit' ? 'badge-credit' : 'badge-payment'}>
                          {txn.type === 'credit' ? 'Udhaar' : 'Payment'}
                        </span>
                      </td>
                      <td className={`py-3 px-2 text-right font-bold ${txn.type === 'credit' ? 'text-rose-500' : 'text-emerald-500'}`}>
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
