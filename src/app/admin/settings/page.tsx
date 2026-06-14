'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, Loader2, Save, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingState from '@/components/shared/LoadingState';
import ImageUpload from '@/components/shared/ImageUpload';

const socialPlatformOptions = ['instagram', 'facebook', 'youtube', 'twitter', 'linkedin', 'pinterest', 'whatsapp'];

const groupLabels: Record<string, { title: string; description: string }> = {
  brand: { title: 'Brand & Header', description: 'Logo, contacts, footer and supported links' },
  theme: { title: 'Theme', description: 'Website colors and visual defaults' },
  tax: { title: 'Tax', description: 'GST, PAN and tax defaults' },
  invoice: { title: 'Invoices', description: 'Prefixes for business documents' },
  team: { title: 'Team', description: 'Employee code automation' },
  bank: { title: 'Payments', description: 'UPI, QR and bank display details' },
  general: { title: 'General', description: 'Currency and global defaults' },
  shipping: { title: 'Shipping & COD', description: 'Shipping charge and COD rules' },
  seo: { title: 'SEO Defaults', description: 'Meta title, description and OG image' },
  email: { title: 'Email & SMTP', description: 'SMTP and marketing email settings' },
  homepage: { title: 'Homepage', description: 'Homepage content settings' },
};

const groupOrder = ['brand', 'theme', 'general', 'shipping', 'tax', 'invoice', 'bank', 'email', 'seo', 'team', 'homepage'];

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

