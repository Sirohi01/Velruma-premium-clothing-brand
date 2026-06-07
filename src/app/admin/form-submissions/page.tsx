import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function FormSubmissionsPage() {
  return (
    <Phase9ModulePage
      title="Form Submissions"
      description="Review dealer, franchise, exhibition and contact form submissions."
      endpoint="/api/form-submissions"
      defaults={{ status: 'new' }}
      fields={[
        { key: 'formName', label: 'Form Name', required: true },
        { key: 'data', label: 'Submission Data', type: 'json' },
        { key: 'status', label: 'Status', type: 'select', options: ['new', 'reviewed', 'converted', 'rejected'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        { key: 'formName', label: 'Form' },
        { key: 'data.name', label: 'Sender Name' },
        { key: 'data.email', label: 'Email' },
        { key: 'status', label: 'Status', type: 'status' },
        { key: 'notes', label: 'Notes' },
        { key: 'createdAt', label: 'Received', type: 'date' },
      ]}
    />
  );
}
