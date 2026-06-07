'use client';

import { useEffect, useMemo, useState } from 'react';
import { Megaphone, Plus, RefreshCcw, ShoppingCart, Users } from 'lucide-react';
import { toast } from 'sonner';

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

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignForm, setCampaignForm] = useState<any>(blankCampaign);
  const [subscriberForm, setSubscriberForm] = useState({ name: '', email: '', tags: '' });
  const [cartForm, setCartForm] = useState({ customerName: '', email: '', phone: '', title: '', quantity: 1, price: 0, followUpNote: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [campaignRes, newsletterRes, cartRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/newsletters'),
        fetch('/api/abandoned-carts'),
      ]);
      const [campaignData, newsletterData, cartData] = await Promise.all([campaignRes.json(), newsletterRes.json(), cartRes.json()]);
      if (campaignData.success) setCampaigns(campaignData.data);
      if (newsletterData.success) setSubscribers(newsletterData.data);
      if (cartData.success) setCarts(cartData.data);
    } catch {
      toast.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const spend = campaigns.reduce((sum, campaign) => sum + Number(campaign.spend || 0), 0);
    const revenue = campaigns.reduce((sum, campaign) => sum + Number(campaign.revenue || 0), 0);
    const abandoned = carts.filter((cart) => cart.status !== 'recovered').reduce((sum, cart) => sum + Number(cart.total || 0), 0);
    return { spend, revenue, abandoned };
  }, [campaigns, carts]);

  const saveCampaign = async (event: React.FormEvent) => {
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

  const saveSubscriber = async (event: React.FormEvent) => {
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

  const saveCart = async (event: React.FormEvent) => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Marketing</h1>
          <p className="text-sm text-zinc-500">Manual campaigns, newsletter subscribers and abandoned cart recovery.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-200">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Campaign ROI</p><p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">₹{(metrics.revenue - metrics.spend).toLocaleString('en-IN')}</p></div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Subscribers</p><p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{subscribers.length}</p></div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"><p className="text-sm text-zinc-500">Abandoned Value</p><p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">₹{metrics.abandoned.toLocaleString('en-IN')}</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2"><Megaphone className="h-5 w-5 text-amber-500" /><h2 className="font-semibold text-zinc-900 dark:text-white">Campaigns</h2></div>
          <form onSubmit={saveCampaign} className="mb-5 grid gap-3">
            <input required placeholder="Campaign name" value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <div className="grid grid-cols-2 gap-3">
              <select value={campaignForm.channel} onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['instagram', 'whatsapp', 'email', 'sms', 'offline'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <select value={campaignForm.status} onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">{['planned', 'running', 'paused', 'completed'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <input type="number" min="0" placeholder="Spend" value={campaignForm.spend} onChange={(e) => setCampaignForm({ ...campaignForm, spend: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="number" min="0" placeholder="Revenue" value={campaignForm.revenue} onChange={(e) => setCampaignForm({ ...campaignForm, revenue: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black"><Plus className="h-4 w-4" />Add Campaign</button>
          </form>
          <div className="space-y-3">
            {loading ? <p className="text-sm text-zinc-500">Loading...</p> : campaigns.map((campaign) => (
              <div key={campaign._id} className="rounded-lg border border-zinc-200 p-3 dark:border-white/10"><div className="flex justify-between gap-3"><p className="font-medium text-zinc-900 dark:text-white">{campaign.name}</p><span className="text-xs capitalize text-zinc-500">{campaign.status}</span></div><p className="mt-1 text-xs text-zinc-500">{campaign.channel} · ROI ₹{Number((campaign.revenue || 0) - (campaign.spend || 0)).toLocaleString('en-IN')}</p></div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-amber-500" /><h2 className="font-semibold text-zinc-900 dark:text-white">Newsletter</h2></div>
          <form onSubmit={saveSubscriber} className="mb-5 grid gap-3">
            <input placeholder="Name" value={subscriberForm.name} onChange={(e) => setSubscriberForm({ ...subscriberForm, name: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input required type="email" placeholder="Email" value={subscriberForm.email} onChange={(e) => setSubscriberForm({ ...subscriberForm, email: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input placeholder="Tags comma separated" value={subscriberForm.tags} onChange={(e) => setSubscriberForm({ ...subscriberForm, tags: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black">Save Subscriber</button>
          </form>
          <div className="space-y-2">
            {subscribers.slice(0, 8).map((subscriber) => <div key={subscriber._id} className="rounded-lg bg-zinc-50 p-3 text-sm dark:bg-white/5"><p className="font-medium text-zinc-900 dark:text-white">{subscriber.email}</p><p className="text-xs capitalize text-zinc-500">{subscriber.status}</p></div>)}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-amber-500" /><h2 className="font-semibold text-zinc-900 dark:text-white">Abandoned Carts</h2></div>
          <form onSubmit={saveCart} className="mb-5 grid gap-3">
            <input placeholder="Customer name" value={cartForm.customerName} onChange={(e) => setCartForm({ ...cartForm, customerName: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input placeholder="Email" value={cartForm.email} onChange={(e) => setCartForm({ ...cartForm, email: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <input placeholder="Phone" value={cartForm.phone} onChange={(e) => setCartForm({ ...cartForm, phone: e.target.value })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <div className="grid grid-cols-3 gap-3">
              <input required placeholder="Item" value={cartForm.title} onChange={(e) => setCartForm({ ...cartForm, title: e.target.value })} className="col-span-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="number" min="1" value={cartForm.quantity} onChange={(e) => setCartForm({ ...cartForm, quantity: Number(e.target.value) })} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input type="number" min="0" value={cartForm.price} onChange={(e) => setCartForm({ ...cartForm, price: Number(e.target.value) })} className="col-span-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            </div>
            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-amber-500 dark:text-black">Add Cart</button>
          </form>
          <div className="space-y-3">
            {carts.slice(0, 8).map((cart) => <div key={cart._id} className="rounded-lg border border-zinc-200 p-3 dark:border-white/10"><div className="flex justify-between gap-3"><p className="font-medium text-zinc-900 dark:text-white">{cart.customerName || cart.email || 'Unknown'}</p><span className="text-xs capitalize text-zinc-500">{cart.status}</span></div><p className="mt-1 text-xs text-zinc-500">₹{Number(cart.total || 0).toLocaleString('en-IN')}</p><div className="mt-3 flex gap-2"><button onClick={() => updateCartStatus(cart, 'contacted')} className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-white/10 dark:text-zinc-200">Contacted</button><button onClick={() => updateCartStatus(cart, 'recovered')} className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">Recovered</button></div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
