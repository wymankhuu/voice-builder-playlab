import { v4 as uuidv4 } from 'uuid';
import { InterviewResponse, InterviewState } from '../../shared/types/interview.types';
import { INTERVIEW_QUESTIONS } from '../../shared/constants/questions';

/**
 * Interview Session Data
 */
interface InterviewSession {
  sessionId: string;
  currentQuestionIndex: number;
  state: InterviewState;
  responses: Map<number, InterviewResponse>;
  startTime: Date;
  endTime?: Date;
}

/**
 * Interview Service
 * Manages interview sessions and state
 */
export class InterviewService {
  private sessions: Map<string, InterviewSession> = new Map();

  /**
   * Create a new interview session
   */
  createSession(): InterviewSession {
    const sessionId = uuidv4();
    const session: InterviewSession = {
      sessionId,
      currentQuestionIndex: 0,
      state: InterviewState.WELCOME,
      responses: new Map(),
      startTime: new Date(),
    };

    this.sessions.set(sessionId, session);
    console.log(`[InterviewService] Created session: ${sessionId}`);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): InterviewSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Start interview (move from WELCOME to first question)
   */
  startInterview(sessionId: string): void {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.state = InterviewState.QUESTION_1;
    session.currentQuestionIndex = 0;
    console.log(`[InterviewService] Started interview for session: ${sessionId}`);
  }

  /**
   * Get current question for session
   */
  getCurrentQuestion(sessionId: string) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const question = INTERVIEW_QUESTIONS[session.currentQuestionIndex];
    return question;
  }

  /**
   * Save response and move to next question
   */
  saveResponse(
    sessionId: string,
    questionIndex: number,
    transcript: string,
    confidence: number = 1.0
  ): void {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const question = INTERVIEW_QUESTIONS[questionIndex];
    const response: InterviewResponse = {
      questionId: question.id,
      question: question.text,
      rawTranscript: transcript,
      confirmedAnswer: transcript,
      clarifications: [],
      timestamp: new Date(),
      confidence,
    };

    session.responses.set(questionIndex + 1, response); // 1-indexed for template generator
    console.log(`[InterviewService] Saved response for Q${questionIndex + 1}: ${transcript.substring(0, 50)}`);
  }

  /**
   * Move to next question
   */
  nextQuestion(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.currentQuestionIndex++;

    if (session.currentQuestionIndex >= INTERVIEW_QUESTIONS.length) {
      // All questions completed
      session.state = InterviewState.COMPLETE;
      session.endTime = new Date();
      console.log(`[InterviewService] Interview completed for session: ${sessionId}`);
      return false;
    }

    // Update state to next question
    const stateMap: Record<number, InterviewState> = {
      0: InterviewState.QUESTION_1,
      1: InterviewState.QUESTION_2,
      2: InterviewState.QUESTION_3,
      3: InterviewState.QUESTION_4,
      4: InterviewState.QUESTION_5,
    };

    session.state = stateMap[session.currentQuestionIndex] || InterviewState.COMPLETE;
    console.log(`[InterviewService] Moved to question ${session.currentQuestionIndex + 1}`);

    return true;
  }

  /**
   * Get all responses for template generation
   */
  getAllResponses(sessionId: string): Record<number, { questionId: string; answer: string }> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const responses: Record<number, { questionId: string; answer: string }> = {};

    session.responses.forEach((response, questionNumber) => {
      responses[questionNumber] = {
        questionId: response.questionId,
        answer: response.confirmedAnswer,
      };
    });

    return responses;
  }

  /**
   * Get progress (current question / total questions)
   */
  getProgress(sessionId: string): { current: number; total: number } {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return {
      current: session.currentQuestionIndex + 1,
      total: INTERVIEW_QUESTIONS.length,
    };
  }

  /**
   * Check if interview is complete
   */
  isComplete(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) {
      return false;
    }

    return session.state === InterviewState.COMPLETE;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    console.log(`[InterviewService] Deleted session: ${sessionId}`);
  }

  /**
   * Clean up old sessions (older than 1 hour)
   */
  cleanupOldSessions(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.startTime < oneHourAgo) {
        this.deleteSession(sessionId);
      }
    }
  }
}

// Singleton instance
export const interviewService = new InterviewService();

// Cleanup old sessions every 30 minutes
setInterval(() => {
  interviewService.cleanupOldSessions();
}, 30 * 60 * 1000);
