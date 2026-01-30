import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client
 */
export function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    console.log('[OpenAI] API key found, initializing client');
    openaiClient = new OpenAI({ apiKey });
  } else {
    console.log('[OpenAI] No API key found, AI generation will be disabled');
  }
}

/**
 * Get OpenAI client instance
 */
export function getOpenAIClient(): OpenAI | null {
  return openaiClient;
}

/**
 * Generate Playlab.ai template using OpenAI
 */
export async function generateTemplateWithAI(answers: {
  q1: string; // App vision, problem, audience
  q2: string; // User journey
  q3: string; // Tone/personality
  q4: string; // Success outcome
  q5: string; // Boundaries
}): Promise<string> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized');
  }

  const prompt = `You are a helpful assistant that creates Playlab.ai custom prompts for AI assistants.

Based on the following interview responses, generate a Playlab.ai prompt that follows this EXACT structure:

Background
You are an expert in [extract from responses].
Your role is to [extract from responses].
You are talking to [extract target audience from responses].
Success looks like [extract from success answer].

Your Workflow
First, [extract first step from user journey].
After they respond, then [extract second step].
Next, [extract third step].
[Continue for all workflow steps mentioned in the user journey]

Guidelines & Guardrails
Avoid language that might seem judgmental or dismissive.
Be inclusive in your examples and explanations, consider multiple perspectives, and avoid stereotypes.
Provide clear and concise responses.
If off-topic, prompt users to return to the main subject.
[Add any custom boundaries mentioned in Q5]

Interview Responses:
Q1 (App vision, problem, audience): ${answers.q1}
Q2 (User journey): ${answers.q2}
Q3 (Tone/personality): ${answers.q3}
Q4 (Success outcome): ${answers.q4}
Q5 (Boundaries): ${answers.q5}

IMPORTANT:
- Use the EXACT structure shown above
- Extract information naturally from the responses
- For the Workflow section, describe each step in a clear, actionable way
- Include "First," "After they respond, then," and "Next," for the workflow steps
- Maintain a ${answers.q3.toLowerCase()} tone throughout
- Include any specific boundaries or requirements from Q5 at the end of Guidelines & Guardrails
- Output ONLY the template, no additional explanation`;

  const completion = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a prompt engineer specializing in creating clear, effective prompts for AI assistants. You follow templates exactly and extract key information from user responses.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const generated = completion.choices[0]?.message?.content || '';

  if (!generated) {
    throw new Error('OpenAI returned empty response');
  }

  return generated.trim();
}
