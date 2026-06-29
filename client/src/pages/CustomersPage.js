import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import CustomerFormModal from '../components/CustomerFormModal';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonCustomerCard, SkeletonTableRow } from '../components/SkeletonCard';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    api.get('/customers')
      .then(({ data }) => setCustomers(data.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/customers/${deleteTarget.id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const pendingCount = customers.filter((c) => c.balance > 0).length;

  return (
    <div className="pb-24 md:pb-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Customers</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 text-sm">{customers.length} total</p>
            {pendingCount > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="badge-overdue">{pendingCount} pending</span>
              </>
            )}
          </div>
        </div>
        <button
          id="add-customer-btn"
          onClick={() => { setEditCustomer(null); setShowModal(true); }}
          className="btn-primary text-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          id="customer-search-input"
          type="text"
          className="input pl-10 pr-10"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Result count ── */}
      {search && !loading && (
        <p className="text-sm text-slate-500 mb-3">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="font-medium text-slate-700">{search}</span>"
        </p>
      )}

      {loading ? (
        <>
          {/* Mobile skeleton */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {Array(5).fill(null).map((_, i) => <SkeletonCustomerCard key={i} />)}
          </div>
          {/* Desktop skeleton */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Customer</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header text-right">Balance</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array(5).fill(null).map((_, i) => <SkeletonTableRow key={i} />)}
              </tbody>
            </table>
          </div>
        </>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-4">
            {search ? '🔍' : '👥'}
          </div>
          <h3 className="font-display text-lg font-bold text-slate-700 mb-1">
            {search ? 'No results found' : 'No customers yet'}
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            {search ? `No customers match "${search}". Try a different search.` : 'Add your first customer to start tracking udhaar.'}
          </p>
          {!search && (
            <button onClick={() => setShowModal(true)} className="btn-primary inline-flex">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Customer
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Mobile Cards ── */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {filtered.map((c) => (
              <div key={c._id} className="card py-3.5 px-4 flex items-center gap-3 hover:shadow-card-hover hover:border-ink-100 transition-all duration-200">
                <Link to={`/customers/${c._id}`} className="flex-1 flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${
                    c.balance > 0
                      ? 'bg-rose-100 text-rose-700'
                      : c.balance < 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-ink-100 text-ink-700'
                  }`}>
                    {c.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.phone}</p>
                  </div>
                </Link>
                <div className="text-right flex-shrink-0 mx-2">
                  <p className={`font-bold text-sm ${
                    c.balance > 0 ? 'text-rose-600' : c.balance < 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {formatCurrency(Math.abs(c.balance))}
                  </p>
                  <span className={c.balance > 0 ? 'badge-credit' : c.balance < 0 ? 'badge-payment' : 'badge-neutral'}>
                    {c.balance > 0 ? 'Pending' : c.balance < 0 ? 'Advance' : 'Clear'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditCustomer(c); setShowModal(true); }}
                    className="text-xs text-ink-600 hover:text-ink-800 font-medium px-2 py-1 rounded-lg hover:bg-ink-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: c._id, name: c.name })}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop Table ── */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Customer</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header text-right">Balance</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="table-row">
                    <td className="table-cell">
                      <Link to={`/customers/${c._id}`} className="flex items-center gap-3 group">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          c.balance > 0
                            ? 'bg-rose-100 text-rose-700'
                            : c.balance < 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-ink-100 text-ink-700'
                        }`}>
                          {c.name[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-ink-700 group-hover:underline">{c.name}</span>
                      </Link>
                    </td>
                    <td className="table-cell text-slate-500">{c.phone}</td>
                    <td className="table-cell text-right">
                      <p className={`font-bold ${
                        c.balance > 0 ? 'text-rose-600' : c.balance < 0 ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {formatCurrency(Math.abs(c.balance))}
                      </p>
                      <span className={c.balance > 0 ? 'badge-credit' : c.balance < 0 ? 'badge-payment' : 'badge-neutral'}>
                        {c.balance > 0 ? 'Pending' : c.balance < 0 ? 'Advance' : 'Clear'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/customers/${c._id}`} className="btn-secondary text-xs py-1.5 px-3">
                          View
                        </Link>
                        <button
                          onClick={() => { setEditCustomer(c); setShowModal(true); }}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: c._id, name: c.name })}
                          className="text-xs text-white bg-rose-500 hover:bg-rose-600 py-1.5 px-3 rounded-lg transition-colors font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Modals ── */}
      {showModal && (
        <CustomerFormModal
          existing={editCustomer}
          onClose={() => { setShowModal(false); setEditCustomer(null); }}
          onSuccess={fetchCustomers}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Customer?"
          message={`This will permanently delete "${deleteTarget.name}" and all their transaction history. This cannot be undone.`}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
