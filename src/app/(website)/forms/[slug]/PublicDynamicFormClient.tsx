'use client';

import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicDynamicFormClient({ slug }: { slug: string }) {
  const [form, setForm] = useState<any | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch('/api/forms?status=active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setForm(data.data.find((item: any) => item.slug === slug) || null);
      })
      .catch(() => undefined);
  }, [slug]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const res = await fetch('/api/form-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId: form._id, formName: form.name, data: values, status: 'new' }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Form submitted');
      setValues({});
    } else {
      toast.error(data.error || 'Submission failed');
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>{form?.name || 'VELRUMA Form'}</h1>
      <p className="mt-2 text-sm text-zinc-500">Submit your details and our team will review it.</p>
      {!form ? (
        <p className="mt-8 text-sm text-zinc-500">Form not found or inactive.</p>
      ) : (
        <form onSubmit={submit} className="mt-8 grid gap-4">
          {(form.fields?.length ? form.fields : [
            { key: 'name', label: 'Name', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'phone', label: 'Phone', type: 'phone', required: false },
            { key: 'message', label: 'Message', type: 'textarea', required: true },
          ]).map((field: any) => (
            <label key={field.key}>
              <span className="mb-1 block text-sm font-medium text-zinc-700">{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea required={field.required} value={values[field.key] || ''} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} rows={4} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
              ) : (
                <input required={field.required} type={field.type === 'phone' ? 'tel' : field.type || 'text'} value={values[field.key] || ''} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
              )}
            </label>
          ))}
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white">
            <Send className="h-4 w-4" />
            Submit
          </button>
        </form>
      )}
    </section>
  );
}