function titleCase(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState('');

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

  const grouped = useMemo(() => settings.reduce<Record<string, any[]>>((acc, setting) => {
    acc[setting.group] = acc[setting.group] || [];
    acc[setting.group].push(setting);
    return acc;
  }, {}), [settings]);

  const groups = useMemo(() => Object.keys(grouped).sort((a, b) => {
    const aIndex = groupOrder.indexOf(a);
    const bIndex = groupOrder.indexOf(b);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex) || a.localeCompare(b);
  }), [grouped]);

  useEffect(() => {
    if (!activeGroup && groups.length) setActiveGroup(groups[0]);
    if (activeGroup && groups.length && !groups.includes(activeGroup)) setActiveGroup(groups[0]);
  }, [activeGroup, groups]);

  const activeItems = grouped[activeGroup] || [];
  const activeMeta = groupLabels[activeGroup] || { title: titleCase(activeGroup || 'Settings'), description: 'Manage this setting group.' };

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

  const renderLabel = (setting: any) => (
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
      {setting.label}
      {setting.description && <span className="ml-2 normal-case tracking-normal text-zinc-400">({setting.description})</span>}
    </span>
  );

  const inputClass = 'h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10';

  const renderSetting = (setting: any) => {
    if (setting.key === 'footer_social_links') {
      const rows = parseJsonList(setting.value);
      return (
        <div key={setting.key} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm md:col-span-2">
          {renderLabel(setting)}
          <div className="space-y-2">
            {rows.map((row: any, index) => (
              <div key={index} className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 md:grid-cols-[140px_1fr_1fr_auto]">
                <select value={row.platform || 'instagram'} onChange={(event) => updateJsonRow(setting.key, index, { platform: event.target.value })} className={inputClass}>
                  {socialPlatformOptions.map((platform) => <option key={platform} value={platform}>{titleCase(platform)}</option>)}
                </select>
                <input value={row.label || ''} onChange={(event) => updateJsonRow(setting.key, index, { label: event.target.value })} placeholder="Label" className={inputClass} />
                <input value={row.url || ''} onChange={(event) => updateJsonRow(setting.key, index, { url: event.target.value })} placeholder="https://..." className={inputClass} />
                <button type="button" onClick={() => removeJsonRow(setting.key, index)} className="h-10 rounded-lg px-3 text-xs font-bold text-red-500 hover:bg-red-50">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addJsonRow(setting.key, { platform: 'instagram', label: '', url: '' })} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100">
              + Add social link
            </button>
          </div>
        </div>
      );
    }

    if (setting.key === 'header_supported_links') {
      const rows = parseJsonList(setting.value);
      return (
        <div key={setting.key} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm md:col-span-2">
          {renderLabel(setting)}
          <div className="space-y-2">
            {rows.map((row: any, index) => (
              <div key={index} className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 lg:grid-cols-[1fr_1fr_1fr_190px_auto]">
                <input value={row.label || ''} onChange={(event) => updateJsonRow(setting.key, index, { label: event.target.value })} placeholder="Top text e.g. SUPPORTED BY" className={inputClass} />
                <input value={row.url || ''} onChange={(event) => updateJsonRow(setting.key, index, { url: event.target.value })} placeholder="https://..." className={inputClass} />
                <input value={row.badgeText || ''} onChange={(event) => updateJsonRow(setting.key, index, { badgeText: event.target.value })} placeholder="Badge text e.g. Flipkart" className={inputClass} />
                <ImageUpload label="Logo/Icon" value={row.logo || ''} folder="settings" onChange={(value) => updateJsonRow(setting.key, index, { logo: value })} />
                <button type="button" onClick={() => removeJsonRow(setting.key, index)} className="h-10 rounded-lg px-3 text-xs font-bold text-red-500 hover:bg-red-50">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addJsonRow(setting.key, { label: 'SUPPORTED BY', url: '', logo: '', badgeText: '' })} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100">
              + Add supported link
            </button>
          </div>
        </div>
      );
    }

    if (setting.type === 'image') {
      return (
        <div key={setting.key} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
          {renderLabel(setting)}
          <ImageUpload label="" value={String(setting.value ?? '')} folder="settings" onChange={(value) => updateValue(setting.key, value)} />
        </div>
      );
    }

    if (setting.type === 'boolean') {
      return (
        <label key={setting.key} className="flex min-h-20 items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
          <span>
            <span className="block text-sm font-semibold text-zinc-900">{setting.label}</span>
            {setting.description && <span className="mt-1 block text-xs text-zinc-500">{setting.description}</span>}
          </span>
          <span className={`relative h-6 w-11 rounded-full transition ${setting.value ? 'bg-amber-500' : 'bg-zinc-300'}`}>
            <input type="checkbox" checked={Boolean(setting.value)} onChange={(event) => updateValue(setting.key, event.target.checked)} className="peer absolute inset-0 opacity-0" />
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${setting.value ? 'left-6' : 'left-1'}`} />
          </span>
        </label>
      );
    }

    if (setting.type === 'textarea') {
      return (
        <label key={setting.key} className="block rounded-xl border border-zinc-200 bg-white p-3 shadow-sm md:col-span-2">
          {renderLabel(setting)}
          <textarea value={String(setting.value ?? '')} onChange={(event) => updateValue(setting.key, event.target.value)} rows={4} className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10" />
        </label>
      );
    }

    return (
      <label key={setting.key} className="block rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
        {renderLabel(setting)}
        <input
          type={setting.type === 'number' ? 'number' : setting.type === 'color' ? 'color' : 'text'}
          value={String(setting.value ?? '')}
          onChange={(event) => updateValue(setting.key, setting.type === 'number' ? Number(event.target.value) : event.target.value)}
          className={`${inputClass} ${setting.type === 'color' ? 'p-1' : ''}`}
        />
      </label>
    );
  };

  if (loading) return <LoadingState label="Loading settings..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950" style={{ fontFamily: "'Playfair Display', serif" }}>Settings</h1>
            <p className="text-sm text-zinc-500">Manage brand, checkout, SEO, SMTP and operational defaults without scrolling through one huge form.</p>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm lg:sticky lg:top-18 lg:self-start">
          {groups.map((group) => {
            const meta = groupLabels[group] || { title: titleCase(group), description: 'Settings group' };
            const active = group === activeGroup;
            return (
              <button
                key={group}
                type="button"
                onClick={() => setActiveGroup(group)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${active ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-700 hover:bg-zinc-50'}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{meta.title}</span>
                  <span className={`block truncate text-xs ${active ? 'text-zinc-300' : 'text-zinc-400'}`}>{grouped[group]?.length || 0} settings</span>
                </span>
                {active ? <Check className="h-4 w-4 text-amber-400" /> : <ChevronRight className="h-4 w-4 text-zinc-300" />}
              </button>
            );
          })}
        </aside>

        <section className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-3 shadow-sm">
          <div className="mb-3 flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-950">{activeMeta.title}</h2>
              <p className="text-xs text-zinc-500">{activeMeta.description}</p>
            </div>
            <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{activeItems.length} fields</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {activeItems.map(renderSetting)}
          </div>
        </section>
      </div>
    </div>
  );
}
