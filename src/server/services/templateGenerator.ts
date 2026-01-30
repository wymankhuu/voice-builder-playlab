import {
  PlaylabTemplate,
  WorkflowComplexity,
  AIModel,
  StarterInput,
  TemplateGenerationRequest,
  TemplateGenerationResponse,
} from '../../shared/types/template.types';
import { AI_MODELS, MODEL_CHARACTERISTICS, DEFAULT_EDUCATION_MODEL } from '../../shared/constants/models';
import {
  DEFAULT_GUIDELINES,
  KNOWLEDGE_FILE_TYPES,
  COMMON_USER_MEMORY_FIELDS,
  CONVERSATION_RULE_TEMPLATES,
} from '../../shared/constants/playlabFeatures';

/**
 * Template Generator Service
 * Transforms interview responses into Playlab.ai-formatted prompt templates
 */
export class TemplateGenerator {
  /**
   * Generate complete Playlab.ai template from interview responses
   */
  generateTemplate(request: TemplateGenerationRequest): TemplateGenerationResponse {
    try {
      const { responses } = request;

      // Extract data from each question
      const q1 = responses[1]?.answer || '';
      const q2 = responses[2]?.answer || '';
      const q3 = responses[3]?.answer || '';
      const q4 = responses[4]?.answer || '';
      const q5 = responses[5]?.answer || '';

      // Build template structure
      const template: PlaylabTemplate = {
        background: this.generateBackground(q1, q2),
        workflow: this.generateWorkflow(q3),
        conversationRules: this.generateConversationRules(q4),
        guidelines: this.generateGuidelines(q5),
        recommendations: this.generateRecommendations(q3, q5, q1),
      };

      // Format template as markdown
      const formattedTemplate = this.formatTemplateAsMarkdown(template);

      return {
        success: true,
        template,
        formattedTemplate,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Template generation failed',
      };
    }
  }

  /**
   * Generate Background section from Q1 (role) and Q2 (audience)
   */
  private generateBackground(roleAnswer: string, audienceAnswer: string) {
    const expertise = this.extractExpertise(roleAnswer);
    const role = this.extractRole(roleAnswer);
    const targetAudience = this.extractAudience(audienceAnswer);

    return {
      expertise: expertise || '**[Specify expertise area]**',
      role: role || '**[Specify role/title]**',
      targetAudience: targetAudience || '**[Specify target users and their context]**',
    };
  }

  /**
   * Generate Workflow section from Q3 (what it does)
   */
  private generateWorkflow(workflowAnswer: string) {
    const steps = this.extractWorkflowSteps(workflowAnswer);

    return {
      steps: steps.length > 0
        ? steps
        : [
            {
              stepNumber: 1,
              description: '**[What is the first step users take?]**',
              subBullets: ['**[What information do you need to gather?]**'],
            },
          ],
    };
  }

  /**
   * Generate Conversation Rules from Q4 (communication style)
   */
  private generateConversationRules(styleAnswer: string) {
    const tone = this.extractTone(styleAnswer);
    const style = this.extractStyle(styleAnswer);
    const structure = CONVERSATION_RULE_TEMPLATES.structured;

    return {
      tone: tone || '**[Specify tone: formal, friendly, encouraging, etc.]**',
      style: style || '**[Specify style: question-driven, answer-driven, conversational, etc.]**',
      structure,
    };
  }

  /**
   * Generate Guidelines & Guardrails from Q5 (boundaries)
   */
  private generateGuidelines(boundariesAnswer: string) {
    const extracted = this.extractBoundariesAndRequirements(boundariesAnswer);

    return {
      boundaries: extracted.boundaries.length > 0
        ? extracted.boundaries
        : ['**[What topics should be avoided?]**'],
      limitations: extracted.limitations.length > 0
        ? extracted.limitations
        : ['**[What are the limitations of this assistant?]**'],
      requirements: extracted.requirements.length > 0
        ? extracted.requirements
        : ['**[What specific requirements must be met?]**'],
      defaultGuidelines: DEFAULT_GUIDELINES,
    };
  }

  /**
   * Generate Recommendations (model, knowledge files, inputs, etc.)
   */
  private generateRecommendations(workflowAnswer: string, boundariesAnswer: string, roleAnswer: string) {
    const complexity = this.analyzeWorkflowComplexity(workflowAnswer);
    const model = this.recommendModel(complexity, roleAnswer);
    const knowledgeFileTypes = this.recommendKnowledgeFiles(boundariesAnswer);
    const starterInputs = this.recommendStarterInputs(workflowAnswer);
    const appName = this.generateAppName(roleAnswer);
    const appDescription = this.generateAppDescription(roleAnswer, workflowAnswer);
    const userMemory = this.recommendUserMemory(roleAnswer);

    return {
      model,
      knowledgeFileTypes,
      starterInputs,
      appName,
      appDescription,
      userMemory,
    };
  }

