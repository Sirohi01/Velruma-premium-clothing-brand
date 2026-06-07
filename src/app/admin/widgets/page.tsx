import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function WidgetsPage() {
  return (
    <Phase9ModulePage
      title="Dashboard Widgets"
      description="Configure admin dashboard widgets, order and visibility."
      endpoint="/api/widgets"
      defaults={{ widgetType: 'custom', position: 0, size: 'medium', isEnabled: true, isActive: true }}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'widgetType', label: 'Widget Type', type: 'select', options: ['sales', 'orders', 'crm', 'inventory', 'support', 'custom'] },
        { key: 'position', label: 'Position', type: 'number' },
        { key: 'size', label: 'Size', type: 'select', options: ['small', 'medium', 'large'] },
        { key: 'isEnabled', label: 'Enabled', type: 'checkbox' },
      ]}
      columns={[
        { key: 'title', label: 'Widget' },
        { key: 'widgetType', label: 'Type', type: 'status' },
        { key: 'position', label: 'Position' },
        { key: 'size', label: 'Size' },
        { key: 'isEnabled', label: 'Enabled', type: 'boolean' },
      ]}
    />
  );
}
