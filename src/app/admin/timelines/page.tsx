import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function TimelinesPage() {
  return (
    <Phase9ModulePage
      title="Activity Timelines"
      description="Universal timeline for customers, suppliers, leads and orders."
      endpoint="/api/timelines"
      defaults={{ channel: 'note', status: 'open', isActive: true }}
      fields={[
        { key: 'entityType', label: 'Entity Type', required: true },
        { key: 'entityId', label: 'Entity ID' },
        { key: 'title', label: 'Title', required: true },
        { key: 'note', label: 'Note', type: 'textarea' },
        { key: 'channel', label: 'Channel', type: 'select', options: ['call', 'whatsapp', 'email', 'meeting', 'system', 'note'] },
        { key: 'owner', label: 'Owner' },
        { key: 'dueAt', label: 'Due At', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['open', 'done', 'cancelled'] },
      ]}
      columns={[
        { key: 'entityType', label: 'Entity' },
        { key: 'title', label: 'Title' },
        { key: 'channel', label: 'Channel', type: 'status' },
        { key: 'owner', label: 'Owner' },
        { key: 'status', label: 'Status', type: 'status' },
      ]}
    />
  );
}
