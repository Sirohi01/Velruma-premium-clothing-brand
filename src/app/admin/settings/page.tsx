'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LoadingState from '@/components/shared/LoadingState';
import ImageUpload from '@/components/shared/ImageUpload';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
        else toast.error(data.error || 'Failed to load settings');
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const grouped = settings.reduce<Record<string, any[]>>((acc, setting) => {
    acc[setting.group] = acc[setting.group] || [];
    acc[setting.group].push(setting);
    return acc;
  }, {});

  const updateValue = (key: string, value: unknown) => {
    setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value } : setting)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        toast.success('Settings saved');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading settings..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-zinc-500">Brand, tax, invoice, shipping, and SEO defaults.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <section key={group} className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400">{group}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((setting) => {
              const labelWithDesc = (
                <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {setting.label}
                  {setting.description && (
                    <span className="ml-2 font-normal text-zinc-500">({setting.description})</span>
                  )}
                </span>
              );

              return setting.type === 'image' ? (
                <div key={setting.key}>
                  {labelWithDesc}
                  <ImageUpload
                    label=""
                    value={String(setting.value ?? '')}
                    folder="settings"
                    onChange={(value) => updateValue(setting.key, value)}
                  />
                </div>
              ) : setting.type === 'boolean' ? (
                <label key={setting.key} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-300">{setting.label}</span>
                    {setting.description && <span className="text-xs text-zinc-500">{setting.description}</span>}
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(setting.value)}
                    onChange={(event) => updateValue(setting.key, event.target.checked)}
                    className="h-4 w-4 accent-amber-500"
                  />
                </label>
              ) : setting.type === 'textarea' ? (
                <label key={setting.key} className="block md:col-span-2">
                  {labelWithDesc}
                  <textarea
                    value={String(setting.value ?? '')}
                    onChange={(event) => updateValue(setting.key, event.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </label>
              ) : (
                <label key={setting.key} className="block">
                  {labelWithDesc}
                  <input
                    type={setting.type === 'number' ? 'number' : setting.type === 'color' ? 'color' : 'text'}
                    value={String(setting.value ?? '')}
                    onChange={(event) => updateValue(setting.key, setting.type === 'number' ? Number(event.target.value) : event.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
