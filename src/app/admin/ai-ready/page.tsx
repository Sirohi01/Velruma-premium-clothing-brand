import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function AiReadyPage() {
  return (
    <Phase9ModulePage
      title="Future AI Ready Layer"
      description="Prepare AI capability configs for future SEO, descriptions, reports and chatbot workflows."
      endpoint="/api/ai-ready"
      defaults={{ isEnabled: false, isActive: true }}
      fields={[
        { key: 'module', label: 'Module', required: true },
        { key: 'capability', label: 'Capability', required: true },
        { key: 'promptTemplate', label: 'Prompt Template', type: 'textarea' },
        { key: 'isEnabled', label: 'Enabled', type: 'checkbox' },
      ]}
      columns={[
        { key: 'module', label: 'Module' },
        { key: 'capability', label: 'Capability' },
        { key: 'isEnabled', label: 'Enabled', type: 'boolean' },
        { key: 'createdAt', label: 'Created', type: 'date' },
      ]}
    />
  );
}
