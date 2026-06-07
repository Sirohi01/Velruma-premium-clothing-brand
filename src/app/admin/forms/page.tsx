import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function FormsPage() {
  return (
    <Phase9ModulePage
      title="Dynamic Forms"
      description="Create exhibition, dealer, franchise and custom inquiry forms."
      endpoint="/api/forms"
      defaults={{ purpose: 'custom', fields: [], isActive: true }}
      fields={[
        { key: 'name', label: 'Form Name', required: true },
        { key: 'slug', label: 'Slug', required: true },
        { key: 'purpose', label: 'Purpose', type: 'select', options: ['contact', 'dealer', 'franchise', 'exhibition', 'custom'] },
        { key: 'isActive', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'name', label: 'Form' },
        { key: 'slug', label: 'Slug' },
        { key: 'purpose', label: 'Purpose', type: 'status' },
        { key: 'createdAt', label: 'Created', type: 'date' },
      ]}
    />
  );
}
