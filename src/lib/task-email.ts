import { renderMarketingEmail, sendSmtpMail } from '@/lib/smtp-mailer';
import { Employee } from '@/models/Phase9';
import Setting from '@/models/Setting';

type SettingMap = Record<string, unknown>;

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

async function getEmailSettings() {
  const rows = await Setting.find({ group: { $in: ['email', 'brand'] } }).lean();
  return rows.reduce<SettingMap>((map, item: any) => {
    map[item.key] = item.value;
    return map;
  }, {});
}

async function findAssignedEmployee(task: any) {
  if (!task?.assignedTo && !task?.assignedToCode) return null;
  return Employee.findOne({
    $or: [
      { employeeCode: task.assignedToCode },
      { employeeCode: task.assignedTo },
      { name: task.assignedTo },
    ],
    isActive: true,
  }).lean();
}

function taskDetails(task: any) {
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN') : 'Not set';
  return [
    `Task: ${task.title || '-'}`,
    `Module: ${String(task.module || '-').replaceAll('_', ' ')}`,
    `Priority: ${String(task.priority || 'normal').replaceAll('_', ' ')}`,
    `Status: ${String(task.status || 'todo').replaceAll('_', ' ')}`,
    `Due date: ${dueDate}`,
    task.description ? `Description: ${task.description}` : '',
    task.notes ? `Notes: ${task.notes}` : '',
  ].filter(Boolean).join('\n');
}

async function sendTaskEmail(task: any, subject: string, headline: string, intro: string) {
  const employee: any = await findAssignedEmployee(task);
  if (!employee?.email) return;

  const settings = await getEmailSettings();
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
  const logo = valueAsString(settings, 'marketing_default_logo', '');
  const footerNote = valueAsString(settings, 'marketing_footer_text', 'VELRUMA - Premium oversized essentials crafted in India.');

  await sendSmtpMail(smtp, {
    fromName,
    fromEmail,
    replyTo,
    to: [employee.email],
    subject,
    html: renderMarketingEmail({
      logo,
      headline,
      body: `Hi ${employee.name || task.assignedTo || 'Team Member'},\n\n${intro}\n\n${taskDetails(task)}`,
      footerNote,
      preheader: subject,
    }),
  });
}

export async function notifyTaskAssigned(task: any) {
  try {
    await sendTaskEmail(
      task,
      `New task assigned: ${task.title || 'VELRUMA Task'}`,
      'New Task Assigned',
      'A task has been assigned to you. Please review the details below and complete it by the due date.'
    );
  } catch (error) {
    console.error('Task assignment email error:', error);
  }
}

export async function notifyTaskCompleted(task: any) {
  try {
    await sendTaskEmail(
      task,
      `Task completed: ${task.title || 'VELRUMA Task'}`,
      'Task Marked Complete',
      'This task has been marked as complete in the VELRUMA admin panel.'
    );
  } catch (error) {
    console.error('Task completion email error:', error);
  }
}
