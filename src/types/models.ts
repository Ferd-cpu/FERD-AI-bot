/**
 * Core type definitions for FERD-AI
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface SearchResult {
  title: string;
  url: string;
  score: number;
  summary?: string;
  publishedDate?: string;
  source?: string;
}

export interface ResearchReport {
  topic: string;
  sources: SearchResult[];
  synthesis: string;
  timestamp: Date;
  confidence?: number;
}

export interface CodeAnalysis {
  language: string;
  task: string;
  findings: string[];
  recommendations: string[];
  score?: number; // Quality score
}

export interface DocumentMetadata {
  url: string;
  title: string;
  wordCount: number;
  language?: string;
  publishDate?: Date;
  authors?: string[];
}

export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: Date;
}