  /**
   * Analyze workflow complexity based on keywords and sentence structure
   */
  private analyzeWorkflowComplexity(workflowAnswer: string): WorkflowComplexity {
    const answer = workflowAnswer.toLowerCase();

    // Complex indicators
    const complexKeywords = ['analyze', 'evaluate', 'synthesize', 'compare', 'integrate', 'assess', 'multi-step'];
    const hasComplexKeywords = complexKeywords.some((keyword) => answer.includes(keyword));
    const hasMultipleSteps = answer.split(/step|then|next|after|finally/i).length > 4;

    if (hasComplexKeywords || hasMultipleSteps) {
      return 'high';
    }

    // Simple indicators
    const simpleKeywords = ['quick', 'simple', 'basic', 'generate', 'create'];
    const hasSimpleKeywords = simpleKeywords.some((keyword) => answer.includes(keyword));
    const isBrief = answer.split(' ').length < 30;

    if (hasSimpleKeywords && isBrief) {
      return 'simple';
    }

    return 'medium';
  }

  /**
   * Recommend AI model based on complexity and use case
   */
  private recommendModel(complexity: WorkflowComplexity, roleAnswer: string): AIModel {
    const answer = roleAnswer.toLowerCase();
    const needsReasoning = answer.includes('math') || answer.includes('problem') || answer.includes('analysis');

    if (needsReasoning) {
      return 'Claude 4 Sonnet (Reasoning)';
    }

    switch (complexity) {
      case 'high':
        return 'Claude 4 Opus';
      case 'medium':
        return 'Claude 3.7 Sonnet';
      case 'simple':
        return 'Claude 3.5 Haiku';
      default:
        return DEFAULT_EDUCATION_MODEL;
    }
  }

  /**
   * Recommend knowledge file types based on boundaries answer
   */
  private recommendKnowledgeFiles(boundariesAnswer: string): string[] {
    const answer = boundariesAnswer.toLowerCase();
    const recommendations: string[] = [];

    const keywords = {
      documents: ['curriculum', 'standards', 'policy', 'handbook', 'guide'],
      spreadsheets: ['data', 'student records', 'assessment', 'grades', 'roster'],
      wordDocs: ['lesson plan', 'template', 'report', 'notes'],
      presentations: ['training', 'presentation', 'slides'],
    };

    Object.entries(keywords).forEach(([type, words]) => {
      if (words.some((word) => answer.includes(word))) {
        const fileType = KNOWLEDGE_FILE_TYPES[type as keyof typeof KNOWLEDGE_FILE_TYPES];
        if (fileType && !recommendations.includes(fileType.label)) {
          recommendations.push(fileType.label);
        }
      }
    });

    return recommendations.length > 0
      ? recommendations
      : ['PDF documents (general reference materials)'];
  }

  /**
   * Recommend starter inputs based on workflow
   */
  private recommendStarterInputs(workflowAnswer: string): StarterInput[] {
    const answer = workflowAnswer.toLowerCase();
    const inputs: StarterInput[] = [];

    // Common patterns
    if (answer.includes('grade') || answer.includes('level')) {
      inputs.push({
        type: 'dropdown',
        label: 'Grade Level',
        options: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        required: true,
      });
    }

    if (answer.includes('subject') || answer.includes('topic')) {
      inputs.push({
        type: 'dropdown',
        label: 'Subject Area',
        options: ['English/Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Other'],
        required: true,
      });
    }

    if (answer.includes('upload') || answer.includes('document') || answer.includes('file')) {
      inputs.push({
        type: 'file_upload',
        label: 'Upload Document',
        required: false,
      });
    }

    if (answer.includes('describe') || answer.includes('explain') || answer.includes('detail')) {
      inputs.push({
        type: 'long_text',
        label: 'Description',
        placeholder: 'Provide details...',
        required: true,
      });
    }

    // Default fallback
    if (inputs.length === 0) {
      inputs.push({
        type: 'long_text',
        label: 'Your Request',
        placeholder: 'Describe what you need help with...',
        required: true,
      });
    }

    return inputs;
  }

  /**
   * Generate app name from role answer
   */
  private generateAppName(roleAnswer: string): string {
    const role = this.extractRole(roleAnswer);
    if (role) {
      return role.replace(/\*\*/g, '').trim();
    }
    return 'Custom AI Assistant';
  }

