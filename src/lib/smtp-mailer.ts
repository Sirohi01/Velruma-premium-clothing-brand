import net from 'node:net';
import tls from 'node:tls';

export type SmtpAttachment = {
  filename: string;
  contentType: string;
  content: Buffer;
};

export type SmtpOptions = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
};

export type SendMailOptions = {
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: SmtpAttachment[];
};

function encodeHeader(value: string) {
  return /[^\x00-\x7F]/.test(value) ? `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=` : value;
}

function foldBase64(buffer: Buffer) {
  return buffer.toString('base64').replace(/.{1,76}/g, '$&\r\n').trim();
}

function stripHtml(html: string) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildMessage(mail: SendMailOptions) {
  const mixedBoundary = `velruma-mixed-${Date.now()}`;
  const altBoundary = `velruma-alt-${Date.now()}`;
  const from = `${encodeHeader(mail.fromName)} <${mail.fromEmail}>`;
  const headers = [
    `From: ${from}`,
    `To: ${mail.to.length === 1 ? mail.to[0] : mail.fromEmail}`,
    mail.replyTo ? `Reply-To: ${mail.replyTo}` : '',
    `Subject: ${encodeHeader(mail.subject)}`,
    'MIME-Version: 1.0',
    `Date: ${new Date().toUTCString()}`,
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
  ].filter(Boolean).join('\r\n');

  const body = [
    `--${mixedBoundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    '',
    `--${altBoundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    mail.text || stripHtml(mail.html),
    '',
    `--${altBoundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    mail.html,
    '',
    `--${altBoundary}--`,
  ];

  for (const attachment of mail.attachments || []) {
    body.push(
      `--${mixedBoundary}`,
      `Content-Type: ${attachment.contentType || 'application/octet-stream'}; name="${attachment.filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      '',
      foldBase64(attachment.content),
      ''
    );
  }

  body.push(`--${mixedBoundary}--`, '');
  return `${headers}\r\n\r\n${body.join('\r\n')}`;
}

export async function sendSmtpMail(smtp: SmtpOptions, mail: SendMailOptions) {
  if (!smtp.host || !smtp.port || !mail.fromEmail) throw new Error('SMTP settings are incomplete');
  if (mail.to.length === 0) throw new Error('No recipients selected');

  let socket: net.Socket | tls.TLSSocket = smtp.secure
    ? tls.connect({ host: smtp.host, port: smtp.port, servername: smtp.host })
    : net.connect({ host: smtp.host, port: smtp.port });
  socket.setEncoding('utf8');

  let buffer = '';
  const waitFor = (expected: number[]) => new Promise<string>((resolve, reject) => {
    const onData = (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || '';
      if (!/^\d{3}[ -]/.test(last)) return;
      if (/^\d{3}-/.test(last)) return;
      const code = Number(last.slice(0, 3));
      if (expected.includes(code)) {
        const response = buffer;
        buffer = '';
        socket.off('data', onData);
        resolve(response);
      } else if (code >= 400) {
        socket.off('data', onData);
        reject(new Error(responseSummary(buffer)));
      }
    };
    socket.on('data', onData);
    socket.once('error', reject);
  });

  const write = async (command: string, expected: number[]) => {
    socket.write(`${command}\r\n`);
    return waitFor(expected);
  };

  const responseSummary = (response: string) => response.split(/\r?\n/).filter(Boolean).slice(-2).join(' ');

  try {
    await waitFor([220]);
    await write(`EHLO ${smtp.host}`, [250]);

    if (!smtp.secure) {
      await write('STARTTLS', [220]);
      socket = tls.connect({ socket, servername: smtp.host });
      socket.setEncoding('utf8');
      buffer = '';
      await write(`EHLO ${smtp.host}`, [250]);
    }

    if (smtp.user && smtp.password) {
      await write('AUTH LOGIN', [334]);
      await write(Buffer.from(smtp.user).toString('base64'), [334]);
      await write(Buffer.from(smtp.password).toString('base64'), [235]);
    }

    await write(`MAIL FROM:<${mail.fromEmail}>`, [250]);
    for (const recipient of mail.to) {
      await write(`RCPT TO:<${recipient}>`, [250, 251]);
    }
    await write('DATA', [354]);
    socket.write(`${buildMessage(mail)}\r\n.\r\n`);
    await waitFor([250]);
    await write('QUIT', [221]);
  } finally {
    socket.end();
  }
}

export function renderMarketingEmail({
  logo,
  banner,
  headline,
  body,
  ctaLabel,
  ctaUrl,
  footerNote,
  preheader,
}: {
  logo?: string;
  banner?: string;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  preheader?: string;
}) {
  const paragraphs = String(body || '').split('\n').map((line) => line.trim()).filter(Boolean);
  return `<!doctype html>
<html>
<body style="margin:0;background:#f7f4ef;font-family:Inter,Arial,sans-serif;color:#18181b;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader || headline}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ef;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #e4e4e7;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:24px 26px;border-bottom:1px solid #eee8dc;">
              ${logo ? `<img src="${logo}" alt="VELRUMA" style="max-width:138px;height:auto;display:block;">` : `<div style="font-family:Georgia,serif;font-size:28px;font-weight:700;letter-spacing:.08em;">VELRUMA</div>`}
            </td>
          </tr>
          ${banner ? `<tr><td><img src="${banner}" alt="" style="display:block;width:100%;height:auto;"></td></tr>` : ''}
          <tr>
            <td style="padding:30px 28px 12px;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:38px;line-height:1.02;color:#09090b;">${headline}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;">
              ${paragraphs.map((paragraph) => `<p style="margin:14px 0 0;font-size:15px;line-height:1.75;color:#52525b;">${paragraph}</p>`).join('')}
              ${ctaLabel && ctaUrl ? `<p style="margin:26px 0 4px;"><a href="${ctaUrl}" style="display:inline-block;background:#09090b;color:#ffffff;text-decoration:none;border-radius:10px;padding:13px 20px;font-size:14px;font-weight:700;">${ctaLabel}</a></p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 26px;background:#faf7f0;border-top:1px solid #eee8dc;color:#71717a;font-size:12px;line-height:1.6;">
              ${footerNote || 'VELRUMA - Premium oversized essentials crafted in India.'}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
