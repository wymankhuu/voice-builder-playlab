// Playlab.ai starter input types
export type StarterInputType = 'short_text' | 'long_text' | 'file_upload' | 'dropdown' | 'checkboxes';

// Starter input configuration
export interface StarterInput {
  type: StarterInputType;
  label: string;
  placeholder?: string;
  options?: string[]; // For dropdown and checkboxes
  required?: boolean;
}

// Workflow step structure
export interface WorkflowStep {
  stepNumber: number;
  description: string;
  subBullets: string[];
  questions?: string[]; // Bold-formatted questions for user
}

// Complete Playlab.ai template structure
export interface PlaylabTemplate {
  // Section 1: Background
  background: {
    expertise: string;
    role: string;
    targetAudience: string; // With **placeholders** for builder input
  };

  // Section 2: Workflow
  workflow: {
    steps: WorkflowStep[];
  };

  // Section 3: Formatting & Conversation Rules
  conversationRules: {
    tone: string;
    style: string;
    structure: string[];
  };

  // Section 4: Guidelines & Guardrails
  guidelines: {
    boundaries: string[];
    limitations: string[];
    requirements: string[];
    defaultGuidelines: string[]; // The 4 default guidelines
  };

  // Section 5: Recommendations
  recommendations: {
    model: string;
    knowledgeFileTypes: string[];
    starterInputs: StarterInput[];
    appName: string;
    appDescription: string;
    userMemory: {
      enabled: boolean;
      trackingFields: string[];
    };
  };
}

// AI Model options
export type AIModel =
  | 'Claude 3 Opus'
  | 'Claude 3.5 Haiku'
  | 'Claude 3.7 Sonnet'
  | 'Claude 4 Opus'
  | 'Claude 4 Sonnet'
  | 'Claude 4 Sonnet (Reasoning)'
  | 'DeepSeek R1'
  | 'Gemini 2.5 Flash'
  | 'Gemini 2.5 Pro'
  | 'GPT 4.1'
  | 'GPT 4.1 Nano'
  | 'GPT OSS 120B'
  | 'GPT OSS 20B'
  | 'GPT-4o'
  | 'Kimi K2'
  | 'Llama 3.3 70B Instruct'
  | 'Llama 4 Maverick'
  | 'Llama 4 Scout'
  | 'o3 Mini';

// Workflow complexity levels
export type WorkflowComplexity = 'simple' | 'medium' | 'high';

// Template generation request
export interface TemplateGenerationRequest {
  sessionId: string;
  responses: Record<number, {
    questionId: string;
    answer: string;
  }>;
}

// Template generation response
export interface TemplateGenerationResponse {
  success: boolean;
  template?: PlaylabTemplate;
  formattedTemplate?: string; // Markdown-formatted string ready for copy/paste
  error?: string;
}
