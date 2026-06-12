import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function DesignationsPage() {
  return (
    <Phase9ModulePage
      title="Designations"
      description="Create designation masters with reporting lines and default roles for faster hiring."
      endpoint="/api/designations"
      defaults={{ level: 1, isActive: true }}
      fields={[
        { key: 'title', label: 'Designation Title', required: true },
        { key: 'code', label: 'Designation Code' },
        { key: 'departmentCode', label: 'Department', type: 'select', optionsEndpoint: '/api/departments?status=active', optionValueKey: 'code', optionLabelKey: 'name' },
        { key: 'level', label: 'Level', type: 'number' },
        { key: 'defaultRole', label: 'Default Role' },
        { key: 'responsibilities', label: 'Responsibilities', type: 'textarea' },
      ]}
      columns={[
        { key: 'title', label: 'Designation' },
        { key: 'code', label: 'Code' },
        { key: 'departmentCode', label: 'Department' },
        { key: 'defaultRole', label: 'Role' },
        { key: 'level', label: 'Level' },
      ]}
    />
  );
}
