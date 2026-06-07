import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function NotificationsPage() {
  return (
    <Phase9ModulePage
      title="Notification Center"
      description="Track admin alerts for orders, low stock, suppliers, support and system events."
      endpoint="/api/notifications"
      defaults={{ type: 'system', priority: 'normal', audience: 'admin', isRead: false, isActive: true }}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'message', label: 'Message', type: 'textarea', required: true },
        { key: 'type', label: 'Type', type: 'select', options: ['order', 'stock', 'return', 'supplier', 'support', 'task', 'system'] },
        { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'normal', 'high', 'urgent'] },
        { key: 'audience', label: 'Audience', type: 'select', options: ['admin', 'team', 'customer'] },
        { key: 'link', label: 'Link' },
        { key: 'isActive', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type', type: 'status' },
        { key: 'priority', label: 'Priority', type: 'status' },
        { key: 'audience', label: 'Audience' },
        { key: 'createdAt', label: 'Created', type: 'date' },
      ]}
    />
  );
}