  /**
   * Generate app description
   */
  private generateAppDescription(roleAnswer: string, workflowAnswer: string): string {
    const role = this.extractRole(roleAnswer) || 'assistant';
    const cleanRole = role.replace(/\*\*/g, '').trim().toLowerCase();

    const firstSentence = workflowAnswer.split(/[.!?]/)[0];

    return `An AI-powered ${cleanRole} that helps you ${firstSentence.toLowerCase()}.`;
  }

  /**
   * Recommend user memory fields
   */
  private recommendUserMemory(roleAnswer: string) {
    const defaultFields = [
      'Grade Level or context',
      'Subject Area',
      'User Role',
      'Previous interactions',
      'User preferences',
    ];

    return {
      enabled: true,
      trackingFields: defaultFields,
    };
  }

  /**
   * Extract expertise from role answer
   */
  private extractExpertise(answer: string): string {
    const expertiseKeywords = ['coach', 'advisor', 'specialist', 'expert', 'consultant', 'mentor'];
    const words = answer.split(' ');

    for (const keyword of expertiseKeywords) {
      const index = words.findIndex((w) => w.toLowerCase().includes(keyword));
      if (index !== -1) {
        return words.slice(Math.max(0, index - 2), index + 1).join(' ');
      }
    }

    return answer.slice(0, 100);
  }

  /**
   * Extract role from role answer
   */
  private extractRole(answer: string): string {
    return answer.trim() || 'AI Assistant';
  }

  /**
   * Extract audience from audience answer
   */
  private extractAudience(answer: string): string {
    if (!answer.trim()) {
      return '**[Specify your target audience]**';
    }

    // Add placeholder suggestion if too vague
    if (answer.split(' ').length < 3) {
      return `${answer} **[Add more context about their needs/situation]**`;
    }

    return answer;
  }

  /**
   * Extract tone from style answer
   */
  private extractTone(answer: string): string {
    const toneKeywords = {
      formal: ['formal', 'professional', 'official'],
      friendly: ['friendly', 'warm', 'approachable'],
      encouraging: ['encouraging', 'supportive', 'positive'],
      direct: ['direct', 'straightforward', 'concise'],
    };

    const lowerAnswer = answer.toLowerCase();

    for (const [tone, keywords] of Object.entries(toneKeywords)) {
      if (keywords.some((keyword) => lowerAnswer.includes(keyword))) {
        return tone.charAt(0).toUpperCase() + tone.slice(1);
      }
    }

    return 'Professional and supportive';
  }

  /**
   * Extract style from style answer
   */
  private extractStyle(answer: string): string {
    const lowerAnswer = answer.toLowerCase();

    if (lowerAnswer.includes('question') || lowerAnswer.includes('ask')) {
      return 'Question-driven dialogue';
    }
    if (lowerAnswer.includes('answer') || lowerAnswer.includes('provide')) {
      return 'Direct answer-driven';
    }
    if (lowerAnswer.includes('conversation') || lowerAnswer.includes('chat')) {
      return 'Conversational';
    }

    return 'Balanced question and answer approach';
  }

  /**
   * Extract workflow steps from workflow answer
   */
  private extractWorkflowSteps(answer: string) {
    const steps = [];
    const sentences = answer.split(/[.!?]+/).filter((s) => s.trim());

    let stepNumber = 1;
    for (const sentence of sentences.slice(0, 5)) {
      if (sentence.trim()) {
        steps.push({
          stepNumber,
          description: sentence.trim(),
          subBullets: ['**[What specific actions are taken in this step?]**'],
        });
        stepNumber++;
      }
    }

    return steps;
  }

  /**
   * Extract boundaries and requirements from boundaries answer
   */
  private extractBoundariesAndRequirements(answer: string) {
    const boundaries: string[] = [];
    const limitations: string[] = [];
    const requirements: string[] = [];

    const lowerAnswer = answer.toLowerCase();

    // Look for negatives (boundaries)
    if (lowerAnswer.includes('not') || lowerAnswer.includes('avoid') || lowerAnswer.includes("don't")) {
      const negSentences = answer.split(/[.!?]/).filter((s) =>
        s.toLowerCase().includes('not') || s.toLowerCase().includes('avoid') || s.toLowerCase().includes("don't")
      );
      boundaries.push(...negSentences.map((s) => s.trim()).filter(Boolean));
    }

    // Look for requirements
    if (lowerAnswer.includes('must') || lowerAnswer.includes('require') || lowerAnswer.includes('only')) {
      const reqSentences = answer.split(/[.!?]/).filter((s) =>
        s.toLowerCase().includes('must') || s.toLowerCase().includes('require') || s.toLowerCase().includes('only')
      );
      requirements.push(...reqSentences.map((s) => s.trim()).filter(Boolean));
    }

    return { boundaries, limitations, requirements };
  }

