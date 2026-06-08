'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LoadingState from '@/components/shared/LoadingState';
import ImageUpload from '@/components/shared/ImageUpload';

const socialPlatformOptions = ['instagram', 'facebook', 'youtube', 'twitter', 'linkedin', 'pinterest', 'whatsapp'];

function parseJsonList(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function stringifyRows(rows: unknown[]) {
  return JSON.stringify(rows, null, 2);
}

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

  const updateJsonRow = (key: string, index: number, patch: Record<string, unknown>) => {
    const setting = settings.find((item) => item.key === key);
    const rows = parseJsonList(setting?.value);
    rows[index] = { ...rows[index], ...patch };
    updateValue(key, stringifyRows(rows));
  };

  const addJsonRow = (key: string, row: Record<string, unknown>) => {
    const setting = settings.find((item) => item.key === key);
    updateValue(key, stringifyRows([...parseJsonList(setting?.value), row]));
  };

  const removeJsonRow = (key: string, index: number) => {
    const setting = settings.find((item) => item.key === key);
    updateValue(key, stringifyRows(parseJsonList(setting?.value).filter((_, rowIndex) => rowIndex !== index)));
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

              if (setting.key === 'footer_social_links') {
                const rows = parseJsonList(setting.value);
                return (
                  <div key={setting.key} className="md:col-span-2">
                    {labelWithDesc}
                    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      {rows.map((row: any, index) => (
                        <div key={index} className="grid gap-3 rounded-lg border border-white/10 bg-zinc-950/40 p-3 md:grid-cols-[160px_1fr_1fr_auto]">
                          <select
                            value={row.platform || 'instagram'}
                            onChange={(event) => updateJsonRow(setting.key, index, { platform: event.target.value })}
                            className="h-10 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white"
                          >
                            {socialPlatformOptions.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
                          </select>
                          <input
                            value={row.label || ''}
                            onChange={(event) => updateJsonRow(setting.key, index, { label: event.target.value })}
                            placeholder="Label"
                            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500"
                          />
                          <input
                            value={row.url || ''}
                            onChange={(event) => updateJsonRow(setting.key, index, { url: event.target.value })}
                            placeholder="https://..."
                            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500"
                          />
                          <button type="button" onClick={() => removeJsonRow(setting.key, index)} className="rounded-lg px-3 text-sm font-semibold text-red-400 hover:bg-red-500/10">
                            Remove
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addJsonRow(setting.key, { platform: 'instagram', label: '', url: '' })} className="rounded-lg border border-amber-500/30 px-3 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-500/10">
                        + Add social link
                      </button>
                    </div>
                  </div>
                );
              }

              if (setting.key === 'header_supported_links') {
                const rows = parseJsonList(setting.value);
                return (
                  <div key={setting.key} className="md:col-span-2">
                    {labelWithDesc}
                    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      {rows.map((row: any, index) => (
                        <div key={index} className="grid gap-3 rounded-lg border border-white/10 bg-zinc-950/40 p-3 lg:grid-cols-[1fr_1fr_1fr_220px_auto]">
                          <input
                            value={row.label || ''}
                            onChange={(event) => updateJsonRow(setting.key, index, { label: event.target.value })}
                            placeholder="Top text e.g. SUPPORTED BY"
                            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500"
                          />
                          <input
                            value={row.url || ''}
                            onChange={(event) => updateJsonRow(setting.key, index, { url: event.target.value })}
                            placeholder="https://..."
                            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500"
                          />
                          <input
                            value={row.badgeText || ''}
                            onChange={(event) => updateJsonRow(setting.key, index, { badgeText: event.target.value })}
                            placeholder="Badge text e.g. Flipkart"
                            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-amber-500"
                          />
                          <ImageUpload
                            label="Logo/Icon"
                            value={row.logo || ''}
                            folder="settings"
                            onChange={(value) => updateJsonRow(setting.key, index, { logo: value })}
                          />
                          <button type="button" onClick={() => removeJsonRow(setting.key, index)} className="h-10 rounded-lg px-3 text-sm font-semibold text-red-400 hover:bg-red-500/10">
                            Remove
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addJsonRow(setting.key, { label: 'SUPPORTED BY', url: '', logo: '', badgeText: '' })} className="rounded-lg border border-amber-500/30 px-3 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-500/10">
                        + Add supported link
                      </button>
                    </div>
                  </div>
                );
              }

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
