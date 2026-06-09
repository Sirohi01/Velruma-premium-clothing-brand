import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import Newsletter from '@/models/Newsletter';
import Role from '@/models/Role';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

function uniqueEmails(items: { email?: string; name?: string; source: string }[]) {
  const map = new Map<string, { email: string; name?: string; source: string }>();
  for (const item of items) {
    const email = item.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) continue;
    if (!map.has(email)) map.set(email, { email, name: item.name, source: item.source });
  }
  return Array.from(map.values());
}

export async function GET() {
  try {
    await dbConnect();
    const customerRoles = await Role.find({ slug: { $in: ['customer', 'customers', 'client', 'user'] } }).select('_id').lean();
    const customerRoleIds = customerRoles.map((role) => role._id);
    const customerQuery = customerRoleIds.length > 0
      ? { isActive: true, role: { $in: customerRoleIds } }
      : { isActive: true };

    const [subscribers, users, leads] = await Promise.all([
      Newsletter.find({ status: 'subscribed' }).select('name email source tags').sort({ createdAt: -1 }).lean(),
      User.find(customerQuery).select('name email phone role').sort({ createdAt: -1 }).lean(),
      Lead.find({ email: { $exists: true, $ne: '' } }).select('name email source stage').sort({ createdAt: -1 }).lean(),
    ]);

    const newsletter = uniqueEmails(subscribers.map((item: any) => ({ name: item.name, email: item.email, source: 'newsletter' })));
    const customers = uniqueEmails(users.map((item: any) => ({ name: item.name, email: item.email, source: 'customer' })));
    const clients = uniqueEmails(leads.map((item: any) => ({ name: item.name, email: item.email, source: 'lead' })));
    const all = uniqueEmails([...newsletter, ...customers, ...clients]);

    return NextResponse.json({
      success: true,
      data: {
        all,
        newsletter,
        customers,
        clients,
        counts: {
          all: all.length,
          newsletter: newsletter.length,
          customers: customers.length,
          clients: clients.length,
        },
      },
    });
  } catch (error) {
    console.error('Marketing recipients GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
