import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { ragService } from '../services/ragService.js';

const router = express.Router();

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  return createClient(url, key);
}

/**
 * POST /api/chat
 */
router.post('/', async (req, res) => {
  try {
    const { message, conversationId, userId } = req.body;
    const supabase = getSupabase();

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    res.setHeader('Content-Type', 'application/json');

    const { answer, sources, retrievedChunks } = await ragService.generateResponse(message);

    let aiMsgRecord = null;
    if (conversationId) {
      const { data } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            role: 'assistant',
            content: answer,
          },
        ])
        .select()
        .single();

      aiMsgRecord = data;
    }

    if (retrievedChunks.length === 0 && userId) {
      await supabase.from('unanswered_questions').insert([
        {
          user_id: userId,
          question: message,
          reason: 'NO_KNOWLEDGE_BASE_MATCH',
          status: 'open',
        },
      ]);
    }

    return res.json({
      success: true,
      answer,
      sources,
      message: aiMsgRecord,
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ error: error.message || 'AI generation error' });
  }
});

export default router;
