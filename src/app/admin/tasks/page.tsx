import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function TasksPage() {
  return (
    <Phase9ModulePage
      title="Task Management"
      description="Create, assign and track CRM, operations and follow-up tasks."
      endpoint="/api/tasks"
      defaults={{ module: 'crm', priority: 'normal', status: 'todo', isActive: true }}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'module', label: 'Module', type: 'select', options: ['crm', 'orders', 'inventory', 'support', 'production', 'marketing', 'accounts', 'operations', 'other'] },
        { key: 'assignedTo', label: 'Assigned To', type: 'select', optionsEndpoint: '/api/team?status=active', optionValueKey: 'employeeCode', optionLabelKey: 'name' },
        { key: 'dueDate', label: 'Due Date', type: 'date' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['lowest', 'low', 'normal', 'medium', 'high', 'urgent', 'critical'] },
        { key: 'status', label: 'Status', type: 'select', options: ['todo', 'planned', 'assigned', 'in_progress', 'waiting', 'review', 'completed', 'blocked', 'cancelled'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        { key: 'title', label: 'Task' },
        { key: 'assignedTo', label: 'Assigned' },
        { key: 'priority', label: 'Priority', type: 'status' },
        { key: 'status', label: 'Status', type: 'status' },
        { key: 'dueDate', label: 'Due', type: 'date' },
      ]}
    />
  );
}
