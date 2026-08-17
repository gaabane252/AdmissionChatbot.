import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { embeddingService } from './embeddingService.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ppgkeiwxnjnjzacyhdog.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZ2tlaXd4bmpuanphY3loZG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTc3NzUsImV4cCI6MjEwMjI5Mzc3NX0.oug1soLLTBoshX7_Z8ENae1_-DLwEsbd-FyW6dCqw04';
  return createClient(url, key);
}

let aiInstance = null;
function getGenAI() {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

export const ragService = {
  /**
   * Search knowledge base for relevant chunks
   */
  async searchKnowledgeBase(query, matchThreshold = 0.25, matchCount = 4) {
    try {
      const supabase = getSupabase();
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const { data: matchedChunks, error } = await supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
      });

      if (error) {
        console.warn('RPC match_document_chunks warning (direct query fallback):', error.message);
        const { data: docs } = await supabase
          .from('document_chunks')
          .select('id, document_id, content, metadata')
          .limit(4);
        return docs || [];
      }

      return matchedChunks || [];
    } catch (err) {
      console.error('Search Knowledge Base Error:', err);
      return [];
    }
  },

  /**
   * Generate RAG Answer using Gemini AI
   */
  async generateResponse(query, chatHistory = [], onChunk = null) {
    const retrievedChunks = await this.searchKnowledgeBase(query);
    
    const contextText = retrievedChunks.map((c, i) => `[Source ${i + 1}]:\n${c.content}`).join('\n\n');
    const sources = [...new Set(retrievedChunks.map(c => c.metadata?.file_name || 'Official SNU Document'))];

    const systemPrompt = `You are the official SNU AI Admission Assistant for Somali National University (SNU).
Your job is to assist students with friendly, accurate, and professional information regarding SNU admissions, faculties, programs, tuition fees, registration deadlines, and campus life.

Use the provided Knowledge Base context below to answer the user's question accurately.
If the information is not present in the context, provide a helpful general response about SNU and politely suggest contacting the SNU Registrar Office (admissions@snu.edu.so).

Knowledge Base Context:
---
${contextText || 'No specific document context found.'}
---
`;

    const ai = getGenAI();

    if (ai && process.env.GEMINI_API_KEY) {
      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
      
      for (const modelName of modelsToTry) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent Question: ${query}\n\nNote: If the student asks in Somali, please respond fluently in Somali. If in English, respond in English.` }] }
            ]
          });

          let fullText = '';
          for await (const chunk of responseStream) {
            const textChunk = typeof chunk.text === 'function' ? chunk.text() : (chunk.text || '');
            fullText += textChunk;
            if (onChunk) onChunk(textChunk);
          }

          if (fullText && fullText.trim()) {
            return { answer: fullText, sources, retrievedChunks };
          }
        } catch (err) {
          console.warn(`Gemini generation with ${modelName} failed, trying next:`, err.message || err);
        }
      }
    }

    const fallbackAnswer = `Welcome to Somali National University! 

Based on official SNU guidelines:
${retrievedChunks.length > 0 ? contextText.slice(0, 300) + '...' : 'SNU offers undergraduate programs across Medicine, Engineering, Education, Agriculture, Economics, and Law.'}

For further details or official application forms, please visit the SNU Admissions Office or email admissions@snu.edu.so.`;

    if (onChunk) {
      onChunk(fallbackAnswer);
    }

    return { answer: fallbackAnswer, sources, retrievedChunks };
  }
};
