'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { FileText, Mail, Megaphone, Paperclip, Plus, RefreshCcw, Send, ShoppingCart, Users } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/shared/ImageUpload';

const inputClass = 'h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white';
const textareaClass = 'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white';

const blankCampaign = {
  name: '',
  channel: 'instagram',
  status: 'planned',
  audience: 'All customers',
  budget: 0,
  spend: 0,
  leads: 0,
  revenue: 0,
  startDate: '',
  endDate: '',
  notes: '',
};

const blankEmailForm = {
  templateName: '',
  templateId: '',
  audience: 'all',
  manualEmails: '',
  testEmail: '',
  subject: 'New VELRUMA drop is live',
  preheader: 'Premium oversized essentials, crafted for everyday confidence.',
  logo: '',
  banner: '',
  headline: 'Premium essentials, managed with care.',
  body: 'Hi,\n\nDiscover VELRUMA premium oversized essentials designed for clean everyday comfort.\n\nThis mail is crafted from the admin marketing studio, with brand logo, banner, CTA and attachments support.',
  ctaLabel: 'Shop Now',
  ctaUrl: 'https://velruma.com/shop',
  footerNote: '',
  saveTemplate: true,
};

function settingValue(settings: any[], key: string, fallback: unknown = '') {
  const item = settings.find((setting) => setting.key === key);
  return item?.value ?? fallback;
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [carts, setCarts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [recipientCounts, setRecipientCounts] = useState({ all: 0, newsletter: 0, customers: 0, clients: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [activePanel, setActivePanel] = useState<'email' | 'templates' | 'lists'>('email');
  const [campaignForm, setCampaignForm] = useState<any>(blankCampaign);
  const [subscriberForm, setSubscriberForm] = useState({ name: '', email: '', tags: '' });
  const [cartForm, setCartForm] = useState({ customerName: '', email: '', phone: '', title: '', quantity: 1, price: 0, followUpNote: '' });
  const [emailForm, setEmailForm] = useState<any>(blankEmailForm);
  const [smtpForm, setSmtpForm] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_secure: false,
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: 'VELRUMA',
    marketing_reply_to: '',
    marketing_footer_text: '',
    marketing_default_logo: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const fetchAll = async () => {
    try {
      const [campaignRes, newsletterRes, cartRes, templateRes, settingsRes, recipientsRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/newsletters'),
        fetch('/api/abandoned-carts'),
        fetch('/api/email-templates'),
        fetch('/api/settings?group=email'),
        fetch('/api/marketing/email/recipients'),
      ]);
      const [campaignData, newsletterData, cartData, templateData, settingsData, recipientsData] = await Promise.all([
        campaignRes.json(),
        newsletterRes.json(),
        cartRes.json(),
        templateRes.json(),
        settingsRes.json(),
        recipientsRes.json(),
      ]);
      if (campaignData.success) setCampaigns(campaignData.data);
      if (newsletterData.success) setSubscribers(newsletterData.data);
      if (cartData.success) setCarts(cartData.data);
      if (templateData.success) setTemplates(templateData.data);
      if (settingsData.success) {
        setSettings(settingsData.data);
        setSmtpForm({
          smtp_host: String(settingValue(settingsData.data, 'smtp_host', '')),
          smtp_port: String(settingValue(settingsData.data, 'smtp_port', '587')),
          smtp_secure: Boolean(settingValue(settingsData.data, 'smtp_secure', false)),
          smtp_user: String(settingValue(settingsData.data, 'smtp_user', '')),
          smtp_password: String(settingValue(settingsData.data, 'smtp_password', '')),
          smtp_from_email: String(settingValue(settingsData.data, 'smtp_from_email', '')),
          smtp_from_name: String(settingValue(settingsData.data, 'smtp_from_name', 'VELRUMA')),
          marketing_reply_to: String(settingValue(settingsData.data, 'marketing_reply_to', '')),
          marketing_footer_text: String(settingValue(settingsData.data, 'marketing_footer_text', '')),
          marketing_default_logo: String(settingValue(settingsData.data, 'marketing_default_logo', '')),
        });
        setEmailForm((current: any) => ({
          ...current,
          logo: current.logo || String(settingValue(settingsData.data, 'marketing_default_logo', '')),
          footerNote: current.footerNote || String(settingValue(settingsData.data, 'marketing_footer_text', '')),
        }));
      }
      if (recipientsData.success) setRecipientCounts(recipientsData.data.counts);
    } catch {
      toast.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const metrics = useMemo(() => {
    const spend = campaigns.reduce((sum, campaign) => sum + Number(campaign.spend || 0), 0);
    const revenue = campaigns.reduce((sum, campaign) => sum + Number(campaign.revenue || 0), 0);
    const abandoned = carts.filter((cart) => cart.status !== 'recovered').reduce((sum, cart) => sum + Number(cart.total || 0), 0);
    return { spend, revenue, abandoned };
  }, [campaigns, carts]);

  const saveSmtp = async (event: FormEvent) => {
    event.preventDefault();
    setSavingSmtp(true);
    try {
      const payload = Object.entries(smtpForm).map(([key, value]) => ({
        group: 'email',
        key,
        value: key === 'smtp_port' ? Number(value) : value,
        label: settings.find((setting) => setting.key === key)?.label || key,
        type: key.includes('logo') ? 'image' : key.includes('text') ? 'textarea' : key === 'smtp_secure' ? 'boolean' : key === 'smtp_port' ? 'number' : 'string',
        isPublic: false,
      }));
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'SMTP settings save failed');
        return;
      }
      toast.success('SMTP settings saved');
      fetchAll();
    } catch {
      toast.error('Network error');
    } finally {
      setSavingSmtp(false);
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find((item) => item._id === templateId);
    if (!template) {
      setEmailForm({ ...emailForm, templateId });
      return;
    }
    setEmailForm({
      ...emailForm,
      templateId,
      templateName: template.name || '',
      audience: template.audience || 'all',
      subject: template.subject || '',
      preheader: template.preheader || '',
      logo: template.logo || emailForm.logo,
      banner: template.banner || '',
      headline: template.headline || '',
      body: template.body || '',
      ctaLabel: template.ctaLabel || '',
      ctaUrl: template.ctaUrl || '',
      footerNote: template.footerNote || '',
      saveTemplate: false,
    });
  };

  const sendEmail = async (event: FormEvent, testOnly = false) => {
    event.preventDefault();
    setSending(true);
    try {
      const formData = new FormData();
      Object.entries({ ...emailForm, testEmail: testOnly ? emailForm.testEmail : '', saveTemplate: emailForm.saveTemplate ? 'true' : 'false' }).forEach(([key, value]) => {
        formData.append(key, String(value ?? ''));
      });
      attachments.forEach((file) => formData.append('attachments', file));

      const res = await fetch('/api/marketing/email/send', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Email send failed');
        return;
      }
      toast.success(testOnly ? `Test email sent to ${emailForm.testEmail}` : `Email sent to ${data.data.sent} recipient(s)`);
      setAttachments([]);
      fetchAll();
    } catch {
      toast.error('Network error');
    } finally {
      setSending(false);
    }
  };

  const saveCampaign = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Campaign save failed');
        return;
      }
      toast.success('Campaign added');
      setCampaignForm(blankCampaign);
      fetchAll();
    } catch {
      toast.error('Network error');
    }
  };

  const saveSubscriber = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const res = await fetch('/api/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subscriberForm, source: 'manual', tags: subscriberForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Subscriber save failed');
        return;
      }
      toast.success('Subscriber saved');
      setSubscriberForm({ name: '', email: '', tags: '' });
      fetchAll();
    } catch {
      toast.error('Network error');
    }
  };

  const saveCart = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const res = await fetch('/api/abandoned-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: cartForm.customerName,
          email: cartForm.email,
          phone: cartForm.phone,
          followUpNote: cartForm.followUpNote,
          items: [{ title: cartForm.title, quantity: Number(cartForm.quantity || 1), price: Number(cartForm.price || 0) }],
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Cart save failed');
        return;
      }
      toast.success('Abandoned cart added');
      setCartForm({ customerName: '', email: '', phone: '', title: '', quantity: 1, price: 0, followUpNote: '' });
      fetchAll();
    } catch {
      toast.error('Network error');
    }
  };

  const updateCartStatus = async (cart: any, status: string) => {
    try {
      const res = await fetch(`/api/abandoned-carts/${cart._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cart status updated');
        fetchAll();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Marketing</h1>
          <p className="text-sm text-zinc-500">SMTP email studio, templates, bulk audiences, newsletter and abandoned cart recovery.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-200">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Email Audience" value={recipientCounts.all.toLocaleString('en-IN')} />
        <Metric label="Newsletter" value={recipientCounts.newsletter.toLocaleString('en-IN')} />
        <Metric label="Customers" value={recipientCounts.customers.toLocaleString('en-IN')} />
        <Metric label="Clients / Leads" value={recipientCounts.clients.toLocaleString('en-IN')} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metric label="Campaign ROI" value={`Rs.${(metrics.revenue - metrics.spend).toLocaleString('en-IN')}`} />
        <Metric label="Abandoned Value" value={`Rs.${metrics.abandoned.toLocaleString('en-IN')}`} />
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <PanelTab label="Email Studio" active={activePanel === 'email'} onClick={() => setActivePanel('email')} />
        <PanelTab label={`Templates (${templates.length})`} active={activePanel === 'templates'} onClick={() => setActivePanel('templates')} />
        <PanelTab label="Lists & Recovery" active={activePanel === 'lists'} onClick={() => setActivePanel('lists')} />
      </div>

      {activePanel === 'email' && (
      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 bg-[#F7F4EF] px-4 py-3 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Email Studio</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-zinc-600">
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10">Templates {templates.length}</span>
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10">Attachments {attachments.length}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
          <form onSubmit={saveSmtp} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">SMTP Setup</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Host"><input value={smtpForm.smtp_host} onChange={(e) => setSmtpForm({ ...smtpForm, smtp_host: e.target.value })} className={inputClass} placeholder="smtp.gmail.com" /></Field>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Field label="Port"><input type="number" value={smtpForm.smtp_port} onChange={(e) => setSmtpForm({ ...smtpForm, smtp_port: e.target.value })} className={inputClass} /></Field>
                <label className="mt-6 flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200">
                  <input type="checkbox" checked={smtpForm.smtp_secure} onChange={(e) => setSmtpForm({ ...smtpForm, smtp_secure: e.target.checked })} />
                  SSL
                </label>
              </div>
              <Field label="Username"><input value={smtpForm.smtp_user} onChange={(e) => setSmtpForm({ ...smtpForm, smtp_user: e.target.value })} className={inputClass} /></Field>
              <Field label="Password"><input type="password" value={smtpForm.smtp_password} onChange={(e) => setSmtpForm({ ...smtpForm, smtp_password: e.target.value })} className={inputClass} /></Field>
              <Field label="From email"><input type="email" value={smtpForm.smtp_from_email} onChange={(e) => setSmtpForm({ ...smtpForm, smtp_from_email: e.target.value })} className={inputClass} /></Field>
              <Field label="From name"><input value={smtpForm.smtp_from_name} onChange={(e) => setSmtpForm({ ...smtpForm, smtp_from_name: e.target.value })} className={inputClass} /></Field>
              <Field label="Reply-to email"><input type="email" value={smtpForm.marketing_reply_to} onChange={(e) => setSmtpForm({ ...smtpForm, marketing_reply_to: e.target.value })} className={inputClass} /></Field>
              <ImageUpload label="Default email logo" value={smtpForm.marketing_default_logo} folder="marketing/email" onChange={(marketing_default_logo) => setSmtpForm({ ...smtpForm, marketing_default_logo })} />
              <Field label="Footer text"><textarea value={smtpForm.marketing_footer_text} onChange={(e) => setSmtpForm({ ...smtpForm, marketing_footer_text: e.target.value })} rows={3} className={textareaClass} /></Field>
            </div>
            <button disabled={savingSmtp} className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">
              {savingSmtp ? 'Saving...' : 'Save SMTP Settings'}
            </button>
          </form>

          <form onSubmit={(event) => sendEmail(event, false)} className="grid gap-3">
            <div className="grid gap-3 lg:grid-cols-3">
              <Field label="Saved template">
                <select value={emailForm.templateId} onChange={(e) => loadTemplate(e.target.value)} className={inputClass}>
                  <option value="">Custom email</option>
                  {templates.map((template) => <option key={template._id} value={template._id}>{template.name}</option>)}
                </select>
              </Field>
              <Field label="Template name"><input value={emailForm.templateName} onChange={(e) => setEmailForm({ ...emailForm, templateName: e.target.value })} className={inputClass} /></Field>
              <Field label="Audience">
                <select value={emailForm.audience} onChange={(e) => setEmailForm({ ...emailForm, audience: e.target.value })} className={inputClass}>
                  <option value="all">All ({recipientCounts.all})</option>
                  <option value="newsletter">Newsletter ({recipientCounts.newsletter})</option>
                  <option value="customers">Customers ({recipientCounts.customers})</option>
                  <option value="clients">Clients / Leads ({recipientCounts.clients})</option>
                  <option value="manual">Manual only</option>
                </select>
              </Field>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Subject"><input required value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} className={inputClass} /></Field>
              <Field label="Preheader"><input value={emailForm.preheader} onChange={(e) => setEmailForm({ ...emailForm, preheader: e.target.value })} className={inputClass} /></Field>
              <Field label="Manual emails" hint={emailForm.audience === 'manual' ? 'Manual only selected: mail will go only to these emails, one by one.' : 'These emails are added with selected audience.'}><textarea value={emailForm.manualEmails} onChange={(e) => setEmailForm({ ...emailForm, manualEmails: e.target.value })} rows={3} className={textareaClass} /></Field>
              <Field label="Test email" hint="Use Send Test to verify before bulk sending."><input type="email" value={emailForm.testEmail} onChange={(e) => setEmailForm({ ...emailForm, testEmail: e.target.value })} className={inputClass} /></Field>
            </div>

            <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
              <div className="space-y-3">
                <ImageUpload label="Email logo" value={emailForm.logo} folder="marketing/email" onChange={(logo) => setEmailForm({ ...emailForm, logo })} />
                <ImageUpload label="Email banner" value={emailForm.banner} folder="marketing/banners" onChange={(banner) => setEmailForm({ ...emailForm, banner })} />
                <div>
                  <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Attachments</span>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-sm font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                    <Paperclip className="h-4 w-4" />
                    Add multiple files
                    <input type="file" multiple className="hidden" onChange={(event) => setAttachments(Array.from(event.target.files || []))} />
                  </label>
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-zinc-500">
                      {attachments.map((file) => <p key={`${file.name}-${file.size}`} className="truncate">{file.name}</p>)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <Field label="Headline"><input required value={emailForm.headline} onChange={(e) => setEmailForm({ ...emailForm, headline: e.target.value })} className={inputClass} /></Field>
                <Field label="Body"><textarea required value={emailForm.body} onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })} rows={7} className={textareaClass} /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="CTA label"><input value={emailForm.ctaLabel} onChange={(e) => setEmailForm({ ...emailForm, ctaLabel: e.target.value })} className={inputClass} /></Field>
                  <Field label="CTA URL"><input value={emailForm.ctaUrl} onChange={(e) => setEmailForm({ ...emailForm, ctaUrl: e.target.value })} className={inputClass} /></Field>
                </div>
                <Field label="Footer note"><textarea value={emailForm.footerNote} onChange={(e) => setEmailForm({ ...emailForm, footerNote: e.target.value })} rows={2} className={textareaClass} /></Field>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border border-zinc-200 bg-[#F7F4EF] p-3 dark:border-white/10 dark:bg-zinc-950 lg:grid-cols-[1fr_320px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Email preview</p>
                <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900">
                  <div className="border-b border-zinc-100 p-4 dark:border-white/10">
                    {emailForm.logo ? <img src={emailForm.logo} alt="" className="max-h-14 max-w-36 object-contain" /> : <p className="font-serif text-2xl font-bold tracking-widest">VELRUMA</p>}
                  </div>
                  {emailForm.banner && <img src={emailForm.banner} alt="" className="aspect-[16/5] w-full object-cover" />}
                  <div className="p-5">
                    <h3 className="font-serif text-3xl font-bold leading-tight text-zinc-950 dark:text-white">{emailForm.headline}</h3>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-600 dark:text-zinc-300">{emailForm.body}</p>
                    {emailForm.ctaLabel && <span className="mt-4 inline-flex rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">{emailForm.ctaLabel}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
                  <input type="checkbox" checked={emailForm.saveTemplate} onChange={(e) => setEmailForm({ ...emailForm, saveTemplate: e.target.checked })} />
                  Save as template after send
                </label>
                <button type="button" disabled={sending || !emailForm.testEmail} onClick={(event) => sendEmail(event as any, true)} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">Send Test</button>
                <button disabled={sending} className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-amber-500 dark:text-black">
                  {sending ? 'Sending...' : 'Send Bulk Email'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      )}

      {activePanel === 'lists' && (
      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2"><Megaphone className="h-5 w-5 text-amber-500" /><h2 className="font-semibold text-zinc-900 dark:text-white">Campaigns</h2></div>
          <form onSubmit={saveCampaign} className="mb-4 grid gap-2">
            <input required placeholder="Campaign name" value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} className={inputClass} />
            <div className="grid grid-cols-2 gap-2">
              <select value={campaignForm.channel} onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value })} className={inputClass}>{['instagram', 'whatsapp', 'email', 'sms', 'offline'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <select value={campaignForm.status} onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })} className={inputClass}>{['planned', 'running', 'paused', 'completed'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <input type="number" min="0" placeholder="Spend" value={campaignForm.spend} onChange={(e) => setCampaignForm({ ...campaignForm, spend: Number(e.target.value) })} className={inputClass} />
              <input type="number" min="0" placeholder="Revenue" value={campaignForm.revenue} onChange={(e) => setCampaignForm({ ...campaignForm, revenue: Number(e.target.value) })} className={inputClass} />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black"><Plus className="h-4 w-4" />Add Campaign</button>
          </form>
          <div className="space-y-2">
            {loading ? <p className="text-sm text-zinc-500">Loading...</p> : campaigns.slice(0, 8).map((campaign) => (
              <div key={campaign._id} className="rounded-lg border border-zinc-200 p-3 dark:border-white/10"><div className="flex justify-between gap-3"><p className="font-medium text-zinc-900 dark:text-white">{campaign.name}</p><span className="text-xs capitalize text-zinc-500">{campaign.status}</span></div><p className="mt-1 text-xs text-zinc-500">{campaign.channel} - ROI Rs.{Number((campaign.revenue || 0) - (campaign.spend || 0)).toLocaleString('en-IN')}</p></div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-amber-500" /><h2 className="font-semibold text-zinc-900 dark:text-white">Newsletter</h2></div>
          <form onSubmit={saveSubscriber} className="mb-4 grid gap-2">
            <input placeholder="Name" value={subscriberForm.name} onChange={(e) => setSubscriberForm({ ...subscriberForm, name: e.target.value })} className={inputClass} />
            <input required type="email" placeholder="Email" value={subscriberForm.email} onChange={(e) => setSubscriberForm({ ...subscriberForm, email: e.target.value })} className={inputClass} />
            <input placeholder="Tags comma separated" value={subscriberForm.tags} onChange={(e) => setSubscriberForm({ ...subscriberForm, tags: e.target.value })} className={inputClass} />
            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black">Save Subscriber</button>
          </form>
          <div className="space-y-2">
            {subscribers.slice(0, 8).map((subscriber) => <div key={subscriber._id} className="rounded-lg bg-zinc-50 p-3 text-sm dark:bg-white/5"><p className="font-medium text-zinc-900 dark:text-white">{subscriber.email}</p><p className="text-xs capitalize text-zinc-500">{subscriber.status}</p></div>)}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-amber-500" /><h2 className="font-semibold text-zinc-900 dark:text-white">Abandoned Carts</h2></div>
          <form onSubmit={saveCart} className="mb-4 grid gap-2">
            <input placeholder="Customer name" value={cartForm.customerName} onChange={(e) => setCartForm({ ...cartForm, customerName: e.target.value })} className={inputClass} />
            <input placeholder="Email" value={cartForm.email} onChange={(e) => setCartForm({ ...cartForm, email: e.target.value })} className={inputClass} />
            <input placeholder="Phone" value={cartForm.phone} onChange={(e) => setCartForm({ ...cartForm, phone: e.target.value })} className={inputClass} />
            <div className="grid grid-cols-3 gap-2">
              <input required placeholder="Item" value={cartForm.title} onChange={(e) => setCartForm({ ...cartForm, title: e.target.value })} className={`${inputClass} col-span-3`} />
              <input type="number" min="1" value={cartForm.quantity} onChange={(e) => setCartForm({ ...cartForm, quantity: Number(e.target.value) })} className={inputClass} />
              <input type="number" min="0" value={cartForm.price} onChange={(e) => setCartForm({ ...cartForm, price: Number(e.target.value) })} className={`${inputClass} col-span-2`} />
            </div>
            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black">Add Cart</button>
          </form>
          <div className="space-y-2">
            {carts.slice(0, 8).map((cart) => <div key={cart._id} className="rounded-lg border border-zinc-200 p-3 dark:border-white/10"><div className="flex justify-between gap-3"><p className="font-medium text-zinc-900 dark:text-white">{cart.customerName || cart.email || 'Unknown'}</p><span className="text-xs capitalize text-zinc-500">{cart.status}</span></div><p className="mt-1 text-xs text-zinc-500">Rs.{Number(cart.total || 0).toLocaleString('en-IN')}</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => updateCartStatus(cart, 'contacted')} className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-white/10 dark:text-zinc-200">Contacted</button><button type="button" onClick={() => updateCartStatus(cart, 'recovered')} className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">Recovered</button></div></div>)}
          </div>
        </section>
      </div>
      )}

      {activePanel === 'templates' && (
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold text-zinc-900 dark:text-white">Saved Email Templates</h2>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {templates.length === 0 ? <p className="text-sm text-zinc-500">No templates yet.</p> : templates.slice(0, 8).map((template) => (
            <button key={template._id} type="button" onClick={() => loadTemplate(template._id)} className="rounded-lg border border-zinc-200 p-3 text-left transition hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:hover:bg-amber-500/10">
              <p className="font-medium text-zinc-900 dark:text-white">{template.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{template.subject}</p>
            </button>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}

function PanelTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${
        active
          ? 'bg-zinc-950 text-white shadow-sm dark:bg-amber-500 dark:text-black'
          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