  /**
   * Format template as markdown string
   */
  private formatTemplateAsMarkdown(template: PlaylabTemplate): string {
    let markdown = `# ${template.recommendations.appName}\n\n`;
    markdown += `${template.recommendations.appDescription}\n\n`;
    markdown += `---\n\n`;

    // Background
    markdown += `## Background\n\n`;
    markdown += `**Expertise:** ${template.background.expertise}\n\n`;
    markdown += `**Role:** ${template.background.role}\n\n`;
    markdown += `**Target Audience:** ${template.background.targetAudience}\n\n`;
    markdown += `---\n\n`;

    // Workflow
    markdown += `## Workflow\n\n`;
    template.workflow.steps.forEach((step) => {
      markdown += `### Step ${step.stepNumber}: ${step.description}\n\n`;
      step.subBullets.forEach((bullet) => {
        markdown += `- ${bullet}\n`;
      });
      if (step.questions && step.questions.length > 0) {
        step.questions.forEach((q) => {
          markdown += `  - ${q}\n`;
        });
      }
      markdown += `\n`;
    });
    markdown += `---\n\n`;

    // Formatting and Conversation Rules
    markdown += `## Formatting and Conversation Rules\n\n`;
    markdown += `**Tone:** ${template.conversationRules.tone}\n\n`;
    markdown += `**Style:** ${template.conversationRules.style}\n\n`;
    markdown += `**Structure Guidelines:**\n`;
    template.conversationRules.structure.forEach((rule) => {
      markdown += `- ${rule}\n`;
    });
    markdown += `\n---\n\n`;

    // Guidelines & Guardrails
    markdown += `## Guidelines & Guardrails\n\n`;
    markdown += `### Default Guidelines\n`;
    template.guidelines.defaultGuidelines.forEach((guideline) => {
      markdown += `- ${guideline}\n`;
    });
    markdown += `\n### Boundaries\n`;
    template.guidelines.boundaries.forEach((boundary) => {
      markdown += `- ${boundary}\n`;
    });
    if (template.guidelines.limitations.length > 0) {
      markdown += `\n### Limitations\n`;
      template.guidelines.limitations.forEach((limitation) => {
        markdown += `- ${limitation}\n`;
      });
    }
    if (template.guidelines.requirements.length > 0) {
      markdown += `\n### Requirements\n`;
      template.guidelines.requirements.forEach((req) => {
        markdown += `- ${req}\n`;
      });
    }
    markdown += `\n---\n\n`;

    // Recommended Model
    markdown += `## Recommended Model\n\n`;
    markdown += `**${template.recommendations.model}**\n\n`;
    const modelInfo = MODEL_CHARACTERISTICS[template.recommendations.model];
    if (modelInfo) {
      markdown += `*Best for: ${modelInfo.bestFor.join(', ')}*\n\n`;
    }
    markdown += `---\n\n`;

    // Recommended Knowledge Files
    markdown += `## Recommended Knowledge Files\n\n`;
    template.recommendations.knowledgeFileTypes.forEach((fileType) => {
      markdown += `- ${fileType}\n`;
    });
    markdown += `\n---\n\n`;

    // Recommended Starter Inputs
    markdown += `## Recommended Starter Inputs\n\n`;
    template.recommendations.starterInputs.forEach((input, index) => {
      markdown += `### ${index + 1}. ${input.label} (${input.type})\n`;
      if (input.placeholder) {
        markdown += `- Placeholder: "${input.placeholder}"\n`;
      }
      if (input.options) {
        markdown += `- Options: ${input.options.join(', ')}\n`;
      }
      markdown += `- Required: ${input.required ? 'Yes' : 'No'}\n\n`;
    });
    markdown += `---\n\n`;

    // User Memory
    markdown += `## Recommended User Memory\n\n`;
    markdown += `**Track between sessions:**\n`;
    template.recommendations.userMemory.trackingFields.forEach((field) => {
      markdown += `- ${field}\n`;
    });
    markdown += `\n---\n\n`;
    markdown += `*Generated by Voice Builder for Playlab.ai*\n`;

    return markdown;
  }
}

// Export singleton instance
export const templateGenerator = new TemplateGenerator();
