import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import CustomerFormModal from '../components/CustomerFormModal';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    api.get('/customers')
      .then(({ data }) => setCustomers(data.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name} and all their transactions?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Customers</h1>
          <p className="text-slate-500 text-sm">{customers.length} total</p>
        </div>
        <button onClick={() => { setEditCustomer(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          ➕ <span className="hidden sm:inline">Add Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="text"
          className="input pl-10"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-ink-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">👥</div>
          <h3 className="font-display text-xl font-bold text-slate-700 mb-1">
            {search ? 'No results found' : 'No customers yet'}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {search ? 'Try a different search' : 'Add your first customer to get started'}
          </p>
          {!search && (
            <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
              ➕ Add Customer
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map((c) => (
              <div key={c._id} className="card flex items-center gap-3 py-3 px-4">
                <Link to={`/customers/${c._id}`} className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-bold text-base flex-shrink-0">
                    {c.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.phone}</p>
                  </div>
                </Link>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-base ${c.balance > 0 ? 'text-rose-500' : c.balance < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {formatCurrency(Math.abs(c.balance))}
                  </p>
                  <p className="text-xs text-slate-400">{c.balance > 0 ? 'Pending' : c.balance < 0 ? 'Advance' : 'Clear'}</p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => { setEditCustomer(c); setShowModal(true); }} className="text-xs text-ink-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c._id, c.name)} className="text-xs text-rose-500 hover:underline">Del</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-slate-500 font-semibold">Customer</th>
                  <th className="text-left py-3 px-3 text-slate-500 font-semibold">Phone</th>
                  <th className="text-right py-3 px-3 text-slate-500 font-semibold">Balance</th>
                  <th className="text-right py-3 px-3 text-slate-500 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <Link to={`/customers/${c._id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-bold">
                          {c.name[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-ink-700 hover:underline">{c.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{c.phone}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-bold ${c.balance > 0 ? 'text-rose-500' : c.balance < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {formatCurrency(Math.abs(c.balance))}
                      </span>
                      <p className="text-xs text-slate-400">{c.balance > 0 ? 'Pending' : c.balance < 0 ? 'Advance' : 'Clear'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/customers/${c._id}`} className="text-xs btn-secondary py-1.5 px-3">View</Link>
                        <button onClick={() => { setEditCustomer(c); setShowModal(true); }} className="text-xs btn-secondary py-1.5 px-3">Edit</button>
                        <button onClick={() => handleDelete(c._id, c.name)} className="text-xs text-white bg-rose-500 hover:bg-rose-600 py-1.5 px-3 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <CustomerFormModal
          existing={editCustomer}
          onClose={() => { setShowModal(false); setEditCustomer(null); }}
          onSuccess={fetchCustomers}
        />
      )}
    </div>
  );
}
