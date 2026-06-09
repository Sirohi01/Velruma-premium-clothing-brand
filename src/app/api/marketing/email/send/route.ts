import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { renderMarketingEmail, sendSmtpMail, type SmtpAttachment } from '@/lib/smtp-mailer';
import EmailTemplate from '@/models/EmailTemplate';
import Lead from '@/models/Lead';
import MarketingCampaign from '@/models/MarketingCampaign';
import Newsletter from '@/models/Newsletter';
import Setting from '@/models/Setting';
import User from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SettingMap = Record<string, unknown>;
type EmailAudience = 'all' | 'newsletter' | 'customers' | 'clients' | 'leads' | 'manual';

function valueAsString(settings: SettingMap, key: string, fallback = '') {
  const value = settings[key];
  return typeof value === 'string' ? value : value == null ? fallback : String(value);
}

function valueAsNumber(settings: SettingMap, key: string, fallback: number) {
  const value = Number(settings[key]);
  return Number.isFinite(value) ? value : fallback;
}

function valueAsBoolean(settings: SettingMap, key: string, fallback = false) {
  const value = settings[key];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return fallback;
}

function splitEmails(value: string) {
  return value.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter((email) => email.includes('@'));
}

async function getSettings() {
  const rows = await Setting.find({ group: { $in: ['email', 'brand'] } }).lean();
  return rows.reduce<SettingMap>((map, item: any) => {
    map[item.key] = item.value;
    return map;
  }, {});
}

async function getAudienceEmails(audience: string) {
  const [subscribers, users, leads] = await Promise.all([
    ['all', 'newsletter'].includes(audience)
      ? Newsletter.find({ status: 'subscribed' }).select('email').lean()
      : Promise.resolve([]),
    ['all', 'customers'].includes(audience)
      ? User.find({ isActive: true }).select('email').lean()
      : Promise.resolve([]),
    ['all', 'leads', 'clients'].includes(audience)
      ? Lead.find({ email: { $exists: true, $ne: '' } }).select('email').lean()
      : Promise.resolve([]),
  ]);

  return [...subscribers, ...users, ...leads].map((item: any) => String(item.email || '').toLowerCase()).filter((email) => email.includes('@'));
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)));
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const formData = await request.formData();
    const settings = await getSettings();

    const templateId = String(formData.get('templateId') || '');
    const audience = String(formData.get('audience') || 'manual');
    const templateAudience: EmailAudience = ['all', 'newsletter', 'customers', 'clients', 'leads', 'manual'].includes(audience)
      ? audience as EmailAudience
      : 'manual';
    const manualEmails = splitEmails(String(formData.get('manualEmails') || ''));
    const subject = String(formData.get('subject') || '');
    const preheader = String(formData.get('preheader') || '');
    const logo = String(formData.get('logo') || valueAsString(settings, 'marketing_default_logo'));
    const banner = String(formData.get('banner') || '');
    const headline = String(formData.get('headline') || '');
    const body = String(formData.get('body') || '');
    const ctaLabel = String(formData.get('ctaLabel') || '');
    const ctaUrl = String(formData.get('ctaUrl') || '');
    const footerNote = String(formData.get('footerNote') || valueAsString(settings, 'marketing_footer_text'));
    const testEmail = String(formData.get('testEmail') || '');
    const saveTemplate = String(formData.get('saveTemplate') || '') === 'true';
    const templateName = String(formData.get('templateName') || subject || 'Marketing Email');

    const files = formData.getAll('attachments').filter((file): file is File => file instanceof File && file.size > 0);
    const attachments: SmtpAttachment[] = await Promise.all(files.map(async (file) => ({
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      content: Buffer.from(await file.arrayBuffer()),
    })));

    let template = null;
    if (templateId) {
      template = await EmailTemplate.findById(templateId);
    }

    const emailSubject = subject || template?.subject || '';
    const emailHeadline = headline || template?.headline || emailSubject;
    const emailBody = body || template?.body || '';
    const emailHtml = renderMarketingEmail({
      logo: logo || template?.logo,
      banner: banner || template?.banner,
      headline: emailHeadline,
      body: emailBody,
      ctaLabel: ctaLabel || template?.ctaLabel,
      ctaUrl: ctaUrl || template?.ctaUrl,
      footerNote: footerNote || template?.footerNote,
      preheader: preheader || template?.preheader,
    });

    if (!emailSubject || !emailHeadline || !emailBody) {
      return NextResponse.json({ success: false, error: 'Subject, headline and body are required' }, { status: 400 });
    }

    const audienceEmails = testEmail ? [] : await getAudienceEmails(audience);
    const recipients = unique([...(testEmail ? splitEmails(testEmail) : audienceEmails), ...manualEmails]);
    if (recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'No recipients found for selected audience' }, { status: 400 });
    }

    const smtp = {
      host: valueAsString(settings, 'smtp_host'),
      port: valueAsNumber(settings, 'smtp_port', 587),
      secure: valueAsBoolean(settings, 'smtp_secure', false),
      user: valueAsString(settings, 'smtp_user'),
      password: valueAsString(settings, 'smtp_password'),
    };

    const fromEmail = valueAsString(settings, 'smtp_from_email', valueAsString(settings, 'brand_email', 'hello@velruma.com'));
    const fromName = valueAsString(settings, 'smtp_from_name', valueAsString(settings, 'brand_name', 'VELRUMA'));
    const replyTo = valueAsString(settings, 'marketing_reply_to', fromEmail);

    await sendSmtpMail(smtp, {
      fromName,
      fromEmail,
      replyTo,
      to: recipients,
      subject: emailSubject,
      html: emailHtml,
      attachments,
    });

    let savedTemplate = template;
    if (saveTemplate && !templateId) {
      savedTemplate = await EmailTemplate.create({
        name: templateName,
        subject: emailSubject,
        preheader,
        audience: templateAudience,
        logo,
        banner,
        headline: emailHeadline,
        body: emailBody,
        ctaLabel,
        ctaUrl,
        footerNote,
        theme: 'velruma',
      });
    }

    await MarketingCampaign.create({
      name: `Email: ${emailSubject}`,
      channel: 'email',
      status: 'completed',
      audience: templateAudience,
      leads: recipients.length,
      notes: `Sent to ${recipients.length} recipient(s). Attachments: ${attachments.length}. Template: ${savedTemplate?.name || 'custom'}`,
    });

    return NextResponse.json({ success: true, data: { sent: recipients.length, attachments: attachments.length, template: savedTemplate } });
  } catch (error: unknown) {
    console.error('Marketing email send error:', error);
    const message = error instanceof Error ? error.message : 'Email send failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
