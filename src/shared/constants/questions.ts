import { Question } from '../types/interview.types';

// Enhanced 5-question interview for building Playlab.ai custom AI apps
export const INTERVIEW_QUESTIONS: Question[] = [
  {
    id: 'q1_app_vision',
    order: 1,
    text: "Tell me about the app you're envisioning. What problem does it solve, and who is it for?",
    voicePrompt:
      'Hi Im here to help you build a custom AI assistant Lets start Tell me about the app youre envisioning What problem does it solve and who is it for?',
    extractionHints: ['app', 'problem', 'solve', 'user', 'audience', 'helps', 'for'],
    clarificationPrompts: [
      'Can you tell me more about the specific pain points your users face?',
      'What makes your target audience unique?',
    ],
  },
  {
    id: 'q2_user_journey',
    order: 2,
    text: "Describe a typical user's journey through the app. What does their experience look like from start to finish?",
    voicePrompt:
      'Great Now describe a typical users journey through the app What does their experience look like from start to finish?',
    extractionHints: ['journey', 'experience', 'start', 'finish', 'first', 'then', 'next', 'finally'],
    clarificationPrompts: [
      'What information does the user provide at the beginning?',
      'How does the app guide them through each step?',
    ],
  },
  {
    id: 'q3_tone_personality',
    order: 3,
    text: 'What tone, personality, or expertise should the app convey? How should it make users feel?',
    voicePrompt:
      'Perfect What tone personality or expertise should the app convey How should it make users feel?',
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
      'Are there specific experts or styles you want the app to emulate?',
      'What emotional response do you want users to have?',
    ],
  },
  {
    id: 'q4_success_outcome',
    order: 4,
    text: 'What would success look like for this app? If users walked away having accomplished one thing, what would it be?',
    voicePrompt:
      'Excellent What would success look like for this app If users walked away having accomplished one thing what would it be?',
    extractionHints: ['success', 'accomplish', 'achieve', 'goal', 'outcome', 'result'],
    clarificationPrompts: [
      'How will users know theyve gotten value from the app?',
      'What specific outcome should they be able to achieve?',
    ],
  },
  {
    id: 'q5_boundaries',
    order: 5,
    text: 'Are there any boundaries or things the app should avoid doing or suggesting?',
    voicePrompt:
      'Finally are there any boundaries or things the app should avoid doing or suggesting?',
    extractionHints: ['boundaries', 'avoid', 'not', 'dont', 'shouldnt', 'never', 'restrict', 'limit'],
    clarificationPrompts: [
      'How should the app handle off-topic requests?',
      'Are there any compliance or ethical concerns to consider?',
    ],
  },
];

// Default confirmation prompt template
export const CONFIRMATION_PROMPT = (paraphrase: string): string =>
  `Just to confirm you said ${paraphrase} Is that correct`;

// Welcome message
export const WELCOME_MESSAGE =
  'Welcome to Voice Builder for Playlab I will ask you 5 questions to help design your custom AI assistant This should take about 3 minutes Ready to begin';

// Completion message
export const COMPLETION_MESSAGE =
  'Great I have all the information I need Let me generate your custom AI assistant template for Playlab This will just take a moment';
