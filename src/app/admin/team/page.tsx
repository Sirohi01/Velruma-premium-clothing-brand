import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function TeamPage() {
  return (
    <Phase9ModulePage
      title="Team Management"
      description="Maintain employee database, department, salary and daily performance notes."
      endpoint="/api/team"
      defaults={{ department: 'operations', performanceScore: 3, isActive: true }}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'department', label: 'Department' },
        { key: 'designation', label: 'Designation' },
        { key: 'salary', label: 'Salary', type: 'number' },
        { key: 'joiningDate', label: 'Joining Date', type: 'date' },
        { key: 'performanceScore', label: 'Performance Score', type: 'number' },
        { key: 'dailyLog', label: 'Daily Log', type: 'textarea' },
      ]}
      columns={[
        { key: 'name', label: 'Employee' },
        { key: 'department', label: 'Department' },
        { key: 'designation', label: 'Designation' },
        { key: 'salary', label: 'Salary', type: 'currency' },
        { key: 'performanceScore', label: 'Score' },
      ]}
    />
  );
}
