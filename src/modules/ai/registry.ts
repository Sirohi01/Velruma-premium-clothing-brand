import type { AiModuleConfig } from './types';

export const defaultAiCapabilities: AiModuleConfig[] = [
  {
    module: 'seo',
    capability: 'seo',
    promptTemplate: 'Audit this page metadata and suggest improvements.',
    isEnabled: false,
  },
  {
    module: 'products',
    capability: 'product_description',
    promptTemplate: 'Create a premium ecommerce product description from product attributes.',
    isEnabled: false,
  },
  {
    module: 'reports',
    capability: 'report_summary',
    promptTemplate: 'Summarize sales and operations KPIs for admin review.',
    isEnabled: false,
  },
  {
    module: 'support',
    capability: 'support_chat',
    promptTemplate: 'Draft a helpful support reply from ticket context.',
    isEnabled: false,
  },
];
