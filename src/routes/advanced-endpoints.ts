/**
 * Advanced API Endpoints - Exposing FERD-AI's premium capabilities
 */

import { Router, Request, Response } from 'express';
import {
  advancedReasoning,
  analyzeCode,
  conductResearch,
  analyzeMultipleDocuments,
  chainOfThoughtReasoning,
  streamWithContext,
  generateCreativeContent,
  generateStructured,
} from '@/lib/advanced-features';

const router = Router();

// ============================================================================
// 1. ADVANCED REASONING ENDPOINT
// ============================================================================

router.post('/reasoning', async (req: Request, res: Response) => {
  try {
    const { prompt, depth = 'deep', includeThinking = true, stepByStep = true } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const result = await advancedReasoning(prompt, {
      depth,
      includeThinking,
      stepByStep,
    });

    res.json({
      prompt,
      result,
      mode: 'advanced_reasoning',
    });
  } catch (error) {
    console.error('Reasoning error:', error);
    res.status(500).json({ error: 'Failed to perform advanced reasoning' });
  }
});

// ============================================================================
// 2. IMAGE ANALYSIS ENDPOINT
// ============================================================================

router.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageData, question, options } = req.body;

    if (!imageData || !question) {
      return res.status(400).json({ error: 'imageData and question are required' });
    }

    const result = await analyzeCode({
      code: imageData,
      language: 'image',
      task: 'explain',
    });

    res.json({
      question,
      analysis: result,
      options,
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// ============================================================================
// 3. CODE ANALYSIS ENDPOINT
// ============================================================================

router.post('/analyze-code', async (req: Request, res: Response) => {
  try {
    const { code, language = 'javascript', task = 'explain', context } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }

    const result = await analyzeCode({
      code,
      language,
      task,
      context,
    });

    res.json({
      task,
      language,
      analysis: result,
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

// ============================================================================
// 4. RESEARCH ENDPOINT
// ============================================================================

router.post('/research', async (req: Request, res: Response) => {
  try {
    const { topic, depth = 'comprehensive', sourceDiversity = 'mixed', recency = 'month' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    const result = await conductResearch(topic, {
      depth,
      sourceDiversity,
      recency,
    });

    res.json(result);
  } catch (error) {
    console.error('Research error:', error);
    res.status(500).json({ error: 'Failed to conduct research' });
  }
});

// ============================================================================
// 5. DOCUMENT ANALYSIS ENDPOINT
// ============================================================================

router.post('/analyze-documents', async (req: Request, res: Response) => {
  try {
    const { documents, question, synthesisStyle = 'detailed' } = req.body;

    if (!documents || !question) {
      return res.status(400).json({ error: 'documents and question are required' });
    }

    const result = await analyzeMultipleDocuments({
      documents,
      question,
      synthesisStyle,
    });

    res.json({
      question,
      documentCount: documents.length,
      synthesis: result,
      synthesisStyle,
    });
  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze documents' });
  }
});

// ============================================================================
// 6. CHAIN-OF-THOUGHT ENDPOINT
// ============================================================================

router.post('/chain-of-thought', async (req: Request, res: Response) => {
  try {
    const { problem, constraints, examples } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'problem is required' });
    }

    const result = await chainOfThoughtReasoning({
      problem,
      constraints,
      examples,
    });

    res.json({
      problem,
      solution: result,
      method: 'chain_of_thought',
    });
  } catch (error) {
    console.error('Chain-of-thought error:', error);
    res.status(500).json({ error: 'Failed to perform chain-of-thought reasoning' });
  }
});

// ============================================================================
// 7. STREAMING WITH RESEARCH ENDPOINT
// ============================================================================

router.post('/stream-research', async (req: Request, res: Response) => {
  try {
    const { query, includeResearch = true } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of streamWithContext(query, includeResearch)) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream research error:', error);
    res.status(500).json({ error: 'Failed to stream research' });
  }
});

// ============================================================================
// 8. CREATIVE CONTENT ENDPOINT
// ============================================================================

router.post('/creative', async (req: Request, res: Response) => {
  try {
    const { mode, prompt, style } = req.body;

    if (!mode || !prompt) {
      return res.status(400).json({ error: 'mode and prompt are required' });
    }

    const validModes = ['storyteller', 'technical_writer', 'poet', 'comedian', 'educator', 'copywriter'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        error: `Invalid mode. Valid modes: ${validModes.join(', ')}`,
      });
    }

    const result = await generateCreativeContent(mode, prompt, style);

    res.json({
      mode,
      prompt,
      style: style || 'default',
      content: result,
    });
  } catch (error) {
    console.error('Creative generation error:', error);
    res.status(500).json({ error: 'Failed to generate creative content' });
  }
});

// ============================================================================
// 9. STRUCTURED OUTPUT ENDPOINT
// ============================================================================

router.post('/structured', async (req: Request, res: Response) => {
  try {
    const { prompt, schema } = req.body;

    if (!prompt || !schema) {
      return res.status(400).json({ error: 'prompt and schema are required' });
    }

    const result = await generateStructured(prompt, schema);

    res.json({
      prompt,
      schema,
      output: result,
    });
  } catch (error) {
    console.error('Structured generation error:', error);
    res.status(500).json({ error: 'Failed to generate structured output' });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'advanced_features',
    features: [
      'advanced_reasoning',
      'image_analysis',
      'code_analysis',
      'research',
      'document_analysis',
      'chain_of_thought',
      'streaming_research',
      'creative_content',
      'structured_output',
    ],
  });
});

export default router;
