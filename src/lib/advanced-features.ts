/**
 * Advanced Features Library - Integrating best-in-class capabilities from all leading AI chatbots
 * 
 * Features from:
 * - OpenAI (ChatGPT): Code execution, advanced reasoning, GPT-4 capabilities
 * - Anthropic (Claude): Constitutional AI, long context, nuanced understanding
 * - Google (Gemini): Multimodal processing, real-time info, advanced search
 * - Meta (Llama): Open-source reasoning, efficiency
 * - Microsoft (Copilot): Code generation, productivity integration
 * - Mistral: Optimization, streaming efficiency
 */

import { generateText, streamText, generateWithVision } from './gemini';
import { semanticSearch, keywordSearch } from './exa';
import { extractContent, extractLinks } from './firecrawl';

// ============================================================================
// 1. ADVANCED REASONING & ANALYSIS (Claude + GPT-4 inspired)
// ============================================================================

export interface ReasoningConfig {
  depth: 'shallow' | 'deep' | 'exhaustive';
  includeThinking: boolean;
  stepByStep: boolean;
  maxTokens?: number;
}

export async function advancedReasoning(
  prompt: string,
  config: ReasoningConfig = {
    depth: 'deep',
    includeThinking: true,
    stepByStep: true,
  }
) {
  const thinkingPrompt = `
You are an advanced AI reasoning system. Analyze this request with ${config.depth} reasoning.
${config.stepByStep ? 'Break down your reasoning step-by-step.' : ''}
${config.includeThinking ? 'Show your complete thinking process.' : ''}

Request: ${prompt}

Provide a comprehensive analysis with:
1. Problem understanding
2. Key considerations
3. Potential solutions
4. Trade-offs and implications
5. Final recommendation
`;

  return generateText(thinkingPrompt);
}

// ============================================================================
// 2. MULTIMODAL PROCESSING (Gemini Vision + GPT-4 Vision inspired)
// ============================================================================

export interface ImageAnalysisOptions {
  extractText: boolean;
  identifyObjects: boolean;
  analyzeLayout: boolean;
  describeScene: boolean;
}

export async function analyzeImage(
  imageData: string,
  question: string,
  options: ImageAnalysisOptions = {
    extractText: true,
    identifyObjects: true,
    analyzeLayout: false,
    describeScene: true,
  }
) {
  const analysisPrompt = `
Analyze this image with the following focus:
${options.extractText ? '- Extract all visible text\n' : ''}
${options.identifyObjects ? '- Identify and categorize objects\n' : ''}
${options.analyzeLayout ? '- Analyze layout and composition\n' : ''}
${options.describeScene ? '- Describe the overall scene\n' : ''}

User question: ${question}

Provide a detailed analysis.
`;

  return generateWithVision(analysisPrompt, imageData);
}

// ============================================================================
// 3. CODE EXECUTION & ANALYSIS (GPT-4 Code Interpreter inspired)
// ============================================================================

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  task: 'explain' | 'debug' | 'optimize' | 'refactor' | 'secure';
  context?: string;
}

export async function analyzeCode(request: CodeAnalysisRequest) {
  const taskDescriptions = {
    explain: 'Explain what this code does, line by line. Include the overall purpose.',
    debug: 'Identify bugs, potential errors, and edge cases. Suggest fixes.',
    optimize: 'Optimize for performance, readability, and efficiency. Provide improved code.',
    refactor: 'Refactor for better architecture, design patterns, and maintainability.',
    secure: 'Identify security vulnerabilities and provide hardened code.',
  };

  const prompt = `
Language: ${request.language}
Task: ${taskDescriptions[request.task]}
${request.context ? `\nContext: ${request.context}\n` : ''}

\`\`\`${request.language}
${request.code}
\`\`\`

Provide a comprehensive analysis with actionable recommendations.
`;

  return generateText(prompt);
}

// ============================================================================
// 4. REAL-TIME WEB RESEARCH (Exa AI + Perplexity inspired)
// ============================================================================

export interface ResearchOptions {
  depth: 'quick' | 'standard' | 'comprehensive';
  sourceDiversity: 'academic' | 'news' | 'mixed' | 'technical';
  recency: 'any' | 'month' | 'week' | 'day';
}

