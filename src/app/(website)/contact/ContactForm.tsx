'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formName: 'Contact Us',
          status: 'new',
          data,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="sr-only">Full Name</label>
          <input type="text" id="name" name="name" placeholder="Full Name *" required className="block w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors" />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">Email Address</label>
          <input type="email" id="email" name="email" placeholder="Email Address *" required className="block w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="sr-only">Phone Number</label>
          <input type="tel" id="phone" name="phone" placeholder="Phone Number" className="block w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors" />
        </div>
        <div>
          <label htmlFor="subject" className="sr-only">Subject</label>
          <input type="text" id="subject" name="subject" placeholder="Subject" className="block w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors" />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="sr-only">Message</label>
        <textarea id="message" name="message" placeholder="Your Message *" required rows={3} className="block w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-0 transition-colors resize-none"></textarea>
      </div>
      <div className="pt-4">
        <button type="submit" disabled={loading} className="w-full bg-zinc-900 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-zinc-800 disabled:opacity-70 transition-colors">
          {loading ? 'Sending...' : 'Submit Inquiry'}
        </button>
      </div>
    </form>
  );
}
