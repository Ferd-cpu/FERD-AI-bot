/**
 * Enhanced FERD-AI Server with all advanced features integrated
 */

import express, { Express } from 'express';
import cors from 'cors';
import { getEnv } from '@/config/env';
import { rateLimitMiddleware } from '@/middleware/rate-limit';
import { errorHandlerMiddleware } from '@/middleware/error-handler';
import advancedRoutes from '@/routes/advanced-endpoints';

// Import existing routes
import { semanticSearch } from '@/lib/exa';
import { extractContent } from '@/lib/firecrawl';
import { generateText, streamText } from '@/lib/gemini';

const env = getEnv();
const app: Express = express();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rate limiting
app.use(rateLimitMiddleware());

// ============================================================================
// BASIC ENDPOINTS
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FERD-AI',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    features: {
      advanced_reasoning: true,
      image_analysis: true,
      code_analysis: true,
      real_time_research: true,
      document_analysis: true,
      chain_of_thought: true,
      creative_modes: true,
      structured_output: true,
      streaming: true,
      multimodal: true,
    },
  });
});

// ============================================================================
// ADVANCED ROUTES
// ============================================================================

app.use('/api/advanced', advancedRoutes);

// ============================================================================
// CORE CHAT ENDPOINTS
// ============================================================================

app.post('/api/chat', async (req, res) => {
  try {
    const { message, useSearch = false, includeWebContent = false } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let context = '';

    if (useSearch) {
      try {
        const searchResults = await semanticSearch(message, { numResults: 5 });
        context = searchResults
          .map((r) => `- ${r.title}: ${r.summary || 'No summary available'}`)
          .join('\n');

        if (includeWebContent && searchResults.length > 0) {
          try {
            const topContent = await extractContent(searchResults[0].url);
            context += `\n\nTop source content:\n${topContent.substring(0, 2000)}...`;
          } catch (error) {
            console.warn('Failed to extract web content:', error);
          }
        }
      } catch (error) {
        console.warn('Search failed, proceeding without web search:', error);
      }
    }

    const response = await generateText(message, context);

    res.json({
      message,
      response,
      searchEnabled: useSearch,
      webContentIncluded: includeWebContent && useSearch,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, useSearch = false } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let context = '';

    if (useSearch) {
      try {
        const searchResults = await semanticSearch(message, { numResults: 3 });
        context = searchResults
          .map((r) => `- ${r.title}: ${r.summary || ''}`)
          .join('\n');
      } catch (error) {
        console.warn('Search failed:', error);
      }
    }

    for await (const chunk of streamText(message, context)) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream chat error:', error);
    res.status(500).json({ error: 'Failed to stream chat message' });
  }
});

// ============================================================================
// SEARCH ENDPOINT
// ============================================================================

app.post('/api/search', async (req, res) => {
  try {
    const { query, numResults = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await semanticSearch(query, { numResults });

    res.json({
      query,
      results,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// ============================================================================
// EXTRACTION ENDPOINT
// ============================================================================

app.post('/api/extract', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const content = await extractContent(url);

    res.json({
      url,
      content,
      length: content.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Extract error:', error);
    res.status(500).json({ error: 'Failed to extract content' });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

app.use(errorHandlerMiddleware);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗`);
  console.log(`║          ✨ FERD-AI Premium Edition Running ✨        ║`);
  console.log(`╚════════════════════════════════════════════════════════╝
`);
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📚 Environment: ${env.NODE_ENV}`);
  console.log(`🤖 Gemini API: ✓ Configured`);
  console.log(`🔍 Exa AI: ✓ Configured`);
  console.log(`🕷️  Firecrawl: ✓ Configured`);
  console.log(`
📋 Available Features:`);
  console.log(`   ✓ Advanced Reasoning (Chain-of-Thought, Deep Analysis)`);
  console.log(`   ✓ Image & Vision Analysis`);
  console.log(`   ✓ Code Analysis & Optimization`);
  console.log(`   ✓ Real-time Web Research`);
  console.log(`   ✓ Multi-Document Analysis`);
  console.log(`   ✓ Creative Content Generation`);
  console.log(`   ✓ Structured Output & Schema`);
  console.log(`   ✓ Streaming Responses`);
  console.log(`   ✓ Multimodal Processing`);
  console.log(`   ✓ Rate Limiting & Security
`);
});

export default app;
