import type { AiRunInput, AiRunResult } from './types';

export async function runAiCapability(_input: AiRunInput): Promise<AiRunResult> {
  return {
    success: false,
    error: 'AI execution is not enabled yet. Configure a provider before using this capability.',
  };
}
