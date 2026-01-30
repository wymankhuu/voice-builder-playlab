import { Question } from '../types/interview.types';

// Enhanced 5-question interview for building Playlab.ai custom AI apps
export const INTERVIEW_QUESTIONS: Question[] = [
  {
    id: 'q1_app_vision',
    order: 1,
    text: "What app are you building and who is it for?",
    voicePrompt:
      'Hi Im here to help you build a custom AI assistant What app are you building and who is it for?',
    extractionHints: ['app', 'problem', 'solve', 'user', 'audience', 'helps', 'for'],
    clarificationPrompts: [
      'What problem does it solve?',
      'Who is your target audience?',
    ],
  },
  {
    id: 'q2_user_journey',
    order: 2,
    text: "Describe the user journey from start to finish.",
    voicePrompt:
      'Great Describe the user journey from start to finish',
    extractionHints: ['journey', 'experience', 'start', 'finish', 'first', 'then', 'next', 'finally'],
    clarificationPrompts: [
      'What happens first?',
      'What happens next?',
    ],
  },
  {
    id: 'q3_tone_personality',
    order: 3,
    text: 'What tone and personality should the app have?',
    voicePrompt:
      'Perfect What tone and personality should the app have?',
    extractionHints: [
      'tone',
      'personality',
      'expertise',
      'feel',
      'friendly',
      'professional',
      'casual',
      'formal',
      'supportive',
      'empathetic',
    ],
    clarificationPrompts: [
      'How should it make users feel?',
      'Any specific style to emulate?',
    ],
  },
  {
    id: 'q4_success_outcome',
    order: 4,
    text: 'What should users accomplish with this app?',
    voicePrompt:
      'Excellent What should users accomplish with this app?',
    extractionHints: ['success', 'accomplish', 'achieve', 'goal', 'outcome', 'result'],
    clarificationPrompts: [
      'What is the main goal?',
      'What outcome should they achieve?',
    ],
  },
  {
    id: 'q5_boundaries',
    order: 5,
    text: 'What should the app avoid or not do?',
    voicePrompt:
      'Finally What should the app avoid or not do?',
    extractionHints: ['boundaries', 'avoid', 'not', 'dont', 'shouldnt', 'never', 'restrict', 'limit'],
    clarificationPrompts: [
      'Any topics to avoid?',
      'Any restrictions to consider?',
    ],
  },
];

// Default confirmation prompt template
export const CONFIRMATION_PROMPT = (paraphrase: string): string =>
  `Just to confirm you said ${paraphrase} Is that correct`;

// Welcome message
export const WELCOME_MESSAGE =
  'Welcome to Voice Builder Ill ask 5 quick questions to design your custom AI assistant Ready';

// Completion message
export const COMPLETION_MESSAGE =
  'Perfect Generating your AI assistant template now';
