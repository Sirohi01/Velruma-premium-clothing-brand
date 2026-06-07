export type AiCapability = 'seo' | 'product_description' | 'report_summary' | 'support_chat';

export interface AiModuleConfig {
  module: string;
  capability: AiCapability;
  promptTemplate: string;
  isEnabled: boolean;
}

export interface AiRunInput {
  capability: AiCapability;
  input: Record<string, unknown>;
}

export interface AiRunResult {
  success: boolean;
  output?: string;
  error?: string;
}
