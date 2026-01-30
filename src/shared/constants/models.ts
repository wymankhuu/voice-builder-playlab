import { AIModel } from '../types/template.types';

// Complete list of available AI models for Playlab.ai
export const AI_MODELS: AIModel[] = [
  'Claude 3 Opus',
  'Claude 3.5 Haiku',
  'Claude 3.7 Sonnet',
  'Claude 4 Opus',
  'Claude 4 Sonnet',
  'Claude 4 Sonnet (Reasoning)',
  'DeepSeek R1',
  'Gemini 2.5 Flash',
  'Gemini 2.5 Pro',
  'GPT 4.1',
  'GPT 4.1 Nano',
  'GPT OSS 120B',
  'GPT OSS 20B',
  'GPT-4o',
  'Kimi K2',
  'Llama 3.3 70B Instruct',
  'Llama 4 Maverick',
  'Llama 4 Scout',
  'o3 Mini',
];

// Model characteristics for recommendation engine
export const MODEL_CHARACTERISTICS: Record<
  AIModel,
  {
    speed: 'fast' | 'medium' | 'slow';
    reasoning: 'basic' | 'advanced' | 'expert';
    contextWindow: 'small' | 'medium' | 'large';
    bestFor: string[];
  }
> = {
  'Claude 3 Opus': {
    speed: 'slow',
    reasoning: 'expert',
    contextWindow: 'large',
    bestFor: ['complex analysis', 'long documents', 'critical thinking'],
  },
  'Claude 3.5 Haiku': {
    speed: 'fast',
    reasoning: 'basic',
    contextWindow: 'medium',
    bestFor: ['quick responses', 'simple tasks', 'high volume'],
  },
  'Claude 3.7 Sonnet': {
    speed: 'medium',
    reasoning: 'advanced',
    contextWindow: 'large',
    bestFor: ['general purpose', 'balanced performance', 'education'],
  },
  'Claude 4 Opus': {
    speed: 'slow',
    reasoning: 'expert',
    contextWindow: 'large',
    bestFor: ['complex workflows', 'detailed analysis', 'research'],
  },
  'Claude 4 Sonnet': {
    speed: 'medium',
    reasoning: 'advanced',
    contextWindow: 'large',
    bestFor: ['education', 'content creation', 'conversation'],
  },
  'Claude 4 Sonnet (Reasoning)': {
    speed: 'slow',
    reasoning: 'expert',
    contextWindow: 'large',
    bestFor: ['problem solving', 'step-by-step analysis', 'math'],
  },
  'DeepSeek R1': {
    speed: 'fast',
    reasoning: 'advanced',
    contextWindow: 'medium',
    bestFor: ['code', 'technical', 'research'],
  },
  'Gemini 2.5 Flash': {
    speed: 'fast',
    reasoning: 'basic',
    contextWindow: 'large',
    bestFor: ['quick tasks', 'multimodal', 'real-time'],
  },
  'Gemini 2.5 Pro': {
    speed: 'medium',
    reasoning: 'advanced',
    contextWindow: 'large',
    bestFor: ['multimodal', 'long context', 'general purpose'],
  },
  'GPT 4.1': {
    speed: 'medium',
    reasoning: 'advanced',
    contextWindow: 'large',
    bestFor: ['general purpose', 'creative writing', 'conversation'],
  },
  'GPT 4.1 Nano': {
    speed: 'fast',
    reasoning: 'basic',
    contextWindow: 'small',
    bestFor: ['quick tasks', 'simple queries', 'low latency'],
  },
  'GPT OSS 120B': {
    speed: 'medium',
    reasoning: 'advanced',
    contextWindow: 'large',
    bestFor: ['open source', 'customization', 'research'],
  },
  'GPT OSS 20B': {
    speed: 'fast',
    reasoning: 'basic',
    contextWindow: 'medium',
    bestFor: ['open source', 'efficiency', 'simple tasks'],
  },
  'GPT-4o': {
    speed: 'medium',
    reasoning: 'advanced',
    contextWindow: 'large',
    bestFor: ['multimodal', 'general purpose', 'conversation'],
  },
  'Kimi K2': {
    speed: 'medium',
    reasoning: 'advanced',
    contextWindow: 'large',
    bestFor: ['Chinese language', 'long context', 'research'],
  },
  'Llama 3.3 70B Instruct': {
    speed: 'medium',
    reasoning: 'advanced',
    contextWindow: 'medium',
    bestFor: ['open source', 'customization', 'conversation'],
  },
  'Llama 4 Maverick': {
    speed: 'medium',
    reasoning: 'advanced',
    contextWindow: 'large',
    bestFor: ['open source', 'general purpose', 'long context'],
  },
  'Llama 4 Scout': {
    speed: 'fast',
    reasoning: 'basic',
    contextWindow: 'medium',
    bestFor: ['open source', 'efficiency', 'quick tasks'],
  },
  'o3 Mini': {
    speed: 'fast',
    reasoning: 'advanced',
    contextWindow: 'medium',
    bestFor: ['reasoning', 'problem solving', 'efficiency'],
  },
};

// Default model for education-focused apps
export const DEFAULT_EDUCATION_MODEL: AIModel = 'Claude 3.7 Sonnet';