export async function conductResearch(
  topic: string,
  options: ResearchOptions = {
    depth: 'comprehensive',
    sourceDiversity: 'mixed',
    recency: 'month',
  }
) {
  const numResults = options.depth === 'quick' ? 5 : options.depth === 'standard' ? 10 : 20;
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  if (options.recency === 'day') startDate.setDate(startDate.getDate() - 1);
  else if (options.recency === 'week') startDate.setDate(startDate.getDate() - 7);
  else if (options.recency === 'month') startDate.setDate(startDate.getDate() - 30);

  const searchResults = await semanticSearch(topic, {
    numResults,
    startPublishedDate: options.recency !== 'any' ? startDate.toISOString() : undefined,
    endPublishedDate: endDate.toISOString(),
  });

  // Extract detailed content from top sources
  const detailedSources = await Promise.all(
    searchResults.slice(0, 3).map(async (result) => {
      try {
        const content = await extractContent(result.url);
        return {
          ...result,
          fullContent: content.substring(0, 1000),
        };
      } catch {
        return result;
      }
    })
  );

  const synthesisPrompt = `
Based on these recent sources about "${topic}":

${detailedSources
  .map(
    (s, i) => `
Source ${i + 1}: ${s.title}
URL: ${s.url}
Summary: ${s.summary}
${s.fullContent ? `Content Preview: ${s.fullContent}` : ''}
`
  )
  .join('')}

Provide a comprehensive research summary with:
1. Key findings
2. Current trends
3. Notable developments
4. Expert perspectives (if available)
5. Future implications
`;

  const synthesis = await generateText(synthesisPrompt);

  return {
    topic,
    sources: detailedSources,
    synthesis,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// 5. LONG CONTEXT UNDERSTANDING (Claude Sonnet inspired)
// ============================================================================

export interface DocumentAnalysisRequest {
  documents: Array<{
    url: string;
    title?: string;
  }>;
  question: string;
  synthesisStyle: 'executive_summary' | 'detailed' | 'comparative';
}

export async function analyzeMultipleDocuments(request: DocumentAnalysisRequest) {
  const extractedDocs = await Promise.all(
    request.documents.map(async (doc) => {
      try {
        const content = await extractContent(doc.url);
        return {
          title: doc.title || new URL(doc.url).hostname,
          url: doc.url,
          content: content.substring(0, 3000), // Limit per document
        };
      } catch (error) {
        console.error(`Failed to extract ${doc.url}:`, error);
        return null;
      }
    })
  );

  const validDocs = extractedDocs.filter((d) => d !== null);

  const styles = {
    executive_summary: 'Provide a concise executive summary highlighting key points.',
    detailed:
      'Provide a detailed analysis examining each document thoroughly with cross-references.',
    comparative: 'Compare and contrast the documents, highlighting differences and similarities.',
  };

  const prompt = `
Analyzing ${validDocs.length} documents.

Documents:
${validDocs.map((doc) => `\n## ${doc.title}\nURL: ${doc.url}\n${doc.content}\n---`).join('')}

Question: ${request.question}

Style: ${styles[request.synthesisStyle]}

Provide a comprehensive analysis.
`;

  return generateText(prompt);
}

// ============================================================================
// 6. CHAIN-OF-THOUGHT REASONING (o1 inspired)
// ============================================================================

export interface ChainOfThoughtRequest {
  problem: string;
  constraints?: string[];
  examples?: Array<{ input: string; output: string }>;
}

export async function chainOfThoughtReasoning(request: ChainOfThoughtRequest) {
  let prompt = `
Solve this problem using step-by-step reasoning:

Problem: ${request.problem}
`;

  if (request.constraints && request.constraints.length > 0) {
    prompt += `\nConstraints:\n${request.constraints.map((c) => `- ${c}`).join('\n')}\n`;
  }

  if (request.examples && request.examples.length > 0) {
    prompt += `\nExamples:\n${request.examples
      .map((e) => `Input: ${e.input}\nOutput: ${e.output}`)
      .join('\n\n')}\n`;
  }

  prompt += `

Thinking process:
1. Break down the problem
2. Identify key components
3. Work through each step
4. Verify your reasoning
5. Provide the final solution

Show all work and reasoning.
`;

  return generateText(prompt);
}

// ============================================================================
// 7. STREAMING WITH REAL-TIME CONTEXT (Perplexity + ChatGPT inspired)
// ============================================================================

export async function* streamWithContext(
  query: string,
  includeResearch = true
): AsyncGenerator<string> {
  // Initial acknowledgment
  yield `🔍 Analyzing query: "${query}"\n\n`;

  if (includeResearch) {
    yield `📊 Conducting real-time research...\n`;

    try {
      const research = await conductResearch(query, {
        depth: 'quick',
        sourceDiversity: 'mixed',
        recency: 'month',
      });
      yield `\n✅ Found ${research.sources.length} relevant sources\n\n`;
    } catch (error) {
      console.warn('Research failed:', error);
      yield `⚠️  Could not retrieve live sources\n\n`;
    }
  }

  // Stream main response
  yield `📝 Generating response...\n\n`;
  for await (const chunk of streamText(query)) {
    yield chunk;
  }

  yield `\n\n✨ Response complete\n`;
}

// ============================================================================
// 8. CREATIVE & SPECIALIZED MODES
// ============================================================================

export type CreativeMode =
  | 'storyteller'
  | 'technical_writer'
  | 'poet'
  | 'comedian'
  | 'educator'
  | 'copywriter';

export async function generateCreativeContent(
  mode: CreativeMode,
  prompt: string,
  style?: string
) {
  const modePrompts = {
    storyteller: 'Write a compelling narrative with vivid descriptions, character development, and engaging dialogue.',
    technical_writer: 'Write clear, precise technical documentation with proper formatting, examples, and explanations.',
    poet: 'Create evocative poetry with rich imagery, metaphors, and emotional depth.',
    comedian: 'Develop humor with witty wordplay, unexpected twists, and relatable observations.',
    educator: 'Explain concepts in an engaging, accessible way suitable for learning.',
    copywriter: 'Craft persuasive, compelling marketing copy that drives action.',
  };

  const fullPrompt = `
Mode: ${mode}
Style: ${style || 'default'}
Base instruction: ${modePrompts[mode]}

Request: ${prompt}
`;

  return generateText(fullPrompt);
}

// ============================================================================
// 9. STRUCTURED OUTPUT & SCHEMA (GPT function calling inspired)
// ============================================================================

export interface StructuredSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, StructuredSchema>;
  description?: string;
  required?: string[];
}

export async function generateStructured(
  prompt: string,
  schema: StructuredSchema
) {
  const schemaString = JSON.stringify(schema, null, 2);

  const fullPrompt = `
Generate output matching this schema:
\`\`\`json
${schemaString}
\`\`\`

Request: ${prompt}

Respond with ONLY valid JSON matching the schema. No additional text.
`;

  const response = await generateText(fullPrompt);
  try {
    return JSON.parse(response);
  } catch {
    return response; // Return raw if parsing fails
  }
}

// ============================================================================
// 10. MEMORY & CONTEXT MANAGEMENT (Multi-turn continuity)
// ============================================================================

export interface ConversationContext {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  facts: Map<string, string>; // Extracted facts for recall
  summary?: string;
}

export function createContext(sessionId: string): ConversationContext {
  return {
    sessionId,
    messages: [],
    facts: new Map(),
  };
}

export async function continueConversation(
  context: ConversationContext,
  userMessage: string
): Promise<string> {
  const conversationHistory = context.messages
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const fullPrompt = `
Conversation history:
${conversationHistory}

Continue naturally. User: ${userMessage}
`;

  const response = await generateText(fullPrompt);

  // Update context
  context.messages.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date(),
  });

  context.messages.push({
    role: 'assistant',
    content: response,
    timestamp: new Date(),
  });

  return response;
}

// ============================================================================
// EXPORT UTILITY
// ============================================================================

export const AdvancedFeatures = {
  advancedReasoning,
  analyzeImage,
  analyzeCode,
  conductResearch,
  analyzeMultipleDocuments,
  chainOfThoughtReasoning,
  streamWithContext,
  generateCreativeContent,
  generateStructured,
  createContext,
  continueConversation,
};
