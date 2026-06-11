import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function AiReadyPage() {
  return (
    <Phase9ModulePage
      title="Future AI Ready Layer"
      description="Prepare AI capability configs for future SEO, descriptions, reports and chatbot workflows."
      endpoint="/api/ai-ready"
      defaults={{
        provider: 'future',
        rolloutStatus: 'planned',
        inputSchema: '{\n  "type": "object",\n  "properties": {}\n}',
        outputSchema: '{\n  "type": "object",\n  "properties": {}\n}',
        guardrails: 'Keep brand tone premium and concise\nDo not publish without admin approval',
        isEnabled: false,
        isActive: true,
      }}
      fields={[
        { key: 'module', label: 'Module', type: 'select', options: ['seo', 'products', 'reports', 'support', 'marketing', 'chatbot'], required: true },
        { key: 'capability', label: 'Capability', required: true },
        { key: 'provider', label: 'Provider', type: 'select', options: ['openai', 'manual', 'future'] },
        { key: 'modelName', label: 'Model Name' },
        { key: 'promptTemplate', label: 'Prompt Template', type: 'textarea' },
        { key: 'inputSchema', label: 'Input Schema JSON', type: 'json' },
        { key: 'outputSchema', label: 'Output Schema JSON', type: 'json' },
        { key: 'guardrails', label: 'Guardrails', type: 'textarea' },
        { key: 'fallbackText', label: 'Fallback Text', type: 'textarea' },
        { key: 'owner', label: 'Owner' },
        { key: 'rolloutStatus', label: 'Rollout Status', type: 'select', options: ['planned', 'testing', 'ready', 'paused'] },
        { key: 'isEnabled', label: 'Enabled', type: 'checkbox' },
      ]}
      columns={[
        { key: 'module', label: 'Module' },
        { key: 'capability', label: 'Capability' },
        { key: 'provider', label: 'Provider', type: 'status' },
        { key: 'rolloutStatus', label: 'Rollout', type: 'status' },
        { key: 'isEnabled', label: 'Enabled', type: 'boolean' },
      ]}
    />
  );
}
