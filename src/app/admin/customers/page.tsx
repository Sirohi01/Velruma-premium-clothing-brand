'use client';

import { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2, Users, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import DataTable from '@/components/shared/DataTable';

const emptyForm = { name: '', email: '', phone: '', password: '', loyaltyPoints: 0, isActive: true };

function money(value: number) {
  return `INR ${Number(value || 0).toLocaleString('en-IN')}`;
}

function dateText(value?: string) {
  return value ? new Date(value).toLocaleDateString('en-IN') : '-';
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    if (data.success) setCustomers(data.data);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (customer: any) => {
    setEditTarget(customer);
    setForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      password: '',
      loyaltyPoints: customer.loyaltyPoints || 0,
      isActive: customer.isActive ?? true,
    });
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: any = { ...form, loyaltyPoints: Number(form.loyaltyPoints || 0) };
    if (editTarget) delete payload.password;
    const res = await fetch(editTarget ? `/api/customers/${editTarget._id}` : '/api/customers', {
      method: editTarget ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(editTarget ? 'Customer updated' : 'Customer created');
      setModalOpen(false);
      fetchCustomers();
    } else {
      toast.error(data.error || 'Customer save failed');
    }
  };

  const deactivate = async (customer: any) => {
    const res = await fetch(`/api/customers/${customer._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast.success('Customer deactivated');
      fetchCustomers();
    } else {
      toast.error(data.error || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-zinc-500">Manage customer profiles, contact data and loyalty points.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black">
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      <DataTable
        data={customers}
        empty="No customers found."
        columns={[
          { key: 'name', header: 'Customer', cell: (row: any) => <Link href={`/admin/customers/${row._id}`} className="font-medium text-white hover:text-amber-300">{row.name}</Link> },
          { key: 'email', header: 'Email', cell: (row: any) => row.email },
          { key: 'phone', header: 'Phone', cell: (row: any) => row.phone || '-' },
          { key: 'orders', header: 'Orders', cell: (row: any) => row.orderStats?.orders || 0 },
          { key: 'spend', header: 'Spend', cell: (row: any) => money(row.orderStats?.revenue || 0) },
          { key: 'lastOrder', header: 'Last Order', cell: (row: any) => dateText(row.orderStats?.lastOrderAt) },
          { key: 'loyalty', header: 'Loyalty', cell: (row: any) => `${row.loyaltyPoints || 0} pts` },
          { key: 'status', header: 'Status', cell: (row: any) => row.isActive ? 'Active' : 'Inactive' },
          { key: 'actions', header: 'Actions', className: 'px-5 py-3 text-right', cell: (row: any) => (
            <div className="flex justify-end gap-1">
              <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => deactivate(row)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          ) },
        ]}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{editTarget ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={save} className="mt-6 grid gap-4 md:grid-cols-2">
              <Input required label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <Input required label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
              <Input label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
              {!editTarget && <Input label="Password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />}
              <Input label="Loyalty Points" type="number" value={String(form.loyaltyPoints)} onChange={(value) => setForm({ ...form, loyaltyPoints: Number(value) })} />
              <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
              <div className="flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:bg-white/10">Cancel</button>
                <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {customers.length === 0 && <Users className="hidden" />}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-medium uppercase text-zinc-500">{label}</span>
      <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500" />
    </label>
  );
}
