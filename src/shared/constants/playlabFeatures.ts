import { StarterInputType } from '../types/template.types';

// Knowledge file types supported by Playlab.ai
export const KNOWLEDGE_FILE_TYPES = {
  documents: {
    label: 'PDF documents',
    extensions: ['.pdf'],
    useCases: ['curriculum guides', 'standards', 'policy documents', 'handbooks', 'research papers'],
  },
  spreadsheets: {
    label: 'CSV/Excel files',
    extensions: ['.csv', '.xlsx'],
    useCases: ['student data', 'assessment results', 'rosters', 'schedules', 'budgets'],
  },
  wordDocs: {
    label: 'Word documents',
    extensions: ['.docx', '.doc'],
    useCases: ['lesson plans', 'policies', 'meeting notes', 'reports'],
  },
  presentations: {
    label: 'PowerPoint presentations',
    extensions: ['.pptx', '.ppt'],
    useCases: ['training materials', 'presentations', 'professional development'],
  },
  text: {
    label: 'Text files',
    extensions: ['.txt', '.md'],
    useCases: ['notes', 'documentation', 'resources'],
  },
};

// Starter input types with descriptions
export const STARTER_INPUT_TYPES: Record<
  StarterInputType,
  {
    label: string;
    description: string;
    useCases: string[];
  }
> = {
  short_text: {
    label: 'Short Text Input',
    description: 'Single-line text field for brief inputs',
    useCases: ['name', 'grade level', 'subject', 'topic', 'date'],
  },
  long_text: {
    label: 'Long Text Input',
    description: 'Multi-line text area for detailed inputs',
    useCases: ['lesson objectives', 'student context', 'project description', 'question'],
  },
  file_upload: {
    label: 'File Upload',
    description: 'Allow users to upload files (PDFs, CSVs, etc.)',
    useCases: ['curriculum document', 'student data', 'lesson plan', 'assessment'],
  },
  dropdown: {
    label: 'Dropdown (Single Select)',
    description: 'Select one option from a predefined list',
    useCases: ['grade level', 'subject area', 'difficulty level', 'format type'],
  },
  checkboxes: {
    label: 'Checkboxes (Multi-Select)',
    description: 'Select multiple options from a predefined list',
    useCases: ['learning standards', 'student needs', 'features to include', 'topics'],
  },
};

// Default 4 guidelines & guardrails for all apps
export const DEFAULT_GUIDELINES = [
  'Avoid language that might seem judgmental or dismissive.',
  'Be inclusive in your examples and explanations, consider multiple perspectives, and avoid stereotypes.',
  'Provide clear and concise responses.',
  'If off-topic, prompt users to return to the main subject.',
];

// Common user memory fields for education apps
export const COMMON_USER_MEMORY_FIELDS = {
  gradeLevel: {
    label: 'Grade Level',
    useCases: ['tailoring content', 'age-appropriate language', 'curriculum alignment'],
  },
  subjectArea: {
    label: 'Subject Area',
    useCases: ['subject-specific guidance', 'standards alignment', 'content focus'],
  },
  schoolContext: {
    label: 'School Context',
    useCases: ['demographic awareness', 'resource considerations', 'cultural relevance'],
  },
  userRole: {
    label: 'User Role',
    useCases: ['permission levels', 'relevant features', 'personalized guidance'],
  },
  preferences: {
    label: 'User Preferences',
    useCases: ['communication style', 'format preferences', 'feature settings'],
  },
  previousInteractions: {
    label: 'Previous Interactions',
    useCases: ['continuity', 'follow-up questions', 'progress tracking'],
  },
  goals: {
    label: 'User Goals',
    useCases: ['personalized recommendations', 'progress tracking', 'targeted support'],
  },
};

// MCP (Model Context Protocol) tools commonly used in education
export const MCP_TOOLS = {
  search: {
    label: 'Search Tool',
    description: 'Search knowledge base and external resources',
    useCases: ['finding standards', 'research', 'resource discovery'],
  },
  calculator: {
    label: 'Calculator Tool',
    description: 'Perform mathematical calculations',
    useCases: ['grade calculations', 'statistics', 'budget planning'],
  },
  calendar: {
    label: 'Calendar Tool',
    description: 'Access and manage calendar events',
    useCases: ['scheduling', 'deadline tracking', 'event planning'],
  },
  fileReader: {
    label: 'File Reader Tool',
    description: 'Read and analyze uploaded files',
    useCases: ['document analysis', 'data processing', 'content extraction'],
  },
};

// Conversation rule templates
export const CONVERSATION_RULE_TEMPLATES = {
  structured: [
    'Structure responses with headers and bullet points for easy scanning',
    'Always reference relevant knowledge base materials when available',
    'Provide examples that relate to the user\'s specific context',
    'Ask one clarifying question at a time to avoid overwhelming users',
  ],
  supportive: [
    'Use encouraging and supportive language',
    'Acknowledge user expertise and experience',
    'Offer multiple options when possible',
    'Check in on understanding before proceeding to next steps',
  ],
  efficient: [
    'Get straight to the point with actionable guidance',
    'Prioritize the most important information first',
    'Use concise language without sacrificing clarity',
    'Provide quick wins alongside long-term strategies',
  ],
};
