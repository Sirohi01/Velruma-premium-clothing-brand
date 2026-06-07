import { Mail, MapPin, Phone } from 'lucide-react';
import ContactForm from './ContactForm';
import dbConnect from '@/lib/db';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: 'Contact Us',
    description: 'Get in touch with us for any inquiries, support, or feedback.',
  };
}

async function getContactSettings() {
  try {
    await dbConnect();
    const settings = await Setting.find({
      key: { $in: ['brand_name', 'brand_email', 'brand_phone', 'brand_address', 'contact_page_image'] }
    }).lean();

    return settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = String(setting.value || '');
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export default async function ContactPage() {
  const settings = await getContactSettings();

  const email = settings.brand_email || 'support@velruma.com';
  const phone = settings.brand_phone || '+91 9876543210';
  const address = settings.brand_address || 'New Delhi, India';
  const brandName = settings.brand_name || 'VELRUMA';
  const contactImage = settings.contact_page_image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="bg-[#F7F4EF] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden bg-white shadow-sm ring-1 ring-zinc-200">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Editorial Image Side */}
            <div className="relative h-64 lg:h-auto bg-zinc-100">
              <img 
                src={contactImage} 
                alt={`${brandName} Fashion Studio`} 
                className="absolute inset-0 h-full w-full object-cover grayscale-[20%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{brandName} Studios</h2>
                <p className="mt-2 text-sm text-zinc-200 uppercase tracking-widest">{address}</p>
              </div>
            </div>

            {/* Contact Details & Form Side */}
            <div className="p-8 sm:p-12 lg:p-16">
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Us</h1>
                <p className="mt-3 text-sm text-zinc-500 uppercase tracking-wide">For inquiries, sizing, or styling advice.</p>
              </div>

              <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 text-sm">
                <div>
                  <h3 className="font-semibold uppercase tracking-wider text-zinc-900 mb-2">Email</h3>
                  <a href={`mailto:${email}`} className="text-zinc-600 hover:text-zinc-900 transition-colors">{email}</a>
                </div>
                <div>
                  <h3 className="font-semibold uppercase tracking-wider text-zinc-900 mb-2">Phone</h3>
                  <a href={`tel:${phone}`} className="text-zinc-600 hover:text-zinc-900 transition-colors">{phone}</a>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <h3 className="font-semibold uppercase tracking-wider text-zinc-900 mb-6">Send a Message</h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
