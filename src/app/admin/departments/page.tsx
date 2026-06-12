import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function DepartmentsPage() {
  return (
    <Phase9ModulePage
      title="Departments"
      description="Create department masters once, then reuse them while adding team members."
      endpoint="/api/departments"
      defaults={{ isActive: true }}
      fields={[
        { key: 'name', label: 'Department Name', required: true },
        { key: 'code', label: 'Department Code' },
        { key: 'image', label: 'Department Image', type: 'image', folder: 'departments' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'email', label: 'Department Email' },
        { key: 'phone', label: 'Department Phone' },
        { key: 'location', label: 'Location' },
      ]}
      columns={[
        { key: 'name', label: 'Department' },
        { key: 'code', label: 'Code' },
        { key: 'email', label: 'Email' },
        { key: 'location', label: 'Location' },
      ]}
    />
  );
}
